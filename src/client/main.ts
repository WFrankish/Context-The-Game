import { Engine } from "./engine.js";

let engine: Engine;

const kill = () => {
    engine.kill();
}

const main = () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    const ctx = canvas.getContext("2d")!;
    engine = new Engine(ctx);
    engine.run();
}

main();