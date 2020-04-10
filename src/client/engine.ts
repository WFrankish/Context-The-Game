import { Canvas } from "./drawing/canvas.js";

export class Engine {
    private readonly canvas: Canvas;;

    private isAlive: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = new Canvas(canvas);
        this.isAlive = false;

        this.render = this.render.bind(this);
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
        this.canvas.clear();

        if (this.isAlive) {
            window.requestAnimationFrame(this.render);
        }
    }
}
