import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Mercury — Contatti.
 * Superficie crateriforme grigia, niente atmosfera (terminator netto),
 * forti contrasti tra lato giorno (rovente) e lato notte (nero).
 */
export class Mercury extends Planet {
  constructor(scene, options = {}) {
    super(scene, {
      ...options,
      atmosphereColor:     null,  // nessuna atmosfera
      axialTilt:           0.05,
    });
  }

  _buildBody() {
    const geo = new THREE.SphereGeometry(this.radius, this.segments, this.segments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:         { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: PLANET_VERT,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float uTime;
        uniform vec3  uSunDirection;

        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vViewDir;

        void main() {
          vec3 p = normalize(vLocalPosition) * 4.0;

          /* Crateri a frequenze multiple */
          float crater1 = ridgedFbm(p * 1.5);
          float crater2 = ridgedFbm(p * 4.0) * 0.6;
          float crater3 = ridgedFbm(p * 9.0) * 0.3;
          float craters = crater1 + crater2 + crater3;

          /* Variazioni regionali */
          float regions = fbm(p * 0.7);

          /* Palette di Mercurio: grigi caldi */
          vec3 darkGrey  = vec3(0.20, 0.18, 0.15);
          vec3 midGrey   = vec3(0.45, 0.40, 0.35);
          vec3 lightGrey = vec3(0.65, 0.58, 0.50);

          vec3 col = mix(darkGrey, midGrey,   smoothstep(0.30, 0.60, regions));
          col      = mix(col,      lightGrey, smoothstep(0.60, 0.85, regions));

          /* Crateri scuriscono e illuminano i bordi */
          float craterShade = smoothstep(0.5, 0.9, craters);
          col *= 0.70 + craterShade * 0.55;

          /* Piccoli punti brillanti (impatti recenti) */
          float impacts = smoothstep(0.92, 1.0, snoise(p * 12.0));
          col = mix(col, vec3(0.95, 0.92, 0.85), impacts * 0.6);

          /* ── Illuminazione netta (no atmosphere → terminator harsh) ── */
          vec3 N = normalize(vWorldNormal);
          float lightDot = dot(N, uSunDirection);
          /* Mercurio reale ha terminator molto netto */
          float dayMix = smoothstep(-0.05, 0.05, lightDot);

          /* Lato giorno: caldo, quasi bianco al picco */
          vec3 day   = col * (0.25 + max(lightDot, 0.0) * 1.2);
          /* Lato notte: praticamente nero */
          vec3 night = col * 0.015;

          vec3 color = mix(night, day, dayMix);

          /* Glow caldo sul terminator (effetto sole rovente sul bordo) */
          float terminator = exp(-pow(lightDot * 8.0, 2.0)) * 0.4;
          color += vec3(1.0, 0.5, 0.2) * terminator;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }
}
