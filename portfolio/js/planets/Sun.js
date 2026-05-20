import * as THREE from 'three';
import { NOISE_GLSL } from '../shaders/noise.js';

/**
 * Sun — sorgente luminosa del sistema.
 * Plasma turbolento con macchie solari, corona multi-layer,
 * prominenze pulsanti, luce direzionale per tutti i pianeti.
 */
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
    const geo = new THREE.SphereGeometry(5, 96, 96);

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

          /* Convezione: due strati di noise a velocità diverse */
          float t = uTime * 0.12;
          float n1 = fbm(p * 1.5  + vec3( t,  t * 0.7, -t * 0.4));
          float n2 = fbm(p * 4.0  + vec3(-t * 0.5, t * 0.9, t * 0.6) + n1 * 0.8);
          float n3 = fbm(p * 9.0  + vec3( t * 1.2, -t * 0.5, t * 0.8));
          float plasma = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;

          /* Granulazione fine */
          float granul = ridgedFbm(p * 18.0 + uTime * 0.1) * 0.15;
          plasma += granul;

          /* Macchie solari (sunspots) — aree scure */
          float spots = smoothstep(0.85, 1.0, ridgedFbm(p * 2.0));
          plasma *= 1.0 - spots * 0.7;

          /* Gradiente colore */
          vec3 cWhite  = vec3(1.00, 0.98, 0.75);
          vec3 cYellow = vec3(1.00, 0.78, 0.20);
          vec3 cOrange = vec3(1.00, 0.45, 0.05);
          vec3 cRed    = vec3(0.85, 0.10, 0.00);

          vec3 col = mix(cWhite, cYellow, smoothstep(0.0, 0.4, plasma));
          col      = mix(col,    cOrange, smoothstep(0.4, 0.7, plasma));
          col      = mix(col,    cRed,    smoothstep(0.8, 1.0, plasma));

          /* Sunspot color (più scuro) */
          col = mix(col, vec3(0.25, 0.10, 0.0), spots * 0.85);

          /* Limb darkening (caratteristica reale del sole) */
          float NdotV = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float limb  = pow(NdotV, 0.6);
          col = mix(cRed * 0.55, col, limb);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    this.coreMesh = new THREE.Mesh(geo, this.coreMat);
    this.group.add(this.coreMesh);
  }

  /* ── Corona multi-layer ── */
  _createCorona() {
    const layers = [
      { scale: 1.18, color: 0xffcc55, opacity: 0.95, power: 2.5 },
      { scale: 1.45, color: 0xff8833, opacity: 0.65, power: 3.0 },
      { scale: 1.95, color: 0xff5511, opacity: 0.35, power: 3.2 },
      { scale: 2.80, color: 0xff2200, opacity: 0.15, power: 3.0 },
      { scale: 4.20, color: 0xff0000, opacity: 0.05, power: 2.8 },
    ];

    const vert = /* glsl */`
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `;
    const frag = /* glsl */`
      uniform vec3  uColor;
      uniform float uIntensity;
      uniform float uPower;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        float f = pow(1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor, f * uIntensity);
      }
    `;

    layers.forEach(({ scale, color, opacity, power }) => {
      const g = new THREE.SphereGeometry(5, 48, 48);
      const m = new THREE.ShaderMaterial({
        uniforms: {
          uColor:     { value: new THREE.Color(color) },
          uIntensity: { value: opacity },
          uPower:     { value: power },
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
      const r     = 5.1 + Math.random() * 2.0;
      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.4 + Math.random() * 1.8;
      sizes[i]  = 1.0 + Math.random() * 3.0;
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
          gl_PointSize = psize * (0.5 + pulse * 1.5) * (100.0 / -mvPos.z);
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
          /* Punto bianco caldo */
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
    this.sunLight = new THREE.PointLight(0xfff4d6, 5, 800, 1.1);
    this.group.add(this.sunLight);
    this.scene.add(new THREE.AmbientLight(0x101428, 0.4));
  }

  /* ── Update ── */
  update(time) {
    if (this.coreMat)        this.coreMat.uniforms.uTime.value       = time;
    if (this.prominenceMat)  this.prominenceMat.uniforms.uTime.value = time;

    const pulse = 1 + Math.sin(time * 0.7) * 0.015;
    this.group.scale.setScalar(pulse);
    this.sunLight.intensity = 5 + Math.sin(time * 1.5) * 0.5;
  }

  getWorldPosition() {
    const p = new THREE.Vector3();
    this.group.getWorldPosition(p);
    return p;
  }
}
