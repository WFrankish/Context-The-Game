import {HttpError} from './http_error.js';

// These are the content types which the server will return. If something is
// absent from this list, the server will return an error instead of returning
// the resource.
const contentTypes = new Map([
  ['js', 'text/javascript'],
  ['js.map', 'application/octet-stream'],
  ['ts', 'application/x-typescript'],
  ['html', 'text/html'],
  ['ico', 'image/x-icon'],
  ['png', 'image/png'],
]);

export function contentType(file: string): string {
  const dot = file.indexOf('.');
  if (dot == -1) {
    throw new HttpError(403, 'Can\'t request files with no extension.');
  }
  const extension = file.substr(dot + 1);
  if (!contentTypes.has(extension)) {
    throw new HttpError(403, 'Unsupported file extension ' + extension);
  }
  return contentTypes.get(extension)!;
}
