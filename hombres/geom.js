function makeSize(w, h) {
  return {w: w, h: h};
}

function makePoint(x, y) {
  return {x: x, y: y};
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

  isOnRect(rect) {
    return (
      this.x + this.w >= rect.x &&
      this.y + this.h >= rect.y &&
      this.x < rect.x + rect.w &&
      this.y < rect.x + rect.h);
  }
}

function makeRect(x, y, w, h) {
  return new Rect(x, y, w, h);
}
