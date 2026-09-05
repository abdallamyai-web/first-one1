export class PerformanceMonitor {
  constructor() {
    this.frames = 0;
    this.elapsed = 0;
    this.fps = 60;
    this.frameTime = 16.67;
    this.lastTime = performance.now();

    this.listeners = new Set();
  }

  begin() {
    this.frameStart = performance.now();
  }

  end() {
    const now = performance.now();

    this.frames++;
    this.elapsed += now - this.lastTime;
    this.frameTime = now - this.frameStart;

    this.lastTime = now;

    if (this.elapsed >= 500) {
      this.fps = Math.round(
        (this.frames * 1000) / this.elapsed
      );

      this.frames = 0;
      this.elapsed = 0;

      this.emit();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit() {
    const data = {
      fps: this.fps,
      frameTime: this.frameTime
    };

    for (const listener of this.listeners) {
      listener(data);
    }
  }

  reset() {
    this.frames = 0;
    this.elapsed = 0;
    this.fps = 60;
    this.frameTime = 16.67;
    this.lastTime = performance.now();
  }
}
