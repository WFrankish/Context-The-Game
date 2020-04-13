import * as chat from './chat.js';
import * as net from './net.js';
import { Zone } from './zone.js';
import { generateZone } from './zone_generator.js';

const channel = net.createChannel('chat', new chat.Handler());

const zones: Map<string, Zone> = new Map();

const example = generateZone(15, 15, 9);

async function init() {
  zones.set('example', await Zone.open('example', example));
}

async function main() {
  await init();
}
main();
