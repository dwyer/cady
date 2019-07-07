function square(x) {
  return x * x;
}

function randInt(x) {
  return Math.floor(Math.random() * x);
}

function makeSize(w, h) {
  return {w: w, h: h};
}

function makePoint(x, y) {
  return {x: x, y: y};
}

function distanceBetween(p, q) {
  return Math.sqrt(square(p.x - q.x) + square(p.y - q.y));
}

class Rect {
  constructor(x, y, w, h) {
    this.size = makeSize(w, h);
    this.origin = makePoint(x, y);
  }

  get size() {
    return this._size;
  }

  set size(size) {
    this._size = size;
  }

  get origin() {
    return this._origin;
  }

  set origin(point) {
    this._origin = point;
    this._center = makePoint(
      point.x + this.size.w / 2,
      point.y + this.size.h / 2);
  }

  get center() {
    return this._center;
  }

  set center(point) {
    this._center = point;
    this._origin = makePoint(
      point.x - this.size.w / 2,
      point.y - this.size.h / 2);
  }

  get x() { return this.origin.x; }
  get y() { return this.origin.y; }
  get w() { return this.size.w; }
  get h() { return this.size.h; }

  /*
   * Returns true if this rect overlapped with other rect at any point
   */
  isOnRect(other) {
    return (
      this.x + this.w >= other.x &&
      this.y + this.h >= other.y &&
      this.x < other.x + other.w &&
      this.y < other.x + other.h);
  }

  isInBounds(other) {
    return (
      this.x + this.w >= 0 &&
      this.y + this.h >= 0 &&
      this.x < other.w &&
      this.y < other.h);
  }
}

function makeRect(x, y, w, h) {
  return new Rect(x, y, w, h);
}
