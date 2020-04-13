import * as chat from './chat.js';
import * as net from './net.js';
import { Zone } from './zone.js';
import { generateZone } from './zone_generator.js';
import { Character } from './character.js';

const channel = net.createChannel('chat', new chat.Handler());

const zones: Map<string, Zone> = new Map();

// TODO: Support other players besides steve.
const steve = Character.create('steve');
const defaultZone = generateZone(30, 30, 12);

async function init() {
  const zone = await Zone.open('default', defaultZone);
  zones.set('default', zone);
  const portals = [...zone.portals.values()];
  steve.position = portals[1].position;
}

async function main() {
  await init();
}
main();
