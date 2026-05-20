import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Jupiter — DevOps & Backend.
 * Gigante massiccio con bande latitudinali multicolori,
 * Grande Macchia Rossa animata che ruota.
 */
export class Jupiter extends Planet {
  constructor(scene, options = {}) {
    super(scene, {
      ...options,
      atmosphereColor:     0xffaa55,
      atmosphereIntensity: 0.70,
      atmospherePower:     3.0,
      atmosphereScale:     1.05,
      axialTilt:           3 * Math.PI / 180, // Giove ha poca inclinazione
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

          /* Coordinate longitudinali (per Macchia Rossa) */
          float lon = atan(N.z, N.x);

          /* Turbolenza orizzontale forte */
          vec3 turbCoord = vec3(N.x * 5.0, lat * 12.0, N.z * 5.0) + vec3(uTime * 0.06, 0.0, 0.0);
          float turb = fbm(turbCoord);
          turb += fbm(turbCoord * 2.5) * 0.4;

          /* Bande latitudinali (Giove ha ~10-12 zone visibili) */
          float bandFreq = 16.0;
          float bands = sin(lat * bandFreq + turb * 2.0) * 0.5 + 0.5;
          /* Bande secondarie più sottili */
          bands *= 0.6 + sin(lat * bandFreq * 2.2 + turb) * 0.4;

          /* Palette gioviana */
          vec3 darkBrown   = vec3(0.45, 0.25, 0.12);
          vec3 brown       = vec3(0.65, 0.42, 0.22);
          vec3 cream       = vec3(0.92, 0.80, 0.58);
          vec3 lightCream  = vec3(0.98, 0.92, 0.75);

          vec3 col = mix(darkBrown, brown,      smoothstep(0.15, 0.45, bands));
          col      = mix(col,       cream,      smoothstep(0.45, 0.70, bands));
          col      = mix(col,       lightCream, smoothstep(0.75, 0.95, bands));

          /* Vortici nelle bande scure */
          float vortex = smoothstep(0.6, 0.9, ridgedFbm(turbCoord * 2.0));
          col = mix(col, darkBrown * 0.8, vortex * 0.3 * (1.0 - smoothstep(0.5, 0.8, bands)));

          /* ───── GRANDE MACCHIA ROSSA ───── */
          /* Centro: ~22°S, longitudine che deriva lentamente */
          float spotLat  = -0.30;
          float spotLon  = uTime * 0.03; // deriva
          /* Distanza ellittica (la macchia è schiacciata) */
          vec2 spotDelta = vec2(
            sin(lon - spotLon) * cos(spotLat - lat * 0.5) * 1.4,
            (lat - spotLat) * 2.2
          );
          float spotDist = length(spotDelta);
          float spotMask = smoothstep(0.40, 0.10, spotDist);

          /* Anelli concentrici dentro la macchia (vortice) */
          float swirl = sin(spotDist * 18.0 - uTime * 0.4) * 0.5 + 0.5;
          vec3 spotInner = vec3(0.85, 0.30, 0.18);
          vec3 spotOuter = vec3(0.55, 0.20, 0.10);
          vec3 spotCol   = mix(spotOuter, spotInner, swirl);
          col = mix(col, spotCol, spotMask * 0.92);

          /* Illuminazione */
          vec3 Nworld = normalize(vWorldNormal);
          float lightDot = dot(Nworld, uSunDirection);
          float dayMix = smoothstep(-0.2, 0.3, lightDot);

          vec3 day   = col * (0.35 + max(lightDot, 0.0) * 0.90);
          vec3 night = col * 0.06;
          vec3 color = mix(night, day, dayMix);

          /* Limb darkening */
          float limb = pow(clamp(dot(Nworld, vViewDir), 0.0, 1.0), 0.6);
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
