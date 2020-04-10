export class Canvas {
    private readonly ctx: CanvasRenderingContext2D;

    private _width: number;
    private _height: number;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this._width = canvas.width;
        this._height = canvas.height;

        window.onresize = () => this.resize();
        this.resize();
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    clear(){
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this._width, this._height);
    }

    drawImage(
        img: HTMLImageElement,
        imgX: number,
        imgY: number,
        width: number,
        height: number,
        posX: number,
        posY: number,
        scaleX = 1,
        scaleY = 1
    ) {
        this.ctx.drawImage(img, imgX, imgY, width, height, posX, posY, width * scaleX, height * scaleY);
    }

    private resize(){
        const {width, height} = this.ctx.canvas.getBoundingClientRect();

        this._width = width;
        this._height = height;
        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;

        this.ctx.imageSmoothingEnabled = false;
    }
}
