class Button {
  constructor(name) {
    this.name = name;
    this.isPressed = false;
    this.isTapped = false;
  }
}

class Controller {
  constructor() {
    this.bindings = {};
    this.buttons = {};
  }

  addButton(name) {
    this.buttons[name] = new Button(name);
  }

  reset() {
    for (let name in this.buttons) {
      this.buttons[name].isTapped = false;
    }
  }

  bindKey(key, buttonName) {
    this.bindings[key] = this.buttons[buttonName];
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

  listen(obj) {
    let me = this;
    obj.onkeyup = function (e) {
      me.onKeyUp(e);
    };
    obj.onkeydown = function (e) {
      me.onKeyDown(e);
    };
  }
}
