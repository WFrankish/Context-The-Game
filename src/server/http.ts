import * as fs from 'fs';
import * as http from 'http';
import * as net from 'net';
import { contentType } from './content_types.js';
import { HttpError } from './http_error.js';
import { filePath } from './paths.js';

export const server = http.createServer();
server.listen(8000, () => {
  const { address, port } = server.address() as net.AddressInfo;
  console.log('Server running on [%s]:%s', address, port);
});

// Asynchronously load a file.
function load(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, data) => {
      error ? reject(new HttpError(404, 'No such file: ' + file)) : resolve(data);
    });
  });
}

export interface Response {
  contentType: string;
  data: string | Buffer;
}
export type Handler = (request: http.IncomingMessage) => Promise<Response>;

function wrapHandler(handler: Handler): http.RequestListener {
  return async (request: http.IncomingMessage, response: http.ServerResponse) => {
    const url = new URL(request.url!, 'http://localhost:8000');
    const respond = (code: number, contentType: string, data: string | Buffer) => {
      console.log('%s %s %d %s', request.method, url.pathname, code, HttpError.statusText(code));
      response.writeHead(code, { 'Content-Type': contentType });
      response.write(data);
      response.end();
    };
    try {
      const { contentType, data } = await handler(request);
      respond(200, contentType, data);
    } catch (error) {
      if (error instanceof HttpError) {
        respond(error.code, 'text/plain', error.message);
      } else {
        console.error(error.toString());
        respond(500, 'text/plain', 'Something bad happened :(');
      }
    }
  };
}

async function handle(request: http.IncomingMessage): Promise<Response> {
  const url = new URL(request.url!, 'http://localhost:8000');
  const path = filePath(url.pathname);
  const type = contentType(path);
  const data = await load(path);
  return { contentType: type, data };
}

server.on('request', wrapHandler(handle));
