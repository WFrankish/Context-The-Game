import * as fs from 'fs';
import * as http from 'http';

function load(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

class HttpError extends Error {
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
  statusText() {
    return HttpError.statusText(this.code);
  }
  static statusText(code: number): string {
    switch (code) {
      case 200:
        return 'OK';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 418:
        return 'I Am A Teapot';
      case 500:
        return 'Internal Server Error';
      default:
        switch (code - code % 100) {
          case 100:
            return 'Something Informational';
          case 200:
            return 'Something Resembling Success';
          case 300:
            return 'Something Somewhere Else';
          case 400:
            return 'Something The Client Did Wrong';
          case 500:
            return 'Something The Server Did Wrong';
        }
        return 'Something Bad';
    }
  }
  code: number
}

// Wraps a request handler to automatically convert exceptions into error pages.
interface Response {
  contentType: string, data: string|Buffer,
}
type SimpleListener = (request: http.IncomingMessage) => Promise<Response>;
function handle(handler: SimpleListener): http.RequestListener {
  return async (
             request: http.IncomingMessage, response: http.ServerResponse) => {
    const url = new URL(request.url!, 'http://localhost:8000');
    const respond =
        (code: number, contentType: string, data: string|Buffer) => {
          console.log(
              '%s %s %d %s', request.method, url.pathname, code,
              HttpError.statusText(code));
          response.writeHead(code, {'Content-Type': contentType});
          response.write(data);
          response.end();
        };
    try {
      const {contentType, data} = await handler(request);
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

// Content type mapping used for serving static content.
const contentTypes = new Map([
  ['js', 'text/javascript'],
  ['js.map', 'application/octet-stream'],
  ['html', 'text/html'],
  ['ico', 'image/x-icon'],
  ['png', 'image/png'],
]);

async function handleStatic(path: string): Promise<Response> {
  const result = path.match(/\.(.*)$/);
  if (!result || !contentTypes.has(result[1])) {
    throw new HttpError(403, 'Forbidden.');
  }
  try {
    const contentType = contentTypes.get(result[1])!;
    const data = await load(path);
    return {contentType, data};
  } catch (error) {
    throw new HttpError(404, 'Not Found: ' + path);
  }
}

async function handleRequest(request: http.IncomingMessage): Promise<Response> {
  const url = new URL(request.url!, 'http://localhost:8000');
  const path = url.pathname;
  if (path == '/') return await handleStatic('client/index.html');
  // TODO: Remove this when we get our shit together.
  if (path == '/display_demo.html') {
    return await handleStatic('client/display_demo.html');
  }
  if (path == '/favicon.ico') return await handleStatic('assets/favicon.ico');
  if (path.startsWith('/scripts/common/')) {
    // `/scripts/common/foo.js` -> `common/foo.js`
    return await handleStatic(path.substr('/scripts/'.length));
  } else if (path.startsWith('/scripts/client/')) {
    // `/scripts/foo.js` -> `client/foo.js`
    return await handleStatic(path.substr('/scripts/'.length));
  } else if (path.startsWith('/assets/')) {
    // `/assets/foo.png` -> `assets/foo.png`
    return await handleStatic(path.substr('/'.length));
  } else {
    throw new HttpError(404, 'Not Found');
  }
}

const server = http.createServer();
server.on('request', handle(handleRequest));
server.listen(8000);
