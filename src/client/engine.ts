import * as display from './display.js';
import { Seconds, Milliseconds, delay } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { StaticImage, LoopingImage, Image } from './drawing/image.js';
import { SpriteSheet } from './drawing/spritesheet.js';
import { HudPiece, Anchor, Tile, Drawable } from './drawing/drawable.js';
import { localPlayer } from './character.js';

let previousFrameTimeMs = 0;

let isAlive = false;

let position: Vector2 | undefined;
let walls: LoopingImage | undefined;
let arrow: StaticImage | undefined;

async function init() {
  if (isAlive) throw new Error('engine is already initialized!');
  isAlive = true;
  const wallSprites = new SpriteSheet(await StaticImage.open('walls.png'), 32, 24);
  walls = new LoopingImage(1000, ...wallSprites.sprites);
  arrow = await StaticImage.open('arrow_left.png');
  isAlive = true;
}

export async function run(): Promise<void> {
  await init();

  requestAnimationFrame(render);

  const deltaTime = 0.02;
  while (true) {
    await delay(1000 * deltaTime);
    update(deltaTime);
  }
}

export function kill(): void {
  isAlive = false;
}

export function update(dt: Seconds): void {
  localPlayer.update(dt);
}

function render(totalMilliseconds: number): void {
  const dt = totalMilliseconds - previousFrameTimeMs;

  display.draw((context) => {
    const tiles: Drawable[] = [
      new Tile(walls!, new Vector2(0, 0)),
      new Tile(walls!, new Vector2(1, 0)),
      new Tile(walls!, new Vector2(2, 0)),
      new Tile(walls!, new Vector2(0, 3)),
      new Tile(walls!, new Vector2(1, 2)),
      new Tile(walls!, new Vector2(5, 5)),
      new Tile(walls!, new Vector2(6, 7)),
      new Tile(walls!, new Vector2(-1, 6)),
      new Tile(walls!, new Vector2(5, -1)),
    ];
    for (const tile of tiles) tile.draw(context, dt);
    const hud: Drawable[] = [
      new HudPiece(arrow!, new Vector2(0, 0), Anchor.TopLeft),
      new HudPiece(arrow!, new Vector2(200, 0), Anchor.Top),
      new HudPiece(arrow!, new Vector2(-1, 0), Anchor.TopRight),
      new HudPiece(arrow!, new Vector2(0, 200), Anchor.Left),
      new HudPiece(arrow!, new Vector2(200, 200), Anchor.Centre),
      new HudPiece(arrow!, new Vector2(-1, 200), Anchor.Right),
      new HudPiece(arrow!, new Vector2(0, -1), Anchor.BottomLeft),
      new HudPiece(arrow!, new Vector2(200, -1), Anchor.Bottom),
      new HudPiece(arrow!, new Vector2(-1, -1), Anchor.BottomRight),
    ];
    for (const item of hud) item.draw(context, dt);
    localPlayer.draw(context);
  });
  requestAnimationFrame(render);

  previousFrameTimeMs = totalMilliseconds;
}

display.onMouseMove((event) => {
  position = event.position;
});
