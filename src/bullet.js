import { Vector2 } from './vector2.js';

export class Bullet {
  constructor(position, velocity, lifetime = 0.9, radius = 2, friendly = true) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.lifetime = lifetime;
    this.radius = radius;
    this.friendly = friendly;
    this.alive = true;
  }

  update(dt, bounds) {
    this.position.add(this.velocity.clone().scale(dt));
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.alive = false;
    }
    if (
      this.position.x < 0 ||
      this.position.x > bounds.width ||
      this.position.y < 0 ||
      this.position.y > bounds.height
    ) {
      this.alive = false;
    }
  }

  draw(ctx, mode) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    if (mode === 'shaded') {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 3);
      gradient.addColorStop(0, this.friendly ? '#ffe66d' : '#ff6d6d');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = this.friendly ? '#ffffff' : '#ff6d6d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
