import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

export class Mercury extends Planet {
  constructor(scene, options = {}) {
    const loader = new THREE.TextureLoader();
    options._tex = loader.load('./textures/2k_mercury.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });
    super(scene, {
      ...options,
      atmosphereColor: null,
      axialTilt:       0.05,
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

          /* Piccoli impatti brillanti procedurali sovrapposti */
          vec3  p       = normalize(vLocalPosition) * 4.0;
          float impacts = smoothstep(0.93, 1.0, snoise(p * 12.0));
          surface = mix(surface, vec3(0.95,0.92,0.85), impacts*0.4);

          /* Terminator netto (no atmosphere) */
          vec3  N        = normalize(vWorldNormal);
          float lightDot = dot(N, uSunDirection);
          float dayMix   = smoothstep(-0.04, 0.04, lightDot);
          vec3 day   = surface * (0.15 + max(lightDot, 0.0) * 0.70);
          vec3 night = surface * 0.015;
          vec3 color = mix(night, day, dayMix);
          float terminator = exp(-pow(lightDot*8.0,2.0))*0.35;
          color += vec3(1.0,0.5,0.2)*terminator;
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