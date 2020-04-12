import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { Seconds } from '../common/time.js';
import { Character, localPlayer } from './character.js';

interface Drawable {
  position: Vector2;
  draw(context: CanvasRenderingContext2D): void;
}

// TODO: Use one of the entity types to replace this.
export class Obstacle {
  constructor(position: Vector2, image: HTMLImageElement) {
    this.position = position;
    if (!image.complete) throw new Error('Image is not loaded.');
    this.image = image;
    // Height as a factor of the width, adjusted by 32/24 to account for the grid transform.
    this.height = ((32 / 24) * image.height) / image.width;
  }
  draw(context: CanvasRenderingContext2D): void {
    const offset = 
    context.drawImage(this.image, this.position.x - 0.5, this.position.y + 0.5 - this.height, 1, this.height);
  }
  position: Vector2;
  // TODO: Make this work using the spritesheet stuff.
  image: HTMLImageElement;
  height: number;
  radius = 0.4;
}

// The slop factor is for stability. By only applying a fractional correction rather than a full one, we'll get
// better convergence in the event of multiple contradictory collisions.
const slop = 0.5;

const characterRadius = 0.3;
export class Zone {
  constructor(floor: HTMLImageElement) {
    if (!floor.complete) throw new Error('floor image is not loaded.');
    this.floor = floor;
  }
  update(dt: Seconds): void {
    const characters = [...this.characters];
    for (const character of characters) character.update(dt);
    // Handle collisions between characters.
    for (let i = 0, n = characters.length; i < n; i++) {
      const a = characters[i];
      for (let j = i + 1; j < n; j++) {
        const b = characters[j];
        const offset = b.position.subtract(a.position);
        const distance = offset.length;
        if (distance > 2 * characterRadius) continue;
        const correction = offset.multiply(0.5 * slop * (2 * characterRadius - distance) / distance);
        a.position = a.position.subtract(correction);
        b.position = b.position.add(correction);
      }
    }
    // Build a hashmap of obstacles keyed by position.
    const obstacles: Map<string, Obstacle> = new Map();
    for (const obstacle of this.obstacles) {
      if (obstacle.position.x % 1 != 0 || obstacle.position.y % 1 != 0) {
        throw new Error('Obstacle has non-integer position.');
      }
      const key = obstacle.position.x + ',' + obstacle.position.y;
      obstacles.set(key, obstacle);
    }
    // Handle collisions between players and obstacles.
    for (const character of characters) {
      const x = Math.round(character.position.x), y = Math.round(character.position.y);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const key = (x + dx) + ',' + (y + dy);
          const obstacle = obstacles.get(key);
          if (!obstacle) continue;
          // Check for overlap with the obstacle by computing overlap in each axis.
          const offset = obstacle.position.subtract(character.position);
          const minDistance = characterRadius + obstacle.radius;
          const axes: [number, Vector2][] = [
            [minDistance - offset.x, new Vector2(1, 0)],
            [minDistance + offset.x, new Vector2(-1, 0)],
            [minDistance - offset.y, new Vector2(0, 1)],
            [minDistance + offset.y, new Vector2(0, -1)],
          ];
          if (axes.some(x => x[0] <= 0)) continue;
          let minOverlap = Infinity;
          let minAxis: Vector2 | undefined;
          for (const [overlap, axis] of axes) {
            if (overlap < minOverlap) {
              minOverlap = overlap;
              minAxis = axis;
            }
          }
          if (!minAxis) continue;
          const correction = minAxis!.multiply(slop * minOverlap);
          character.position = character.position.subtract(correction);
        }
      }
    }
  }
  draw(context: CanvasRenderingContext2D): void {
    // TODO: Support a camera. This has to be done inside Zone if we want to be able to selectively skip drawing
    // objects that are off the edges.

    // Draw the floor. This is canvas hackery. Follow carefully.
    context.save();
    context.beginPath();
    // Here, we temporarily reset the transform so that we can enqueue a rectangle that fills the entire canvas.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.rect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
    // After restoring the transform, we still have a full-size rectangle enqueued, but we have the old transform back.
    // Apply the virtual pixels -> world transform.
    context.translate(0.5 * display.width, 0.5 * display.height);
    // Create a pattern for the tiles on the floor. Since integer coordinates are at the centre of tiles, we temporarily
    // offset the transform when filling so that the pattern aligns with the grid.
    context.fillStyle = context.createPattern(this.floor, 'repeat')!;
    context.translate(16, 12);
    context.fill();
    context.translate(-16, -12);
    context.scale(32, 24);
    // Draw obstacles.
    const objects: Drawable[] = [...this.obstacles, ...this.characters];
    objects.sort((a, b) => a.position.y - b.position.y);
    console.log(objects.map(x => x.constructor.name).join(', '));
    for (const object of objects) object.draw(context);
    context.restore();
  }
  floor: HTMLImageElement;
  obstacles: Set<Obstacle> = new Set();
  characters: Set<Character> = new Set();
}
