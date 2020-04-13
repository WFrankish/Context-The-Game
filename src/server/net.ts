import * as http from 'http';
import WebSocket from 'ws';

import * as common from '../common/net.js';
export { Channel } from '../common/net.js';

import { Milliseconds, time } from '../common/time.js';
import { server } from './http.js';

export { JsonObject } from '../common/net.js';

export type Handler<SnapshotType, UpdateType> = common.ServerHandler<SnapshotType, UpdateType>;

// Create a new channel with the given id and handler. Immediately returns the
// associated channel. The state can be accessed immediately.
export function createChannel<SnapshotType, UpdateType>(
  id: string,
  handler: Handler<SnapshotType, UpdateType>
): common.Channel<SnapshotType, UpdateType> {
  if (channels.has(id)) throw new Error('channel ' + id + ' already exists.');
  const channel: ChannelState<SnapshotType, UpdateType> = new ChannelState(id, handler);
  channels.set(id, channel);
  return channel;
}

const channels: Map<string, ChannelState<any, any>> = new Map();
const clients: Set<Client> = new Set();
const webSocketServer = new WebSocket.Server({ server });

class Subscription {
  constructor(channel: ChannelState<any, any>, client: Client) {
    this.channel = channel;
    this.client = client;
  }
  channel: ChannelState<any, any>;
  client: Client;
  // Number of updates received from the client.
  numLocalUpdates = 0;
}

class ChannelState<SnapshotType, UpdateType> implements common.Channel<SnapshotType, UpdateType> {
  constructor(id: string, handler: Handler<SnapshotType, UpdateType>) {
    this.id = id;
    this.handler = handler;
    this.currentState = handler.defaultState();
  }
  update(update: UpdateType): void {
    this.updates.push(update);
    this.handler.applyUpdate(this.currentState, update);
    this.version++;
    this.handler.onChange(this.currentState);
  }
  state(): SnapshotType {
    return this.currentState;
  }
  id: string;
  handler: Handler<SnapshotType, UpdateType>;
  subscriptions: Set<Subscription> = new Set();
  // Buffered updates which the subscribers haven't received.
  updates: UpdateType[] = [];
  // Current version, including buffered updates.
  currentState: SnapshotType;
  // Version number of the current version.
  version = 0;
  // Creation time of the current version.
  creationTime = new Date();
}

class Client {
  constructor(remoteAddress: string, socket: WebSocket) {
    this.remoteAddress = remoteAddress;
    this.socket = socket;
    socket.on('message', (data: any) => this.message(data));
    socket.on('close', () => this.shutdown());
    socket.on('error', () => this.shutdown());
  }
  send(data: common.ServerMessage): void {
    const maxSendSize = 100000;
    const bytes = JSON.stringify(data);
    if (bytes.length > maxSendSize) throw new Error('Need to split message.');
    console.log('%s <- %s (%d bytes)', this.remoteAddress, data.type, bytes.length);
    this.socket.send(bytes);
  }
  // Handle an incoming message.
  message(data: WebSocket.Data): void {
    let message: common.ClientMessage;
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      console.log('%s: Bad message from client. Disconnecting.', this.remoteAddress);
      this.socket.close();
      return;
    }
    console.log('%s -> %s (%d bytes)', this.remoteAddress, message.type, data.toString().length);
    switch (message.type) {
      case 'ClientUpdates':
        for (const id in message.updates) {
          if (!message.updates.hasOwnProperty(id)) continue;
          if (!this.subscriptions.has(id)) continue;
          const subscription = this.subscriptions.get(id)!;
          const channel = subscription.channel;
          for (const update of message.updates[id]) {
            channel.updates.push(update);
            channel.handler.applyUpdate(channel.currentState, update);
          }
          channel.version += message.updates[id].length;
          subscription.numLocalUpdates += message.updates[id].length;
          channel.handler.onChange(channel.currentState);
        }
        break;
      case 'ClientSubscribe':
        const id = message.id;
        if (!channels.has(id)) {
          const error: common.ServerSubscriptionError = {
            type: 'ServerSubscriptionError',
            id,
            message: 'no such channel',
          };
          this.send(error);
          return;
        }
        const channel = channels.get(id)!;
        const snapshot: common.ServerSnapshot = {
          type: 'ServerSnapshot',
          id,
          state: channel.handler.encodeSnapshot(channel.currentState),
          version: channel.version,
        };
        this.send(snapshot);
        const subscription = new Subscription(channel, this);
        this.subscriptions.set(id, subscription);
        channel.subscriptions.add(subscription);
    }
  }
  sendUpdates() {
    const time = Date.now();
    const message: common.ServerUpdates = {
      type: 'ServerUpdates',
      time,
      updates: {},
    };
    let hasUpdates = false;
    for (const subscription of this.subscriptions.values()) {
      if (subscription.channel.updates.length == 0) continue;
      hasUpdates = true;
      message.updates[subscription.channel.id] = {
        numLocalUpdates: subscription.numLocalUpdates,
        updates: subscription.channel.updates,
      };
    }
    if (!hasUpdates) return;
    this.send(message);
  }
  shutdown() {
    console.log('%s: connection closed.', this.remoteAddress);
    for (const subscription of this.subscriptions.values()) {
      subscription.channel.subscriptions.delete(subscription);
    }
    clients.delete(this);
  }
  remoteAddress: string;
  socket: WebSocket;
  subscriptions: Map<string, Subscription> = new Map();
}

async function sendLoop() {
  const sendInterval: Milliseconds = 50;
  let nextStart = Date.now();
  while (true) {
    await time(nextStart);
    nextStart = Date.now() + sendInterval;
    for (const client of clients) client.sendUpdates();
    for (const channel of channels.values()) channel.updates = [];
  }
}
sendLoop();

function handleClient(socket: WebSocket, request: http.IncomingMessage): void {
  clients.add(new Client(request.connection.remoteAddress!, socket));
}
webSocketServer.on('connection', handleClient);
