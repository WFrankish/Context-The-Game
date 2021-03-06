import { Seconds } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { clamp } from '../common/utils.js';
import { inputs, Inputs } from './inputs.js';
import Inventory from '../common/character/inventory.js';
import { Updatable } from './updatable.js';
import { Drawable } from './drawing/drawable.js';
import * as common from '../common/character.js';
import * as display from './display.js';
import * as net from './net.js';

enum Direction {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}

class CharacterHandler extends common.CharacterHandler {
  constructor(character: Character) {
    super(character);
  }
  copyState(state: common.Snapshot): common.Snapshot {
    return JSON.parse(JSON.stringify(state)) as common.Snapshot;
  }
  loadSnapshot(data: net.JsonObject): common.Snapshot {
    return (data as unknown) as common.Snapshot;
  }
}

export class Character extends common.Character {
  static image = new Image();

  get image() {
    return Character.image;
  }

  static async local(id: string): Promise<Character> {
    const character = new Character(id);
    character.isLocal = true;
    character.inputs = inputs;
    character.channel = await net.subscribe('/character/' + id, new CharacterHandler(character));
    return character;
  }
  static async remote(id: string): Promise<Character> {
    const character = new Character(id);
    character.channel = await net.subscribe('/character/' + id, new CharacterHandler(character));
    return character;
  }

  update(dt: Seconds) {
    super.update(dt);
    if(this.isLocal){
      const x = clamp(display.camera.position.x, this.position.x - 10, this.position.x + 10);
      const y = clamp(display.camera.position.y, this.position.y - 6, this.position.y + 6);

      display.camera.position = new Vector2(x,y);
    }

    if (this.velocity.dotProduct(this.velocity) > 0) {
      this.direction =
        this.velocity.x < 0
          ? Direction.LEFT
          : this.velocity.x > 0
          ? Direction.RIGHT
          : this.velocity.y < 0
          ? Direction.UP
          : Direction.DOWN;
      this.animationTime += dt;
    } else {
      this.animationTime = 0;
    }
    this.rightArmPhase = clamp(this.rightArmPhase + (2 * this.inputs.primary - 1) * 20 * dt, 0, 1);
    this.leftArmPhase = clamp(this.leftArmPhase + (2 * this.inputs.secondary - 1) * 20 * dt, 0, 1);
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.imageSmoothingEnabled = false;
    const row = 1 + (this.direction as number);
    const runColumn = this.animationTime ? 1 + (Math.floor(this.animationTime * 10) % 4) : 0;
    const leftColumn = this.leftArmPhase == 0 ? 5 : this.leftArmPhase < 1 ? 6 : 7;
    const rightColumn = this.rightArmPhase == 0 ? 8 : this.rightArmPhase < 1 ? 9 : 10;
    // Draw things in a different order based on what direction the character is facing.
    const draw = (row: number, column: number) => {
      // The character's feet are not right at the bottom of the image, they are slightly further up.
      const feetOffset = 4;
      // We have to scale the image to counteract the non-square grid transform.
      const height = 32 / 24;
      const offset = (32 - feetOffset) / 24;
      context.drawImage(this.image, 32 * column, 32 * row, 32, 32, -0.5, -offset, 1, height);
    };
    if (row < 3) {
      draw(row, leftColumn);
      draw(row, runColumn);
      draw(row, rightColumn);
    } else {
      draw(row, rightColumn);
      draw(row, runColumn);
      draw(row, leftColumn);
    }
    context.restore();
  }

  get hudText(): string {
    return `${this.inventory.usedWeight}/${this.inventory.maxWeight} | ${this.inventory.usedVolume}/${this.inventory.maxVolume}`;
  }

  direction = Direction.DOWN;
  animationTime = 0;
  leftArmPhase = 0;
  rightArmPhase = 0;
  inventory = new Inventory();
}

Character.image.src = '/assets/character.png';

let initialized = false;
let _localPlayer: Character | undefined;
export async function init() {
  if (initialized) throw new Error('Initialized multiple times.');
  initialized = true;
  if (localStorage.watch) {
    _localPlayer = await Character.remote('steve');
  } else {
    _localPlayer = await Character.local('steve');
  }
  _localPlayer.inputs = inputs;
}

export function localPlayer() {
  if (!_localPlayer) throw new Error('Local player is not initialized.');
  return _localPlayer;
}
