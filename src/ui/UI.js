export class UI {
  constructor() {
    this.elements = {
      moduleButtons:
        document.querySelectorAll(
          ".module-button"
        ),

      moduleEyebrow:
        document.querySelector(
          "#moduleEyebrow"
        ),

      moduleTitle:
        document.querySelector(
          "#moduleTitle"
        ),

      moduleDescription:
        document.querySelector(
          "#moduleDescription"
        ),

      fps:
        document.querySelector(
          "#fpsValue"
        ),

      particles:
        document.querySelector(
          "#particleValue"
        ),

      engine:
        document.querySelector(
          "#engineValue"
        ),

      pause:
        document.querySelector(
          "#pauseButton"
        ),

      reset:
        document.querySelector(
          "#resetButton"
        ),

      debug:
        document.querySelector(
          "#debugButton"
        ),

      debugPanel:
        document.querySelector(
          "#debugPanel"
        ),

      closeDebug:
        document.querySelector(
          "#closeDebug"
        ),

      debugFps:
        document.querySelector(
          "#debugFps"
        ),

      debugFrame:
        document.querySelector(
          "#debugFrame"
        ),

      debugModule:
        document.querySelector(
          "#debugModule"
        ),

      debugParticles:
        document.querySelector(
          "#debugParticles"
        ),

      debugQuality:
        document.querySelector(
          "#debugQuality"
        ),

      debugRenderer:
        document.querySelector(
          "#debugRenderer"
        ),

      transition:
        document.querySelector(
          "#transitionScreen"
        ),

      boot:
        document.querySelector(
          "#bootScreen"
        ),

      bootProgress:
        document.querySelector(
          "#bootProgressBar"
        ),

      bootText:
        document.querySelector(
          "#bootText"
        ),

      systemStatus:
        document.querySelector(
          "#systemStatus"
        )
    };

    this.paused = false;
  }

  bind({
    onModuleChange,
    onPause,
    onReset,
    onDebug
  }) {
    for (const button of this.elements.moduleButtons) {
      button.addEventListener(
        "click",
        () => {
          onModuleChange(
            button.dataset.module
          );
        }
      );
    }

    this.elements.pause.addEventListener(
      "click",
      onPause
    );

    this.elements.reset.addEventListener(
      "click",
      onReset
    );

    this.elements.debug.addEventListener(
      "click",
      onDebug
    );

    this.elements.closeDebug.addEventListener(
      "click",
      onDebug
    );
  }

  setModule(module) {
    const isNeural =
      module === "neural";

    this.elements.moduleButtons.forEach(
      button => {
        button.classList.toggle(
          "active",
          button.dataset.module === module
        );
      }
    );

    if (isNeural) {
      this.elements.moduleEyebrow.textContent =
        "MODULE 01";

      this.elements.moduleTitle.textContent =
        "NEURAL KINETICS";

      this.elements.moduleDescription.textContent =
        "Interactive 2D particle physics and emergent force fields.";

      this.elements.engine.textContent =
        "2D";
    } else {
      this.elements.moduleEyebrow.textContent =
        "MODULE 02";

      this.elements.moduleTitle.textContent =
        "QUANTUM CORE";

      this.elements.moduleDescription.textContent =
        "GPU-oriented procedural particle field with morphing formations.";

      this.elements.engine.textContent =
        "WEBGL";
    }

    this.elements.debugModule.textContent =
      module.toUpperCase();

    this.setPaused(false);
  }

  setPaused(paused) {
    this.paused = paused;

    this.elements.pause.textContent =
      paused
        ? "RESUME"
        : "PAUSE";
  }

  updatePerformance({
    fps,
    frameTime
  }) {
    this.elements.fps.textContent =
      Math.round(fps);

    this.elements.debugFps.textContent =
      Math.round(fps);

    this.elements.debugFrame.textContent =
      `${frameTime.toFixed(1)} ms`;
  }

  updateStats(stats, quality) {
    this.elements.particles.textContent =
      (stats.particles ?? 0).toLocaleString();

    this.elements.debugParticles.textContent =
      (stats.particles ?? 0).toLocaleString();

    this.elements.debugQuality.textContent =
      quality.toUpperCase();

    this.elements.debugRenderer.textContent =
      stats.renderer ?? "UNKNOWN";
  }

  toggleDebug() {
    this.elements.debugPanel.classList.toggle(
      "hidden"
    );
  }

  async transition(callback) {
    this.elements.transition.classList.add(
      "active"
    );

    await new Promise(
      resolve =>
        setTimeout(resolve, 220)
    );

    await callback();

    await new Promise(
      resolve =>
        setTimeout(resolve, 160)
    );

    this.elements.transition.classList.remove(
      "active"
    );
  }

  async bootSequence() {
    const messages = [
      "INITIALIZING VISUAL SYSTEM...",
      "ALLOCATING RENDER PIPELINE...",
      "LOADING MODULE REGISTRY...",
      "CALIBRATING PARTICLE FIELD...",
      "NEXUS ONLINE."
    ];

    for (
      let i = 0;
      i < messages.length;
      i++
    ) {
      this.elements.bootText.textContent =
        messages[i];

      this.elements.bootProgress.style.width =
        `${((i + 1) / messages.length) * 100}%`;

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            130
          )
      );
    }

    await new Promise(
      resolve =>
        setTimeout(resolve, 300)
    );

    this.elements.boot.classList.add(
      "hidden"
    );
  }

  setSystemStatus(text) {
    this.elements.systemStatus.textContent =
      text;
  }
}
