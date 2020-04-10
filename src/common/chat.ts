import * as net from './net.js';

export class Handler implements net.Handler<string[], string> {
  get defaultState() {
    return [];
  }
  copyState(state: string[]): string[] {
    return state.slice();
  }
  loadSnapshot(data: net.JsonObject): string[] {
    return (data as string[]).slice();
  }
  encodeSnapshot(state: string[]): net.JsonObject {
    return state.slice();
  }
  applyUpdate(state: string[], update: string): void {
    state.push(update);
    if (state.length > 100) state.splice(0, state.length - 100);
  }
  onChange(state: string[]): void {}
}
