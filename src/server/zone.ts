import { Vector2 } from '../common/vector2.js';
import * as common from '../common/zone.js';
import { Seconds } from '../common/time.js';
import * as netCommon from '../common/net.js';
import * as net from './net.js';
export { ZoneData } from '../common/zone.js';

export class Obstacle extends common.Obstacle {
  constructor(position: Vector2) {
    super(position);
  }
}

export class Wall extends Obstacle {
  constructor(position: Vector2) {
    super(position);
    this.radius = 0.5;
  }
}

export class Portal extends Obstacle {
  constructor(name: string, position: Vector2, destination: common.PortalDestination) {
    super(position);
    this.name = name;
    this.destination = destination;
  }
  readonly name: string;
  readonly destination: common.PortalDestination;
}

async function loadWall(position: Vector2, neighbours: common.Neighbours): Promise<Wall> {
  return new Wall(position);
}

async function loadObstacle(name: string, position: Vector2, data: common.ObstacleData): Promise<Obstacle> {
  switch (data.type) {
    case 'Obstacle':
      return new Obstacle(position);
    case 'Portal':
      return new Portal(name, position, data.destination);
  }
}

class ZoneHandler extends common.ZoneHandler implements net.Handler<common.ZoneData, common.Update> {
  static async create(data: common.ZoneData) {
    const { floor, obstacles } = await common.load(data, loadWall, loadObstacle);
    return new ZoneHandler(data, new Zone(floor, obstacles));
  }
  constructor(data: common.ZoneData, zone: Zone) {
    super();
    this.data = data;
    this.zone = zone;
  }
  defaultState() {
    return this.data;
  }
  // TODO: Send information about the active state of the zone.
  encodeSnapshot(data: common.ZoneData): netCommon.JsonObject {
    return (data as unknown) as netCommon.JsonObject;
  }
  data: common.ZoneData;
  zone: Zone;
}

export class Zone extends common.Zone {
  static async open(name: string, data: common.ZoneData) {
    const handler = await ZoneHandler.create(data);
    const channel = net.createChannel('/zone/' + name, handler);
    return handler.zone;
  }
  constructor(floor: Set<string>, obstacles: Map<string, Obstacle>) {
    super(floor, obstacles);
    this.portals = new Map(
      [...this.obstacles.values()]
        .filter((x) => x instanceof Portal)
        .map((x) => x as Portal)
        .map((x) => [x.name, x])
    );
  }
  readonly portals: Map<string, Portal>;
}
