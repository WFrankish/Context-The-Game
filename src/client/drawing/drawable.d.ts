import { Canvas } from './canvas.js';
import { Loadable } from './loadable.js';
import { Vector2 } from '../../common/vector2.js';

export interface Drawable extends Loadable {
    draw(canvas: Canvas, position: Vector2, dt: number): void;
}
