import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { Seconds } from '../common/time.js';
import { Character, localPlayer } from './character.js';
import { open } from './drawing/image.js';

interface Drawable {
  position: Vector2;
  draw(context: CanvasRenderingContext2D): void;
}

// TODO: Use one of the entity types to replace this.
export class Obstacle {
  constructor(image: HTMLImageElement, position = new Vector2(0, 0)) {
    if (!image.complete) throw new Error('Image is not loaded.');
    this.position = position;
    this.image = image;
    // Height as a factor of the width, adjusted by 32/24 to account for the grid transform.
    this.height = ((32 / 24) * image.height) / image.width;
  }
  draw(context: CanvasRenderingContext2D): void {
    const offset = context.drawImage(
      this.image,
      this.position.x - 0.5,
      this.position.y + 0.5 - this.height,
      1,
      this.height
    );
  }
  onInteract(character: Character): void {}
  position: Vector2;
  // TODO: Make this work using the spritesheet stuff.
  image: HTMLImageElement;
  height: number;
  radius = 0.4;
}

export class Wall extends Obstacle {
  static async create(position = new Vector2(0, 0)) {
    const image = await open('placeholder_wall.png');
    return new Wall(image, position);
  }
  private constructor(image: HTMLImageElement, position: Vector2) {
    super(image, position);
    this.radius = 0.5;
  }
}

export class Portal extends Obstacle {
  static async create(name: string, position: Vector2, destination: PortalDestination) {
    const image = await open('portal.png');
    return new Portal(name, image, position, destination);
  }
  private constructor(name: string, image: HTMLImageElement, position: Vector2, destination: PortalDestination) {
    super(image, position);
    this.name = name;
    this.destination = destination;
  }
  onInteract(character: Character): void {
    if (character != localPlayer) return;
    console.log('Travel to zone %s, enter through portal %s.', this.destination.zone, this.destination.portal);
  }
  readonly name: string;
  readonly destination: PortalDestination;
}

// The slop factor is for stability. By only applying a fractional correction rather than a full one, we'll get
// better convergence in the event of multiple contradictory collisions.
const slop = 0.5;

const example = `
~~~~~~~~~~~~~~~~~~~
~#################~
~#  a  #    x    #~
~#     #         #~
~#               #~
~#               #~
~#     #         #~
~#  b  #    y    #~
~#################~
~~~~~~~~~~~~~~~~~~~

{
  "a": {
    "type": "Obstacle",
    "image": "chest.png"
  },
  "b": {
    "type": "Obstacle",
    "image": "chest.png"
  },
  "x": {
    "type": "Portal",
    "destination": {
      "zone": "example",
      "portal": "y"
    }
  },
  "y": {
    "type": "Portal",
    "destination": {
      "zone": "example",
      "portal": "x"
    }
  }
}
`;
interface PlainObstacleData {
  type: 'Obstacle';
  image: string;
  radius?: number;
}
interface PortalDestination {
  zone: string;
  portal: string;
}
interface PortalData {
  type: 'Portal';
  destination: PortalDestination;
}
type ObstacleData = PlainObstacleData | PortalData;
async function loadObstacle(name: string, position: Vector2, data: ObstacleData) {
  switch (data.type) {
    case 'Obstacle': {
      const image = await open(data.image);
      const result = new Obstacle(image, position);
      if (data.radius != undefined) result.radius = data.radius;
      return result;
    }
    case 'Portal': {
      return await Portal.create(name, position, data.destination);
    }
  }
}

const characterRadius = 0.3;
export class Zone {
  static async open(id: string): Promise<Zone> {
    const floorImage = open('floor.png');
    // TODO: Load the zone from the server rather than from the example.
    const sections = example.split('\n\n');
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
            placedObstacles.set(position.toString(), Wall.create(position));
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
    return new Zone(await floorImage, floor, obstacles);
  }
  private constructor(floorImage: HTMLImageElement, floor: Set<string>, obstacles: Map<string, Obstacle>) {
    if (!floorImage.complete) throw new Error('floor image is not loaded.');
    this.floorImage = floorImage;
    this.floor = floor;
    this.obstacles = obstacles;
    this.portals = new Map(
      [...this.obstacles.values()]
        .filter((x) => x instanceof Portal)
        .map((x) => x as Portal)
        .map((x) => [x.name, x])
    );
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
        const correction = offset.multiply((0.5 * slop * (2 * characterRadius - distance)) / distance);
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
          const minDistance = characterRadius + obstacle.radius;
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
  draw(context: CanvasRenderingContext2D): void {
    // TODO: Support a camera. This has to be done inside Zone if we want to be able to selectively skip drawing
    // objects that are off the edges.

    // Draw the floor. This is canvas hackery. Follow carefully.
    context.save();
    context.save();
    context.fillStyle = '#000';
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
    // Apply the virtual pixels -> world transform.
    context.translate(0.5 * display.width, 0.5 * display.height);
    // Create a pattern for the tiles on the floor. Since integer coordinates are at the centre of tiles, we temporarily
    // offset the transform when filling so that the pattern aligns with the grid.
    context.fillStyle = context.createPattern(this.floorImage, 'repeat')!;
    context.translate(-16, -12);
    context.beginPath();
    for (const cell of this.floor) {
      const position = Vector2.fromString(cell);
      context.rect(32 * position.x, 24 * position.y, 32, 24);
    }
    context.fill();
    context.translate(16, 12);
    context.scale(32, 24);
    // Draw obstacles.
    const objects: Drawable[] = [...this.obstacles.values(), ...this.characters];
    objects.sort((a, b) => a.position.y - b.position.y);
    console.log(objects.map((x) => x.constructor.name).join(', '));
    for (const object of objects) object.draw(context);
    context.restore();
  }
  private floorImage: HTMLImageElement;
  private floor: Set<string>;
  // Map from stringified position to obstacle.
  private obstacles: Map<string, Obstacle>;
  // Map from portal name to portal.
  readonly portals: Map<string, Portal>;
  characters: Set<Character> = new Set();
}
