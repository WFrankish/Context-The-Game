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

export class Sprite implements Image {
  private readonly image: HTMLImageElement;
  private readonly startX: number;
  private readonly startY: number;
  private readonly width: number;
  private readonly height: number;

  constructor(image: HTMLImageElement, x: number, y: number, width: number, height: number) {
    this.image = image;
    this.startX = x;
    this.startY = y;
    this.width = width;
    this.height = height;
  }

  update(dt: Seconds): void {}

  get(): ImageData {
    return {
      data: this.image,
      startX: this.startX,
      startY: this.startY,
      width: this.width,
      height: this.height,
    };
  }
}

export async function openStatic(path: string): Promise<Sprite> {
  const image = await open(path);
  return new Sprite(image, 0, 0, image.width, image.height);
}

export async function openSprites(path: string, width: number, height: number): Promise<Sprite[]> {
  const image = await open(path);
  const sprites = [];
  const border = 1;
  for (let y = border; y < image.height; y += height + 2 * border) {
    for (let x = border; x < image.width; x += width + 2 * border) {
      sprites.push(new Sprite(image, x, y, width, height));
    }
  }
  return sprites;
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
