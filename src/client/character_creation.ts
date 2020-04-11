import * as display from './display.js';
import { Vector2 } from '../common/vector2.js';
import { HudPiece, Anchor, Tile, Drawable } from './drawing/drawable.js';
import { StaticImage, LoopingImage, Image } from "./drawing/image.js";

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

      let arrowLeft = new StaticImage('arrow_left.png');
      if (arrowLeft.isLoaded) {
        //context.drawImage(arrowLeft, 0, 256, 64, 32);
        let arrLeft = new HudPiece(arrowLeft, new Vector2(0, 0), Anchor.TopLeft);
        arrLeft.draw(context, 0);
      };
      let arrowRight = new StaticImage("arrow_right.png")
      if (arrowRight.isLoaded) {
        //context.drawImage(arrowRight, 160, 256, 64, 32);
        let arrRight = new HudPiece(arrowRight, new Vector2(128, 0), Anchor.TopLeft);
        arrRight.draw(context, 0);
      };
          },
    (context) => {
    }
  );
    display.onMouseMove((event) => {
    position = event.position;
  });
};