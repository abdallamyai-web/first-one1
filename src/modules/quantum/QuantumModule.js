import * as THREE from "three";

const TAU = Math.PI * 2;

export class QuantumModule {
  constructor(options = {}) {
    this.name = "quantum";

    this.container = null;

    this.renderer = null;
    this.scene = null;
    this.camera = null;

    this.geometry = null;
    this.material = null;
    this.points = null;

    this.particleCount =
      options.particleCount ?? 15000;

    this.positions = null;
    this.colors = null;

    this.targets = new Float32Array(
      this.particleCount * 3
    );

    this.basePositions = new Float32Array(
      this.particleCount * 3
    );

    this.velocity = new Float32Array(
      this.particleCount * 3
    );

    this.mode = 0;

    this.morphProgress = 1;

    this.width = 1;
    this.height = 1;

    this.paused = false;

    this.elapsed = 0;

    this.pointer = {
      x: 0,
      y: 0
    };

    this.boundPointerMove =
      this.onPointerMove.bind(this);
  }

  mount(container) {
    this.container = container;

    this.scene = new THREE.Scene();

    this.scene.background =
      new THREE.Color("#02040a");

    this.camera =
      new THREE.PerspectiveCamera(
        52,
        1,
        0.1,
        100
      );

    this.camera.position.set(
      0,
      0,
      7.2
    );

    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.75
      )
    );

    this.renderer.setClearColor(
      0x02040a,
      1
    );

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.domElement.className =
      "quantum-canvas";

    container.appendChild(
      this.renderer.domElement
    );

    this.createParticleField();

    this.createCoreGlow();

    this.resize(
      container.clientWidth,
      container.clientHeight
    );

    this.renderer.domElement.addEventListener(
      "pointermove",
      this.boundPointerMove,
      { passive: true }
    );
  }

  activate() {
    this.paused = false;

    this.renderer.setAnimationLoop(
      this.animate.bind(this)
    );
  }

  deactivate() {
    if (!this.renderer) {
      return;
    }

    // Critical lifecycle operation.
    this.renderer.setAnimationLoop(null);

    this.renderer.domElement.removeEventListener(
      "pointermove",
      this.boundPointerMove
    );

    if (this.geometry) {
      this.geometry.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }

    this.disposeSceneObjects();

    this.renderer.dispose();

    this.renderer.domElement.remove();

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.geometry = null;
    this.material = null;
    this.points = null;
    this.container = null;
  }

  createParticleField() {
    this.positions =
      new Float32Array(
        this.particleCount * 3
      );

    this.colors =
      new Float32Array(
        this.particleCount * 3
      );

    const colorA =
      new THREE.Color("#35b8ff");

    const colorB =
      new THREE.Color("#9d5cff");

    const colorC =
      new THREE.Color("#ff3fc8");

    for (
      let i = 0;
      i < this.particleCount;
      i++
    ) {
      const index = i * 3;

      const position =
        this.generateSpherePoint();

      this.positions[index] =
        position.x;

      this.positions[index + 1] =
        position.y;

      this.positions[index + 2] =
        position.z;

      this.basePositions[index] =
        position.x;

      this.basePositions[index + 1] =
        position.y;

      this.basePositions[index + 2] =
        position.z;

      const t =
        i / this.particleCount;

      const color =
        t < 0.5
          ? colorA.clone().lerp(
              colorB,
              t * 2
            )
          : colorB.clone().lerp(
              colorC,
              (t - 0.5) * 2
            );

      this.colors[index] =
        color.r;

      this.colors[index + 1] =
        color.g;

      this.colors[index + 2] =
        color.b;

      this.targets[index] =
        position.x;

      this.targets[index + 1] =
        position.y;

      this.targets[index + 2] =
        position.z;
    }

    this.geometry =
      new THREE.BufferGeometry();

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        this.positions,
        3
      )
    );

    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        this.colors,
        3
      )
    );

    this.material =
      new THREE.PointsMaterial({
        size: 0.026,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });

    this.points =
      new THREE.Points(
        this.geometry,
        this.material
      );

    this.scene.add(this.points);
  }

  createCoreGlow() {
    const geometry =
      new THREE.SphereGeometry(
        0.16,
        24,
        24
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: 0x66ccff,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });

    const core =
      new THREE.Mesh(
        geometry,
        material
      );

    core.name = "core-glow";

    this.scene.add(core);

    const ringGeometry =
      new THREE.TorusGeometry(
        0.72,
        0.006,
        8,
        128
      );

    const ringMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x55bbff,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending
      });

    const ring =
      new THREE.Mesh(
        ringGeometry,
        ringMaterial
      );

    ring.name = "core-ring";

    this.scene.add(ring);
  }

  generateSpherePoint() {
    const theta =
      Math.random() * TAU;

    const phi =
      Math.acos(
        2 * Math.random() - 1
      );

    const radius =
      1.0 +
      (Math.random() - 0.5) *
      0.12;

    return new THREE.Vector3(
      radius *
        Math.sin(phi) *
        Math.cos(theta),

      radius *
        Math.sin(phi) *
        Math.sin(theta),

      radius *
        Math.cos(phi)
    );
  }

  generateTarget(mode, i) {
    const t =
      i / this.particleCount;

    const angle =
      t * TAU * 12;

    if (mode === 0) {
      return this.generateSpherePoint();
    }

    if (mode === 1) {
      // Torus.
      const u =
        t * TAU * 20;

      const v =
        ((i * 17) %
          this.particleCount) /
        this.particleCount *
        TAU;

      const R = 1.35;
      const r = 0.42;

      return new THREE.Vector3(
        (R + r * Math.cos(v)) *
          Math.cos(u),

        r * Math.sin(v),

        (R + r * Math.cos(v)) *
          Math.sin(u)
      );
    }

    if (mode === 2) {
      // Helix.
      const turns = 9;

      const u = t * turns * TAU;

      const radius =
        0.35 +
        0.7 *
        Math.sin(t * Math.PI);

      const y =
        (t - 0.5) * 3.4;

      return new THREE.Vector3(
        Math.cos(u) * radius,
        y,
        Math.sin(u) * radius
      );
    }

    if (mode === 3) {
      // Galaxy.
      const arm =
        i % 5;

      const armOffset =
        arm * TAU / 5;

      const radius =
        Math.pow(
          Math.random(),
          0.55
        ) * 2.3;

      const spin =
        radius * 2.2;

      const a =
        armOffset +
        spin +
        (Math.random() - 0.5) *
        0.45;

      return new THREE.Vector3(
        Math.cos(a) * radius,
        (Math.random() - 0.5) *
          (0.15 + radius * 0.08),
        Math.sin(a) * radius
      );
    }

    // Neural field.
    const x =
      (t * 17 % 1 - 0.5) * 3;

    const y =
      Math.sin(
        t * TAU * 8
      ) * 0.8;

    const z =
      Math.cos(
        t * TAU * 13
      ) * 0.8;

    return new THREE.Vector3(
      x,
      y,
      z
    );
  }

  morphTo(mode) {
    this.mode = mode;

    for (
      let i = 0;
      i < this.particleCount;
      i++
    ) {
      const target =
        this.generateTarget(
          mode,
          i
        );

      const index = i * 3;

      this.targets[index] =
        target.x;

      this.targets[index + 1] =
        target.y;

      this.targets[index + 2] =
        target.z;
    }

    this.morphProgress = 0;
  }

  animate(time) {
    if (
      !this.renderer ||
      !this.scene ||
      !this.camera ||
      this.paused
    ) {
      return;
    }

    const dt =
      Math.min(
        (time - this.elapsed) / 1000,
        0.033
      );

    this.elapsed = time;

    const normalizedDt =
      Number.isFinite(dt)
        ? dt
        : 0.016;

    this.updateParticles(
      normalizedDt,
      time * 0.001
    );

    this.updateScene(
      time * 0.001
    );

    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  updateParticles(delta, time) {
    const positions =
      this.geometry.attributes.position.array;

    const morphSpeed = 2.2;

    for (
      let i = 0;
      i < this.particleCount;
      i++
    ) {
      const index = i * 3;

      const targetX =
        this.targets[index];

      const targetY =
        this.targets[index + 1];

      const targetZ =
        this.targets[index + 2];

      let x =
        positions[index];

      let y =
        positions[index + 1];

      let z =
        positions[index + 2];

      const dx =
        targetX - x;

      const dy =
        targetY - y;

      const dz =
        targetZ - z;

      const force =
        Math.min(
          1,
          delta * morphSpeed
        );

      x += dx * force;
      y += dy * force;
      z += dz * force;

      // Subtle quantum fluctuation.
      const pulse =
        Math.sin(
          time * 2.2 +
          i * 0.013
        ) * 0.0015;

      x += pulse;
      y += pulse * 0.5;
      z -= pulse;

      // Pointer field.
      const px =
        this.pointer.x * 2.2;

      const py =
        this.pointer.y * 1.3;

      const pdx =
        px - x;

      const pdy =
        py - y;

      const pd =
        Math.sqrt(
          pdx * pdx +
          pdy * pdy
        );

      if (pd < 1.6) {
        const influence =
          (1 - pd / 1.6) *
          delta *
          0.5;

        x +=
          pdx * influence;

        y +=
          pdy * influence;
      }

      positions[index] = x;
      positions[index + 1] = y;
      positions[index + 2] = z;
    }

    this.geometry.attributes.position.needsUpdate =
      true;
  }

  updateScene(time) {
    if (!this.points) {
      return;
    }

    this.points.rotation.y =
      time * 0.08;

    this.points.rotation.x =
      Math.sin(time * 0.2) *
      0.15;

    const core =
      this.scene.getObjectByName(
        "core-glow"
      );

    if (core) {
      const scale =
        1 +
        Math.sin(time * 2.5) *
        0.08;

      core.scale.setScalar(scale);
    }

    const ring =
      this.scene.getObjectByName(
        "core-ring"
      );

    if (ring) {
      ring.rotation.x =
        time * 0.35;

      ring.rotation.y =
        time * 0.6;
    }

    const cameraTargetX =
      this.pointer.x * 0.25;

    const cameraTargetY =
      this.pointer.y * 0.18;

    this.camera.position.x +=
      (cameraTargetX -
        this.camera.position.x) *
      0.025;

    this.camera.position.y +=
      (cameraTargetY -
        this.camera.position.y) *
      0.025;

    this.camera.lookAt(
      0,
      0,
      0
    );
  }

  resize(width, height) {
    this.width =
      Math.max(1, width);

    this.height =
      Math.max(1, height);

    if (!this.renderer || !this.camera) {
      return;
    }

    this.camera.aspect =
      this.width / this.height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      this.width,
      this.height,
      false
    );
  }

  onPointerMove(event) {
    if (!this.renderer) {
      return;
    }

    const rect =
      this.renderer.domElement.getBoundingClientRect();

    this.pointer.x =
      ((event.clientX - rect.left) /
        rect.width -
        0.5);

    this.pointer.y =
      -(
        (event.clientY - rect.top) /
          rect.height -
        0.5
      );
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.elapsed =
      performance.now();
  }

  reset() {
    this.morphTo(0);
  }

  nextFormation() {
    this.morphTo(
      (this.mode + 1) % 5
    );
  }

  setQuality(quality) {
    const counts = {
      quality: 18000,
      balanced: 15000,
      performance: 8000
    };

    const targetCount =
      counts[quality];

    if (
      !targetCount ||
      targetCount === this.particleCount
    ) {
      return;
    }

    // The module is deliberately recreated
    // for a particle-count change. This keeps
    // buffer lifecycle deterministic.
    this.rebuild(targetCount);
  }

  rebuild(count) {
    if (!this.geometry) {
      return;
    }

    const oldPositions =
      this.positions;

    this.particleCount = count;

    this.geometry.dispose();

    this.positions =
      new Float32Array(
        count * 3
      );

    this.colors =
      new Float32Array(
        count * 3
      );

    this.targets =
      new Float32Array(
        count * 3
      );

    this.basePositions =
      new Float32Array(
        count * 3
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const oldIndex =
        (i % (oldPositions.length / 3)) *
        3;

      const index = i * 3;

      const sourceX =
        oldPositions[oldIndex];

      const sourceY =
        oldPositions[oldIndex + 1];

      const sourceZ =
        oldPositions[oldIndex + 2];

      this.positions[index] =
        sourceX ?? 0;

      this.positions[index + 1] =
        sourceY ?? 0;

      this.positions[index + 2] =
        sourceZ ?? 0;

      this.targets[index] =
        this.positions[index];

      this.targets[index + 1] =
        this.positions[index + 1];

      this.targets[index + 2] =
        this.positions[index + 2];

      const c =
        i / count;

      this.colors[index] =
        0.15 + c * 0.35;

      this.colors[index + 1] =
        0.55 + c * 0.2;

      this.colors[index + 2] =
        1;
    }

    this.geometry =
      new THREE.BufferGeometry();

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        this.positions,
        3
      )
    );

    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        this.colors,
        3
      )
    );

    const oldPoints =
      this.points;

    this.points =
      new THREE.Points(
        this.geometry,
        this.material
      );

    this.scene.remove(oldPoints);

    this.scene.add(this.points);
  }

  disposeSceneObjects() {
    if (!this.scene) {
      return;
    }

    this.scene.traverse(
      object => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(
              material =>
                material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      }
    );

    this.scene.clear();
  }

  getStats() {
    return {
      particles: this.particleCount,
      renderer: "THREE.JS / WEBGL"
    };
  }
}
