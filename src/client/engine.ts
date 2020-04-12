import * as display from './display.js';
import { Seconds, delay } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { open, StaticImage } from './drawing/image.js';
import { HudPiece, Anchor, Drawable } from './drawing/drawable.js';
import { localPlayer } from './character.js';
import { Obstacle, Zone } from './zone.js';
import { CameraControl } from './camera_control.js';

let previousFrameTime: Seconds = 0;

let isAlive = false;

let position: Vector2 | undefined;
let arrow: StaticImage | undefined;
let zone: Zone | undefined;
let camera: CameraControl | undefined;

async function init() {
  if (isAlive) throw new Error('engine is already initialized!');
  isAlive = true;
  const [floor, obstacle] = await Promise.all(['floor.png', 'obstacle.png'].map(open));
  arrow = await StaticImage.open('arrow_left.png');
  camera = new CameraControl();
  zone = new Zone(floor);
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
  camera!.update(dt);
  zone!.update(dt);
}

function render(totalMilliseconds: number): void {
  const totalSeconds = totalMilliseconds / 1000;
  const dt = totalSeconds - previousFrameTime;

  display.draw(
    (context) => {
      zone!.draw(context, dt);
    },
    (context) => {
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
    }
  );
  requestAnimationFrame(render);

  previousFrameTime = totalSeconds;
}

display.onMouseMove((event) => {
  position = event.position;
});
