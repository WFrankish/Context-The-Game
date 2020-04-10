import * as engine from './engine.js';
import {creationInit} from './character_creation.js';

const kill = () => {
  engine.kill();
};

const main = () => {
  engine.run();
};

main();
