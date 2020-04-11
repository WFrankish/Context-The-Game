import {Milliseconds, Timestamp, time} from '../common/time.js';
import * as metrics from '../common/metrics.js';
import * as common from '../common/net.js';

export type Handler<SnapshotType, UpdateType> =
    common.ClientHandler<SnapshotType, UpdateType>;

export interface Channel<SnapshotType, UpdateType> {
  readonly id: string;
  // Apply a new update originating from the client.
  update(update: UpdateType): void;
  // Access the current state.
  state(): SnapshotType;
}

// Wait for the network connection to establish. This should be called exactly
// once, and should return before any other use of the network library is made.
export async function start() {
  await startupPromise;
  console.log('Connected.');
  sendLoop();
}

// Subscribe to a channel identified by `id`. Asynchronously returns the
// associated channel once it has initialized with a state from the server.
export async function subscribe<SnapshotType, UpdateType>(
    id: string, handler: Handler<SnapshotType, UpdateType>) {
  if (channels.has(id)) {
    throw new Error(id + ' is already subscribed.');
  }
  const channel: ChannelState<SnapshotType, UpdateType> =
      new ChannelState(id, handler);
  channels.set(id, channel);
  const request: common.ClientSubscribe = {type: 'ClientSubscribe', id};
  send(request);
  await channel.initializationPromise;
  return channel;
}

const channels: Map<string, ChannelState<any, any>> = new Map;
const socket = new WebSocket('ws://' + location.host + '/websocket');
socket.onclose = event => {
  throw event;
};
socket.onerror = event => {
  throw event;
};
const startupPromise = new Promise((resolve, reject) => {
  socket.onopen = () => resolve();
});

class ChannelState<SnapshotType, UpdateType> implements
    Channel<SnapshotType, UpdateType> {
  constructor(id: string, handler: Handler<SnapshotType, UpdateType>) {
    this.id = id;
    this.handler = handler;
    this.initializationPromise = new Promise((resolve, reject) => {
      this.initDone = () => {
        this.initialized = true;
        resolve();
      };
      this.initFailed = reject;
    });
  }
  update(update: UpdateType): void {
    this.updates.push(update);
    this.handler.applyUpdate(this.predictedState!, update);
    this.numLocalUpdates++;
    this.handler.onChange(this.predictedState!);
  }
  state(): SnapshotType {
    if (!this.predictedState) {
      throw new Error('Cannot access state before it is initialized.');
    }
    return this.predictedState;
  }
  id: string;
  handler: Handler<SnapshotType, UpdateType>;
  // Current state known to be consistent with the server.
  committedState?: SnapshotType;
  // Version number of the committed state.
  version = 0;
  // Creation time of the committed state, in server time.
  creationTime: Timestamp = 0;
  // Predicted state based on the consistent state and local changes.
  predictedState?: SnapshotType;
  // Local updates to the committed state which have already been sent.
  updates: UpdateType[] = [];
  // Number of updates created locally which have been sent.
  numSentUpdates = 0;
  // Number of updates created locally in total.
  numLocalUpdates = 0;
  // True if the channel has been initialized.
  initialized = false;
  // Initialization promise. Resolved once at least one snapshot has been
  // received. Rejected if the channel doesn't exist on the server.
  initializationPromise: Promise<void>;
  initDone?: () => void;
  initFailed?: (error: common.ServerSubscriptionError) => void;
}

function send(message: common.ClientMessage): void {
  const maxSendSize = 100000;
  const bytes = JSON.stringify(message);
  if (bytes.length > maxSendSize) throw new Error('Need to split message.');
  console.log('-> %s (%d bytes)', message.type, bytes.length);
  metrics.count('bytes-sent', bytes.length);
  socket.send(bytes);
}

async function sendLoop() {
  const sendInterval: Milliseconds = 1000;
  const maxSendSize = 100000;
  let nextStart = Date.now();
  while (true) {
    await time(nextStart);
    nextStart = Date.now() + sendInterval;
    const message: common.ClientUpdates = {type: 'ClientUpdates', updates: {}};
    let hasUpdates = false;
    for (const channel of channels.values()) {
      const toSend = channel.numLocalUpdates - channel.numSentUpdates;
      if (toSend == 0) continue;
      hasUpdates = true;
      message.updates[channel.id] = channel.updates.slice(-toSend);
      channel.numSentUpdates = channel.numLocalUpdates;
    }
    if (!hasUpdates) continue;
    send(message);
  }
}

function receiveSnapshot(message: common.ServerSnapshot): void {
  const id = message.id;
  if (!channels.has(id)) return;
  const channel = channels.get(id)!;
  if (channel.initialized) {
    throw new Error(
        'Received snapshot for channel ' + id +
        ', which is already initialized.');
  }
  try {
    channel.committedState = channel.handler.loadSnapshot(message.state);
    channel.predictedState = channel.handler.copyState(channel.committedState);
    channel.version = message.version;
    channel.initDone!();
    channel.handler.onChange(channel.predictedState);
  } catch (error) {
    channel.initFailed!(error);
  }
}

function receiveUpdates(message: common.ServerUpdates): void {
  console.log(JSON.stringify(message));
  for (const id in message.updates) {
    if (!message.updates.hasOwnProperty(id)) continue;
    if (!channels.has(id)) continue;
    const channel = channels.get(id)!;
    if (!channel.initialized) {
      throw new Error(
          'Received updates for channel ' + id + ' before it was initialized.');
    }
    const {numLocalUpdates, updates} = message.updates[id];
    // Apply updates to the committed state.
    for (const update of updates) {
      channel.handler.applyUpdate(channel.committedState, update);
    }
    channel.version += updates.length;
    channel.creationTime = message.time;
    // numLocalUpdates tells us how many of the local updates have been
    // committed to the committedState. We can then discard those updates from
    // the pendingUpdates list.
    const numUnprocessed = channel.numLocalUpdates - numLocalUpdates;
    if (numUnprocessed < 0 || channel.updates.length < numUnprocessed) {
      throw new Error('invalid numLocalUpdates for channel ' + id);
    }
    channel.updates.splice(0, channel.updates.length - numUnprocessed);
    // Recompute the predicted state.
    channel.predictedState = channel.handler.copyState(channel.committedState);
    for (const update of channel.updates) {
      channel.handler.applyUpdate(channel.predictedState, update);
    }
    channel.handler.onChange(channel.predictedState);
  }
}

function receiveSubscriptionError(message: common.ServerSubscriptionError):
    void {
  const id = message.id;
  if (!channels.has(id)) return;
  const channel = channels.get(id)!;
  if (channel.initialized) {
    throw new Error(
        'Received subscription error for channel ' + id +
        ' after it was already successfully initialized.');
  }
  channel.initFailed!(message);
  channels.delete(id);
}

function receive(event: MessageEvent): void {
  let message: common.ServerMessage = JSON.parse(event.data);
  metrics.count('bytes-received', event.data.length);
  console.log('<- %s (%d bytes)', message.type, event.data.length);
  switch (message.type) {
    case 'ServerSnapshot':
      return receiveSnapshot(message);
    case 'ServerUpdates':
      return receiveUpdates(message);
    case 'ServerSubscriptionError':
      return receiveSubscriptionError(message);
  }
}
socket.onmessage = receive;
