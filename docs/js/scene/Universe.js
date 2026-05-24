import * as THREE from 'three';

/**
 * Universe — sfondo cosmico.
 *
 * FIX flickering definitivo (già risolto in precedenza, riapplicato):
 *
 * CAUSA REALE: gl_PointSize sub-pixel. Quando una stella scende sotto
 * 1px WebGL la fa sparire/riapparire ogni frame al variare della camera.
 * Il blink sull'alpha amplifica questo visivamente.
 *
 * SOLUZIONE:
 *  1. Blink agisce SOLO su vAlpha — mai su gl_PointSize
 *  2. Floor alzato a 3.0px — nessuna stella va mai sotto soglia
 *  3. Frequenze ultralente (0.025 / 0.038 rad/s = cicli 40-70s)
 *  4. Ampiezza quasi zero (±0.015) — stelle "respirano" impercettibilmente
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
    this.scene.background = new THREE.Color(0x0d1526);
    this.scene.fog = new THREE.FogExp2(0x0d1526, 0.000048);
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
      new THREE.Color(0xd4b8ff),
      new THREE.Color(0xa8beff),
      new THREE.Color(0xb8d4e8),
      new THREE.Color(0xfff0c8),
      new THREE.Color(0xc8c0ff),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 5000 + Math.random() * 4000;
      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      sizes[i]  = Math.random() < 0.05 ? Math.random() * 3.0 + 1.8 : Math.random() * 1.2 + 0.3;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
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

          /*
           * BLINK → solo alpha, MAI sulla dimensione.
           * Frequenze ultralente: 0.025 rad/s = periodo ~250s
           *                       0.038 rad/s = periodo ~165s
           * Ampiezza ±0.015 → range 0.97–1.0, praticamente invisibile.
           * Stelle grandi (aSize > 2.5) ancora più stabili: amp ±0.008.
           */
          float big  = step(2.5, aSize);
          float amp  = mix(0.015, 0.008, big);
          float f1   = mix(0.025, 0.015, big);
          float f2   = mix(0.038, 0.022, big);

          float s1   = sin(uTime * f1 + aPhase);
          float s2   = sin(uTime * f2 + aPhase * 1.618);
          float blink = 0.97 + s1 * amp + s2 * amp;
          vAlpha = clamp(blink, 0.0, 1.0);

          /*
           * DIMENSIONE → solo distanza, blink non la tocca mai.
           * Floor 3.0px: nessuna stella scende sotto soglia sub-pixel.
           * Sotto 1px WebGL fa sparire/riapparire il punto ogni frame
           * al minimo movimento della camera → questo era il flickering.
           */
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float size = aSize * (1200.0 / -mv.z);
          gl_PointSize = max(size, 3.0);

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
          float core  = 1.0 - smoothstep(0.0, 0.5, d);
          float flare = max(0.0, 1.0 - abs(uv.x) * 7.0)
                      * max(0.0, 1.0 - abs(uv.y) * 7.0);
          float a = max(core, flare * 0.45) * vAlpha;
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

  /* ───────── Nebulose ───────── */
  _createNebulae() {
    this.nebulaGroup = new THREE.Group();

    const defs = [
      { theta: 0.6,  phi: 1.0, r: 6200, color: 0x3a2255, spreadR: 3800, spreadT: 1900 },
      { theta: 2.0,  phi: 1.9, r: 7000, color: 0x162960, spreadR: 3500, spreadT: 1750 },
      { theta: 3.5,  phi: 1.3, r: 5800, color: 0x1e1236, spreadR: 4200, spreadT: 2100 },
      { theta: 4.8,  phi: 0.4, r: 7500, color: 0x0e3d4a, spreadR: 4500, spreadT: 2250 },
      { theta: 5.5,  phi: 2.2, r: 6500, color: 0x2e1a44, spreadR: 3600, spreadT: 1800 },
      { theta: 1.3,  phi: 0.6, r: 8000, color: 0x141c32, spreadR: 4800, spreadT: 2400 },
    ];

    const PER_NEBULA = this.device.isMobile ? 160 : 280;

    defs.forEach(({ theta, phi, r, color, spreadR, spreadT }) => {
      const cx = r * Math.sin(phi) * Math.cos(theta);
      const cy = r * Math.cos(phi);
      const cz = r * Math.sin(phi) * Math.sin(theta);

      const positions = new Float32Array(PER_NEBULA * 3);
      const alphas    = new Float32Array(PER_NEBULA);
      const psizes    = new Float32Array(PER_NEBULA);

      for (let i = 0; i < PER_NEBULA; i++) {
        const i3 = i * 3;
        const gx = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        const gy = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        const gz = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        positions[i3]     = cx + gx * spreadR;
        positions[i3 + 1] = cy + gy * spreadT;
        positions[i3 + 2] = cz + gz * spreadR;
        alphas[i] = 0.030 + Math.random() * 0.048;
        psizes[i] = 320 + Math.random() * 320;
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
            float dist = max(-mv.z, 1.0);
            gl_PointSize = aSize * clamp(1800.0 / dist, 0.2, 12.0);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */`
          uniform vec3 uColor;
          varying float vA;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv) * 2.0;
            if (d > 1.0) discard;
            float gauss = exp(-d * d * 2.5);
            gl_FragColor = vec4(uColor, gauss * vA);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      this.nebulaGroup.add(new THREE.Points(geo, mat));
    });

    this.nebulaGroup.renderOrder = -1;
    this.scene.add(this.nebulaGroup);
  }

  update(time) {
    if (this.starsMat) this.starsMat.uniforms.uTime.value = time;
    if (this.nebulaGroup) {
      this.nebulaGroup.rotation.y = time * 0.0006;
      this.nebulaGroup.rotation.x = Math.sin(time * 0.0004) * 0.025;
    }
  }
}