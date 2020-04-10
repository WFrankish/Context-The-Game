export class Engine {
    private readonly ctx: CanvasRenderingContext2D;

    private isAlive: boolean;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
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
        // TODO

        if (this.isAlive) {
            window.requestAnimationFrame(this.render);
        }
    }
}
