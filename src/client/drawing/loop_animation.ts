import { Drawable } from './drawable.js';
import { Canvas } from './canvas.js';
import { Entity } from 'src/common/entity.js';

export class LoopAnimation implements Drawable {
    private _isLoaded: boolean;

    private readonly drawables: Drawable[];

    private readonly frameLengthMs: number;

    private currentTimeMs: number;

    readonly loadPromise: Promise<void>;

    constructor(frameLengthMs: number, ...drawables: Drawable[]) {
        this.frameLengthMs = frameLengthMs;
        this.drawables = drawables;
        this._isLoaded = false;
        this.currentTimeMs = 0;

        this.loadPromise = Promise.all(drawables.map((d) => d.loadPromise)).then(() => {
            this._isLoaded = true;
        });

        if(this.frameLengthMs === 0 || this.drawables.length === 0){
            throw Error("cannot have animation at infinite speed or with no frames you muppet")
        }
    }

    draw(canvas: Canvas, anchor: Entity, dt: number): void {
        const frame = Math.trunc(this.currentTimeMs / this.frameLengthMs);

        this.drawables[frame].draw(canvas, anchor, dt);

        this.currentTimeMs = (this.currentTimeMs + dt) % (this.frameLengthMs * this.drawables.length);
    }

    get isLoaded(): boolean {
        return this._isLoaded;
    }
}
