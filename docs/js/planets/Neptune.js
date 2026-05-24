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
      atmosphereColor:     0x2266dd,
      atmosphereIntensity: 0.70,
      atmospherePower:     2.6,
      atmosphereScale:     1.07,
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
          /* ── Texture base ── */
          vec3 tex = texture2D(uTexture, vUv).rgb;

          /* Boost contrasto: porta i medi verso gli estremi,
             poi esalta il canale blu caratteristico di Nettuno */
          tex = (tex - 0.5) * 1.45 + 0.5;
          tex = clamp(tex, 0.0, 1.0);
          tex *= vec3(0.62, 0.78, 1.30);   // enfatizza blu/cyan, schiaccia rosso
          tex = clamp(tex, 0.0, 1.0);

          vec3 N2  = normalize(vLocalPosition);
          float lat = N2.y;

          /* ── Bande latitudinali procedurali ──
             Nettuno ha venti fortissimi → bande orizzontali molto nette */
          float bandNoise = fbm(vec3(N2.x * 2.5, lat * 18.0, N2.z * 2.5)
                              + vec3(uTime * 0.025, 0.0, 0.0)) * 0.6;
          float bands = sin(lat * 14.0 + bandNoise) * 0.5 + 0.5;
          bands       = pow(bands, 1.4);  // aumenta contrasto bande

          vec3 darkBlue   = vec3(0.01, 0.04, 0.22);
          vec3 mediumBlue = vec3(0.05, 0.18, 0.55);
          vec3 cyanBlue   = vec3(0.18, 0.48, 0.82);

          vec3 bandColor = mix(darkBlue, mediumBlue, bands);
          bandColor      = mix(bandColor, cyanBlue, smoothstep(0.65, 0.95, bands));

          /* Fondi texture + bande: la texture porta le macro-strutture,
             le bande aggiungono variazione ad alta frequenza */
          vec3 surface = mix(tex, bandColor, 0.52);

          /* ── Domain warp per turbolenza ── */
          vec3 warpCoord = vec3(N2.x * 3.5, lat * 10.0, N2.z * 3.5);
          vec3 q = vec3(
            fbm(warpCoord + uTime * 0.035),
            fbm(warpCoord + vec3(5.2, 1.3, 2.8) + uTime * 0.028),
            0.0
          );
          float turb = fbm(warpCoord + q * 1.8 + uTime * 0.02);

          /* ── Grande Macchia Scura ── */
          float lon = atan(N2.z, N2.x);
          float spotLon = -0.8 + uTime * 0.018;
          vec2 spotDelta = vec2(
            sin(lon - spotLon) * cos(-0.25 - lat * 0.4) * 1.6,
            (lat + 0.25) * 2.8
          );
          float spotDist = length(spotDelta);
          float spotMask = smoothstep(0.50, 0.08, spotDist);

          /* Vortice interno con anelli concentrici */
          float swirl = sin(spotDist * 14.0 - uTime * 0.35) * 0.5 + 0.5;
          vec3 spotInner = vec3(0.01, 0.02, 0.12);
          vec3 spotOuter = vec3(0.03, 0.08, 0.28);
          vec3 spotCol   = mix(spotOuter, spotInner, swirl);
          surface = mix(surface, spotCol, spotMask * 0.88);

          /* Alone chiaro attorno alla macchia (bordo brillante) */
          float spotRim = smoothstep(0.55, 0.48, spotDist) * (1.0 - spotMask);
          surface = mix(surface, vec3(0.30, 0.60, 0.95), spotRim * 0.25);

          /* ── Nubi alte cyan-bianche ── */
          float cloudNoise = fbm(vec3(N2.xy * 7.0, N2.z * 7.0) + uTime * 0.055);
          float highClouds = smoothstep(0.72, 0.92, cloudNoise + turb * 0.3);
          /* Strie sottili: maschera lungo le latitudini */
          float cloudStreak = smoothstep(0.68, 0.90, fbm(vec3(N2.x*12.0, lat*5.0, N2.z*12.0) + uTime*0.04));
          float clouds = max(highClouds, cloudStreak * 0.6);
          surface = mix(surface, vec3(0.65, 0.88, 1.0), clouds * 0.40);

          /* ── Illuminazione ── */
          vec3  Nw       = normalize(vWorldNormal);
          float lightDot = dot(Nw, uSunDirection);
          float dayMix   = smoothstep(-0.20, 0.28, lightDot);

          vec3 day   = surface * (0.22 + max(lightDot, 0.0) * 0.72);
          vec3 night = surface * 0.04;
          vec3 color = mix(night, day, dayMix);

          /* Limb darkening — Nettuno ha un limb molto marcato */
          float limb = pow(clamp(dot(Nw, vViewDir), 0.0, 1.0), 0.50);
          color = mix(color * 0.45, color, limb);

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