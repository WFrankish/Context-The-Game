import { Seconds } from "src/common/time";

export interface ImageData {
  readonly data: HTMLImageElement;
  readonly startX: number;
  readonly startY: number;
  readonly width: number;
  readonly height: number;
}

export interface Image {
  update(dt: Seconds): void;
  get(): ImageData;
}

// Asynchronously load an image.
function open(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = '/assets/' + path;
    image.onload = () => resolve(image);
    image.onerror = () => reject();
  });
}

export class StaticImage implements Image {
  static async open(path: string): Promise<StaticImage> {
    return new StaticImage(await open(path));
  }

  private constructor(image: HTMLImageElement) {
    if (!image.complete) {
      throw new Error('Image must be loaded before StaticImage can be constructed.');
    }
    this.imageData = {
      data: image,
      startX: 0,
      startY: 0,
      width: image.width,
      height: image.height,
    };
  }

  update(dt: Seconds): void {}

  get(): ImageData {
    return this.imageData;
  }

  private imageData: ImageData;
}

export class Sprite implements Image {
  private readonly image: Image;
  private readonly startX: number;
  private readonly startY: number;
  private readonly width: number;
  private readonly height: number;

  constructor(image: Image, x: number, y: number, width: number, height: number) {
    this.image = image;
    this.startX = x;
    this.startY = y;
    this.width = width;
    this.height = height;
  }

  update(dt: Seconds): void {}

  get(): ImageData {
    return {
      data: this.image.get().data,
      startX: this.startX,
      startY: this.startY,
      width: this.width,
      height: this.height,
    };
  }
}

export class LoopingImage implements Image {
  private readonly drawables: Image[];

  private readonly frameLength: Seconds;

  private currentTime: Seconds = 0;

  constructor(frameLength: Seconds, ...images: Image[]) {
    if (frameLength === 0 || images.length === 0) {
      throw Error('cannot have animation at infinite speed or with no frames you muppet');
    }
    this.frameLength = frameLength;
    this.drawables = images;
  }

  update(dt: Seconds): void {
    this.currentTime = (this.currentTime + dt) % (this.frameLength * this.drawables.length);
  }

  get(): ImageData {
    const frame = Math.trunc(this.currentTime / this.frameLength);
    return this.drawables[frame].get();
  }
}
