import * as display from './display.js';
import { Seconds, Milliseconds, delay } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { open, StaticImage, LoopingImage, Image } from './drawing/image.js';
import { SpriteSheet } from './drawing/spritesheet.js';
import { HudPiece, Anchor, Tile, Drawable, HudText } from './drawing/drawable.js';
import { localPlayer } from './character.js';
import { Obstacle, Zone } from './zone.js';

let previousFrameTimeMs = 0;

let isAlive = false;

let position: Vector2 | undefined;
let arrow: StaticImage | undefined;
let zone: Zone | undefined;

async function init() {
  if (isAlive) throw new Error('engine is already initialized!');
  isAlive = true;
  const obstacle = await open('obstacle.png');
  arrow = await StaticImage.open('arrow_left.png');
  zone = await Zone.open('example');
  localPlayer.position = [...zone.portals.values()][0].position;
  zone.characters.add(localPlayer);
  zone.obstacles = new Set(
    [
      [-5, 0],
      [5, 0],
      [0, -3],
      [0, 3],
    ].map((p) => new Obstacle(new Vector2(p[0], p[1]), obstacle))
  );
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
  zone!.update(dt);
}

function render(totalMilliseconds: number): void {
  const dt = totalMilliseconds - previousFrameTimeMs;

  display.draw((context) => {
    zone!.draw(context);
    const hud: Drawable[] = [
      // new HudPiece(arrow!, new Vector2(0, 0), Anchor.TopLeft),
      // new HudPiece(arrow!, new Vector2(200, 0), Anchor.Top),
      // new HudPiece(arrow!, new Vector2(-1, 0), Anchor.TopRight),
      // new HudPiece(arrow!, new Vector2(0, 200), Anchor.Left),
      // new HudPiece(arrow!, new Vector2(200, 200), Anchor.Centre),
      // new HudPiece(arrow!, new Vector2(-1, 200), Anchor.Right),
      // new HudPiece(arrow!, new Vector2(0, -1), Anchor.BottomLeft),
      // new HudPiece(arrow!, new Vector2(200, -1), Anchor.Bottom),
      // new HudPiece(arrow!, new Vector2(-1, -1), Anchor.BottomRight),
      new HudText(localPlayer.hudText, 24, new Vector2(0, 0), Anchor.TopLeft),
    ];
    for (const item of hud) item.draw(context, dt);
  });
  requestAnimationFrame(render);

  previousFrameTimeMs = totalMilliseconds;
}

display.onMouseMove((event) => {
  position = event.position;
});
