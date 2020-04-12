import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { Seconds } from '../common/time.js';
import { Character, localPlayer } from './character.js';
import { Updatable } from './updatable.js';
import { Tile } from './drawing/drawable.js';
import { Sprite, Image, openStatic, openSprites } from './drawing/image.js';
import * as common from '../common/zone.js';

interface Drawable {
  draw(context: CanvasRenderingContext2D): void;
}

// TODO: Use one of the entity types to replace this.
export class Obstacle extends common.Obstacle {
  constructor(image: Image, position: Vector2) {
    super(position);
    this.image = image;
  }
  onInteract(character: Character): void {}
  update(dt: Seconds): void {
    this.image.update(dt);
  }
  draw(context: CanvasRenderingContext2D): void {
    const image = this.image.get();
    const height = 32/24 * image.height / image.width;
    context.drawImage(image.data, image.startX, image.startY, image.width, image.height, this.position.x - 0.5,
                      this.position.y + 0.5 - height, 1, height);
  }
  readonly image: Image;
}

export class Wall extends Obstacle {
  static walls = openSprites('walls.png', 32, 24);
  static tallWalls = openSprites('tallwalls.png', 32, 48);

  static async create(position: Vector2, neighbours: common.Neighbours): Promise<Wall> {
    let image: Sprite;

    const top = neighbours.up == '#';
    const left = neighbours.left == '#';
    const bottom = neighbours.down == '#';
    const right = neighbours.right == '#';

    // WIP
    if (!top || !bottom) {
      // do not need to care about corners
      if (!top) {
        // need tall bits for top
        const sprites = await Wall.tallWalls;
        if (bottom && left && right) {
          image = sprites[2];
        } else if (!bottom && left && right) {
          image = sprites[6];
        } else if (bottom && !left && right) {
          image = sprites[1];
        } else if (!bottom && !left && right) {
          image = sprites[5];
        } else if (bottom && left && !right) {
          image = sprites[3];
        } else if (!bottom && left && !right) {
          image = sprites[7];
        } else if (bottom && !left && !right) {
          image = sprites[0];
        } else {
          image = sprites[4];
        }
      } else {
        // top, !bottom
        const sprites = await Wall.walls;
        if (left && right) {
          image = sprites[2];
        } else if (!left && right) {
          image = sprites[3];
        } else if (left && !right) {
          image = sprites[6];
        } else {
          image = sprites[7];
        }
      }
    } else {
      // top && bottom
      const sprites = await Wall.walls;
      if (left && right) {
        image = sprites[16];
      } else if (!left && right) {
        image = sprites[17];
      } else if (left && !right) {
        image = sprites[19];
      } else {
        image = sprites[21];
      }

      const topLeft = false;
      const topRight = false;
      const bottomLeft = false;
      const bottomRight = false;
      image = (await Wall.walls)[0];
    }

    return new Wall(image, position);
  }
  private constructor(image: Image, position: Vector2) {
    super(image, position);
    this.radius = 0.5;
  }
}

export class Portal extends Obstacle {
  static async create(name: string, position: Vector2, destination: common.PortalDestination) {
    const image = await openStatic('portal.png');
    return new Portal(name, image, position, destination);
  }
  private constructor(name: string, image: Image, position: Vector2, destination: common.PortalDestination) {
    super(image, position);
    this.name = name;
    this.destination = destination;
  }
  onInteract(character: Character): void {
    if (character != localPlayer) return;
    console.log('Travel to zone %s, enter through portal %s.', this.destination.zone, this.destination.portal);
  }
  readonly name: string;
  readonly destination: common.PortalDestination;
}

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

async function loadObstacle(name: string, position: Vector2, data: common.ObstacleData): Promise<Obstacle> {
  switch (data.type) {
    case 'Obstacle': {
      const image = await openStatic(data.image);
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
export class Zone extends common.Zone {
  static async open(id: string): Promise<Zone> {
    const floorImage = openStatic('floor.png');
    const {floor, obstacles} = await common.load(example, Wall.create, loadObstacle);
    return new Zone(await floorImage, floor, obstacles as Map<string, Obstacle>);
  }
  private constructor(floorImage: Image, floor: Set<string>, obstacles: Map<string, Obstacle>) {
    super(floor, obstacles);
    this.floorImage = floorImage;
    this.portals = new Map(
      [...this.obstacles.values()]
        .filter((x) => x instanceof Portal)
        .map((x) => x as Portal)
        .map((x) => [x.name, x])
    );
  }
  draw(context: CanvasRenderingContext2D): void {
    // Draw the floor. This is canvas hackery. Follow carefully.
    context.save();

    // Create a pattern for the tiles on the floor. Since integer coordinates are at the centre of tiles, we temporarily
    // offset the transform when filling so that the pattern aligns with the grid.
    context.fillStyle = context.createPattern(this.floorImage.get().data, 'repeat')!;
    context.beginPath();
    context.translate(-16, -12);
    for (const cell of this.floor) {
      const position = Vector2.fromString(cell);
      context.rect(32 * position.x, 24 * position.y, 32, 24);
    }
    context.fill();
    context.translate(16, 12);
    context.scale(32, 24);

    // Draw obstacles.
    const obstacles = [...this.obstacles.values()] as Obstacle[];
    const characters = [...this.characters] as Character[];
    const objects: Drawable[] = [...obstacles, ...characters].sort((a, b) => a.position.y - b.position.y);
    for (const object of objects) object.draw(context);

    context.restore();
  }
  private floorImage: Image;
  // Map from portal name to portal.
  readonly portals: Map<string, Portal>;
}
