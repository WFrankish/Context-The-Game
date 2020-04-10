import { tileWidth } from '../../common/constants.js';

export class Canvas {
    private readonly ctx: CanvasRenderingContext2D;

    private _width: number;
    private _height: number;

    private _zoom: number;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this._width = canvas.width;
        this._height = canvas.height;

        this._zoom = 2;

        window.onresize = () => this.resize();
        this.resize();
    }

    get zoom(): number {
        return this._zoom;
    }

    set zoom(value: number) {
        this._zoom = value;
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
        // sprites are drawn from the bottom centre of their tile
        // 0,0 is in the middle
        // positive is up and right

        // centre sprites horizontally
        const imgWidth = width * scaleX;
        const imgPosX = this._width / 2 + posX * tileWidth - (imgWidth - tileWidth) / 2;

        // draw from bottom
        const imgHeight = height * scaleY;
        const imgPosY = this._height / 2 - posY * tileWidth - imgHeight;

        const offscreen =
            imgPosY + imgHeight < 0 || imgPosY > this._height || imgPosX + imgWidth < 0 || imgPosX > this._width;

        if (!offscreen) {
            this.ctx.drawImage(img, imgX, imgY, width, height, imgPosX, imgPosY, imgWidth, imgHeight);
        }
    }

    private resize() {
        let { width, height } = this.ctx.canvas.getBoundingClientRect();
        width /= this._zoom;
        height /= this._zoom;

        this._width = width;
        this._height = height;
        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;

        this.ctx.imageSmoothingEnabled = false;
    }
}
