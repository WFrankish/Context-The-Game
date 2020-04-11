import * as display from './display.js';
import {Vector2} from '../common/vector2.js';

let position: Vector2|null = null;

export const creationInit = () => {
    display.clear();
    display.drawHud(context => {
        let curr = 0;
        let presets: Array<string>;
        presets = ['./assets/gandalf_the_girthy_green.png', './assets/gandalf_the_girthy_blue.png', './assets/gandalf_the_girthy_red.png', './assets/gandalf_the_girthy_purple.png']; 
        let img = new Image();
        img.src = './assets/gandalf_the_girthy.png';
        context.imageSmoothingEnabled = false;
        img.onload = function() {context.drawImage(img, 0, 0, 256, 256)};
        let arrowLeft = new Image();
        arrowLeft.src = './assets/arrow_left.png';
        arrowLeft.onclick = function() {
            img.src = presets[(curr - 1) % presets.length];
            img.onload = function() {
                context.drawImage(img, 0, 0, 256, 256)
            };
        }
        arrowLeft.onload = function() {
            context.drawImage(arrowLeft, 0, 256, 64, 32);
        };
        let arrowRight = new Image();
        arrowRight.src = './assets/arrow_right.png';
        arrowRight.onclick = function() {
            img.src = presets[(curr + 1) % presets.length];
            context.drawImage(img, 0, 0, 256, 256);

        }
        arrowRight.onload = function() {
            context.drawImage(arrowRight, 160, 256, 64, 32);
        }
    });
      
    display.onMouseMove(event => {
        position = event.position;
    });
}