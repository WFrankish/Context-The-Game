import { Canvas } from "./drawing/canvas.js";
import { SpriteSheet } from "./drawing/spritesheet.js";
import { Entity } from "../common/entity.js";
import { LoopAnimation } from "./drawing/loop_animation.js";
import { Vector2 } from "../common/vector2.js";

export class Engine {
    private readonly canvas: Canvas;

    private previousFrameTimeMs : number;

    private isAlive: boolean;

    temp: SpriteSheet;

    temp2?: LoopAnimation;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = new Canvas(canvas);
        this.isAlive = false;
        this.previousFrameTimeMs = 0;

        this.render = this.render.bind(this);

        this.temp = new SpriteSheet("assets/walls.png", 32, 24);
    }

    run(): void {
        this.init();

        window.requestAnimationFrame(this.render);

        // TODO
        // while(this.isAlive){
        //     this.update();
        // }
    }

    kill(): void {
        this.isAlive = false;
    }

    private init(): void {
        this.isAlive = true;
    }

    private update(): void {
        // TODO
    }

    private render(totalMilliseconds: number): void {
        this.canvas.startFrame();

        const dt =  totalMilliseconds - this.previousFrameTimeMs;

        if(this.temp.isLoaded && this.temp2 === undefined){
            this.temp2 = new LoopAnimation(100, ...this.temp.sprites)
        }


        const temp = Math.trunc(totalMilliseconds / 200);
        this.temp2?.draw(this.canvas, new Entity(new Vector2(temp % 13, temp % 17)), dt);

        this.canvas.endFrame();
        if (this.isAlive) {
            window.requestAnimationFrame(this.render);
        }

        this.previousFrameTimeMs = totalMilliseconds;
    }
}
