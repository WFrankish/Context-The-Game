# net - Networking Framework

The networking framework abstracts the details of network synchronization and
presents a simplified interface for users to implement. It is broken into three
parts:

  * `client/net.ts` - The clientside interface for networking.
  * `common/net.ts` - Type definitions used by both the client and the server.
  * `server/net.ts` - The serverside interface for networking.

## Networking Model

The networking framework exposes various *channels* to the client. The server
can *create* channels. The client can *subscribe* to channels. Both the server
and the client can *update* the channels.

Channels are networked using a combination of *snapshots* and *updates*.
A *snapshot* represents the full state of the object at a given point in time.
When a client first subscribes to a channel, they will be given a snapshot to
load. After loading a snapshot, it can be kept up to date using *updates*.
Clients can post updates representing local changes to the state, and the
networking framework will deliver updates representing other changes from the
server or from other clients. The framework will ensure that updates are
*eventually consistent* across all clients.

# How To Use It

To implement a networkable object, you must first decide what your
`SnapshotType` and `UpdateType` will be.

The `SnapshotType` can be any javascript object, as long as you can translate
that object into a JSON format via a custom `encodeSnapshot` function and
recover an equivalent object using a custom `loadSnapshot` function. For
example, a simple chat application could use `SnapshotType = string[]`,
representing the list of messages in the chat history. Since `string[]` is
easily convertible into JSON, the `encodeSnapshot` and `loadSnapshot` functions
don't have to do anything except copy the contents into a new object with
`array.slice()`.

The `UpdateType` must be directly JSON serialisable. In the case of the chat
application, we would have `UpdateType = string`, representing a single new
message.

After you have chosen your `SnapshotType` and `UpdateType`, you need to
implement the `net.ClientHandler<SnapshotType, UpdateType>` and
`net.ServerHandler<SnapshotType, UpdateType>` interfaces from `common/net.ts`.
There is significant overlap between these interfaces, and they can be
implemented with a single type.

# Example Usage

There is an example chat application demonstrating the usage:

  * `client/chat.html` - Main application.
  * `client/common.ts` - Common chat networking logic.
  * `client/chat.ts` - Client-specific chat logic.
  * `client/server.ts` - Server-specific chat logic.

This can be tested out by starting up the server and browsing to `/chat.html`.
