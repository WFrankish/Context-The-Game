import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { HudPiece, Anchor, Tile, Drawable } from './drawing/drawable.js';
import { openStatic, Sprite } from './drawing/image.js';

let position: Vector2 | null = null;
let img : Sprite | undefined;
let curr = 2;
let presets : Sprite[] | undefined[];

async function init() {
  let preset_assets = ['gandalf_the_girthy_green.png',
    'gandalf_the_girthy_blue.png',
    'gandalf_the_girthy_red.png',
    'gandalf_the_girthy_purple.png',
  ];
  presets = await Promise.all(preset_assets.map(openStatic))
  display.onMouseMove((event) => {
    position = event.position;
  });
  display.onMouseUp((event) => {
    console.log(`Mouse up position: ${position?.x} ${position?.y}`);
    if (isLeftArrowClicked()) {
      curr = (curr + 4 - 1) % 4;
      requestAnimationFrame(render);
    } else if (isRightArrowClicked()) {
        curr = (curr + 1) % 4;
        requestAnimationFrame(render);
    }
  });
}

init(); 
window.requestAnimationFrame(render);

function render(totalMilliseconds: number): void {
  if (presets == undefined || presets[curr] == undefined) {
    window.requestAnimationFrame(render);
    return;
  }
  display.draw((context) => {},
    (context) => {
    context.imageSmoothingEnabled = false;
    drawPreset(context);
    let arrowLeft = new Image();
    arrowLeft.src = '../assets/arrow_left.png';
    arrowLeft.onload = function () {
      context.drawImage(arrowLeft, 0, 256, 128, 64);
    };
    let arrowRight = new Image();
    arrowRight.src = '../assets/arrow_right.png';
    arrowRight.onload = function () {
      context.drawImage(arrowRight, 128, 256, 128, 64);
    };
  });

}

function isLeftArrowClicked(): boolean {
  console.log("Left arrow clicked");
  let arrowLeftBounds: Array<number>;
  arrowLeftBounds = [0, 128, 256, 320];
  if (position == null) return false;
  if (position.x < arrowLeftBounds[0] || position.x > arrowLeftBounds[1]) {
    return false;
  }
  if (position.y < arrowLeftBounds[2] || position.y > arrowLeftBounds[3]) {
    return false;
  }
  return true;
}
function isRightArrowClicked(): boolean {
  console.log("Right arrow clicked");
  let arrowRightBounds: Array<number> = [128, 256, 256, 320];
  if (position == null) return false;
  if (position.x < arrowRightBounds[0] || position.x > arrowRightBounds[1]) {
    return false;
  }
  if (position.y < arrowRightBounds[2] || position.y > arrowRightBounds[3]) {
    return false;
  }
  return true;
}

function drawPreset(context: CanvasRenderingContext2D): void {
  img = presets[curr];
  if (img == undefined) return;
  context.drawImage(
    img.get().data,
    img.get().startX,
    img.get().startY,
    img.get().width,
    img.get().height,
    0,
    0,
    256,
    256
  );
}
