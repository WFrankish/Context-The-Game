import * as common from '../common/chat.js';

export class Handler extends common.Handler {
  constructor() {
    super();
  }
  onChange(state: string[]): void {
    console.log('%d messages.', state.length)
  }
}
