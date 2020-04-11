import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { HudPiece, Anchor, Tile, Drawable } from './drawing/drawable.js';
import { StaticImage, LoopingImage, Image } from './drawing/image.js';

let position: Vector2 | null = null;
let curr = 0;
let img = new Image();
let presets: Array<string>;
presets = [
  '../assets/gandalf_the_girthy_green.png',
  '../assets/gandalf_the_girthy_blue.png',
  '../assets/gandalf_the_girthy_red.png',
  '../assets/gandalf_the_girthy_purple.png',
];
window.requestAnimationFrame(creationInit);
function creationInit(totalMilliseconds: number): void {
  display.draw((context) => {
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
  display.onMouseMove((event) => {
    position = event.position;
    
    console.log(`position: ${position?.x} ${position?.y}`);
  });
  display.onMouseUp((event) => {
    console.log(`Mouse up position: ${position?.x} ${position?.y}`);
    if (isLeftArrowClicked()) {
      curr = (curr - 1) % 4;
      display.draw((context) => {
        drawPreset(context);
      });
    }
    // if (isLeftArrowClicked()) {
    //     curr = (curr - 1) % 4;
    //     display.draw((context) => {
    //         drawPreset(context)
    //     })
    // }
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

function drawPreset(context: CanvasRenderingContext2D): void {
  img.src = presets[curr];
  img.onload = function () {
    context.drawImage(img, 0, 0, 256, 256);
  };
}
