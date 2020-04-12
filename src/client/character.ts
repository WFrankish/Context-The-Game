import { Seconds } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { clamp } from '../common/utils.js';
import { inputs, Inputs } from "./inputs.js";
import Inventory from '../common/character/inventory.js';
import { Updatable } from './updatable.js';
import { Drawable } from './drawing/drawable.js';

enum Direction {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}

export class Character implements Updatable, Drawable {
  static image = new Image();
  update(dt: Seconds) {
    let move = new Vector2(inputs.right - inputs.left, inputs.down - inputs.up);
    if (move.dotProduct(move) > 0) {
      move = move.normalized();
      this.direction =
        move.x < 0 ? Direction.LEFT : move.x > 0 ? Direction.RIGHT : move.y < 0 ? Direction.UP : Direction.DOWN;
      this.animationTime += dt;
    } else {
      this.animationTime = 0;
    }
    this.rightArmPhase = clamp(this.rightArmPhase + (2 * inputs.primary - 1) * 20 * dt, 0, 1);
    this.leftArmPhase = clamp(this.leftArmPhase + (2 * inputs.secondary - 1) * 20 * dt, 0, 1);
    this.position = this.position.add(move.multiply(this.moveSpeed * dt));
  }
  draw(context: CanvasRenderingContext2D) {
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
      context.drawImage(Character.image, 32 * column, 32 * row, 32, 32, -0.5, -offset, 1, height);
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

  position = new Vector2(0, 0);
  inputs = new Inputs();
  direction = Direction.DOWN;
  animationTime = 0;
  leftArmPhase = 0;
  rightArmPhase = 0;
  moveSpeed = 3;
  inventory = new Inventory();
}
Character.image.src = 'assets/character.png';

export const localPlayer = new Character();
localPlayer.inputs = inputs;
