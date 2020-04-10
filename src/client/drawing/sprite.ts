import { Image } from './image.js';
import { Drawable } from './drawable.js';
import { Canvas } from './canvas.js';
import { Vector2 } from '../../common/vector2.js';

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

    draw(canvas: Canvas, position: Vector2): void {
        canvas.drawImage(
            this.img.data,
            this.x,
            this.y,
            this.width,
            this.height,
            position.x,
            position.y
        );
    }
}
