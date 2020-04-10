import { Image } from './image.js';
import { Sprite } from './sprite.js';
import { Loadable } from './loadable.js';

export class SpriteSheet implements Loadable {
    private _isLoaded: boolean;

    readonly url: string;

    readonly loadPromise: Promise<void>;

    readonly sprites: Sprite[];

    constructor(url: string, width: number, height: number) {
        this.url = url;
        this.sprites = [];

        this._isLoaded = false;
        const img = new Image(url);
        this.loadPromise = img.loadPromise.then(() => {
            for (let y = 0; y < img.data.height; y += height) {
                for (let x = 0; x < img.data.width; x += width) {
                    this.sprites.push(new Sprite(img, x, y, width, height));
                }
            }

            this._isLoaded = true;
        });
    }
    get isLoaded(): boolean {
        return this._isLoaded;
    }
}
