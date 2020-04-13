import * as chat from './chat.js';
import * as net from './net.js';
import { ZoneData, Zone } from './zone.js';

const channel = net.createChannel('chat', new chat.Handler());

const zones: Map<string, Zone> = new Map();

const example: ZoneData = {
  layout: `
#######################
#######################
######  a  #    x    ##
######     #         ##
######               ##
######               ##
######     #         ##
######  b  #    y    ##
#######################
#######################`,
  obstacles: {
    a: {
      type: 'Obstacle',
      image: 'chest.png',
    },
    b: {
      type: 'Obstacle',
      image: 'chest.png',
    },
    x: {
      type: 'Portal',
      destination: {
        zone: 'example',
        portal: 'y',
      },
    },
    y: {
      type: 'Portal',
      destination: {
        zone: 'example',
        portal: 'x',
      },
    },
  },
};

async function init() {
  zones.set('example', await Zone.open('example', example));
}

async function main() {
  await init();
}
main();
