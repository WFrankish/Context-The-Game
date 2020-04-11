export class Engine {
    private previousFrameTimeMs : number;

    private isAlive: boolean;

    constructor() {
        this.isAlive = false;
        this.previousFrameTimeMs = 0;

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
        const dt =  totalMilliseconds - this.previousFrameTimeMs;

        // TODO replace with display stuff

        this.previousFrameTimeMs = totalMilliseconds;
    }
}
