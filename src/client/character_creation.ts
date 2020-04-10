import * as display from './display.js';
import {Vector2} from '../common/vector2.js';

let position: Vector2|null = null;

export const creationInit = () => {
    display.clear();
    display.drawHud(context => {
        let img = new Image();
        img.src = './assets/gandalf_the_girthy.png';
        context.imageSmoothingEnabled = false;
        img.onload = function() {context.drawImage(img, 0, 0, 256, 256)};
        // context.fillStyle = '#eee';
        // context.fillRect(10, 10, display.width - 20, display.height - 20);
        // context.fillStyle = '#f00';
        // context.fillRect(
        //     0.5 * display.width - 10, 0.5 * display.height - 10, 20, 20);
        // context.font = '20pt sans-serif';
        // context.textAlign = 'center';
        // context.textBaseline = 'bottom';
        // if (position) {
        // context.fillText(Math.round(position.x) + ',' + Math.round(position.y),
        //                     0.5 * display.width, 0.5 * display.height - 20);
        // }
    });
      
    display.onMouseMove(event => {
        position = event.position;
    });
}