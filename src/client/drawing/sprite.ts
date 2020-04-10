import { Entity } from '../../common/entity.js';
import { Image } from './image.js';
import { Drawable } from './drawable.js';
import { Loadable } from './loadable.js';
import { Canvas } from './canvas.js';

export class Sprite implements Drawable {
    readonly img: Image;

    private readonly x: number;
    private readonly y: number;
    private readonly width: number;
    private readonly height: number;

    constructor(img: Image, x: number, y: number, width: number, height: number) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get isLoaded(): boolean {
        return this.img.isLoaded;
    }

    get loadPromise(): Promise<void> {
        return this.img.loadPromise;
    }

    draw(canvas: Canvas, anchor: Entity): void {
        canvas.drawImage(
            this.img.data,
            this.x,
            this.y,
            this.width,
            this.height,
            anchor.position.x,
            anchor.position.y
        );
    }
}
