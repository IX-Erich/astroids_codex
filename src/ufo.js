import { Bullet } from './bullet.js';
import { Vector2, randomRange } from './vector2.js';

const UFO_CONFIG = {
  large: { radius: 26, speed: 70, fireDelay: [1.4, 2.2], score: 200, accuracy: 0.5 },
  small: { radius: 18, speed: 110, fireDelay: [1, 1.6], score: 1000, accuracy: 0.1 },
};

export class UFO {
  constructor(bounds, ship) {
    this.type = Math.random() < 0.6 ? 'large' : 'small';
    this.config = UFO_CONFIG[this.type];
    this.radius = this.config.radius;
    this.position = new Vector2();
    const fromLeft = Math.random() < 0.5;
    this.position.x = fromLeft ? -this.radius : bounds.width + this.radius;
    this.position.y = randomRange(bounds.height * 0.1, bounds.height * 0.9);
    const direction = fromLeft ? 1 : -1;
    this.velocity = new Vector2(direction * this.config.speed, randomRange(-40, 40));
    this.bounds = bounds;
    this.fireTimer = randomRange(this.config.fireDelay[0], this.config.fireDelay[1]);
    this.alive = true;
    this.ship = ship;
  }

  update(dt, bullets) {
    this.position.add(this.velocity.clone().scale(dt));
    if (this.position.y < this.bounds.height * 0.1 || this.position.y > this.bounds.height * 0.9) {
      this.velocity.y *= -1;
    }

    if (this.position.x < -this.radius - 40 || this.position.x > this.bounds.width + this.radius + 40) {
      this.alive = false;
      return;
    }

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = randomRange(this.config.fireDelay[0], this.config.fireDelay[1]);
      const direction = this.aimDirection();
      const bulletVelocity = direction.scale(240);
      const bullet = new Bullet(this.position, bulletVelocity, 1.4, 3, false);
      bullets.push(bullet);
    }
  }

  aimDirection() {
    const target = this.ship.position.clone();
    const offset = (Math.random() - 0.5) * Math.PI * this.config.accuracy;
    const direction = Vector2.subtract(target, this.position).normalize();
    const angle = Math.atan2(direction.y, direction.x) + offset;
    return Vector2.fromAngle(angle, 1);
  }

  draw(ctx, mode) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    if (mode === 'shaded') {
      const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
      gradient.addColorStop(0, '#fef3c7');
      gradient.addColorStop(1, '#facc15');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius + 8, this.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius + 8, this.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -this.radius * 0.3, this.radius * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export function ufoScore(type) {
  return UFO_CONFIG[type]?.score ?? 0;
}
