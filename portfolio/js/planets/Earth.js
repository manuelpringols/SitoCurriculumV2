import * as THREE from 'three';
import { Planet } from './Planet.js';
import { NOISE_GLSL }    from '../shaders/noise.js';
import { PLANET_VERT }   from '../shaders/chunks.js';

/**
 * Earth — Chi Sono
 * Continenti procedurali, oceani con specular, calotte polari,
 * sfera nuvole separata che ruota in modo indipendente,
 * atmosfera blu con sun-side highlight.
 */
export class Earth extends Planet {
  constructor(scene, options = {}) {
    super(scene, {
      ...options,
      atmosphereColor:     0x6ab6ff,
      atmosphereIntensity: 0.85,
      atmospherePower:     2.8,
      atmosphereScale:     1.06,
      axialTilt:           23.5 * Math.PI / 180,
    });
    this._buildClouds();
  }

  _buildBody() {
    const geo = new THREE.SphereGeometry(this.radius, this.segments, this.segments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:          { value: 0 },
        uSunDirection:  { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: PLANET_VERT,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float uTime;
        uniform vec3  uSunDirection;

        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying vec3 vLocalPosition;
        varying vec3 vViewDir;

        void main() {
          /* Posizione di campionamento — usa local position per stabilità durante rotazione */
          vec3 p = normalize(vLocalPosition) * 2.5;

          /* Continent noise: combinazione di fbm per realismo */
          float continents = fbm(p);
          continents += fbm(p * 2.3) * 0.4;
          continents += fbm(p * 5.1) * 0.15;
          continents = continents * 0.5 + 0.18;

          /* Land mask */
          float land = smoothstep(0.42, 0.50, continents);

          /* Ocean depth */
          float oceanDepth = smoothstep(0.0, 0.42, continents);
          vec3 deepOcean    = vec3(0.02, 0.06, 0.20);
          vec3 shallowOcean = vec3(0.06, 0.30, 0.55);
          vec3 oceanColor   = mix(deepOcean, shallowOcean, oceanDepth);

          /* Land elevation 0-1 */
          float elev = clamp((continents - 0.42) / 0.50, 0.0, 1.0);

          /* Colori terreni — sand, grass, forest, mountain, snow */
          vec3 sand     = vec3(0.78, 0.70, 0.50);
          vec3 grass    = vec3(0.20, 0.45, 0.15);
          vec3 forest   = vec3(0.08, 0.28, 0.08);
          vec3 mountain = vec3(0.40, 0.36, 0.32);
          vec3 snow     = vec3(0.95, 0.96, 0.98);

          vec3 land_col = sand;
          land_col = mix(land_col, grass,    smoothstep(0.05, 0.20, elev));
          land_col = mix(land_col, forest,   smoothstep(0.18, 0.40, elev));
          land_col = mix(land_col, mountain, smoothstep(0.45, 0.65, elev));
          land_col = mix(land_col, snow,     smoothstep(0.75, 0.90, elev));

          /* Calotte polari basate sulla latitudine */
          float lat = abs(normalize(vLocalPosition).y);
          float polarMask = smoothstep(0.75, 0.92, lat + fbm(p * 8.0) * 0.04);
          land_col   = mix(land_col,   snow,                       polarMask);
          oceanColor = mix(oceanColor, vec3(0.80, 0.85, 0.92),     polarMask * 0.9);

          /* Surface finale */
          vec3 surface = mix(oceanColor, land_col, land);

          /* Illuminazione direzionale dal sole */
          vec3  N        = normalize(vWorldNormal);
          float lightDot = dot(N, uSunDirection);
          float dayMix   = smoothstep(-0.2, 0.25, lightDot);

          /* Lato giorno: leggera modulazione */
          vec3 day = surface * (0.35 + max(lightDot, 0.0) * 0.85);

          /* Lato notte: molto scuro */
          vec3 night = surface * 0.04;
          night      = mix(night, vec3(0.0, 0.0, 0.015), 1.0 - land);

          vec3 color = mix(night, day, dayMix);

          /* Specular sull'oceano (lato giorno) */
          if (land < 0.5) {
            vec3 R = reflect(-uSunDirection, N);
            float spec = pow(max(dot(vViewDir, R), 0.0), 30.0);
            color += vec3(1.0, 0.95, 0.80) * spec * dayMix * (1.0 - land) * 1.4;
          }

          /* Cerchio luce ai bordi (limb darkening soft) */
          float limb = pow(clamp(dot(N, vViewDir), 0.0, 1.0), 0.65);
          color = mix(color * 0.6, color, limb);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }

  /* ── Sfera nuvole indipendente ── */
  _buildClouds() {
    const geo = new THREE.SphereGeometry(this.radius * 1.018, 48, 48);

    this.cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime:          { value: 0 },
        uSunDirection:  { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: PLANET_VERT,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float uTime;
        uniform vec3  uSunDirection;

        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;

        void main() {
          vec3 p = normalize(vLocalPosition) * 3.2;
          /* Deriva lenta delle nuvole */
          p += vec3(uTime * 0.015, 0.0, uTime * 0.008);

          float c = fbm(p);
          c += fbm(p * 2.7) * 0.4;
          c = smoothstep(0.42, 0.78, c);

          /* Diradate ai poli */
          float lat = abs(normalize(vLocalPosition).y);
          c *= 1.0 - smoothstep(0.85, 1.0, lat) * 0.7;

          /* Illuminazione */
          vec3 N = normalize(vWorldNormal);
          float lightDot = max(dot(N, uSunDirection), 0.0);
          float dayMix   = smoothstep(-0.15, 0.3, dot(N, uSunDirection));

          vec3 cloudCol = mix(vec3(0.05, 0.05, 0.10), vec3(1.0), dayMix);

          gl_FragColor = vec4(cloudCol, c * (0.4 + dayMix * 0.5));
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    this.cloudMesh = new THREE.Mesh(geo, this.cloudMaterial);
    this.spinGroup.add(this.cloudMesh);
  }

  _onUpdate(time, delta) {
    // Nuvole ruotano più lentamente del pianeta
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += this.rotSpeed * delta * 0.15;
    }
  }
}
