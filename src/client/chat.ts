import * as common from '../common/chat.js';

import * as net from './net.js';

export class Handler extends common.Handler {
  constructor(username: string, view: HTMLElement, input: HTMLInputElement) {
    super();
    this.username = username;
    this.view = view;
    this.input = input;
  }
  async start() {
    if (this.channel) return;
    await net.start();
    this.channel = await net.subscribe('chat', this);
    this.input.addEventListener(
        'keydown', (event: KeyboardEvent) => this.handleInput(event));
    this.channel!.update(this.username + ' has connected.');
  }
  handleInput(event: KeyboardEvent): void {
    if (event.code == 'Enter') {
      event.preventDefault();
      this.channel!.update(this.username + ': ' + this.input.value);
      this.input.value = '';
    }
  }
  onChange(state: string[]): void {
    // Put all the messages into the view box and scroll to the bottom.
    this.view.innerText = state.join('\n');
    this.view.scrollTop = this.view.scrollHeight;
  }
  username: string;
  view: HTMLElement;
  input: HTMLInputElement;
  channel?: net.Channel<string[], string>;
}
