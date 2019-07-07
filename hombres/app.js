(function () {

  const TAU = 2 * Math.PI;
  const PHI = 1.61803399;
  const SCREEN_SIZE = makeSize(800, 600);

  function randomPointOnEdgeOfScreen() {
      switch (randInt(4)) {
        case 0:
          return makePoint(0, randInt(SCREEN_SIZE.h));
        case 1:
          return makePoint(randInt(SCREEN_SIZE.w), 0);
        case 2:
          return makePoint(SCREEN_SIZE.w, randInt(SCREEN_SIZE.h));
        case 3:
          return makePoint(randInt(SCREEN_SIZE.w), SCREEN_SIZE.h);
      }
  }

  class MyController extends Controller {
    constructor() {
      super();

      this.addButton('up');
      this.addButton('down');
      this.addButton('left');
      this.addButton('right');
      this.addButton('fire');

      this.bindKey('ArrowUp', 'up');
      this.bindKey('ArrowDown', 'down');
      this.bindKey('ArrowLeft', 'left');
      this.bindKey('ArrowRight', 'right');

      this.bindKey('w', 'up');
      this.bindKey('a', 'left');
      this.bindKey('s', 'down');
      this.bindKey('d', 'right');

      this.bindKey('f', 'fire');
      this.bindKey(' ', 'fire');
    }
  }

  class Entity {
    constructor() {
      this.rect = makeRect(0, 0, 0, 0);
      this.direction = 0;
      this.isDead = false;
    }

    turn(angle) {
      this.direction += angle;
    }

    move(distance) {
      let origin = this.rect.origin;
      origin.x += distance * Math.cos(this.direction);
      origin.y += distance * Math.sin(this.direction);
      this.rect.origin = origin;
    }

    update() {}

    preDraw(ctx) {}
    draw(ctx) {}
    postDraw(ctx) {}

    get isOnScreen() {
      return this.rect.isInBounds(SCREEN_SIZE);
    }

    get corners() {
      let corners = [
        makePoint(this.rect.x + this.rect.w, this.rect.y + this.rect.h),
        makePoint(this.rect.x,               this.rect.y + this.rect.h),
        makePoint(this.rect.x,               this.rect.y),
        makePoint(this.rect.x + this.rect.w, this.rect.y),
      ];
      let theta = this.direction + TAU / 8;
      let points = [];
      for (let i = 0; i < 4; i++) {
        let r = distanceBetween(this.rect.center, corners[i]);
        let p = makePoint(
          this.rect.center.x + r * Math.cos(theta),
          this.rect.center.y + r * Math.sin(theta));
        points.push(p);
        theta += TAU / 4;
      }
      return points;
    }

    get boundingBox() {
      let pts = this.corners;
      let minX = Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x);
      let maxX = Math.max(pts[0].x, pts[1].x, pts[2].x, pts[3].x);
      let minY = Math.min(pts[0].y, pts[1].y, pts[2].y, pts[3].y);
      let maxY = Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y);
      return makeRect(minX, minY, maxX-minX, maxY-minY);
    }
  }

  class ShapeEntity extends Entity {
    static DEFAULT_COLOR = 'white';

    constructor() {
      super();
      this.color = ShapeEntity.DEFAULT_COLOR;
    }
  }

  class CircleEntity extends ShapeEntity {
    constructor() {
      super();
      this.radius = 0;
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.rect.center.x, this.rect.center.y, this.radius, 0, TAU);
      ctx.fill();
    }
  }

  class RectEntity extends ShapeEntity {

    preDraw(ctx) {
      ctx.translate(this.rect.center.x, this.rect.center.y);
      ctx.rotate(this.direction);
    }

    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.rect.w/2, -this.rect.h/2, this.rect.w, this.rect.h);
    }

    postDraw(ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.drawBoundingBox(ctx);
    }

    drawBoundingBox(ctx) {
      let rect = this.boundingBox;
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }

  }

  class Player extends RectEntity {

    draw(ctx) {
      super.draw(ctx);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.rect.w, 0);
      ctx.stroke();
    }
  }

  class Bullet extends CircleEntity {
    static VELOCITY = 10 * PHI;
    static RADIUS = 2;

    constructor() {
      super();
      this.radius = Bullet.RADIUS;
    }

    update() {
      this.move(Bullet.VELOCITY);
    }
  }

  class Enemy extends RectEntity {
    constructor() {
      super();
      this.rect.size = tileSize;
    }
  }

  class ExplosionEntity extends CircleEntity {
    static MIN_RADIUS = 2;
    static MAX_RADIUS = 1 << 6;
    static COLOR = 'red';

    constructor() {
      super();
      this.radius = ExplosionEntity.MIN_RADIUS;
      this.color = ExplosionEntity.COLOR;
    }

    update() {
      this.radius *= PHI;
      this.isDead = this.radius > ExplosionEntity.MAX_RADIUS;
    }
  }

  let controller = new MyController();

  let tileSize = makeSize(32, 32);

  let canvas = document.getElementById('canvas');
  canvas.width = SCREEN_SIZE.w;
  canvas.height = SCREEN_SIZE.h;
  let ctx = canvas.getContext('2d');

  let player = new Player();
  player.rect.size = tileSize;
  player.rect.center = makePoint(SCREEN_SIZE.w/2, SCREEN_SIZE.h/2);
  player.direction = -TAU / 4; // face north

  let entities = [
    player,
  ];

  function init() {
    controller.bindKey('h', 'left');
    controller.bindKey('j', 'down');
    controller.bindKey('k', 'up');
    controller.bindKey('l', 'right');
    controller.listen(document);
  }

  /* Handle input */
  function update() {
    const MOVE_VEL = 2;
    const TURN_VEL = 0.06;

    if (controller.buttons.up.isPressed) player.move(MOVE_VEL);
    if (controller.buttons.down.isPressed) player.move(-MOVE_VEL);
    if (controller.buttons.left.isPressed) player.turn(-TURN_VEL);
    if (controller.buttons.right.isPressed) player.turn(TURN_VEL);

    if (controller.buttons.fire.isTapped) {
      let bullet = new Bullet();
      bullet.rect.center = player.rect.center;
      bullet.direction = player.direction;
      entities.push(bullet);
      console.log('PEW!');
    }
    if (frameCount % 200 == 0) {
      // spawn enemy at the edge of the screen
      let enemy = new Enemy();
      enemy.rect.center = randomPointOnEdgeOfScreen();
      entities.push(enemy);
    }

    entities.forEach((entity) => {
      if (entity instanceof Enemy) {
        entity.direction = Math.atan2(player.rect.y - entity.rect.y,
          player.rect.x - entity.rect.x);
        let distance = distanceBetween(player.rect.center, entity.rect.center);
        entity.move(Math.min(MOVE_VEL, distance));
        if (distance < 1) {
          entity.isDead = true;
        }
        if (entity.isDead) {
          let explosion = new ExplosionEntity();
          explosion.rect.center = entity.rect.center;
          entities.push(explosion);
          console.log('BOOM!');
        }
      }
      entity.update();
      if (entity instanceof Bullet) {
        entity.isDead = !entity.isOnScreen;
        if (entity.isDead) {
          let explosion = new ExplosionEntity();
          explosion.rect.center = entity.rect.center;
          entities.push(explosion);
          console.log('BOOM!');
        }
      }
    });

    entities = entities.filter((entity) => {
      return !entity.isDead;
    });

    controller.reset();
  }

  /* Update the screen */
  function draw(ctx) {
    // clear screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SCREEN_SIZE.w, SCREEN_SIZE.h);
    // draw entities
    for (let i in entities) {
      entities[i].preDraw(ctx);
      entities[i].draw(ctx);
      entities[i].postDraw(ctx);
    }
  }

  let frameCount = 0;

  function loop(_) {
    update();
    draw(ctx);
    frameCount++;
    window.requestAnimationFrame(loop);
  }

  init();
  window.requestAnimationFrame(loop);

})();
