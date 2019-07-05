(function () {

  class Button {
    constructor() {
      this.isPressed = false;
      this.isTapped = false;
    }
  }

  class Controller {
    constructor() {
      this.up = new Button();
      this.down = new Button();
      this.left = new Button();
      this.right = new Button();
      this.shoot = new Button();
      this.buttons = [
        this.up,
        this.down,
        this.left,
        this.right,
        this.shoot,
      ];
      this.bindings = {};
    }

    reset() {
      for (let i in this.buttons) {
        this.buttons[i].isTapped = false;
      }
    }

    bindKey(key, button) {
      this.bindings[key] = button;
    }

    onKeyDown(e) {
      let button = this.bindings[e.key];
      if (button) {
        button.isTapped = !button.isPressed;
        button.isPressed = true;
      }
    }

    onKeyUp(e) {
      let button = this.bindings[e.key];
      if (button) {
        button.isPressed = false;
      }
    }
  }

  class Entity {
    constructor() {
      this.rect = makeRect(0, 0, 0, 0);
      this.angle = 0;
      this.vel = 0;
      this.turnVelocity = 0;
      this.moveVelocity = 0;
      this.isDead = false;
    }

    rotate(angle) {
      this.angle += angle;
    }

    move(vel) {
      let origin = this.rect.origin;
      origin.x += vel * Math.cos(this.angle);
      origin.y += vel * Math.sin(this.angle);
      this.rect.origin = origin;
    }

    update() {
      this.rotate(this.turnVelocity);
      this.move(this.moveVelocity);
    }

    draw(ctx) {}
  }

  class PlayerEntity extends Entity {

    draw(ctx) {
      ctx.translate(this.rect.center.x, this.rect.center.y);
      ctx.rotate(this.angle);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-this.rect.w/2, -this.rect.h/2, this.rect.w, this.rect.h);

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.rect.w, 0);
      ctx.stroke();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  class BulletEntity extends Entity {
    constructor() {
      super();
      this.rect.size = makeSize(4, 4);
    }

    draw(ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    update() {
      this.move(4);
    }
  }

  class ExplosionEntity extends Entity {
    constructor() {
      super();
      this.radius = 1;
      this.rect.size = makeSize(1, 1);
    }

    update() {
      this.radius *= 2;
      let center = this.rect.center;
      this.rect.size = makeSize(this.radius, this.radius);
      this.rect.center = center;
      this.isDead = this.radius > 1 << 7;
    }

    draw(ctx) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(this.rect.center.x, this.rect.center.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  let controller = new Controller();

  const SCREEN_SIZE = makeSize(800, 600);
  let tileSize = makeSize(32, 32);

  let canvas = document.getElementById('canvas');
  canvas.width = SCREEN_SIZE.w;
  canvas.height = SCREEN_SIZE.h;
  let ctx = canvas.getContext('2d');

  let player = new PlayerEntity();
  player.rect.size = tileSize;
  player.rect.center = makePoint(SCREEN_SIZE.w/2, SCREEN_SIZE.h/2);
  player.angle = -Math.PI / 2; // face north

  let entities = [
    player,
  ];

  function init() {
    controller.bindKey('ArrowUp', controller.up);
    controller.bindKey('ArrowDown', controller.down);
    controller.bindKey('ArrowLeft', controller.left);
    controller.bindKey('ArrowRight', controller.right);

    controller.bindKey('w', controller.up);
    controller.bindKey('a', controller.left);
    controller.bindKey('s', controller.down);
    controller.bindKey('d', controller.right);

    controller.bindKey('h', controller.left);
    controller.bindKey('j', controller.down);
    controller.bindKey('k', controller.up);
    controller.bindKey('l', controller.right);

    controller.bindKey('f', controller.shoot);
    controller.bindKey(' ', controller.shoot);

    document.onkeyup = function (e) {
      controller.onKeyUp(e);
    };

    document.onkeydown = function (e) {
      controller.onKeyDown(e);
    };
  }

  function isRectOnScreen(rect) {
    return rect.x + rect.w >= 0 &&
      rect.y + rect.h >= 0 &&
      rect.x < SCREEN_SIZE.w &&
      rect.y < SCREEN_SIZE.h;
  }

  /* Handle input */
  function update() {
    let moveVel = 2;
    let turnVel = 0.1;

    if (controller.up.isPressed) player.move(moveVel);
    if (controller.down.isPressed) player.move(-moveVel);
    if (controller.left.isPressed) player.rotate(-turnVel);
    if (controller.right.isPressed) player.rotate(turnVel);

    if (controller.shoot.isTapped) {
      let bullet = new BulletEntity();
      bullet.rect.center = player.rect.center;
      bullet.angle = player.angle;
      entities.push(bullet);
      console.log('PEW!');
    }

    entities.forEach(function (entity) {
      entity.update();
      if (entity instanceof BulletEntity) {
        entity.isDead = !isRectOnScreen(entity.rect);
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
      entities[i].draw(ctx);
    }
  }

  function loop(_) {
    update();
    draw(ctx);
    window.requestAnimationFrame(loop);
  }

  init();
  window.requestAnimationFrame(loop);

})();
