import {HttpError} from './http_error.js';

// Assets which match specific paths are rewritten before the path prefix
// whitelist is applied.
const aliases = new Map([
  ['/', '/client/index.html'],
  ['/favicon.ico', '/assets/favicon.ico'],
  // TODO: Remove these once we've got our shit together.
  ['/display_demo.html', '/client/display_demo.html'],
  ['/chat.html', '/client/chat.html'],
]);

// The path prefix whitelist rejects any request which does not match one of the
// allowed prefixes.
const pathPrefixWhitelist = new Set(['/assets/', '/client/', '/common/']);

export function filePath(path: string): string {
  if (aliases.has(path)) path = aliases.get(path)!;
  for (const prefix of pathPrefixWhitelist) {
    if (path.startsWith(prefix)) return path.substr(1);
  }
  throw new HttpError(403, 'Disallowed path.');
}
