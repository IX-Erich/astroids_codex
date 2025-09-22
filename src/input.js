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
    const key = this.normalizeKey(event.key);
    if (!key) return;
    if (!this.down.has(key)) {
      this.pressed.add(key);
    }
    this.down.add(key);
  }

  handleKeyUp(event) {
    const key = this.normalizeKey(event.key);
    if (!key) return;
    if (this.down.has(key)) {
      this.released.add(key);
    }
    this.down.delete(key);
  }

  isDown(key) {
    const normalized = this.normalizeKey(key);
    return normalized ? this.down.has(normalized) : false;
  }

  wasPressed(key) {
    const normalized = this.normalizeKey(key);
    return normalized ? this.pressed.has(normalized) : false;
  }

  wasReleased(key) {
    const normalized = this.normalizeKey(key);
    return normalized ? this.released.has(normalized) : false;
  }

  flush() {
    this.pressed.clear();
    this.released.clear();
  }

  normalizeKey(key) {
    if (!key) return '';

    if (key === ' ') {
      return 'space';
    }

    const lower = key.toLowerCase();
    switch (lower) {
      case 'return':
      case 'numpadenter':
      case 'enter':
        return 'enter';
      case 'spacebar':
      case 'space':
        return 'space';
      default:
        return lower;
    }
  }
}
