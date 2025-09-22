export class InputManager {
  constructor(target = window) {
    this.target = target;
    this.down = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.listeners = {
      keydown: (event) => this.handleKeyDown(event),
      keyup: (event) => this.handleKeyUp(event),
    };
    this.attach();
  }

  attach() {
    this.target.addEventListener('keydown', this.listeners.keydown);
    this.target.addEventListener('keyup', this.listeners.keyup);
  }

  detach() {
    this.target.removeEventListener('keydown', this.listeners.keydown);
    this.target.removeEventListener('keyup', this.listeners.keyup);
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (!this.down.has(key)) {
      this.pressed.add(key);
    }
    this.down.add(key);
  }

  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    if (this.down.has(key)) {
      this.released.add(key);
    }
    this.down.delete(key);
  }

  isDown(key) {
    return this.down.has(key.toLowerCase());
  }

  wasPressed(key) {
    return this.pressed.has(key.toLowerCase());
  }

  wasReleased(key) {
    return this.released.has(key.toLowerCase());
  }

  flush() {
    this.pressed.clear();
    this.released.clear();
  }
}
