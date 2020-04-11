import {Engine} from './engine.js';

let engine: Engine;

const kill =
    () => {
      engine.kill();
    }

const main =
    () => {
      engine = new Engine();
      engine.run();
    }

main();