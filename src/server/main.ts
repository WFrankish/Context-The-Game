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
      case 404:
        return 'Not Found';
      case 500:
        return 'Server Error';
      default:
        return 'Something Bad';
    }
  }
  code: number
}

function handle(handler: http.RequestListener) {}
