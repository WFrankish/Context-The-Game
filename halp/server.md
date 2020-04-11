# server

The server has two independent components for networking: the HTTP server and
the WebSocket server.

## HTTP server

The HTTP server is defined by the `server/http.ts` module, and serves static
content. The paths for content are all relative to the `site/` directory. To
prevent access to disallowed paths, access is controlled by the
`server/content_types.ts` and `server/paths.ts` files.

Due to `server/content_types.ts`:

  * Requests with no extension will produce 403.
  * Requests with unknown extensions will produce 403.

Due to `server/paths.ts`:

  * Requests to paths that are neither aliases or whitelisted will produce 403.

## WebSocket server.

The WebSocket server is defined by `server/net.ts`. The server interface is
a single function `net.createChannel(id: string, handler: ServerHandler)`, which
can be used to create a new network channel. Clients can then subscribe to this
channel.

On the client side, networking is defined by `client/net.ts`. Clients must
invoke `await net.start()` to initialize the networking code, and can then call
`net.subscribe(id: string, handler: ClientHandler)` to subscribe to the named
channel.
