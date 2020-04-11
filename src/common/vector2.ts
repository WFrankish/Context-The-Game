export class Vector2 {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get length(): number {
    return this.squareLength ** 0.5;
  }

  get squareLength(): number {
    return this.x ** 2 + this.y ** 2;
  }

  negated(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  distanceTo(that: Vector2): number {
    return this.distanceToSquared(that) ** 0.5;
  }

  distanceToSquared(that: Vector2): number {
    return (this.x - that.x) ** 2 + (this.y - that.y) ** 2;
  }

  dotProduct(that: Vector2): number {
    return this.x * that.x + this.y * that.y;
  }

  equals(that: Vector2): boolean {
    return this.x === that.x && this.y === that.y;
  }

  add(that: number | Vector2): Vector2 {
    return Vector2.add(this, that);
  }

  static add: VectorMath = (a: any, b: any) => {
    return vectorMath(a, b, (x, y) => x + y);
  };

  subtract(that: number | Vector2): Vector2 {
    return Vector2.subtract(this, that);
  }

  static subtract: VectorMath = (a: any, b: any) => {
    return vectorMath(a, b, (x, y) => x - y);
  };

  multiply(that: number | Vector2): Vector2 {
    return Vector2.multiply(this, that);
  }

  static multiply: VectorMath = (a: any, b: any) => {
    return vectorMath(a, b, (x, y) => x * y);
  };

  divide(that: number | Vector2): Vector2 {
    return Vector2.divide(this, that);
  }

  static divide: VectorMath = (a: any, b: any) => {
    return vectorMath(a, b, (x, y) => x / y);
  };

  normalized(): Vector2 {
    return this.divide(this.length);
  }
}

type VectorMath = ((a: Vector2, b: Vector2 | number) => Vector2) & ((a: Vector2 | number, b: Vector2) => Vector2);

const vectorMath = (a: any, b: any, op: (x: number, y: number) => number) => {
  if (typeof a === 'number') {
    return new Vector2(op(a, b.x), op(a, b.y));
  } else if (typeof b === 'number') {
    return new Vector2(op(a.x, b), op(a.y, b));
  } else {
    return new Vector2(op(a.x, b.x), op(a.y, b.y));
  }
};
