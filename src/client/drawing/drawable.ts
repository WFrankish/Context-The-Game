import { Image } from './image.js';
import { Vector2 } from '../../common/vector2.js';
import * as display from '../display.js';
import { tileWidth, tileHeight } from '../../common/constants.js';
import { Seconds } from 'src/common/time.js';

export interface Drawable {
  draw(ctx: CanvasRenderingContext2D, dt: Seconds): void;
}

export class Tile implements Drawable {
  img: Image;

  position: Vector2;

  constructor(img: Image, position: Vector2) {
    this.img = img;
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D, dt: Seconds) {
    let { x, y } = this.position;

    const img = this.img.getImage(dt);
    // sprites are drawn from the bottom centre of their tile
    // positive is up and right

    // centre sprites horizontally
    x = x * tileWidth - (img.width - tileWidth) / 2;

    // draw from bottom
    y = display.height - y * tileHeight - img.height;

    ctx.drawImage(img.data, img.startX, img.startY, img.width, img.height, x, y, img.width, img.height);
  }
}

export enum Anchor {
  Top,
  TopRight,
  Right,
  BottomRight,
  Bottom,
  BottomLeft,
  Left,
  TopLeft,
  Centre,
}

export class HudPiece implements Drawable {
  img: Image;

  position: Vector2;

  anchor: Anchor;

  constructor(img: Image, position: Vector2, anchor = Anchor.TopLeft) {
    this.img = img;
    this.position = position;
    this.anchor = anchor;
  }

  draw(ctx: CanvasRenderingContext2D, dt: Seconds) {
    // allow wrapping - e.g. -1 indicates 1 from right or top
    let { x, y } = this.position;
    x = x >= 0 ? x : display.width + x;
    y = y >= 0 ? y : display.height + y;

    const img = this.img.getImage(dt);

    switch (this.anchor) {
      case Anchor.Top:
      case Anchor.Centre:
      case Anchor.Bottom:
        x = x - Math.trunc(img.width / 2);
        break;
      case Anchor.TopRight:
      case Anchor.Right:
      case Anchor.BottomRight:
        x = x - img.width;
        break;
      default:
        break;
    }

    switch (this.anchor) {
      case Anchor.Left:
      case Anchor.Centre:
      case Anchor.Right:
        y = y - Math.trunc(img.height / 2);
        break;
      case Anchor.BottomLeft:
      case Anchor.Bottom:
      case Anchor.BottomRight:
        y = y - img.height;
        break;
    }

    ctx.drawImage(img.data, img.startX, img.startY, img.width, img.height, x, y, img.width, img.height);
  }
}
