import * as THREE from 'three';

/**
 * Universe — sfondo cosmico.
 * Campo stellare con twinkle + nebulose volumetriche.
 * Fix dal bug Step 1: rimosso `vertexColors:true` su ShaderMaterial
 * (conflittava con la dichiarazione manuale di `attribute vec3 color`).
 */
export class Universe {
  constructor(scene, device) {
    this.scene  = scene;
    this.device = device;

    this._setBackground();
    this._createStarField();
    this._createNebulae();
  }

  _setBackground() {
    this.scene.background = new THREE.Color(0x00000a);
    this.scene.fog = new THREE.FogExp2(0x00000a, 0.00022);
  }

  /* ───────── Starfield ───────── */
  _createStarField() {
    const count = this.device.starCount;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const phases    = new Float32Array(count);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xb8d0ff),
      new THREE.Color(0xfff0c8),
      new THREE.Color(0xffd27f),
      new THREE.Color(0xff9966),
      new THREE.Color(0x00e5ff),
      new THREE.Color(0xc0c0ff),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribuzione su guscio sferico
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 700 + Math.random() * 500;

      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;

      sizes[i]  = Math.random() < 0.05 ? Math.random() * 3.0 + 1.8 : Math.random() * 1.2 + 0.3;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    // ATTENZIONE: usiamo aColor (non `color`) per evitare conflitto con built-in di Three.js
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        attribute vec3  aColor;
        attribute float aSize;
        attribute float aPhase;
        varying vec3  vColor;
        varying float vAlpha;
        uniform float uTime;

        void main() {
          vColor = aColor;
          float t = uTime * 1.6 + aPhase;
          float blink = 0.65 + (sin(t) * 0.5 + 0.5) * 0.35;
          vAlpha = blink;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * blink * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3  vColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core  = 1.0 - smoothstep(0.05, 0.45, d);
          float flare = max(0.0, 1.0 - abs(uv.x) * 7.0) * max(0.0, 1.0 - abs(uv.y) * 7.0);
          float a = max(core, flare * 0.5) * vAlpha;
          gl_FragColor = vec4(vColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.stars    = new THREE.Points(geo, mat);
    this.starsMat = mat;
    this.scene.add(this.stars);
  }

  /* ───────── Nebulose volumetriche ───────── */
  _createNebulae() {
    this.nebulaGroup = new THREE.Group();

    const defs = [
      { pos: [-280,  80, -480], color: 0x2a0080, spread: [320, 140, 200] }, // viola
      { pos: [ 380, -90, -420], color: 0x004a55, spread: [340, 160, 220] }, // teal
      { pos: [ 140, 200, -560], color: 0x401020, spread: [260, 110, 180] }, // magenta scuro
      { pos: [-400, -70, -340], color: 0x102060, spread: [290, 150, 210] }, // blu cobalto
      { pos: [  80,-230,-640],  color: 0x553300, spread: [220, 100, 160] }, // ambra
    ];

    const count = this.device.nebulaParticles;

    defs.forEach(({ pos, color, spread }) => {
      const positions = new Float32Array(count * 3);
      const alphas    = new Float32Array(count);
      const psizes    = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Gaussian-ish: media di 3 random per addolcire i bordi
        const rx = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        const ry = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        const rz = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        positions[i3]     = pos[0] + rx * spread[0];
        positions[i3 + 1] = pos[1] + ry * spread[1];
        positions[i3 + 2] = pos[2] + rz * spread[2];
        alphas[i] = Math.random() * 0.45 + 0.05;
        psizes[i] = Math.random() * 80 + 30;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas, 1));
      geo.setAttribute('aSize',    new THREE.BufferAttribute(psizes, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) } },
        vertexShader: /* glsl */`
          attribute float aAlpha;
          attribute float aSize;
          varying float vA;
          void main() {
            vA = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (180.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */`
          uniform vec3 uColor;
          varying float vA;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;
            float a = (1.0 - smoothstep(0.0, 0.5, d)) * vA;
            gl_FragColor = vec4(uColor, a * 0.75);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      this.nebulaGroup.add(new THREE.Points(geo, mat));
    });

    this.scene.add(this.nebulaGroup);
  }

  update(time) {
    if (this.starsMat) this.starsMat.uniforms.uTime.value = time;
    if (this.nebulaGroup) {
      this.nebulaGroup.rotation.y = time * 0.003;
      this.nebulaGroup.rotation.x = Math.sin(time * 0.002) * 0.04;
    }
  }
}
