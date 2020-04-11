import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { StaticImage, LoopingImage, Image } from './drawing/image.js';
import { SpriteSheet } from './drawing/spritesheet.js';
import { HudPiece, Anchor, Tile, Drawable } from './drawing/drawable.js';

let previousFrameTimeMs = 0;

let isAlive = false;

let position: Vector2 | undefined;

let temp = new StaticImage('walls.png');
let temp2 = new SpriteSheet(temp, 32, 24);
let temp3: Image;
let temp4 = new StaticImage('arrow_left.png');
temp2.loadPromise.then(() => (temp3 = new LoopingImage(1000, ...temp2.sprites)));

export function run(): void {
  if (isAlive) {
    console.log('engine is already running!');
  }

  init();

  window.requestAnimationFrame(render);

  // TODO
  // while(this.isAlive){
  //     this.update();
  // }
}

export function kill(): void {
  isAlive = false;
}

function init(): void {
  isAlive = true;
}

export function update(): void {
  // TODO
}

function render(totalMilliseconds: number): void {
  const dt = totalMilliseconds - previousFrameTimeMs;

  display.draw(
    (ctx) => {
      if (temp3?.isLoaded) {
        const pieces: Drawable[] = [
          new Tile(temp3, new Vector2(0, 0)),
          new Tile(temp3, new Vector2(1, 0)),
          new Tile(temp3, new Vector2(2, 0)),
          new Tile(temp3, new Vector2(0, 3)),
          new Tile(temp3, new Vector2(1, 2)),
          new Tile(temp3, new Vector2(5, 5)),
          new Tile(temp3, new Vector2(6, 7)),
          new Tile(temp3, new Vector2(-1, 6)),
          new Tile(temp3, new Vector2(5, -1)),
        ];
        pieces.forEach((p) => p.draw(ctx, dt));
      }
      if (temp4.isLoaded) {
        const pieces: Drawable[] = [
          new HudPiece(temp4, new Vector2(0, 0), Anchor.TopLeft),
          new HudPiece(temp4, new Vector2(200, 0), Anchor.Top),
          new HudPiece(temp4, new Vector2(-1, 0), Anchor.TopRight),
          new HudPiece(temp4, new Vector2(0, 200), Anchor.Left),
          new HudPiece(temp4, new Vector2(200, 200), Anchor.Centre),
          new HudPiece(temp4, new Vector2(-1, 200), Anchor.Right),
          new HudPiece(temp4, new Vector2(0, -1), Anchor.BottomLeft),
          new HudPiece(temp4, new Vector2(200, -1), Anchor.Bottom),
          new HudPiece(temp4, new Vector2(-1, -1), Anchor.BottomRight),
        ];
        pieces.forEach((p) => p.draw(ctx, dt));
      }
    }
  );
  requestAnimationFrame(render);

  previousFrameTimeMs = totalMilliseconds;
}

display.onMouseMove((event) => {
  position = event.position;
});
