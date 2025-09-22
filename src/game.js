import { InputManager } from './input.js';
import { Ship } from './ship.js';
import { createAsteroidWave, asteroidScore } from './asteroid.js';
import { UFO, ufoScore } from './ufo.js';
import { Vector2 } from './vector2.js';
import { AudioManager } from './audio.js';

const LOCAL_STORAGE_KEYS = {
  highScore: 'asteroids.highScore',
  renderMode: 'asteroids.renderMode',
};

const INITIAL_ASTEROIDS = 4;
const MAX_PLAYER_BULLETS = 6;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bounds = { width: canvas.width, height: canvas.height };
    this.input = new InputManager(window);
    this.audio = new AudioManager();

    this.mode = localStorage.getItem(LOCAL_STORAGE_KEYS.renderMode) || 'wireframe';
    this.state = 'menu';
    this.ship = new Ship(new Vector2(canvas.width / 2, canvas.height / 2));
    this.asteroids = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.ufo = null;
    this.ufoTimer = 10;
    this.level = 1;
    this.score = 0;
    this.highScore = Number(localStorage.getItem(LOCAL_STORAGE_KEYS.highScore)) || 0;
    this.lastTimestamp = 0;
    this.overlayVisible = true;
    this.demoAsteroids = [];

    this.hud = {
      score: document.getElementById('hud-score'),
      highScore: document.getElementById('hud-high-score'),
      lives: document.getElementById('hud-lives'),
      mode: document.getElementById('hud-mode'),
      mute: document.getElementById('hud-mute'),
      menu: document.getElementById('menu-screen'),
      gameOver: document.getElementById('gameover-screen'),
      finalScore: document.getElementById('final-score'),
      finalHighScore: document.getElementById('final-high-score'),
      startButton: document.querySelector('#menu-screen .primary'),
    };

    if (this.hud.startButton) {
      this.hud.startButton.addEventListener('click', () => {
        this.startFromMenu();
      });
    }

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    this.demoAsteroids = createAsteroidWave(3, this.bounds);

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    this.updateHUD();
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.bounds.width = width;
    this.bounds.height = height;
    this.demoAsteroids = createAsteroidWave(3, this.bounds);
  }

  resetGame() {
    this.ship = new Ship(new Vector2(this.bounds.width / 2, this.bounds.height / 2));
    this.playerBullets = [];
    this.enemyBullets = [];
    this.asteroids = createAsteroidWave(INITIAL_ASTEROIDS, this.bounds, {
      position: this.ship.position,
      radius: this.ship.radius * 4,
    });
    this.ufo = null;
    this.ufoTimer = 10;
    this.level = 1;
    this.score = 0;
    this.state = 'playing';
    this.setOverlay('menu', false);
    this.setOverlay('gameOver', false);
  }

  setOverlay(name, visible) {
    const element = this.hud[name];
    if (!element) return;
    element.style.display = visible ? 'flex' : 'none';
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    this.handleInput(dt);
    this.update(dt);
    this.draw();

    this.input.flush();
    requestAnimationFrame(this.loop);
  }

  handleInput() {
    if (this.input.wasPressed('enter') || this.input.wasPressed('return')) {
      this.startFromMenu();
    }

    if (this.input.wasPressed('shift')) {
      if (this.state === 'playing' && this.ship.invulnerableTime <= 0) {
        this.ship.hyperspace(this.bounds);
        this.ship.invulnerableTime = 2;
      }
    }

    if (this.input.wasPressed('m')) {
      this.toggleRenderMode();
    }

    if (this.input.wasPressed(' ') || this.input.wasPressed('spacebar') || this.input.wasPressed('space')) {
      if (this.state === 'playing') {
        const activeBullets = this.playerBullets.filter((b) => b.alive).length;
        if (activeBullets < MAX_PLAYER_BULLETS) {
          const bullet = this.ship.shoot(this.playerBullets);
          if (bullet) {
            this.audio.playShoot();
          }
        }
      }
    }

    if (this.input.wasPressed('p')) {
      this.audio.toggleMute();
      this.updateHUD();
    }
  }

  startFromMenu() {
    if (this.state === 'menu' || this.state === 'gameover') {
      this.audio.ensureContext();
      this.resetGame();
    }
  }

  update(dt) {
    if (this.state === 'menu') {
      this.setOverlay('menu', true);
      this.setOverlay('gameOver', false);
      return;
    }

    if (this.state === 'gameover') {
      this.setOverlay('menu', false);
      this.setOverlay('gameOver', true);
      return;
    }

    this.ship.update(dt, this.input, this.bounds, this.audio);

    this.playerBullets.forEach((bullet) => bullet.update(dt, this.bounds));
    this.enemyBullets.forEach((bullet) => bullet.update(dt, this.bounds));
    this.playerBullets = this.playerBullets.filter((bullet) => bullet.alive);
    this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.alive);

    for (const asteroid of this.asteroids) {
      asteroid.update(dt, this.bounds);
    }

    if (this.ufo) {
      this.ufo.update(dt, this.enemyBullets);
      if (!this.ufo.alive) {
        this.ufo = null;
        this.ufoTimer = Math.max(6, 14 - this.level);
      }
    } else {
      this.ufoTimer -= dt;
      if (this.ufoTimer <= 0) {
        this.ufo = new UFO(this.bounds, this.ship);
        this.ufoTimer = Math.max(6, 14 - this.level) + Math.random() * 4;
      }
    }

    this.handleCollisions();
    this.cleanupAsteroids();
    this.checkLevelCompletion();
    this.updateHUD();
  }

  handleCollisions() {
    // Player bullets vs asteroids
    for (const bullet of this.playerBullets) {
      if (!bullet.alive) continue;
      for (const asteroid of this.asteroids) {
        if (!asteroid.alive) continue;
        if (this.circleCollide(bullet.position, bullet.radius, asteroid.position, asteroid.radius)) {
          bullet.alive = false;
          asteroid.alive = false;
          this.score += asteroidScore(asteroid.size);
          this.audio.playExplosion();
          break;
        }
      }
    }

    // Player bullets vs UFO
    if (this.ufo) {
      for (const bullet of this.playerBullets) {
        if (!bullet.alive) continue;
        if (this.circleCollide(bullet.position, bullet.radius, this.ufo.position, this.ufo.radius)) {
          bullet.alive = false;
          this.score += ufoScore(this.ufo.type);
          this.ufo.alive = false;
          this.ufo = null;
          this.audio.playExplosion();
          this.ufoTimer = Math.max(6, 14 - this.level) + Math.random() * 4;
          break;
        }
      }
    }

    // Enemy bullets vs ship
    if (this.ship.invulnerableTime <= 0) {
      for (const bullet of this.enemyBullets) {
        if (!bullet.alive) continue;
        if (this.circleCollide(bullet.position, bullet.radius, this.ship.position, this.ship.radius)) {
          bullet.alive = false;
          this.destroyShip();
          break;
        }
      }
    }

    // Asteroids vs ship
    if (this.ship.invulnerableTime <= 0) {
      for (const asteroid of this.asteroids) {
        if (!asteroid.alive) continue;
        if (this.circleCollide(asteroid.position, asteroid.radius * 0.9, this.ship.position, this.ship.radius)) {
          asteroid.alive = false;
          this.destroyShip();
          break;
        }
      }
    }

    // UFO vs ship
    if (this.ufo && this.ship.invulnerableTime <= 0) {
      if (this.circleCollide(this.ufo.position, this.ufo.radius, this.ship.position, this.ship.radius)) {
        this.ufo.alive = false;
        this.ufo = null;
        this.destroyShip();
      }
    }
  }

  destroyShip() {
    this.audio.playExplosion();
    this.audio.setThrusting(false);
    this.ship.lives -= 1;
    if (this.ship.lives > 0) {
      this.ship.position = new Vector2(this.bounds.width / 2, this.bounds.height / 2);
      this.ship.velocity.set(0, 0);
      this.ship.invulnerableTime = 2;
    } else {
      this.endGame();
    }
  }

  cleanupAsteroids() {
    const newAsteroids = [];
    for (const asteroid of this.asteroids) {
      if (!asteroid.alive) {
        newAsteroids.push(...asteroid.split());
      } else {
        newAsteroids.push(asteroid);
      }
    }
    this.asteroids = newAsteroids;
  }

  checkLevelCompletion() {
    const remaining = this.asteroids.filter((a) => a.alive).length;
    if (remaining === 0) {
      this.level += 1;
      const newCount = INITIAL_ASTEROIDS + this.level;
      this.asteroids = createAsteroidWave(newCount, this.bounds, {
        position: this.ship.position,
        radius: this.ship.radius * 4,
      });
      this.ship.invulnerableTime = 2;
    }
  }

  endGame() {
    this.state = 'gameover';
    this.audio.setThrusting(false);
    this.setOverlay('gameOver', true);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(LOCAL_STORAGE_KEYS.highScore, this.highScore.toString());
    }
    this.updateHUD();
  }

  toggleRenderMode() {
    this.mode = this.mode === 'wireframe' ? 'shaded' : 'wireframe';
    localStorage.setItem(LOCAL_STORAGE_KEYS.renderMode, this.mode);
    this.updateHUD();
  }

  updateHUD() {
    if (this.hud.score) this.hud.score.textContent = this.score.toString().padStart(6, '0');
    if (this.hud.highScore)
      this.hud.highScore.textContent = this.highScore.toString().padStart(6, '0');
    if (this.hud.lives) this.hud.lives.textContent = 'Lives: ' + this.ship.lives;
    if (this.hud.mode) this.hud.mode.textContent = `Mode: ${this.mode}`;
    if (this.hud.mute) this.hud.mute.textContent = this.audio.isMuted() ? 'Mute: On' : 'Mute: Off';
    if (this.hud.finalScore) this.hud.finalScore.textContent = this.score.toString().padStart(6, '0');
    if (this.hud.finalHighScore)
      this.hud.finalHighScore.textContent = this.highScore.toString().padStart(6, '0');
  }

  draw() {
    this.ctx.fillStyle = '#05060a';
    this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

    if (this.state === 'menu') {
      // draw background asteroids for ambience
      this.drawDemoObjects();
      return;
    }

    for (const asteroid of this.asteroids) {
      asteroid.draw(this.ctx, this.mode);
    }
    if (this.ufo) {
      this.ufo.draw(this.ctx, this.mode);
    }
    this.playerBullets.forEach((bullet) => bullet.alive && bullet.draw(this.ctx, this.mode));
    this.enemyBullets.forEach((bullet) => bullet.alive && bullet.draw(this.ctx, this.mode));
    this.ship.draw(this.ctx, this.mode);

    if (this.state === 'gameover') {
      this.drawGameOverOverlay();
    }
  }

  drawDemoObjects() {
    const tempShip = new Ship(new Vector2(this.bounds.width / 2, this.bounds.height / 2));
    tempShip.draw(this.ctx, this.mode);
    for (const asteroid of this.demoAsteroids) {
      asteroid.draw(this.ctx, this.mode);
    }
  }

  drawGameOverOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);
  }

  circleCollide(aPos, aRadius, bPos, bRadius) {
    const dx = aPos.x - bPos.x;
    const dy = aPos.y - bPos.y;
    const distSq = dx * dx + dy * dy;
    const radius = aRadius + bRadius;
    return distSq <= radius * radius;
  }
}

export function startGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) throw new Error('Canvas element not found');
  return new Game(canvas);
}
