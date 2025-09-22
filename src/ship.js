import { Bullet } from './bullet.js';
import { Vector2, wrapPosition } from './vector2.js';

export class Ship {
  constructor(position) {
    this.position = position.clone();
    this.velocity = new Vector2();
    this.angle = -Math.PI / 2;
    this.rotationSpeed = Math.PI * 2;
    this.thrustPower = 220;
    this.maxSpeed = 320;
    this.radius = 18;
    this.lives = 3;
    this.cooldown = 0;
    this.invulnerableTime = 0;
    this.thrusting = false;
  }

  update(dt, input, bounds, audio) {
    const turnLeft = input.isDown('arrowleft') || input.isDown('a');
    const turnRight = input.isDown('arrowright') || input.isDown('d');
    const thrust = input.isDown('arrowup') || input.isDown('w');

    if (turnLeft) {
      this.angle -= this.rotationSpeed * dt;
    }
    if (turnRight) {
      this.angle += this.rotationSpeed * dt;
    }

    this.thrusting = thrust;
    if (thrust) {
      const accel = Vector2.fromAngle(this.angle, this.thrustPower * dt);
      this.velocity.add(accel);
      const speed = this.velocity.length();
      if (speed > this.maxSpeed) {
        this.velocity.scale(this.maxSpeed / speed);
      }
      audio?.setThrusting(true);
    } else {
      audio?.setThrusting(false);
    }

    // Apply mild friction to prevent drift from lasting forever
    this.velocity.scale(0.995);
    this.position.add(this.velocity.clone().scale(dt));
    wrapPosition(this.position, bounds.width, bounds.height);

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= dt;
    }
  }

  shoot(bullets) {
    if (this.cooldown > 0) return null;
    const direction = Vector2.fromAngle(this.angle, 1);
    const bulletVelocity = direction.clone().scale(520).add(this.velocity);
    const bulletPosition = this.position.clone().add(direction.clone().scale(this.radius));
    const bullet = new Bullet(bulletPosition, bulletVelocity, 0.9, 2.5, true);
    bullets.push(bullet);
    this.cooldown = 0.18;
    return bullet;
  }

  hyperspace(bounds) {
    this.position.set(Math.random() * bounds.width, Math.random() * bounds.height);
    this.velocity.set(0, 0);
    this.invulnerableTime = 2;
  }

  draw(ctx, mode) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle + Math.PI / 2);

    if (mode === 'shaded') {
      const gradient = ctx.createLinearGradient(0, -20, 0, 20);
      gradient.addColorStop(0, '#7dd3fc');
      gradient.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(14, 18);
      ctx.lineTo(-14, 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (this.thrusting) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(7, 30);
        ctx.lineTo(-7, 30);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(14, 18);
      ctx.lineTo(-14, 18);
      ctx.closePath();
      ctx.stroke();
      if (this.thrusting) {
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(6, 28);
        ctx.lineTo(-6, 28);
        ctx.closePath();
        ctx.stroke();
      }
    }

    if (this.invulnerableTime > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
