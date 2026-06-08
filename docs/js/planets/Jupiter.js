import * as THREE from 'three';
import { Planet } from './Planet.js';
import { NOISE_GLSL } from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

export class Jupiter extends Planet {
  constructor(scene, options = {}) {
    const loader = new THREE.TextureLoader();
    options._tex = loader.load('./textures/2k_jupiter.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });

    super(scene, {
      ...options,
      atmosphereColor: 0xffaa55,
      atmosphereIntensity: 0.26,   // era 0.70
      atmospherePower: 3.0,
      atmosphereScale: 1.05,
      axialTilt: 3 * Math.PI / 180,
    });
  }

  _buildBody() {
    const geo = new THREE.SphereGeometry(this.radius, this.segments, this.segments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uTexture: { value: this.options?._tex ?? null },
      },
      vertexShader: PLANET_VERT,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float     uTime;
        uniform vec3      uSunDirection;
        uniform sampler2D uTexture;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vViewDir;
        varying vec2 vUv;

        void main() {
          vec3 surface = texture2D(uTexture, vUv).rgb;

          /* Grande Macchia Rossa animata sovrapposta */
          vec3  N2  = normalize(vLocalPosition);
          float lat = N2.y;
          float lon = atan(N2.z, N2.x);
          float spotLon  = uTime * 0.03;
          vec2  spotDelta = vec2(
            sin(lon - spotLon) * cos(-0.30 - lat * 0.5) * 1.4,
            (lat + 0.30) * 2.2
          );
          float spotDist = length(spotDelta);
          float spotMask = smoothstep(0.42, 0.08, spotDist);
          float swirl    = sin(spotDist * 18.0 - uTime * 0.4) * 0.5 + 0.5;
          vec3 spotCol   = mix(vec3(0.55, 0.20, 0.10), vec3(0.85, 0.30, 0.18), swirl);
          surface = mix(surface, spotCol, spotMask * 0.85);

          /* Turbolenza bande sottile */
          vec3 tc    = vec3(N2.x * 5.0, lat * 12.0, N2.z * 5.0) + vec3(uTime * 0.04);
          float turb = fbm(tc) * 0.08;
          surface    = clamp(surface + turb * vec3(0.1, 0.06, 0.02), 0.0, 1.0);

          /* Illuminazione */
          vec3  Nw       = normalize(vWorldNormal);
          float lightDot = dot(Nw, uSunDirection);
          float dayMix   = smoothstep(-0.2, 0.3, lightDot);
          vec3 day   = surface * (0.18 + max(lightDot, 0.0) * 0.52);
          vec3 night = surface * 0.13;
          vec3 color = mix(night, day, dayMix);
          float limb = pow(clamp(dot(Nw, vViewDir), 0.0, 1.0), 0.4);
          color = mix(color * 0.84, color, limb);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    if (this.options?._tex)
      this.material.uniforms.uTexture.value = this.options._tex;

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }
}