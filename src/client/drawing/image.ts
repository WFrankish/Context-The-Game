export interface ImageData {
  readonly data: HTMLImageElement;
  readonly startX: number;
  readonly startY: number;
  readonly width: number;
  readonly height: number;
}

export interface Image {
  getImage(dt: number): ImageData;
}

// Asynchronously load an image.
export function open(path: string): Promise<HTMLImageElement> {
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

  getImage(): ImageData {
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

  getImage(ms: number): ImageData {
    return {
      data: this.image.getImage(ms).data,
      startX: this.startX,
      startY: this.startY,
      width: this.width,
      height: this.height,
    };
  }
}

export class LoopingImage implements Image {
  private readonly drawables: Image[];

  private readonly frameLengthMs: number;

  private currentTimeMs = 0;

  constructor(frameLengthMs: number, ...images: Image[]) {
    if (frameLengthMs === 0 || images.length === 0) {
      throw Error('cannot have animation at infinite speed or with no frames you muppet');
    }
    this.frameLengthMs = frameLengthMs;
    this.drawables = images;
  }

  getImage(dt: number): ImageData {
    const frame = Math.trunc(this.currentTimeMs / this.frameLengthMs);

    this.currentTimeMs = (this.currentTimeMs + dt) % (this.frameLengthMs * this.drawables.length);

    return this.drawables[frame].getImage(dt);
  }
}
