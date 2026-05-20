import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Mars — Esperienze Lavorative.
 * Superficie rossastra con macchie scure (basalto), calotte polari di ghiaccio,
 * atmosfera sottile color salmone.
 */
export class Mars extends Planet {
  constructor(scene, options = {}) {
    super(scene, {
      ...options,
      atmosphereColor:     0xff8866,
      atmosphereIntensity: 0.35,
      atmospherePower:     3.2,
      atmosphereScale:     1.04,
      axialTilt:           25 * Math.PI / 180,
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
          vec3 p = normalize(vLocalPosition) * 2.8;

          /* Macro-pattern di terreno */
          float base    = fbm(p);
          float detail  = fbm(p * 3.5);
          float craters = ridgedFbm(p * 6.0);

          /* Combinazione: aree scure e chiare */
          float surface = base * 0.55 + detail * 0.30 + craters * 0.15;

          /* Palette marziana */
          vec3 darkBasalt = vec3(0.30, 0.13, 0.08);   // basalto scuro
          vec3 rust       = vec3(0.65, 0.28, 0.12);   // ferro ossidato
          vec3 lightDust  = vec3(0.85, 0.55, 0.32);   // polvere

          vec3 col = mix(darkBasalt, rust,      smoothstep(0.25, 0.55, surface));
          col      = mix(col,        lightDust, smoothstep(0.55, 0.85, surface));

          /* Crateri più scuri */
          col *= 0.75 + craters * 0.30;

          /* Tempeste di polvere — strato globale che si sposta lentamente */
          float storm = fbm(p * 2.0 + vec3(uTime * 0.04, 0.0, uTime * 0.02));
          storm = smoothstep(0.45, 0.75, storm);
          col = mix(col, vec3(0.90, 0.65, 0.40), storm * 0.18);

          /* Calotte polari */
          float lat = abs(normalize(vLocalPosition).y);
          float ice = smoothstep(0.82, 0.95, lat + fbm(p * 12.0) * 0.05);
          col = mix(col, vec3(0.92, 0.90, 0.88), ice);

          /* Illuminazione */
          vec3 N = normalize(vWorldNormal);
          float lightDot = dot(N, uSunDirection);
          float dayMix = smoothstep(-0.15, 0.35, lightDot);

          vec3 day   = col * (0.30 + max(lightDot, 0.0) * 0.85);
          vec3 night = col * 0.04;

          vec3 color = mix(night, day, dayMix);

          /* Limb darkening */
          float limb = pow(clamp(dot(N, vViewDir), 0.0, 1.0), 0.55);
          color = mix(color * 0.55, color, limb);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }
}
