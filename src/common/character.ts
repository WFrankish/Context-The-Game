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
    this._position = this._position.add(this._velocity.multiply(dt));
  }
  get position() {
    return this._position;
  }
  get velocity() {
    return this._velocity;
  }
  set position(value: Vector2) {
    if (this._position.equals(value)) return;
    this._position = value;
    this.sendMovements();
  }
  set velocity(value: Vector2) {
    if (this._velocity.equals(value)) return;
    this._velocity = value;
    this.sendMovements();
  }
  sendMovements() {
    if (!this.isLocal) return;
    if (!this.channel) return;
    this.channel.update({
      type: 'Movement',
      position: [this._position.x, this._position.y],
      velocity: [this._velocity.x, this._velocity.y],
    });
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
  _position = new Vector2(0, 0);
  _velocity = new Vector2(0, 0);
}

export interface Snapshot {
  zone: string;
  position: [number, number];
  velocity: [number, number];
  // TODO: Add other synchronized properties such as player inventory.
}

interface TeleportUpdate {
  type: 'Teleport';
  zone: string;
}

interface MovementUpdate {
  type: 'Movement';
  position: [number, number];
  velocity: [number, number];
}

export type Update = TeleportUpdate | MovementUpdate;

export class CharacterHandler {
  constructor(character: Character) {
    this.character = character;
  }
  applyUpdate(state: Snapshot, update: Update): void {
    switch (update.type) {
      case 'Teleport':
        state.zone = update.zone;
        break;
      case 'Movement':
        state.position = update.position;
        state.velocity = update.velocity;
        break;
    }
  }
  onChange(state: Snapshot): void {
    if (!this.character.isLocal || !this.initialized) {
      this.initialized = true;
      this.character.zone = state.zone;
      this.character.position = new Vector2(state.position[0], state.position[1]);
      this.character.velocity = new Vector2(state.velocity[0], state.velocity[1]);
    }
  }
  character: Character;
  initialized = false;
}
