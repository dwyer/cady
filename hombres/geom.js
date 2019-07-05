function makeSize(w, h) {
  return {w: w, h: h};
}

function makePoint(x, y) {
  return {x: x, y: y};
}

class Rect {
  constructor(x, y, w, h) {
    this.origin = makePoint(x, y);
    this.size = makeSize(w, h);
  }

  setOrigin(x, y) {
    this.origin = makePoint(x, y);
  }

  setCenter(x, y) {
    this.setOrigin(x - this.size.w / 2, y - this.size.h / 2);
  }

  get x() { return this.origin.x; }
  get y() { return this.origin.y; }
  get w() { return this.size.w; }
  get h() { return this.size.h; }
}

function makeRect(x, y, w, h) {
  return new Rect(x, y, w, h);
}
