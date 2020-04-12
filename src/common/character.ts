import { Seconds } from './time.js';
import { Vector2 } from './vector2.js';
import { Inputs } from './inputs.js';

// The values for the enum correspond to the rows in the character sprite sheet.
export enum Direction {
  Right = 0,
  Up = 1,
  Left = 2,
  Down = 3,
}

export class Character {
  static radius = 0.3;
  static walkSpeed = 3;
  update(dt: Seconds) {
    let move = new Vector2(this.inputs.right - this.inputs.left, this.inputs.down - this.inputs.up);
    if (move.dotProduct(move) > 0) {
      move = move.normalized();
    }
    this.velocity = move.multiply(Character.walkSpeed);
    this.position = this.position.add(this.velocity.multiply(dt));
  }
  inputs = new Inputs();
  position = new Vector2(0, 0);
  velocity = new Vector2(0, 0);
}
