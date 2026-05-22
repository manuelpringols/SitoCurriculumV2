import * as THREE from 'three';

/**
 * Universe — sfondo cosmico.
 *
 * Nebulose v3 — lightweight + distribuzione sferica.
 * 6 nebulose × 280 particelle = 1680 totali (era 31.000+).
 * Centri posizionati su una sfera attorno alla scena →
 * colori distribuiti in tutto il cielo, non in un angolo.
 * Particelle grandi (120-260) con gaussian morbido → effetto gas.
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
    this.scene.fog = new THREE.FogExp2(0x00000a, 0.00018);
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

          /* Blink agisce SOLO sull alpha, mai sulla dimensione.
             Variare gl_PointSize causa sub-pixel flickering quando
             la stella scende sotto 1px e WebGL la fa sparire/riapparire. */
          float s1 = sin(uTime * 0.10 + aPhase);
          float s2 = sin(uTime * 0.16 + aPhase * 1.618);
          float blink = 0.92 + s1 * 0.04 + s2 * 0.04;
          vAlpha = clamp(blink, 0.0, 1.0);

          vec4 mv = modelViewMatrix * vec4(position, 1.0);

          /* Dimensione stabile: solo distanza, mai blink.
             max(..., 1.2) garantisce minimo 1.2px → niente sub-pixel flicker. */
          float size = aSize * (300.0 / -mv.z);
          gl_PointSize = max(size, 1.8);

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

  /* ───────── Nebulose — gas distribuito su tutta la sfera ───────── */
  _createNebulae() {
    this.nebulaGroup = new THREE.Group();

    /*
     * 6 nebulose posizionate su angoli ben distribuiti della sfera celeste.
     * theta = longitudine (0 → 2π), phi = latitudine (0 → π).
     * r = distanza dal centro (ben oltre i pianeti, max orb ~500).
     *
     * Spread ellittico: X/Y grande (nuvola larga), Z piccolo
     * (disco appiattito verso la camera per massima copertura visiva).
     */
    const defs = [
      // Teal — fronte-sinistra, in alto
      { theta: 0.6,  phi: 1.0, r: 950,  color: 0x004d66, spreadR: 780, spreadT: 390 },
      // Arancio/oro — fronte-destra, bassa
      { theta: 2.0,  phi: 1.9, r: 1050, color: 0x5c2800, spreadR: 720, spreadT: 360 },
      // Magenta/viola — dietro-sinistra
      { theta: 3.5,  phi: 1.3, r: 900,  color: 0x3d0050, spreadR: 840, spreadT: 420 },
      // Blu profondo — sopra
      { theta: 4.8,  phi: 0.4, r: 1100, color: 0x001040, spreadR: 900, spreadT: 450 },
      // Ambra rossastro — dietro-destra, bassa
      { theta: 5.5,  phi: 2.2, r: 980,  color: 0x4a1800, spreadR: 750, spreadT: 375 },
      // Verde-blu tenue — dietro al centro
      { theta: 1.3,  phi: 0.6, r: 1150, color: 0x002e1e, spreadR: 975, spreadT: 480 },
    ];

    /*
     * Particelle per nebulosa: fisse a 280 indipendentemente dalla qualità.
     * Il look viene dalla dimensione delle particelle, non dalla quantità.
     * Totale: 6 × 280 = 1680 particelle (era 31.000+).
     */
    const PER_NEBULA = this.device.isMobile ? 160 : 280;

    defs.forEach(({ theta, phi, r, color, spreadR, spreadT }) => {
      // Centro nebulosa su sfera
      const cx = r * Math.sin(phi) * Math.cos(theta);
      const cy = r * Math.cos(phi);
      const cz = r * Math.sin(phi) * Math.sin(theta);

      const positions = new Float32Array(PER_NEBULA * 3);
      const alphas    = new Float32Array(PER_NEBULA);
      const psizes    = new Float32Array(PER_NEBULA);

      for (let i = 0; i < PER_NEBULA; i++) {
        const i3 = i * 3;

        // Distribuzione gaussiana: media 4 campioni → campana morbida
        const gx = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        const gy = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;
        const gz = (Math.random() + Math.random() + Math.random() + Math.random() - 2.0) / 2.0;

        // spread radiale grande, tangenziale più compatto → disco
        positions[i3]     = cx + gx * spreadR;
        positions[i3 + 1] = cy + gy * spreadT;
        positions[i3 + 2] = cz + gz * spreadR;

        // Alpha molto bassa: l'effetto gas emerge dalla sovrapposizione additiva
        alphas[i] = 0.022 + Math.random() * 0.038;

        // Particelle grandi con falloff gaussiano = nuvola morbida
        psizes[i] = 180 + Math.random() * 180;
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
            gl_PointSize = aSize * clamp(320.0 / dist, 0.4, 6.0);
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
            /* Gaussian morbidissimo — zero bordi visibili */
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