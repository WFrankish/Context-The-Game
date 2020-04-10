import { Entity } from '../entity.js';
import { Canvas } from './canvas.js';

export interface Drawable {
    draw(canvas: Canvas, anchor: Entity, dt: number): void;
}
