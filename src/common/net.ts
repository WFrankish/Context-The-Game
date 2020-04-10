export type JsonObject =
    boolean|number|string|JsonObject[]|{[key: string]: JsonObject};

export type Milliseconds = number;
export type Timestamp = Milliseconds;

export function time(t: Timestamp) {
  return new Promise((resolve, reject) => setTimeout(resolve, t - Date.now()));
}

// client -> server: Local updates for all subscriptions.
export interface ClientUpdates {
  type: 'ClientUpdates';
  // List of local updates for each channel.
  updates: {[id: string]: JsonObject[]};
}

// client -> server: Subscribe to a channel.
export interface ClientSubscribe {
  type: 'ClientSubscribe';
  // ID of channel to subscribe to.
  id: string;
}

// server -> client: Snapshot for a channel.
export interface ServerSnapshot {
  type: 'ServerSnapshot';
  // ID of the channel.
  id: string;
  // Encoded snapshot.
  state: JsonObject;
  // Version number of the snapshot.
  version: number;
}

// server -> client: Authoritative updates for all subscriptions.
export interface ServerUpdates {
  type: 'ServerUpdates';
  // Server time (in milliseconds).
  time: Timestamp;
  // List of updates for each channel.
  updates: {[id: string]: {numLocalUpdates: number, updates: JsonObject[]}};
}

// server -> client: Error with a certain channel.
export interface ServerSubscriptionError {
  type: 'ServerSubscriptionError';
  // ID of the channel.
  id: string;
  // Error message.
  message: string;
}

// client -> server
export type ClientMessage = ClientSubscribe|ClientUpdates;
// server -> client
export type ServerMessage =
    ServerSnapshot|ServerUpdates|ServerSubscriptionError;

export interface ClientHandler<SnapshotType, UpdateType> {
  // Copy a snapshot state into a new state object.
  copyState(state: SnapshotType): SnapshotType;
  // Decode the network format into a state object.
  loadSnapshot(data: JsonObject): SnapshotType;
  // Apply an update to a snapshot object, updating it in-place.
  applyUpdate(state: SnapshotType, update: UpdateType): void;
  // Invoked when a new version of the state becomes available. May sometimes be
  // skipped if many updates arrive at once, so is not intended to detect every
  // change.
  onChange(state: SnapshotType): void;
}

export interface ServerHandler<SnapshotType, UpdateType> {
  // Default state used when creating new instances of the snapshot type.
  defaultState: SnapshotType;
  // Copy a snapshot state into a new state object.
  copyState(state: SnapshotType): SnapshotType;
  // Encode a snapshot state into the network format.
  encodeSnapshot(state: SnapshotType): JsonObject;
  // Apply an update to a snapshot object, updating it in-place.
  applyUpdate(state: SnapshotType, update: UpdateType): void;
  // Invoked when a new version of the state becomes available. May sometimes be
  // skipped if many updates arrive at once, so is not intended to detect every
  // change.
  onChange(state: SnapshotType): void;
}

export type Handler<SnapshotType, UpdateType> =
    ClientHandler<SnapshotType, UpdateType>&
    ServerHandler<SnapshotType, UpdateType>;
