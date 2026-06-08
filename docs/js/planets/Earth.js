import * as THREE from 'three';
import { Planet } from './Planet.js';
import { NOISE_GLSL } from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Earth — Chi Sono
 * Base: texture reale 2K (day + night).
 * Overlay procedurali: cloud mesh indipendente, polar ice,
 * specular oceano, city lights sul lato notte.
 */
export class Earth extends Planet {
  constructor(scene, options = {}) {
    /* Carica texture prima di chiamare super (che chiama _buildBody) */
    const loader = new THREE.TextureLoader();
    options._texDay = loader.load('./textures/2k_earth_daymap.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });
    options._texNight = loader.load('./textures/2k_earth_nightmap.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });

    super(scene, {
      ...options,
      atmosphereColor: 0x6ab6ff,
      atmosphereIntensity: 0.85,
      atmospherePower: 2.8,
      atmosphereScale: 1.06,
      axialTilt: 23.5 * Math.PI / 180,
    });
    this._buildClouds();
  }

  _buildBody() {
    const geo = new THREE.SphereGeometry(this.radius, this.segments, this.segments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uTexDay: { value: this.options?._texDay ?? null },
        uTexNight: { value: this.options?._texNight ?? null },
      },
      vertexShader: PLANET_VERT,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float      uTime;
        uniform vec3       uSunDirection;
        uniform sampler2D  uTexDay;
        uniform sampler2D  uTexNight;

        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vViewDir;
        varying vec2 vUv;

        void main() {
          /* ── Base dalla texture reale ── */
          vec3 dayTex   = texture2D(uTexDay,   vUv).rgb;
          vec3 nightTex = texture2D(uTexNight, vUv).rgb;

          /* Rilevamento oceano: aree dove il blu domina */
          float oceanMask = clamp(
            (dayTex.b - (dayTex.r + dayTex.g) * 0.55) * 4.0, 0.0, 1.0
          );

          /* Calotte polari procedurali sovrapposte */
          float lat = abs(normalize(vLocalPosition).y);
          vec3 p = normalize(vLocalPosition) * 4.0;
          float polarMask = smoothstep(0.72, 0.88,
            lat + fbm(p * 6.0) * 0.04);
          vec3 surface = mix(dayTex, vec3(0.92, 0.95, 1.0), polarMask);

          /* ── Illuminazione ── */
          vec3  N        = normalize(vWorldNormal);
          float lightDot = dot(N, uSunDirection);
          float dayMix   = smoothstep(-0.18, 0.22, lightDot);

          vec3 day   = surface * (0.18 + max(lightDot, 0.0) * 0.52);

          /* Lato notte: luci città dalla nightmap + tenui emissioni */
          vec3 cityLights = nightTex * 1.8;
          vec3 night = surface * 0.03 + cityLights * (1.0 - dayMix) * 0.9;

          vec3 color = mix(night, day, dayMix);

          /* Specular sull oceano */
          vec3  R    = reflect(-uSunDirection, N);
          float spec = pow(max(dot(vViewDir, R), 0.0), 35.0);
          color += vec3(1.0, 0.96, 0.82) * spec * dayMix * oceanMask * 0.75;

          /* Limb darkening */
          float limb = pow(clamp(dot(N, vViewDir), 0.0, 1.0), 0.4);
          color = mix(color * 0.78, color, limb);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    /* Passa le texture agli uniform dopo che il material è costruito */
    if (this.options?._texDay)
      this.material.uniforms.uTexDay.value = this.options._texDay;
    if (this.options?._texNight)
      this.material.uniforms.uTexNight.value = this.options._texNight;

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }

  /* ── Nuvole procedurali (mesh separato, sempre dinamico) ── */
  _buildClouds() {
    const geo = new THREE.SphereGeometry(this.radius * 1.018, 48, 48);
    this.cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: PLANET_VERT,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float uTime;
        uniform vec3  uSunDirection;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;

        void main() {
          vec3 p = normalize(vLocalPosition) * 3.2;
          p += vec3(uTime * 0.015, 0.0, uTime * 0.008);
          float c = fbm(p);
          c += fbm(p * 2.7) * 0.4;
          c = smoothstep(0.40, 0.76, c);
          float lat = abs(normalize(vLocalPosition).y);
          c *= 1.0 - smoothstep(0.85, 1.0, lat) * 0.7;
          vec3 N = normalize(vWorldNormal);
          float dayMix = smoothstep(-0.15, 0.3, dot(N, uSunDirection));
          vec3 cloudCol = mix(vec3(0.05, 0.05, 0.10), vec3(1.0), dayMix);
          gl_FragColor = vec4(cloudCol, c * (0.45 + dayMix * 0.45));
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    this.cloudMesh = new THREE.Mesh(geo, this.cloudMaterial);
    this.spinGroup.add(this.cloudMesh);
  }

  _onUpdate(time, delta) {
    if (this.cloudMesh)
      this.cloudMesh.rotation.y += this.rotSpeed * delta * 0.15;
  }
}