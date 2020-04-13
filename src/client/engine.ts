import * as display from './display.js';
import { Seconds, delay } from '../common/time.js';
import { Vector2 } from '../common/vector2.js';
import { Sprite, LoopingImage, Image, openStatic } from './drawing/image.js';
import { HudPiece, Anchor, Tile, Drawable, HudText } from './drawing/drawable.js';
import * as character from './character.js';
import { Obstacle, Zone } from './zone.js';
import { CameraControl } from './camera_control.js';
import { showInventory, drawInventory, init as initInventory } from './inventory.js';
import { init as initItemSprites } from './items.js';
import HealthPotion from '../common/items/consumables/health_potion.js';
import { Skeleton } from './skeleton.js';

let previousFrameTime: Seconds = 0;

let isAlive = false;

let position: Vector2 | undefined;
let arrow: Sprite | undefined;
let zone: Zone | undefined;
let camera: CameraControl | undefined;

async function init() {
  if (isAlive) throw new Error('engine is already initialized!');
  isAlive = true;
  arrow = await openStatic('arrow_left.png');
  await initInventory();
  await initItemSprites();
  await character.init();
  camera = new CameraControl();
  // TODO: We don't want everyone to control the same character, so we'll need a way to figure out what the id is for
  // the player so we can use the right character.
  zone = await Zone.open(character.localPlayer().zone);
  character.localPlayer().position = [...zone.portals.values()][0].position;
  //localPlayer.inventory.store(new HealthPotion());
  zone.characters.add(character.localPlayer());

  for(let i = 0; i<20; i++){
    const position = new Vector2(10 - Math.round(Math.random() * 20), 10 - Math.round(Math.random() * 20));

    if(zone.floor.has(position.toString())){
      zone.characters.add(new Skeleton(position))
    }
  }
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
      zone!.draw(context);
    },
    (context) => {
      if (showInventory) {
        drawInventory(context, dt);
      } else {
        const hud: Drawable[] = [new HudText(character.localPlayer().hudText, 24, new Vector2(0, 0), Anchor.TopLeft)];

        for (const item of hud) item.draw(context, dt);
      }
    }
  );
  requestAnimationFrame(render);

  previousFrameTime = totalSeconds;
}

display.onMouseMove((event) => {
  position = event.position;
});
