import * as THREE from 'three';

/**
 * Universe — sfondo cosmico.
 */
export class Universe {
  constructor(scene, device) {
    this.scene = scene;
    this.device = device;
    this._starTex = this._makeStarTexture(128);

    this._setBackground();
    this._createStarField();
    this._createNebulae();
    this._createHeroStars();
  }

  /* ───────── Star texture (condivisa fra particelle e sprite) ───────── */
  _makeStarTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;

    // Alone radiale
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
    g.addColorStop(0.00, 'rgba(255,255,255,1.00)');
    g.addColorStop(0.04, 'rgba(220,238,255,0.88)');
    g.addColorStop(0.14, 'rgba(180,215,255,0.42)');
    g.addColorStop(0.38, 'rgba(140,185,255,0.10)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // Spike: ellisse allungata + gradiente lineare
    const spike = (angle, halfLen, halfW, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const sg = ctx.createLinearGradient(-halfLen, 0, halfLen, 0);
      sg.addColorStop(0, `rgba(200,225,255,0)`);
      sg.addColorStop(0.38, `rgba(235,248,255,${(alpha * 0.65).toFixed(2)})`);
      sg.addColorStop(0.50, `rgba(255,255,255,${alpha.toFixed(2)})`);
      sg.addColorStop(0.62, `rgba(235,248,255,${(alpha * 0.65).toFixed(2)})`);
      sg.addColorStop(1, `rgba(200,225,255,0)`);
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(0, 0, halfLen, halfW, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Croce cardinale
    spike(0, cx * 0.94, 1.5, 0.92);
    spike(Math.PI / 2, cx * 0.94, 1.5, 0.92);
    // Diagonali
    spike(Math.PI / 4, cx * 0.62, 0.9, 0.54);
    spike(-Math.PI / 4, cx * 0.62, 0.9, 0.54);

    return new THREE.CanvasTexture(canvas);
  }

  _setBackground() {
    this.scene.background = new THREE.Color(0x0d1526);
    this.scene.fog = new THREE.FogExp2(0x0d1526, 0.000048);
  }

  /* ───────── Starfield ───────── */
  _createStarField() {
    const count = this.device.starCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

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
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5000 + Math.random() * 4000;
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      sizes[i] = Math.random() < 0.05
        ? Math.random() * 3.0 + 1.8
        : Math.random() * 1.2 + 0.3;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */`
        attribute vec3  aColor;
        attribute float aSize;
        attribute float aPhase;
        varying vec3  vColor;
        varying float vAlpha;
        uniform float uTime;

        void main() {
          vColor = aColor;

          float big = step(2.5, aSize);
          float amp = mix(0.015, 0.008, big);
          float f1  = mix(0.025, 0.015, big);
          float f2  = mix(0.038, 0.022, big);

          float s1    = sin(uTime * f1 + aPhase);
          float s2    = sin(uTime * f2 + aPhase * 1.618);
          float blink = 0.97 + s1 * amp + s2 * amp;
          vAlpha = clamp(blink, 0.0, 1.0);

          vec4  mv    = modelViewMatrix * vec4(position, 1.0);
          float big2  = step(1.75, aSize);
          float coeff = mix(1200.0, 10000.0, big2);
          float size  = aSize * (coeff / -mv.z);
          gl_PointSize = clamp(size, 3.0, 24.0);

          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float r  = length(uv);
    if (r > 0.5) discard;

    float theta = atan(uv.y, uv.x);

    // Stella a 4 punte: cos(4θ) vale 1 sugli assi cardinali, -1 in diagonale
    float star4    = 0.5 + 0.5 * cos(4.0 * theta);
    float starGlow = star4 * exp(-r * r * 8.0) * 0.85;

    // Core compatto
    float core = exp(-r * r * 28.0);

    // Alone morbido
    float halo = exp(-r * r * 5.5) * 0.22;

    float a = max(max(core, starGlow), halo) * vAlpha;
    gl_FragColor = vec4(vColor, clamp(a, 0.0, 1.0));
  }
`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geo, mat);
    this.starsMat = mat;
    this.scene.add(this.stars);
  }

  /* ───────── Nebulose ───────── */
  _createNebulae() {
    this.nebulaGroup = new THREE.Group();

    const defs = [
      { theta: 0.6, phi: 1.0, r: 6200, color: 0x3a2255, spreadR: 3800, spreadT: 1900 },
      { theta: 2.0, phi: 1.9, r: 7000, color: 0x162960, spreadR: 3500, spreadT: 1750 },
      { theta: 3.5, phi: 1.3, r: 5800, color: 0x1e1236, spreadR: 4200, spreadT: 2100 },
      { theta: 4.8, phi: 0.4, r: 7500, color: 0x0e3d4a, spreadR: 4500, spreadT: 2250 },
      { theta: 5.5, phi: 2.2, r: 6500, color: 0x2e1a44, spreadR: 3600, spreadT: 1800 },
      { theta: 1.3, phi: 0.6, r: 8000, color: 0x141c32, spreadR: 4800, spreadT: 2400 },
      { theta: 2.6, phi: 2.7, r: 6900, color: 0x400d0d, spreadR: 3800, spreadT: 1900 },
      { theta: 3.0, phi: 0.5, r: 7400, color: 0x0f2840, spreadR: 4200, spreadT: 2100 },
      { theta: 4.2, phi: 2.3, r: 6600, color: 0x0a2816, spreadR: 3600, spreadT: 1800 },
      { theta: 6.0, phi: 1.7, r: 7100, color: 0x301228, spreadR: 4000, spreadT: 2000 },
      { theta: 0.05, phi: 1.2, r: 8400, color: 0x0d1e38, spreadR: 5200, spreadT: 2600 },
      { theta: 1.8, phi: 2.9, r: 6300, color: 0x341410, spreadR: 3500, spreadT: 1750 },
    ];

    const PER_NEBULA = this.device.isMobile ? 160 : 280;

    defs.forEach(({ theta, phi, r, color, spreadR, spreadT }) => {
      const cx = r * Math.sin(phi) * Math.cos(theta);
      const cy = r * Math.cos(phi);
      const cz = r * Math.sin(phi) * Math.sin(theta);

      const positions = new Float32Array(PER_NEBULA * 3);
      const alphas = new Float32Array(PER_NEBULA);
      const psizes = new Float32Array(PER_NEBULA);

      for (let i = 0; i < PER_NEBULA; i++) {
        const i3 = i * 3;
        const gx = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        const gy = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        const gz = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        positions[i3] = cx + gx * spreadR;
        positions[i3 + 1] = cy + gy * spreadT;
        positions[i3 + 2] = cz + gz * spreadR;
        alphas[i] = 0.030 + Math.random() * 0.048;
        psizes[i] = 320 + Math.random() * 320;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
      geo.setAttribute('aSize', new THREE.BufferAttribute(psizes, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) } },
        vertexShader: /* glsl */`
          attribute float aAlpha;
          attribute float aSize;
          varying float vA;
          void main() {
            vA = aAlpha;
            vec4  mv   = modelViewMatrix * vec4(position, 1.0);
            float dist = max(-mv.z, 1.0);
            gl_PointSize = aSize * clamp(1800.0 / dist, 0.2, 12.0);
            gl_Position  = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */`
          uniform vec3 uColor;
          varying float vA;
          void main() {
            vec2  uv    = gl_PointCoord - 0.5;
            float d     = length(uv) * 2.0;
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

  /* ───────── Hero stars (sprite con texture a croce) ───────── */
  _createHeroStars() {
    const tex = this._starTex;
    const palette = [0xffffff, 0xd4e8ff, 0xfff4dd, 0xe8d4ff, 0xd4f0ff];

    const cfgs = this.device.isMobile ? [
      { n: 6, sMin: 320, sMax: 500, oMin: 0.75, oMax: 1.00 },
      { n: 10, sMin: 180, sMax: 300, oMin: 0.50, oMax: 0.78 },
      { n: 12, sMin: 90, sMax: 170, oMin: 0.28, oMax: 0.52 },
    ] : [
      { n: 12, sMin: 340, sMax: 520, oMin: 0.80, oMax: 1.00 },
      { n: 22, sMin: 200, sMax: 330, oMin: 0.55, oMax: 0.80 },
      { n: 28, sMin: 100, sMax: 190, oMin: 0.28, oMax: 0.54 },
    ];

    cfgs.forEach(({ n, sMin, sMax, oMin, oMax }) => {
      for (let i = 0; i < n; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 5000 + Math.random() * 3500;

        const mat = new THREE.SpriteMaterial({
          map: tex,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          fog: false,
          opacity: oMin + Math.random() * (oMax - oMin),
          color: palette[Math.floor(Math.random() * palette.length)],
        });

        const sprite = new THREE.Sprite(mat);
        sprite.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
        sprite.scale.setScalar(sMin + Math.random() * (sMax - sMin));
        this.scene.add(sprite);
      }
    });
  }

  update(time) {
    if (this.starsMat) this.starsMat.uniforms.uTime.value = time;
    if (this.nebulaGroup) {
      this.nebulaGroup.rotation.y = time * 0.0006;
      this.nebulaGroup.rotation.x = Math.sin(time * 0.0004) * 0.025;
    }
  }
}