import { Vector2 } from './vector2.js';
import { Seconds } from './time.js';
import { Character } from './character.js';

export class Obstacle {
  constructor(position: Vector2) {
    this.position = position;
  }
  onInteract(character: Character): void {}
  position: Vector2;
  radius = 0.4;
}

export interface Portal extends Obstacle {
  name: string;
  destination: PortalDestination;
}

export class Wall extends Obstacle {
  constructor(position: Vector2) {
    super(position);
    this.radius = 0.5;
  }
}

export interface PlainObstacleData {
  type: 'Obstacle';
  image: string;
  radius?: number;
}

export interface PortalDestination {
  zone: string;
  portal: string;
}

export interface PortalData {
  type: 'Portal';
  destination: PortalDestination;
}

export type ObstacleData = PlainObstacleData | PortalData;

export interface Neighbours {
  up: string
  left: string
  down: string
  right: string
}

export type LoadWall = (position: Vector2, neighbours: Neighbours) => Promise<Obstacle>;
export type LoadObstacle = (name: string, position: Vector2, data: ObstacleData) => Promise<Obstacle>;

export async function load(data: string, loadWall: LoadWall, loadObstacle: LoadObstacle) {
  // TODO: Load the zone from the server rather than from the example.
  const sections = data.split('\n\n');
  if (sections.length != 2) throw new Error('Invalid map.');
  // Build the objects in the tile data.
  const obstacleData: Map<string, ObstacleData | null> = new Map(Object.entries(JSON.parse(sections[1])));
  // Load the layout.
  const lines = sections[0].split('\n');
  const width = Math.max(...lines.map((x) => x.length));
  const height = lines.length;
  const floor: Set<string> = new Set();
  const placedObstacles: Map<string, Promise<Obstacle>> = new Map();
  for (let y = 0; y < height; y++) {
    for (let x = 0, lineWidth = lines[y].length; x < lineWidth; x++) {
      const position = new Vector2(Math.floor(x - 0.5 * width), Math.floor(y - 0.5 * height));
      const type = lines[y][x];
      switch (type) {
        case '~':
          break;
        case ' ':
          floor.add(position.toString());
          break;
        case '#':
          // TODO: Use adjacent cells to determine which wall tile to use.
          const neighbours = {
            up: lines[y - 1][x] || '~',
            left: lines[y][x - 1] || '~',
            down: lines[y + 1][x] || '~',
            right: lines[y][x + 1] || '~',
          };
          placedObstacles.set(position.toString(), loadWall(position, neighbours));
          break;
        default:
          floor.add(position.toString());
          const obstacle = obstacleData.get(type);
          if (!obstacle) throw new Error('Undefined obstacle type: ' + type);
          if (obstacle == null) throw new Error('Obstacle type ' + type + ' used multiple times.');
          placedObstacles.set(position.toString(), loadObstacle(type, position, obstacle));
          obstacleData.set(type, null);
      }
    }
  }
  for (const [key, obstacle] of obstacleData) {
    if (obstacle != null) throw new Error('Unused obstacle: ' + key);
  }
  // Wait for all of the tiles to load.
  const obstacles: Map<string, Obstacle> = new Map();
  for (const [key, obstaclePromise] of placedObstacles) {
    obstacles.set(key, await obstaclePromise);
  }
  return {floor, obstacles};
}

export abstract class Zone {
  constructor(floor: Set<string>, obstacles: Map<string, Obstacle>) {
    this.floor = floor;
    this.obstacles = obstacles;
  }
  update(dt: Seconds): void {
    // The slop factor is for stability. By only applying a fractional correction rather than a full one, we'll get
    // better convergence in the event of multiple contradictory collisions.
    const slop = 0.5;
    const characters = [...this.characters];
    for (const character of characters) character.update(dt);
    // Handle collisions between characters.
    for (let i = 0, n = characters.length; i < n; i++) {
      const a = characters[i];
      for (let j = i + 1; j < n; j++) {
        const b = characters[j];
        const offset = b.position.subtract(a.position);
        const distance = offset.length;
        if (distance > Character.radius) continue;
        const correction = offset.multiply((0.5 * slop * (2 * Character.radius - distance)) / distance);
        a.position = a.position.subtract(correction);
        b.position = b.position.add(correction);
      }
    }
    // Handle collisions between players and obstacles.
    for (const character of characters) {
      const x = Math.round(character.position.x),
        y = Math.round(character.position.y);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const key = new Vector2(x + dx, y + dy).toString();
          const obstacle = this.obstacles.get(key);
          if (!obstacle) continue;
          // Check for overlap with the obstacle by computing overlap in each axis.
          const offset = obstacle.position.subtract(character.position);
          const minDistance = Character.radius + obstacle.radius;
          const axes: [number, Vector2][] = [
            [minDistance - offset.x, new Vector2(1, 0)],
            [minDistance + offset.x, new Vector2(-1, 0)],
            [minDistance - offset.y, new Vector2(0, 1)],
            [minDistance + offset.y, new Vector2(0, -1)],
          ];
          if (axes.some((x) => x[0] <= 0)) continue;
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
  // Set of stringified positions for floor tiles.
  readonly floor: Set<string>;
  // Map from stringified position to obstacle.
  readonly obstacles: Map<string, Obstacle>;
  // Map from portal name to portal.
  abstract readonly portals: Map<string, Portal>;
  characters: Set<Character> = new Set();
}
