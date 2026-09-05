import { ModuleManager } from "./ModuleManager.js";
import { PerformanceMonitor } from "./PerformanceMonitor.js";

import { NeuralModule } from "../modules/neural/NeuralModule.js";
import { QuantumModule } from "../modules/quantum/QuantumModule.js";

export class Application {
  constructor(ui) {
    this.ui = ui;

    this.container =
      document.querySelector(
        "#moduleContainer"
      );

    this.moduleManager =
      new ModuleManager();

    this.performance =
      new PerformanceMonitor();

    this.currentModule =
      "neural";

    this.quality =
      "balanced";

    this.boundResize =
      this.onResize.bind(this);

    this.boundVisibility
