import {Vector2} from '../common/vector2.js';

export class Transform {
  constructor(a: Vector2, b: Vector2, c: Vector2) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
  static identity(): Transform {
    return new Transform(
        new Vector2(1, 0), new Vector2(0, 1), new Vector2(0, 0));
  }
  static translate(v: Vector2): Transform {
    return new Transform(new Vector2(1, 0), new Vector2(0, 1), v);
  }
  static rotate(radians: number): Transform {
    const c = Math.cos(radians), s = Math.sin(radians);
    return new Transform(
        new Vector2(c, s), new Vector2(-s, c), new Vector2(0, 0));
  }
  static scale(factor: number): Transform {
    return new Transform(
        new Vector2(factor, 0), new Vector2(0, factor), new Vector2(0, 0));
  }
  multiply(t: Transform): Transform {
    return new Transform(
        this.applyDirection(t.a), this.applyDirection(t.b), this.apply(t.c));
  }
  inverse(): Transform {
    const a = this.a.x, b = this.b.x, c = this.a.y, d = this.b.y;
    const determinant = 1 / (a * d - b * c);
    const ta = new Vector2(determinant * d, determinant * -c);
    const tb = new Vector2(determinant * -b, determinant * a);
    const tc = ta.multiply(-this.c.x).add(tb.multiply(-this.c.y));
    return new Transform(ta, tb, tc);
  }
  apply(v: Vector2): Vector2 {
    return this.applyDirection(v).add(this.c);
  }
  applyDirection(v: Vector2): Vector2 {
    return this.a.multiply(v.x).add(this.b.multiply(v.y));
  }
  a: Vector2;
  b: Vector2;
  c: Vector2;
}
