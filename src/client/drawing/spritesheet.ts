import { Image, Sprite } from './image.js';

export class SpriteSheet {
  readonly sprites: Sprite[] = [];

  constructor(image: Image, width: number, height: number) {
    const data = image.getImage(0);
    for (let y = 0; y < data.height; y += height) {
      for (let x = 0; x < data.width; x += width) {
        this.sprites.push(new Sprite(image, x, y, width, height));
      }
    }
  }
}
