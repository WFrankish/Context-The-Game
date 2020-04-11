import { Image, Sprite } from './image.js';
import { Loadable } from './loadable.js';

export class SpriteSheet implements Loadable {
  private _isLoaded = false;

  readonly assets: string | string[];

  readonly loadPromise: Promise<void>;

  readonly sprites: Sprite[] = [];

  constructor(img: Image, width: number, height: number) {
    this.assets = img.assets;
    this.loadPromise = img.loadPromise.then(() => {
      const data = img.getImage(0);
      for (let y = 0; y < data.height; y += height) {
        for (let x = 0; x < data.width; x += width) {
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
