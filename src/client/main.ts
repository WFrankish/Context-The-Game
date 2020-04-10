import { Engine } from "./engine.js";

let engine: Engine;

const kill = () => {
    engine.kill();
}

const main = () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    engine = new Engine(canvas);
    engine.run();
}

main();