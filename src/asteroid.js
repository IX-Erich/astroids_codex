import { Vector2, wrapPosition, randomRange } from './vector2.js';

const SIZE_CONFIG = {
  large: { radius: 48, speed: [30, 60], score: 20, next: 'medium' },
  medium: { radius: 28, speed: [50, 90], score: 50, next: 'small' },
  small: { radius: 16, speed: [70, 130], score: 100, next: null },
};

export class Asteroid {
  constructor(position, size = 'large') {
    this.position = position.clone();
    this.size = size;
    this.config = SIZE_CONFIG[size];
    const speed = randomRange(this.config.speed[0], this.config.speed[1]);
    const angle = Math.random() * Math.PI * 2;
    this.velocity = Vector2.fromAngle(angle, speed);
    this.rotation = randomRange(-0.6, 0.6);
    this.angle = Math.random() * Math.PI * 2;
    this.vertices = this.generateVertices();
    this.radius = this.config.radius;
    this.alive = true;
  }

  generateVertices() {
    const verts = [];
    const points = 10;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variance = randomRange(0.75, 1.25);
      const radius = this.config.radius * variance;
      verts.push({ angle, radius });
    }
    return verts;
  }

  update(dt, bounds) {
    this.position.add(this.velocity.clone().scale(dt));
    wrapPosition(this.position, bounds.width, bounds.height);
    this.angle += this.rotation * dt;
  }

  split() {
    const nextSize = this.config.next;
    if (!nextSize) {
      return [];
    }
    const children = [];
    for (let i = 0; i < 2; i++) {
      const child = new Asteroid(this.position.clone(), nextSize);
      child.velocity = this.velocity
        .clone()
        .add(Vector2.fromAngle(Math.random() * Math.PI * 2, randomRange(20, 60)));
      children.push(child);
    }
    return children;
  }

  draw(ctx, mode) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      const x = Math.cos(v.angle) * v.radius;
      const y = Math.sin(v.angle) * v.radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    if (mode === 'shaded') {
      const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.3, 0, 0, this.radius);
      gradient.addColorStop(0, '#d1d5db');
      gradient.addColorStop(1, '#4b5563');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}

export function createAsteroidWave(count, bounds, avoid) {
  const asteroids = [];
  for (let i = 0; i < count; i++) {
    let position;
    let attempts = 0;
    do {
      position = new Vector2(Math.random() * bounds.width, Math.random() * bounds.height);
      attempts += 1;
    } while (
      avoid &&
      attempts < 10 &&
      Vector2.subtract(position, avoid.position).length() < avoid.radius + 80
    );
    asteroids.push(new Asteroid(position, 'large'));
  }
  return asteroids;
}

export function asteroidScore(size) {
  return SIZE_CONFIG[size]?.score ?? 0;
}
