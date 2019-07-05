(function () {

  class Entity {
    constructor(rect) {
      this.rect = rect;
    }
  }

  class Button {
    constructor() {
      this.isDown = false;
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
      for (var i in this.buttons) {
        this.buttons[i].isTapped = false;
      }
    }

    bindKey(key, button) {
      this.bindings[key] = button;
    }

    onKeyDown(e) {
      let button = this.bindings[e.key];
      if (button) {
        button.isDown = true;
        button.isTapped = true;
      }
    }

    onKeyUp(e) {
      let button = this.bindings[e.key];
      if (button) {
        button.isDown = false;
        console.log(button);
      }
    }
  }

  let ctrl = new Controller();

  ctrl.bindKey('ArrowUp', ctrl.up);
  ctrl.bindKey('ArrowDown', ctrl.down);
  ctrl.bindKey('ArrowLeft', ctrl.left);
  ctrl.bindKey('ArrowRight', ctrl.right);

  ctrl.bindKey('w', ctrl.up);
  ctrl.bindKey('a', ctrl.left);
  ctrl.bindKey('s', ctrl.down);
  ctrl.bindKey('d', ctrl.right);

  document.onkeyup = function (e) {
    ctrl.onKeyUp(e);
  };

  document.onkeydown = function (e) {
    ctrl.onKeyDown(e);
  };

  let screenSize = makeSize(640, 480);
  let tileSize = makeSize(32, 32);

  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  let player = new Entity(makeRect(0, 0, tileSize.w, tileSize.h));
  player.rect.setCenter(screenSize.w/2, screenSize.h/2);

  function loop(ts) {

    let acc = 2;
    if (ctrl.up.isDown) {
      player.rect.origin.y -= acc;
    }
    if (ctrl.down.isDown) {
      player.rect.origin.y += acc;
    }
    if (ctrl.left.isDown) {
      player.rect.origin.x -= acc;
    }
    if (ctrl.right.isDown) {
      player.rect.origin.x += acc;
    }
    ctrl.reset();

    ctx.fillStyle = '#000000';
    ctx.rect(0, 0, screenSize.w, screenSize.h);
    ctx.fill();
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.rect.origin.x, player.rect.origin.y, player.rect.size.w, player.rect.size.h);

    window.requestAnimationFrame(loop);
  }

  let start = null;
  window.requestAnimationFrame(function (ts) {
    start = ts;
    window.requestAnimationFrame(loop);
  });

})();
