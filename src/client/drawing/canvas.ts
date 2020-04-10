import { tileWidth } from '../../common/constants.js';

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

    startFrame() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this._width, this._height);
    }

    endFrame() {}

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
        // centre images horizontally
        const imgWidth = width * scaleX;
        const imgPosX = (posX * tileWidth) - ((imgWidth - tileWidth) /2);

        // draw from bottom
        const imgHeight = height * scaleY;
        const imgPosY = this._height - (posY * tileWidth) - imgHeight;

        this.ctx.drawImage(
            img,
            imgX,
            imgY,
            width,
            height,
            imgPosX,
            imgPosY,
            imgWidth,
            imgHeight
        );
    }

    private resize() {
        const { width, height } = this.ctx.canvas.getBoundingClientRect();

        this._width = width;
        this._height = height;
        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;

        this.ctx.imageSmoothingEnabled = false;
    }
}
