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

    draw(ctx) {}

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
      let theta = this.direction - TAU / 8;
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

    get segments() {
      let corners = this.corners;
      return [
        [corners[0], corners[1]],
        [corners[1], corners[2]],
        [corners[2], corners[3]],
        [corners[3], corners[0]],
      ];
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

    draw(ctx) {
      ctx.translate(this.rect.center.x, this.rect.center.y);
      ctx.rotate(this.direction);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.rect.w/2, -this.rect.h/2, this.rect.w, this.rect.h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // this.drawBoundingBox(ctx);
    }

    drawBoundingBox(ctx) {
      let rect = this.boundingBox;
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
  }

  class Actor extends RectEntity {

    constructor() {
      super();
      this.health = 100;
    }

    get health() {
      return this._health;
    }

    set health(val) {
      this._health = Math.max(0, val);
      if (this._health == 0) {
        this.isDead = true;
      }
    }

    drawHealthBar(ctx) {
      ctx.lineWidth = 4;
      ctx.translate(this.rect.center.x - 18, this.rect.center.y - 24);

      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18 * 2, 0);
      ctx.stroke();

      ctx.strokeStyle = '#0f0';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18 * 2 / 100 * this.health, 0);
      ctx.stroke();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    draw(ctx) {
      super.draw(ctx);
      if (this.health < 100) {
        this.drawHealthBar(ctx);
      }
    }
  }

  class Player extends Actor {

    draw(ctx) {
      super.draw(ctx);
      ctx.translate(this.rect.center.x, this.rect.center.y);
      ctx.rotate(this.direction);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.rect.w, 0);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // this.drawBoundingBox(ctx);
    }
  }

  class Enemy extends Actor {
    constructor() {
      super();
      this.rect.size = tileSize;
    }

    draw(ctx) {
      super.draw(ctx);
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

  let isPlayerHit = false;

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
    }
    if (frameCount % 100 == 0) {
      // spawn enemy at the edge of the screen
      let enemy = new Enemy();
      enemy.rect.center = randomPointOnEdgeOfScreen();
      entities.push(enemy);
    }

    let enemies = [];
    let bullets = [];
    entities.forEach((entity) => {
      if (entity instanceof Bullet) {
        bullets.push(entity);
      }
      if (entity instanceof Enemy) {
        enemies.push(entity);
      }
    });

    bullets.forEach((bullet) => {
      if (!bullet.isOnScreen) {
        bullet.isDead = true;
        return;
      }
      let p0 = bullet.rect.center;
      let p1 = makePoint(
        p0.x + Bullet.VELOCITY * Math.cos(bullet.direction),
        p0.y + Bullet.VELOCITY * Math.sin(bullet.direction));
      enemies.forEach((enemy) => {
        let corners = enemy.corners;
        if (doLinesIntersect(p0, p1, corners[0], corners[1])) {
          let damage = randInt(10) + 45;
          enemy.health -= damage;
          bullet.isDead = true;
          let explosion = new ExplosionEntity();
          explosion.rect.center = bullet.rect.center;
          entities.push(explosion);
        }
      });
    });

    isPlayerHit = false;
    entities.forEach((entity) => {
      if (entity instanceof Enemy) {
        entity.direction = Math.atan2(player.rect.y - entity.rect.y,
          player.rect.x - entity.rect.x);
        let distance = distanceBetween(player.rect.center, entity.rect.center);
        entity.move(Math.min(MOVE_VEL, distance));
        if (distance < 1) {
          player.health -= randInt(10) + 10;
          isPlayerHit = true;
          entity.isDead = true;
          let explosion = new ExplosionEntity();
          explosion.rect.center = entity.rect.center;
          entities.push(explosion);
        }
      }
      entity.update();
    });

    entities = entities.filter((entity) => {
      return !entity.isDead;
    });

    controller.reset();
  }

  /* Update the screen */
  function draw(ctx) {
    // clear screen
    if (isPlayerHit) {
      ctx.fillStyle = '#ff0000';
    } else {
      ctx.fillStyle = '#000000';
    }
    ctx.fillRect(0, 0, SCREEN_SIZE.w, SCREEN_SIZE.h);
    // draw entities
    for (let i in entities) {
      entities[i].draw(ctx);
    }
  }

  let frameCount = 0;

  function loop(_) {
    update();
    draw(ctx);
    frameCount++;
    if (!player.isDead) {
      window.requestAnimationFrame(loop);
    }
  }

  init();
  window.requestAnimationFrame(loop);

})();
