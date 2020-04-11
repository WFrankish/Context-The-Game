import { Loadable } from './loadable';

export interface ImageData {
  readonly data: HTMLImageElement;
  readonly startX: number;
  readonly startY: number;
  readonly width: number;
  readonly height: number;
}

export interface Image extends Loadable {
  getImage(dt: number): ImageData;
}

export class StaticImage implements Image {
  private _isLoaded = false;

  private imageData?: ImageData;

  readonly assets: string;
  readonly loadPromise: Promise<void>;

  constructor(path: string) {
    this.assets = path;
    const img = document.createElement('img');

    img.src = './assets/' + path;
    this.loadPromise = new Promise((resolve) => {
      img.onload = () => {
        this._isLoaded = true;
        this.imageData = {
          data: img,
          startX: 0,
          startY: 0,
          width: img.width,
          height: img.height,
        };
        resolve();
      };
    });
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  getImage(): ImageData {
    if (this._isLoaded) {
      return this.imageData!;
    } else {
      throw Error(this.assets + ' is not loaded yet');
    }
  }
}

export class Sprite implements Image {
  private readonly img: Image;
  private readonly startX: number;
  private readonly startY: number;
  private readonly width: number;
  private readonly height: number;

  constructor(img: Image, x: number, y: number, width: number, height: number) {
    this.img = img;
    this.startX = x;
    this.startY = y;
    this.width = width;
    this.height = height;
  }

  get assets(): string | string[] {
    return this.img.assets;
  }

  get loadPromise(): Promise<void> {
    return this.img.loadPromise;
  }

  get isLoaded(): boolean {
    return this.img.isLoaded;
  }

  getImage(ms: number): ImageData {
    return {
      data: this.img.getImage(ms).data,
      startX: this.startX,
      startY: this.startY,
      width: this.width,
      height: this.height,
    };
  }
}

export class LoopingImage implements Image {
  private _isLoaded: boolean = false;

  private readonly drawables: Image[];

  private readonly frameLengthMs: number;

  private currentTimeMs = 0;

  readonly assets: string[];

  readonly loadPromise: Promise<void>;

  constructor(frameLengthMs: number, ...images: Image[]) {
    if (frameLengthMs === 0 || images.length === 0) {
      throw Error('cannot have animation at infinite speed or with no frames you muppet');
    }
    this.frameLengthMs = frameLengthMs;
    this.drawables = images;

    this.assets = [];
    for (let drawable of images) {
      if (typeof drawable.assets === 'string') {
        this.assets.push(drawable.assets);
      } else {
        this.assets.push(...drawable.assets);
      }
    }

    this.loadPromise = Promise.all(images.map((d) => d.loadPromise)).then(() => {
      this._isLoaded = true;
    });
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  getImage(dt: number): ImageData {
    const frame = Math.trunc(this.currentTimeMs / this.frameLengthMs);

    this.currentTimeMs = (this.currentTimeMs + dt) % (this.frameLengthMs * this.drawables.length);

    return this.drawables[frame].getImage(dt);
  }
}
