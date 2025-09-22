export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    const len = this.length();
    if (len > 0) {
      this.scale(1 / len);
    }
    return this;
  }

  static add(a, b) {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  static subtract(a, b) {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  static fromAngle(angle, magnitude = 1) {
    return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }
}

export function wrapPosition(vector, width, height) {
  if (vector.x < 0) vector.x += width;
  if (vector.x >= width) vector.x -= width;
  if (vector.y < 0) vector.y += height;
  if (vector.y >= height) vector.y -= height;
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomUnitVector() {
  const angle = Math.random() * Math.PI * 2;
  return Vector2.fromAngle(angle, 1);
}
