import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

export class Mars extends Planet {
  constructor(scene, options = {}) {
    const loader = new THREE.TextureLoader();
    options._tex = loader.load('./textures/2k_mars.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });
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
        uTexture:      { value: this.options?._tex ?? null },
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

          /* Tempesta di polvere procedurale sovrapposta */
          vec3 p = normalize(vLocalPosition) * 2.8;
          float storm = fbm(p * 2.0 + vec3(uTime * 0.04, 0.0, uTime * 0.02));
          storm = smoothstep(0.52, 0.78, storm);
          surface = mix(surface, vec3(0.88, 0.62, 0.38), storm * 0.22);

          /* Calotte polari procedurali */
          float lat = abs(normalize(vLocalPosition).y);
          float ice = smoothstep(0.80, 0.94,
            lat + fbm(p * 10.0) * 0.04);
          surface = mix(surface, vec3(0.92, 0.90, 0.88), ice);

          /* Illuminazione */
          vec3  N        = normalize(vWorldNormal);
          float lightDot = dot(N, uSunDirection);
          float dayMix   = smoothstep(-0.15, 0.35, lightDot);
          vec3 day   = surface * (0.18 + max(lightDot, 0.0) * 0.52);
          vec3 night = surface * 0.04;
          vec3 color = mix(night, day, dayMix);
          float limb = pow(clamp(dot(N, vViewDir), 0.0, 1.0), 0.55);
          color = mix(color * 0.55, color, limb);
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