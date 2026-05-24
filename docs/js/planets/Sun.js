import * as THREE from 'three';
import { NOISE_GLSL } from '../shaders/noise.js';

/**
 * Sun — sorgente luminosa del sistema.
 * Plasma turbolento con macchie solari, corona multi-layer,
 * prominenze pulsanti, luce direzionale per tutti i pianeti.
 *
 * Raggio aumentato: 5 → 200
 */

const R = 200; // raggio base sole

export class Sun {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Sun';

    this._createCore();
    this._createCorona();
    this._createProminences();
    this._createLight();

    this.scene.add(this.group);
  }

  /* ── Superficie solare procedurale ── */
  _createCore() {
    const geo = new THREE.SphereGeometry(R, 96, 96);

    this.coreMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        varying vec3 vNormal;
        varying vec3 vLocalPos;
        void main() {
          vNormal   = normalize(normalMatrix * normal);
          vLocalPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vLocalPos;

        void main() {
          vec3 p = normalize(vLocalPos) * 3.0;

          float t = uTime * 0.12;
          float n1 = fbm(p * 1.5  + vec3( t,  t * 0.7, -t * 0.4));
          float n2 = fbm(p * 4.0  + vec3(-t * 0.5, t * 0.9, t * 0.6) + n1 * 0.8);
          float n3 = fbm(p * 9.0  + vec3( t * 1.2, -t * 0.5, t * 0.8));
          float plasma = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;

          float granul = ridgedFbm(p * 18.0 + uTime * 0.1) * 0.15;
          plasma += granul;

          float spots = smoothstep(0.85, 1.0, ridgedFbm(p * 2.0));
          plasma *= 1.0 - spots * 0.7;

          /* Palette rossastra — valori RAW bassi perché il bloom li amplifica.
             ACES + bloom schiaccia colori > 0.8 → bianco. Tengo sotto 0.75. */
          vec3 cCore   = vec3(0.75, 0.32, 0.04);   // arancio-rosso caldo
          vec3 cAmber  = vec3(0.68, 0.22, 0.02);   // ambra scura
          vec3 cOrange = vec3(0.60, 0.14, 0.01);   // arancio profondo
          vec3 cRed    = vec3(0.48, 0.05, 0.00);   // rosso cupo

          vec3 col = mix(cCore,  cAmber,  smoothstep(0.0,  0.35, plasma));
          col      = mix(col,    cOrange, smoothstep(0.35, 0.65, plasma));
          col      = mix(col,    cRed,    smoothstep(0.72, 1.0,  plasma));

          col = mix(col, vec3(0.25, 0.10, 0.0), spots * 0.88);

          float NdotV = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float limb  = pow(NdotV, 0.55);
          col = mix(cRed * 0.38, col, limb);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    this.coreMesh = new THREE.Mesh(geo, this.coreMat);
    this.group.add(this.coreMesh);
  }

  /* ── Corona — billboard radiation con noise angolare ── */
  _createCorona() {
    /*
     * Tre piani billboard (sempre rivolti alla camera nel loop)
     * a scale crescenti. Il fragment shader usa noise angolare
     * per rompere la simmetria circolare → raggi e plume irregolari.
     */
    const layers = [
      { size: R * 5.5, color: 0xff5500, alpha: 0.50, falloff: 2.8, rayFreq:  5.0, rayAmt: 0.38, speed: 0.18 },
      { size: R * 9.0, color: 0xcc2200, alpha: 0.28, falloff: 1.8, rayFreq:  8.0, rayAmt: 0.28, speed: 0.12 },
      { size: R *14.0, color: 0x881100, alpha: 0.13, falloff: 1.1, rayFreq: 11.0, rayAmt: 0.20, speed: 0.07 },
      { size: R *22.0, color: 0x440800, alpha: 0.07, falloff: 0.6, rayFreq:  4.0, rayAmt: 0.12, speed: 0.03 },
    ];

    const vert = /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        /* Billboard: estrae assi camera dalla viewMatrix e ricostruisce
           la posizione world ignorando la rotazione del modello */
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 worldCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 worldPos    = worldCenter + right * position.x + up * position.y;
        gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
      }
    `;

    const frag = /* glsl */`
      uniform vec3  uColor;
      uniform float uAlpha;
      uniform float uFalloff;
      uniform float uRayFreq;
      uniform float uRayAmt;
      uniform float uTime;
      uniform float uSpeed;

      varying vec2 vUv;

      void main() {
        vec2 c = vUv - 0.5;          // -0.5 … +0.5
        float d = length(c) * 2.0;   // 0 al centro, 1 al bordo del quad
        if (d > 1.0) discard;

        /* ── Gradient radiale gaussiano ── */
        float base = exp(-d * d * uFalloff);

        /* ── Noise angolare: rompe il cerchio in raggi/plume ──
           Combina più frequenze per plume di diversa larghezza */
        float angle = atan(c.y, c.x);
        float t = uTime * uSpeed;

        float ang1 = sin(angle * uRayFreq        + t * 1.3) * 0.5 + 0.5;
        float ang2 = sin(angle * uRayFreq * 1.7  - t * 0.9) * 0.5 + 0.5;
        float ang3 = sin(angle * uRayFreq * 0.6  + t * 0.5) * 0.5 + 0.5;
        float angNoise = ang1 * ang2 * ang3;

        /* I raggi si accentuano nella zona media (non al centro né al bordo) */
        float rayMask = smoothstep(0.05, 0.35, d) * smoothstep(1.0, 0.4, d);
        float rays = angNoise * rayMask * uRayAmt;

        /* ── Pulsazione lenta ── */
        float pulse = 0.82 + sin(t * 3.1) * 0.10 + sin(t * 5.7) * 0.08;

        float glow = (base + rays * base) * pulse * uAlpha;
        glow = max(glow, 0.0);

        gl_FragColor = vec4(uColor * glow, glow);
      }
    `;

    this.coronaMats  = [];
    this.coronaMeshes = [];

    layers.forEach(({ size, color, alpha, falloff, rayFreq, rayAmt, speed }) => {
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uColor:   { value: new THREE.Color(color) },
          uAlpha:   { value: alpha },
          uFalloff: { value: falloff },
          uRayFreq: { value: rayFreq },
          uRayAmt:  { value: rayAmt },
          uTime:    { value: 0 },
          uSpeed:   { value: speed },
        },
        vertexShader:  vert,
        fragmentShader: frag,
        transparent: true,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
        side:        THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      this.group.add(mesh);
      this.coronaMats.push(mat);
      this.coronaMeshes.push(mesh);
    });
  }

  /* ── Prominenze: particelle pulsanti vicino alla superficie ── */
  _createProminences() {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = R * 1.05 + Math.random() * R * 0.4;
      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.4 + Math.random() * 1.8;
      sizes[i]  = 2.0 + Math.random() * 6.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('speed',    new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('psize',    new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        attribute float speed;
        attribute float psize;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          float pulse = sin(uTime * speed) * 0.5 + 0.5;
          vAlpha = pulse;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * (0.5 + pulse * 1.5) * (300.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */`
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float a = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha;
          gl_FragColor = vec4(1.0, 0.75, 0.30, a * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.prominenceMesh = new THREE.Points(geo, mat);
    this.prominenceMat  = mat;
    this.group.add(this.prominenceMesh);
  }

  /* ── Luce + ambient ── */
  _createLight() {
    /*
     * Colore arancio-rosso caldo (0xff7700): il lato giorno di ogni pianeta
     * riceve questa tinta calda → contrasto netto col lato notte blu/freddo.
     * Intensità 5.5 + decay 0.06 → luce potente che raggiunge tutte le orbite.
     */
    this.sunLight = new THREE.PointLight(0xff7700, 7.0, 12000, 0.04);
    this.group.add(this.sunLight);

    /* Ambient freddo per il lato notte — accentua il contrasto caldo/freddo */
    this.scene.add(new THREE.AmbientLight(0x0a0e28, 0.35));
  }

  /* ── Update ── */
  update(time) {
    if (this.coreMat) this.coreMat.uniforms.uTime.value = time;
    if (this.prominenceMat) this.prominenceMat.uniforms.uTime.value = time;
    if (this.coronaMats) {
      this.coronaMats.forEach(mat => { mat.uniforms.uTime.value = time; });
    }
    const pulse = 1 + Math.sin(time * 0.7) * 0.015;
    this.group.scale.setScalar(pulse);
    this.sunLight.intensity = 7.0 + Math.sin(time * 1.5) * 0.6;
  }

  getWorldPosition() {
    const p = new THREE.Vector3();
    this.group.getWorldPosition(p);
    return p;
  }
}