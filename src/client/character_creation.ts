import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { HudPiece, Anchor, Tile, Drawable } from './drawing/drawable.js';

let position: Vector2 | null = null;
let curr = 0;
let presets: Array<string>;
presets = [
  '../assets/gandalf_the_girthy_green.png',
  '../assets/gandalf_the_girthy_blue.png',
  '../assets/gandalf_the_girthy_red.png',
  '../assets/gandalf_the_girthy_purple.png',
];
window.requestAnimationFrame(creationInit);
function creationInit (totalMilliseconds: number): void  {


  display.draw(
    (context) => {
      let img = new Image();
      img.src = presets[curr];
      context.imageSmoothingEnabled = false;
      img.onload = function () {
        context.drawImage(img, 0, 0, 256, 256);
      };
    },
    (context) => {
      let arrowLeft = new Image();
      arrowLeft.src = '../assets/arrow_left.png';
      arrowLeft.onload = function () {
        context.drawImage(arrowLeft, 0, 256, 64, 32);
      };
      let arrowRight = new Image();
      arrowRight.src = '../assets/arrow_right.png';
      arrowRight.onload = function () {
        context.drawImage(arrowRight, 160, 256, 64, 32);
      };
    }
  );
    display.onMouseMove((event) => {
    position = event.position;
  });
};