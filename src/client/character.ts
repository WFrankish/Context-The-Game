import { Seconds } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { clamp } from '../common/utils.js';

import * as display from './display.js';

type Input = 'up' | 'down' | 'left' | 'right' | 'primary' | 'secondary';
class Inputs {
  up = 0;
  down = 0;
  left = 0;
  right = 0;
  primary = 0;
  secondary = 0;
}
const inputs = new Inputs();
const keyBindings: Map<string, Input> = new Map([
  ['KeyW', 'up'],
  ['KeyA', 'left'],
  ['KeyS', 'down'],
  ['KeyD', 'right'],
]);
const mouseBindings: Map<number, Input> = new Map([
  [0, 'primary'],
  [2, 'secondary'],
]);
addEventListener('keydown', (event: KeyboardEvent) => {
  if (!keyBindings.has(event.code)) return;
  const action = keyBindings.get(event.code)!;
  inputs[action] = 1;
});
addEventListener('keyup', (event: KeyboardEvent) => {
  if (!keyBindings.has(event.code)) return;
  const action = keyBindings.get(event.code)!;
  inputs[action] = 0;
});
addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault());
addEventListener('mousedown', (event: MouseEvent) => {
  if (!mouseBindings.has(event.button)) return;
  const action = mouseBindings.get(event.button)!;
  inputs[action] = 1;
});
addEventListener('mouseup', (event: MouseEvent) => {
  if (!mouseBindings.has(event.button)) return;
  const action = mouseBindings.get(event.button)!;
  inputs[action] = 0;
});

enum Direction {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3,
}

export class Character {
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
    context.translate(0.5 * display.width, 0.5 * display.height);
    context.scale(32, 24);
    context.translate(this.position.x, this.position.y);
    context.imageSmoothingEnabled = false;
    const row = 1 + (this.direction as number);
    const runColumn = this.animationTime ? 1 + (Math.floor(this.animationTime * 10) % 4) : 0;
    const leftColumn = this.leftArmPhase == 0 ? 5 : this.leftArmPhase < 1 ? 6 : 7;
    const rightColumn = this.rightArmPhase == 0 ? 8 : this.rightArmPhase < 1 ? 9 : 10;
    // Draw things in a different order based on what direction the character is facing.
    const draw = (row: number, column: number) => {
      context.drawImage(Character.image, 32 * column, 32 * row, 32, 32, -0.5, -1, 1, 32/24);
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
  position = new Vector2(0, 0);
  inputs = new Inputs();
  direction = Direction.DOWN;
  animationTime = 0;
  leftArmPhase = 0;
  rightArmPhase = 0;
  moveSpeed = 3;
}
Character.image.src = 'assets/character.png';

export const localPlayer = new Character;
localPlayer.inputs = inputs;
