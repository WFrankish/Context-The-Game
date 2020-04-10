import { Vector2 } from './vector2.js';

/**
 * A thing that has physical position in the world
 */
export class Entity {
    position: Vector2;

    constructor(position = new Vector2(0, 0)) {
        this.position = position;
    }

    toLocalSpace(that: Entity): Vector2 {
        return that.position.subtract(this.position);
    }
}
