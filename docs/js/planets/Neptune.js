import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

export class Neptune extends Planet {
  constructor(scene, options = {}) {
    const loader = new THREE.TextureLoader();
    options._tex = loader.load('./textures/2k_neptune.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });
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

          /* Storm spots e nubi alte procedurali */
          vec3  N2  = normalize(vLocalPosition);
          float lat = N2.y;
          vec3 q = vec3(
            fbm(vec3(N2.x*3.0,lat*8.0,N2.z*3.0)+uTime*0.04),
            fbm(vec3(N2.x*3.0,lat*8.0,N2.z*3.0)+11.0),
            0.0
          );
          float turb = fbm(vec3(N2.x*4.0,lat*12.0,N2.z*4.0)+q*2.0);
          float stormPos = sin(lat*5.0+uTime*0.05)+sin(N2.x*8.0+uTime*0.03);
          float storm    = smoothstep(0.7,0.95,turb)*smoothstep(0.5,1.0,abs(stormPos));
          surface = mix(surface, vec3(0.02,0.08,0.35)*0.5, storm*0.55);
          float highClouds = smoothstep(0.78,0.96,fbm(vec3(N2.xy*6.0,N2.z*6.0)+uTime*0.06));
          surface = mix(surface, vec3(0.70,0.88,1.0), highClouds*0.30);

          /* Illuminazione */
          vec3  Nw       = normalize(vWorldNormal);
          float lightDot = dot(Nw, uSunDirection);
          float dayMix   = smoothstep(-0.2, 0.3, lightDot);
          vec3 day   = surface * (0.18 + max(lightDot, 0.0) * 0.52);
          vec3 night = surface * 0.06;
          vec3 color = mix(night, day, dayMix);
          float limb = pow(clamp(dot(Nw, vViewDir), 0.0, 1.0), 0.55);
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