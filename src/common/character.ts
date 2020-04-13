import { Seconds } from './time.js';
import { Vector2 } from './vector2.js';
import { Inputs } from './inputs.js';
import * as net from './net.js';

export class Character {
  static radius = 0.3;
  static walkSpeed = 3;
  constructor(id: string) {
    this.id = id;
  }
  update(dt: Seconds) {
    if (this.isLocal) this.processInputs();
    this.position = this.position.add(this.velocity.multiply(dt));
  }
  processInputs() {
    let move = new Vector2(this.inputs.right - this.inputs.left, this.inputs.down - this.inputs.up);
    if (move.dotProduct(move) > 0) {
      move = move.normalized();
    }
    this.velocity = move.multiply(Character.walkSpeed);
  }
  readonly id: string;
  channel?: net.Channel<Snapshot, Update>;
  isLocal = false;
  inputs = new Inputs();
  zone = 'default';
  position = new Vector2(0, 0);
  velocity = new Vector2(0, 0);
}

export interface Snapshot {
  zone: string;
  position: [number, number];
  velocity: [number, number];
  // TODO: Add other synchronized properties such as player inventory.
}

export type Update = null;

export class CharacterHandler {
  constructor(character: Character) {
    this.character = character;
  }
  applyUpdate(state: Snapshot, update: Update): void {}
  onChange(state: Snapshot): void {
    this.character.position = new Vector2(state.position[0], state.position[1]);
    this.character.velocity = new Vector2(state.velocity[0], state.velocity[1]);
  }
  character: Character;
}
