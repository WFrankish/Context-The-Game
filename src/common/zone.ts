import { Vector2 } from './vector2.js';
import { Seconds } from './time.js';
import { Character } from './character.js';
import * as net from './net.js';

export class Obstacle {
  constructor(position: Vector2) {
    this.position = position;
  }
  update(dt: Seconds): void {}
  // TODO: Figure out how this should be invoked. For the local player, we should probably have some code which looks
  // for an obstacle in the direction the character is facing when the player hits the primary action key, and calls
  // onInteract on it. After we've got the local player part working we'll need to figure out how to network it
  // properly. Probably we can simply ignore this event for networked characters and rely on the consequences being
  // visible directly.
  onInteract(character: Character): void {}
  position: Vector2;
  radius = 0.4;
  collides = true;
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

// TODO: Remove this once we've made some real obstacle types.
export interface PlainObstacleData {
  type: 'Obstacle';
  image: string;
  radius?: number;
}

export interface PortalDestination {
  // The zone which this portal takes the player to.
  zone: string;
  // The portal within the target zone from which the player should spawn.
  portal: string;
}

export interface PortalData {
  type: 'Portal';
  destination: PortalDestination;
}

export type ObstacleData = PlainObstacleData | PortalData;

// The network representation of a zone.
export interface ZoneData {
  // A string containing an ascii-art depiction of the map:
  //
  //   `~`: The void, which appears on the outside of all external-edge walls.
  //   '#': Walls
  //   ' ': Floor which can be reached by players.
  //   alphanumeric: Obstacles described by the "obstacles" field.
  layout: string;
  // Custom/unique obstacles present in the layout diagram.
  obstacles: {[name: string]: ObstacleData};
  // IDs of all characters in the zone.
  characters: Set<string>;
}

export type Update =
  | {type: 'Enter', id: string}
  | {type: 'Leave', id: string};

export interface Neighbours {
  up: string;
  left: string;
  down: string;
  right: string;
  upLeft: string;
  downLeft: string;
  upRight: string;
  downRight: string;
}

export type LoadWall = (position: Vector2, neighbours: Neighbours) => Promise<Obstacle>;
export type LoadObstacle = (name: string, position: Vector2, data: ObstacleData) => Promise<Obstacle>;

export async function load(data: ZoneData, loadWall: LoadWall, loadObstacle: LoadObstacle) {
  // Build the objects in the tile data.
  const obstacleData: Map<string, ObstacleData | null> = new Map(Object.entries(data.obstacles));
  // Load the layout.
  const lines = data.layout.split('\n');
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
          const edge = '#';
          const neighbours: Neighbours = {
            up: lines[y - 1]?.[x] ?? edge,
            left: lines[y]?.[x - 1] ?? edge,
            down: lines[y + 1]?.[x] ?? edge,
            right: lines[y]?.[x + 1] ?? edge,
            upLeft: lines[y - 1]?.[x - 1] ?? edge,
            upRight: lines[y - 1]?.[x + 1] ?? edge,
            downLeft: lines[y + 1]?.[x - 1] ?? edge,
            downRight: lines[y + 1]?.[x + 1] ?? edge,
          };
          placedObstacles.set(position.toString(), loadWall(position, neighbours));
          break;
        default:
          const obstacle = obstacleData.get(type);
          if (obstacle === undefined) throw new Error('Undefined obstacle type: ' + type);
          if (obstacle === null) throw new Error('Obstacle type ' + type + ' used multiple times.');
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
  return { floor, obstacles };
}

export abstract class ZoneHandler implements net.BaseHandler<ZoneData, Update> {
  applyUpdate(state: ZoneData, update: Update) {
    switch (update.type) {
      case 'Enter':
        state.characters.add(update.id);
        break;
      case 'Leave':
        state.characters.delete(update.id);
        break;
    }
  }
  onChange(state: ZoneData): void {}
}

export abstract class Zone {
  constructor(floor: Set<string>, obstacles: Map<string, Obstacle>) {
    this.floor = floor;
    this.obstacles = obstacles;
  }
  update(dt: Seconds): void {
    const obstacles = [...this.obstacles.values()];
    for (const obstacle of obstacles) obstacle.update(dt);
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
          if (!obstacle.collides) continue;
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
  channel?: net.Channel<ZoneData, Update>;
  // Set of stringified positions for floor tiles.
  readonly floor: Set<string>;
  // Map from stringified position to obstacle.
  readonly obstacles: Map<string, Obstacle>;
  // All the characters.
  readonly characters: Set<Character> = new Set();
  // Map from portal name to portal.
  abstract readonly portals: Map<string, Portal>;
}
