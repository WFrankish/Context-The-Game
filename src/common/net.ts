import { Timestamp } from './time.js';

export type JsonObject = boolean | number | string | JsonObject[] | { [key: string]: JsonObject };

// The minimum interface that must be implemented on the client side.
export interface ClientHandler<SnapshotType, UpdateType> {
  // Copy a snapshot state into a new state object. This must create a separate
  // object, as the implementation may internally have multiple snapshots in use
  // at one time.
  copyState(state: SnapshotType): SnapshotType;
  // Decode the network format into a state object. If there is no difference
  // between the snapshot format and the network format, this function may
  // simply return its argument.
  loadSnapshot(data: JsonObject): SnapshotType;
  // Apply an update to a snapshot object, updating it in-place. The client must
  // not assume anything about the order of multiple invocations of applyUpdate.
  // Internally, to ensure eventual consistency, the implementation may need
  // multiple versions of the state available and switch between applying
  // updates to one, or the other, or both.
  applyUpdate(state: SnapshotType, update: UpdateType): void;
  // Invoked when a new version of the state becomes available. May sometimes be
  // skipped if many updates arrive at once, so is not intended to detect every
  // change.
  onChange(state: SnapshotType): void;
}

// The minimum interface that must be implemented on the server side.
export interface ServerHandler<SnapshotType, UpdateType> {
  // Default state used when creating new instances of the snapshot type. This
  // function should return a new object each time it is called. It must not
  // return a reference to the same object twice.
  defaultState(): SnapshotType;
  // Copy a snapshot state into a new state object. This must create a separate
  // object, as the implementation may internally have multiple snapshots in use
  // at one time.
  copyState(state: SnapshotType): SnapshotType;
  // Encode a state object into the network format. If there is no difference
  // between the snapshot format and the network format, this function may
  // simply return its argument.
  encodeSnapshot(state: SnapshotType): JsonObject;
  // Apply an update to a snapshot object, updating it in-place. The client must
  // not assume anything about the order of multiple invocations of applyUpdate.
  // Internally, to ensure eventual consistency, the implementation may need
  // multiple versions of the state available and switch between applying
  // updates to one, or the other, or both.
  applyUpdate(state: SnapshotType, update: UpdateType): void;
  // Invoked when a new version of the state becomes available. May sometimes be
  // skipped if many updates arrive at once, so is not intended to detect every
  // change.
  onChange(state: SnapshotType): void;
}

// The combination of the client and server interfaces. If the object
// representation is sufficiently simple, it may be simpler to only implement
// this interface.
export type Handler<SnapshotType, UpdateType> = ClientHandler<SnapshotType, UpdateType> &
  ServerHandler<SnapshotType, UpdateType>;

// client -> server: Local updates for all subscriptions.
export interface ClientUpdates {
  type: 'ClientUpdates';
  // List of local updates for each channel.
  updates: { [id: string]: JsonObject[] };
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
  updates: { [id: string]: { numLocalUpdates: number; updates: JsonObject[] } };
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
export type ClientMessage = ClientSubscribe | ClientUpdates;
// server -> client
export type ServerMessage = ServerSnapshot | ServerUpdates | ServerSubscriptionError;
