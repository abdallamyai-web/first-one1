const TAU = Math.PI * 2;

class Particle {
  constructor(width, height) {
    this.reset(width, height);
  }

  reset(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    const angle = Math.random() * TAU;
    const speed = 0.1 + Math.random() * 0.5;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.ax = 0;
    this.ay = 0;

    this.radius = 0.6 + Math.random() * 1.8;

    this.energy = Math.random();
    this.phase = Math.random() * TAU;

    this.life = Math.random();
  }
}

class Shockwave {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.radius = 0;
    this.strength = 1;
    this.life = 1;
  }

  update(delta) {
    this.radius += 520 * delta;
    this.life -= 1.35 * delta;

    return this.life > 0;
  }
}

export class NeuralModule {
  constructor(options = {}) {
    this.name = "neural";

    this.canvas = null;
    this.ctx = null;

    this.width = 0;
    this.height = 0;

    this.particles = [];
    this.shockwaves = [];

    this.pointer = {
      x: 0,
      y: 0,
      active: false,
      down: false
    };

    this.animationId = null;
    this.lastTime = 0;

    this.paused = false;

    this.quality = options.quality ?? "balanced";

    this.particleCount = {
      quality: 4500,
      balanced: 3000,
      performance: 1800
    };

    this.neighbors = 8;

    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundPointerLeave = this.onPointerLeave.bind(this);
  }

  mount(container) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "neural-canvas";

    this.ctx = this.canvas.getContext("2d", {
      alpha: true,
      desynchronized: true
    });

    if (!this.ctx) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    container.appendChild(this.canvas);

    this.resize(
      container.clientWidth,
      container.clientHeight
    );

    this.createParticles();

    this.canvas.addEventListener(
      "pointermove",
      this.boundPointerMove,
      { passive: true }
    );

    this.canvas.addEventListener(
      "pointerdown",
      this.boundPointerDown,
      { passive: true }
    );

    this.canvas.addEventListener(
      "pointerup",
      this.boundPointerUp,
      { passive: true }
    );

    this.canvas.addEventListener(
      "pointerleave",
      this.boundPointerLeave,
      { passive: true }
    );
  }

  activate() {
    this.paused = false;
    this.lastTime = performance.now();

    this.startLoop();
  }

  deactivate() {
    this.stopLoop();

    this.canvas?.removeEventListener(
      "pointermove",
      this.boundPointerMove
    );

    this.canvas?.removeEventListener(
      "pointerdown",
      this.boundPointerDown
    );

    this.canvas?.removeEventListener(
      "pointerup",
      this.boundPointerUp
    );

    this.canvas?.removeEventListener(
      "pointerleave",
      this.boundPointerLeave
    );

    this.particles.length = 0;
    this.shockwaves.length = 0;

    this.canvas?.remove();

    this.canvas = null;
    this.ctx = null;
  }

  startLoop() {
    if (this.animationId !== null) {
      return;
    }

    const frame = (time) => {
      this.animationId = requestAnimationFrame(frame);

      if (this.paused) {
        return;
      }

      const delta = Math.min(
        (time - this.lastTime) / 1000,
        0.033
      );

      this.lastTime = time;

      this.update(delta);
      this.render();
    };

    this.animationId = requestAnimationFrame(frame);
  }

  stopLoop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resize(width, height) {
    if (!this.canvas) {
      return;
    }

    this.width = Math.max(1, width);
    this.height = Math.max(1, height);

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    this.canvas.width = Math.floor(
      this.width * dpr
    );

    this.canvas.height = Math.floor(
      this.height * dpr
    );

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    if (this.particles.length === 0) {
      this.createParticles();
    }
  }

  createParticles() {
    const count =
      this.particleCount[this.quality];

    this.particles = Array.from(
      { length: count },
      () => new Particle(this.width, this.height)
    );
  }

  setQuality(quality) {
    if (!this.particleCount[quality]) {
      return;
    }

    this.quality = quality;
    this.createParticles();
  }

  update(delta) {
    const time = performance.now() * 0.001;

    for (const particle of this.particles) {
      particle.ax = 0;
      particle.ay = 0;

      const dx =
        this.pointer.x - particle.x;

      const dy =
        this.pointer.y - particle.y;

      const distanceSq =
        dx * dx + dy * dy;

      const distance =
        Math.sqrt(distanceSq) || 1;

      if (
        this.pointer.active &&
        distance < 340
      ) {
        const influence =
          1 - distance / 340;

        const force =
          influence * influence * 90;

        const nx = dx / distance;
        const ny = dy / distance;

        if (this.pointer.down) {
          particle.ax += nx * force;
          particle.ay += ny * force;
        } else {
          particle.ax -= nx * force * 0.55;
          particle.ay -= ny * force * 0.55;
        }

        // Vortex component.
        particle.ax += -ny * force * 0.55;
        particle.ay += nx * force * 0.55;
      }

      // Ambient orbital field.
      const wave =
        Math.sin(
          particle.phase +
          time * 0.45 +
          particle.x * 0.0015
        );

      particle.ax +=
        Math.cos(time * 0.2 + particle.y * 0.001) *
        wave *
        2.5;

      particle.ay +=
        Math.sin(time * 0.17 + particle.x * 0.001) *
        wave *
        2.5;

      particle.vx += particle.ax * delta;
      particle.vy += particle.ay * delta;

      const damping = Math.pow(0.92, delta * 60);

      particle.vx *= damping;
      particle.vy *= damping;

      const maxSpeed = 3.5;

      const speed = Math.hypot(
        particle.vx,
        particle.vy
      );

      if (speed > maxSpeed) {
        const factor = maxSpeed / speed;

        particle.vx *= factor;
        particle.vy *= factor;
      }

      particle.x += particle.vx * delta * 60;
      particle.y += particle.vy * delta * 60;

      // Soft wrap.
      if (particle.x < -20) {
        particle.x = this.width + 20;
      }

      if (particle.x > this.width + 20) {
        particle.x = -20;
      }

      if (particle.y < -20) {
        particle.y = this.height + 20;
      }

      if (particle.y > this.height + 20) {
        particle.y = -20;
      }

      particle.energy =
        Math.min(
          1,
          0.25 +
          speed / maxSpeed * 0.75
        );
    }

    for (const wave of this.shockwaves) {
      for (const particle of this.particles) {
        const dx = particle.x - wave.x;
        const dy = particle.y - wave.y;

        const distance = Math.hypot(dx, dy);

        const thickness = 60;

        if (
          Math.abs(distance - wave.radius) <
          thickness
        ) {
          const normalized =
            1 -
            Math.abs(distance - wave.radius) /
            thickness;

          const nx = dx / (distance || 1);
          const ny = dy / (distance || 1);

          const force =
            normalized *
            wave.strength *
            14;

          particle.vx += nx * force;
          particle.vy += ny * force;
        }
      }

      wave.update(delta);
    }

    this.shockwaves =
      this.shockwaves.filter(
        wave => wave.life > 0
      );
  }

  render() {
    if (!this.ctx) {
      return;
    }

    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    // Background glow.
    const gradient =
      ctx.createRadialGradient(
        this.pointer.x,
        this.pointer.y,
        0,
        this.pointer.x,
        this.pointer.y,
        500
      );

    gradient.addColorStop(
      0,
      "rgba(20, 110, 255, 0.08)"
    );

    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    // Connection field.
    this.renderConnections(ctx);

    // Particles.
    for (const particle of this.particles) {
      const energy = particle.energy;

      const r = Math.floor(
        70 + energy * 80
      );

      const g = Math.floor(
        140 + energy * 90
      );

      const b = 255;

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius *
          (0.75 + energy * 0.65),
        0,
        TAU
      );

      ctx.fillStyle =
        `rgba(${r}, ${g}, ${b}, ${0.3 + energy * 0.7})`;

      ctx.fill();
    }

    // Shockwaves.
    for (const wave of this.shockwaves) {
      ctx.beginPath();

      ctx.arc(
        wave.x,
        wave.y,
        wave.radius,
        0,
        TAU
      );

      ctx.strokeStyle =
        `rgba(70, 180, 255, ${wave.life * 0.7})`;

      ctx.lineWidth = 1.5;

      ctx.stroke();

      ctx.beginPath();

      ctx.arc(
        wave.x,
        wave.y,
        wave.radius * 0.92,
        0,
        TAU
      );

      ctx.strokeStyle =
        `rgba(170, 80, 255, ${wave.life * 0.25})`;

      ctx.lineWidth = 5;

      ctx.stroke();
    }

    // Cursor field.
    if (this.pointer.active) {
      ctx.beginPath();

      ctx.arc(
        this.pointer.x,
        this.pointer.y,
        this.pointer.down ? 25 : 12,
        0,
        TAU
      );

      ctx.strokeStyle =
        "rgba(100, 200, 255, 0.65)";

      ctx.lineWidth = 1;

      ctx.stroke();

      ctx.beginPath();

      ctx.arc(
        this.pointer.x,
        this.pointer.y,
        3,
        0,
        TAU
      );

      ctx.fillStyle =
        "rgba(255,255,255,0.95)";

      ctx.fill();
    }
  }

  renderConnections(ctx) {
    const maxDistance = 105;
    const maxDistanceSq =
      maxDistance * maxDistance;

    // Sampling keeps the connection pass
    // visually rich without becoming O(N²)
    // across thousands of particles.
    const step =
      this.particles.length > 3500
        ? 4
        : 2;

    for (
      let i = 0;
      i < this.particles.length;
      i += step
    ) {
      const a = this.particles[i];

      for (
        let j = i + step;
        j < this.particles.length;
        j += step
      ) {
        const b = this.particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;

        const distanceSq =
          dx * dx + dy * dy;

        if (distanceSq > maxDistanceSq) {
          continue;
        }

        const alpha =
          (1 -
            Math.sqrt(distanceSq) /
            maxDistance) *
          0.14;

        ctx.beginPath();

        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        ctx.strokeStyle =
          `rgba(70, 150, 255, ${alpha})`;

        ctx.lineWidth = 0.45;

        ctx.stroke();
      }
    }
  }

  onPointerMove(event) {
    const rect =
      this.canvas.getBoundingClientRect();

    this.pointer.x =
      event.clientX - rect.left;

    this.pointer.y =
      event.clientY - rect.top;

    this.pointer.active = true;
  }

  onPointerDown(event) {
    this.pointer.down = true;

    const rect =
      this.canvas.getBoundingClientRect();

    this.pointer.x =
      event.clientX - rect.left;

    this.pointer.y =
      event.clientY - rect.top;

    this.shockwaves.push(
      new Shockwave(
        this.pointer.x,
        this.pointer.y
      )
    );
  }

  onPointerUp() {
    this.pointer.down = false;
  }

  onPointerLeave() {
    this.pointer.active = false;
    this.pointer.down = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }

  reset() {
    this.createParticles();
    this.shockwaves.length = 0;
  }

  getStats() {
    return {
      particles: this.particles.length,
      renderer: "CANVAS 2D"
    };
  }
}
