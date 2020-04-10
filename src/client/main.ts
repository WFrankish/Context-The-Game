import { Engine } from "./engine.js";
import * as charCreator from './character_creation.js';

let engine: Engine;

const kill = () => {
  engine.kill();
};

const main = () => {
  engine.run();
};

main();
