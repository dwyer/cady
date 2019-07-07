(function () {

  const PI = Math.PI;
  const TWO_PI = 2 * PI;
  const TAU = PI / 2;
  const PHI = 1.61803399;
  const SCREEN_SIZE = makeSize(800, 600);
  const SCREEN_RECT = makeRect(0, 0, SCREEN_SIZE.w, SCREEN_SIZE.h);

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
      return this.rect.isOnRect(SCREEN_RECT);
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
      ctx.arc(this.rect.center.x, this.rect.center.y, this.radius, 0, TWO_PI);
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
  player.direction = -TAU; // face north

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
    const TURL_VEL = 0.1;

    if (controller.buttons.up.isPressed) player.move(MOVE_VEL);
    if (controller.buttons.down.isPressed) player.move(-MOVE_VEL);
    if (controller.buttons.left.isPressed) player.turn(-TURL_VEL);
    if (controller.buttons.right.isPressed) player.turn(TURL_VEL);

    if (controller.buttons.fire.isTapped) {
      let bullet = new Bullet();
      bullet.rect.center = player.rect.center;
      bullet.direction = player.direction;
      entities.push(bullet);
      console.log('PEW!');
    }

    if (frameCount % 200 == 0) {
      let enemy = new Enemy();
      let center = randInt(2) == 0 ?
        makePoint(0, randInt(SCREEN_SIZE.h)) :
        makePoint(randInt(SCREEN_SIZE.w), 0);
      enemy.rect.center = center;
      console.log(enemy.rect.center);
      entities.push(enemy);
    }

    entities.forEach(function (entity) {
      if (entity instanceof Enemy) {
        entity.direction = Math.atan2(player.rect.y - entity.rect.y, player.rect.x - entity.rect.x);
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

    entities = entities.filter(function (entity) {
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
