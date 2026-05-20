import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Neptune — Competenze Tecniche.
 * Gigante gassoso cyan/blu profondo, bande di vento turbolento,
 * possibili "Grandi Macchie Scure" che derivano lentamente.
 */
export class Neptune extends Planet {
  constructor(scene, options = {}) {
    super(scene, {
      ...options,
      atmosphereColor:     0x4488ff,
      atmosphereIntensity: 0.80,
      atmospherePower:     3.0,
      atmosphereScale:     1.06,
      axialTilt:           28 * Math.PI / 180,
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
          vec3 N   = normalize(vLocalPosition);
          float lat = N.y;

          /* Domain warp per turbolenza */
          vec3 q = vec3(
            fbm(vec3(N.x * 3.0, lat * 8.0, N.z * 3.0) + uTime * 0.04),
            fbm(vec3(N.x * 3.0, lat * 8.0, N.z * 3.0) + 11.0),
            fbm(vec3(N.x * 3.0, lat * 8.0, N.z * 3.0) + 23.0)
          );
          float turb = fbm(vec3(N.x * 4.0, lat * 12.0, N.z * 4.0) + q * 2.0);

          /* Bande latitudinali */
          float bands = sin(lat * 10.0 + turb * 1.2) * 0.5 + 0.5;

          /* Palette nettuniana — cyan/blu profondo */
          vec3 deepBlue  = vec3(0.02, 0.10, 0.40);
          vec3 midBlue   = vec3(0.08, 0.30, 0.70);
          vec3 brightCy  = vec3(0.25, 0.55, 0.92);
          vec3 whisper   = vec3(0.65, 0.85, 0.98);

          vec3 col = mix(deepBlue, midBlue,  bands);
          col      = mix(col,      brightCy, smoothstep(0.55, 0.85, turb));

          /* Grandi macchie scure (storm spots) */
          float stormPos = sin(lat * 5.0 + uTime * 0.05) + sin(N.x * 8.0 + uTime * 0.03);
          float storm    = smoothstep(0.7, 0.95, turb) * smoothstep(0.5, 1.0, abs(stormPos));
          col = mix(col, deepBlue * 0.5, storm * 0.7);

          /* Strati di nubi alte cyan */
          float highClouds = smoothstep(0.75, 0.95, fbm(vec3(N.xy * 6.0, N.z * 6.0) + uTime * 0.06));
          col = mix(col, whisper, highClouds * 0.35);

          /* Illuminazione */
          vec3 Nworld = normalize(vWorldNormal);
          float lightDot = dot(Nworld, uSunDirection);
          float dayMix = smoothstep(-0.2, 0.3, lightDot);

          vec3 day   = col * (0.32 + max(lightDot, 0.0) * 0.90);
          vec3 night = col * 0.06;
          vec3 color = mix(night, day, dayMix);

          /* Limb darkening */
          float limb = pow(clamp(dot(Nworld, vViewDir), 0.0, 1.0), 0.55);
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
