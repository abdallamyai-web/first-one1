export class ModuleManager {
  constructor() {
    this.modules = new Map();
    this.activeName = null;
    this.transitioning = false;
  }

  register(name, module) {
    if (this.modules.has(name)) {
      throw new Error(`Module "${name}" is already registered.`);
    }

    this.modules.set(name, module);
    return this;
  }

  async activate(name, container) {
    if (this.transitioning) {
      return;
    }

    if (!this.modules.has(name)) {
      throw new Error(`Unknown module: ${name}`);
    }

    if (this.activeName === name) {
      return;
    }

    this.transitioning = true;

    const previous = this.activeName
      ? this.modules.get(this.activeName)
      : null;

    try {
      if (previous) {
        await previous.deactivate();
      }

      container.replaceChildren();

      const next = this.modules.get(name);

      await next.mount(container);
      await next.activate();

      this.activeName = name;
    } finally {
      this.transitioning = false;
    }
  }

  get activeModule() {
    if (!this.activeName) {
      return null;
    }

    return this.modules.get(this.activeName) ?? null;
  }

  resize(width, height) {
    this.activeModule?.resize(width, height);
  }

  pause() {
    this.activeModule?.pause();
  }

  resume() {
    this.activeModule?.resume();
  }

  reset() {
    this.activeModule?.reset();
  }

  getStats() {
    return this.activeModule?.getStats?.() ?? {};
  }

  async dispose() {
    for (const module of this.modules.values()) {
      await module.deactivate();
    }

    this.modules.clear();
    this.activeName = null;
  }
}
