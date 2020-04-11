// Type for representing an http error code.
export class HttpError extends Error {
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
        switch (code - (code % 100)) {
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
  code: number;
}
