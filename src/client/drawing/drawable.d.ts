import { Entity } from '../../common/entity.js';
import { Canvas } from './canvas.js';
import { Loadable } from './loadable.js';

export interface Drawable extends Loadable {
    draw(canvas: Canvas, anchor: Entity, dt: number): void;
}
