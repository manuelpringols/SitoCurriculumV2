import * as THREE from 'three';
import { NOISE_GLSL } from '../shaders/noise.js';

/**
 * Sun — sorgente luminosa del sistema.
 * Plasma turbolento con macchie solari, corona multi-layer,
 * prominenze pulsanti, luce direzionale per tutti i pianeti.
 *
 * SUN_RADIUS = 28  →  più grande di tutti i pianeti (max Jupiter r=22)
 */

const SUN_RADIUS = 28;

export class Sun {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Sun';

    const loader = new THREE.TextureLoader();
    this._texSun = loader.load('./textures/2k_sun.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });

    this._createCore();
    this._createCorona();
    this._createProminences();
    this._createLight();

    this.scene.add(this.group);
  }

  /* ── Superficie solare procedurale ── */
  _createCore() {
    const geo = new THREE.SphereGeometry(SUN_RADIUS, 96, 96);

    this.coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uTexture: { value: this._texSun },
      },
      vertexShader: /* glsl */`
        varying vec3 vNormal;
        varying vec3 vLocalPos;
        varying vec2 vUv;
        void main() {
          vNormal   = normalize(normalMatrix * normal);
          vLocalPos = position;
          vUv       = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float     uTime;
        uniform sampler2D uTexture;
        varying vec3 vNormal;
        varying vec3 vLocalPos;
        varying vec2 vUv;

        void main() {
          /* ── Base: texture reale NASA ── */
          vec3 col = texture2D(uTexture, vUv).rgb;

          /* ── Plasma: modula SOLO la luminosità, non il colore ──
             Aggiunge convezione e vita senza alterare i colori reali */
          vec3 p  = normalize(vLocalPos) * 3.0;
          float t = uTime * 0.10;
          float n1 = fbm(p * 1.5 + vec3( t,  t * 0.7, -t * 0.4));
          float n2 = fbm(p * 4.0 + vec3(-t * 0.5, t * 0.9, t * 0.6) + n1 * 0.6);
          float plasma = n1 * 0.55 + n2 * 0.30 + ridgedFbm(p * 14.0 + uTime * 0.08) * 0.10;

          /* Modulazione luminosità: ±15% — texture visibile al 100% */
          float brightness = 0.88 + plasma * 0.24;
          col *= brightness;

          /* Macchie solari: scuriscono la texture senza cambiarla */
          float spots = smoothstep(0.88, 1.0, ridgedFbm(p * 2.0));
          col *= 1.0 - spots * 0.72;

          /* Limb darkening reale del sole */
          float NdotV = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float limb  = pow(NdotV, 0.55);
          col = mix(col * 0.38, col, limb);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    this.coreMesh = new THREE.Mesh(geo, this.coreMat);
    this.group.add(this.coreMesh);
  }

  /* ── Corona multi-layer — bordi morbidi ── */
  _createCorona() {
    /*
     * 5 layer invece di 3.
     * Ogni layer aggiunge una velatura sempre più grande e trasparente.
     * power basso (1.4–1.8) = Fresnel si spalma su tutta la sfera, non
     *   solo sul bordo → transizione graduale dal nucleo all'esterno.
     * opacity progressivamente dimezzata → nessun bordo netto visibile.
     */
    const layers = [
      { scale: 1.10, color: 0xfff0aa, opacity: 0.18, power: 1.4, speed: 0.30 }, // alone interno bianco-caldo
      { scale: 1.28, color: 0xffcc55, opacity: 0.14, power: 1.6, speed: 0.25 }, // giallo
      { scale: 1.60, color: 0xff9933, opacity: 0.10, power: 1.9, speed: 0.18 }, // arancio
      { scale: 2.10, color: 0xff5511, opacity: 0.06, power: 2.3, speed: 0.12 }, // rosso
      { scale: 3.00, color: 0xff3300, opacity: 0.03, power: 2.8, speed: 0.07 }, // alone esterno, quasi invisibile
    ];

    const vert = /* glsl */`
      uniform float uTime;
      uniform float uSpeed;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        /*
         * Displacement aumentato (0.35 → 0.55) e tre assi con
         * frequenze leggermente diverse → bordo organico, non sferico.
         */
        float wave =
          sin(pos.x * 2.2 + uTime * uSpeed * 3.5) *
          sin(pos.y * 1.9 + uTime * uSpeed * 2.8) *
          sin(pos.z * 2.5 + uTime * uSpeed * 2.2);
        pos += normal * wave * 0.55;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        vWorldPos = pos;
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const frag = /* glsl */`
      uniform vec3  uColor;
      uniform float uIntensity;
      uniform float uPower;
      uniform float uTime;
      uniform float uSpeed;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;

      void main() {
        float NdotV = clamp(dot(vNormal, vViewDir), 0.0, 1.0);

        /*
         * Fresnel morbido: pow con power basso + smoothstep addizionale
         * che sfuma ulteriormente il centro invece di tagliarlo netto.
         */
        float rim = pow(1.0 - NdotV, uPower);
        rim *= smoothstep(0.0, 0.55, 1.0 - NdotV); // sbiadisce il centro

        float flare = sin(vWorldPos.y * 5.0 + uTime * uSpeed * 6.0) * 0.5 + 0.5;
        float pulse = 0.88 + sin(uTime * uSpeed * 4.0) * 0.12; // pulse ridotto
        float alpha = rim * uIntensity * pulse;
        alpha *= 0.70 + flare * 0.30;

        gl_FragColor = vec4(uColor, alpha);
      }
    `;

    this.coronaMats = [];

    layers.forEach(({ scale, color, opacity, power, speed }) => {
      const g = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
      const m = new THREE.ShaderMaterial({
        uniforms: {
          uColor:     { value: new THREE.Color(color) },
          uIntensity: { value: opacity },
          uPower:     { value: power },
          uTime:      { value: 0 },
          uSpeed:     { value: speed },
        },
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(g, m);
      mesh.scale.setScalar(scale);
      this.group.add(mesh);
      this.coronaMats.push(m);
    });
  }

  /* ── Prominenze: particelle pulsanti vicino alla superficie ── */
  _createProminences() {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3    = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      // Prominenze appena oltre la superficie del sole
      const r     = SUN_RADIUS * 1.04 + Math.random() * SUN_RADIUS * 0.18;
      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.4 + Math.random() * 1.8;
      sizes[i]  = 2.5 + Math.random() * 6.0;  // più grandi per stare in proporzione
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('speed',    new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('psize',    new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uTexture: { value: this._texSun },
      },
      vertexShader: /* glsl */`
        attribute float speed;
        attribute float psize;
        uniform float uTime;
        varying float vAlpha;

        void main() {
          float pulse = sin(uTime * speed) * 0.5 + 0.5;
          vAlpha = pulse;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = psize * (0.5 + pulse * 1.5) * (260.0 / -mvPos.z);
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
     * PointLight:
     *   colore  0xfff6e0  — bianco caldo, luce solare pura senza esagerare il giallo
     *   intensità 2.2     — soffusa: i pianeti sono leggibili su entrambi i lati
     *   range   1400      — copre tutte le orbite (Mercury orb=464)
     *   decay   0.18      — caduta naturale: lontano si oscura gradualmente
     *
     * AmbientLight leggermente aumentata (0.55) per evitare lati notte
     * completamente neri — si vede ancora la sagoma del pianeta.
     */
    this.sunLight = new THREE.PointLight(0xfff6e0, 2.2, 2200, 0.12);
    this.group.add(this.sunLight);
    this.scene.add(new THREE.AmbientLight(0x0d1528, 0.55));
  }

  /* ── Update ── */
  update(time) {
    if (this.coreMat)       this.coreMat.uniforms.uTime.value = time;
    if (this.prominenceMat) this.prominenceMat.uniforms.uTime.value = time;

    if (this.coronaMats) {
      this.coronaMats.forEach(mat => { mat.uniforms.uTime.value = time; });
    }

    const pulse = 1 + Math.sin(time * 0.7) * 0.012;
    this.group.scale.setScalar(pulse);

    /*
     * Pulse intensità ridotto: 1.1 ± 0.10 invece di 1.8 ± 0.30.
     * Il sole "respira" appena — percepibile solo se lo si fissa.
     */
    this.sunLight.intensity = 1.1 + Math.sin(time * 1.5) * 0.10;
  }

  getWorldPosition() {
    const p = new THREE.Vector3();
    this.group.getWorldPosition(p);
    return p;
  }
}