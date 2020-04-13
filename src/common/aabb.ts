import { Vector2 } from "./vector2";

export class AxisAlignedBoundaryBox {
    readonly topX : number;
    readonly topY : number;
    readonly bottomX : number;
    readonly bottomY : number;

    constructor (v1 : Vector2, v2 : Vector2) {
        this.topX = v1.x;
        this.topY = v1.y;
        this.bottomX = v2.x;
        this.bottomY = v2.y;
    }

    isInside (v : Vector2) : boolean {
        if (v == null) return false;
        if (v.x < this.topX || v.x > this.bottomX
            || v.y < this.topY || v.y > this.bottomY) {
                return false;
            }
        return true;
    }

    isOverlapping (aabb : AxisAlignedBoundaryBox) {
        if (aabb == null) return false;
        if (aabb.topX > this.bottomX || aabb.bottomX < this.topX
            || aabb.topY > this.bottomY || aabb.bottomY < this.topY) {
                return false;
            }
        return true;
    }

    getWidth () : number {
        return this.bottomX - this.topX;
    }

    getHeight () : number {
        return this.bottomY - this.topY
    }
}

