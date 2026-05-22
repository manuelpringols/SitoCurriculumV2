import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Saturn — Istruzione
 * Corpo: texture reale + turbolenza procedurale.
 * Anelli: texture 2k_saturn_ring_alpha.png applicata direttamente
 *         su RingGeometry — UV radiale, double-side, trasparenza dall'alpha.
 */
export class Saturn extends Planet {
  constructor(scene, options = {}) {
    const loader = new THREE.TextureLoader();

    options._texBody = loader.load('./textures/2k_saturn.jpg',
      t => { t.colorSpace = THREE.SRGBColorSpace; });

    options._texRing = loader.load('./textures/2k_saturn_ring_alpha.png',
      t => { t.colorSpace = THREE.SRGBColorSpace; });

    super(scene, {
      ...options,
      atmosphereColor:     0xffdda0,
      atmosphereIntensity: 0.45,
      atmospherePower:     3.0,
      atmosphereScale:     1.05,
      axialTilt:           27 * Math.PI / 180,
    });

    this._buildRings();
  }

  /* ── Corpo ── */
  _buildBody() {
    const geo = new THREE.SphereGeometry(this.radius, this.segments, this.segments);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime:         { value: 0 },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uTexture:      { value: this.options?._texBody ?? null },
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

          vec3  N2  = normalize(vLocalPosition);
          float lat = N2.y;
          float turb = fbm(vec3(N2.x*4.0, lat*16.0, N2.z*4.0) + uTime*0.015) * 0.06;
          surface = clamp(surface + turb * vec3(0.08, 0.06, 0.02), 0.0, 1.0);

          float polarHex = smoothstep(0.85, 0.92, abs(lat));
          surface = mix(surface, vec3(0.55, 0.45, 0.25), polarHex * 0.5);

          vec3  Nw       = normalize(vWorldNormal);
          float lightDot = dot(Nw, uSunDirection);
          float dayMix   = smoothstep(-0.2, 0.3, lightDot);
          vec3 day   = surface * (0.18 + max(lightDot, 0.0) * 0.52);
          vec3 night = surface * 0.05;
          vec3 color = mix(night, day, dayMix);
          float limb = pow(clamp(dot(Nw, vViewDir), 0.0, 1.0), 0.6);
          color = mix(color * 0.6, color, limb);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    if (this.options?._texBody)
      this.material.uniforms.uTexture.value = this.options._texBody;

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }

  /* ── Anelli con texture reale ── */
  _buildRings() {
    const innerR = this.radius * 1.20;
    const outerR = this.radius * 2.50;

    const geo = new THREE.RingGeometry(innerR, outerR, 256, 4);

    /*
     * UV radiale: U va da 0 (bordo interno) a 1 (bordo esterno).
     * La texture saturn_ring ha i dati dei gap e delle bande
     * distribuiti sull'asse orizzontale — questo mapping è quello corretto.
     */
    const pos = geo.attributes.position;
    const uv  = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const t = (r - innerR) / (outerR - innerR);
      uv.setXY(i, t, 0.5);  // V fisso a 0.5 = riga centrale della texture
    }
    uv.needsUpdate = true;

    /*
     * ShaderMaterial minimale: campiona la texture,
     * usa l'alpha per la trasparenza, aggiunge luce solare soft.
     */
    this.ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture:      { value: this.options?._texRing ?? null },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D uTexture;
        uniform vec3      uSunDirection;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vec4 ring = texture2D(uTexture, vUv);

          /* Gli anelli di Saturno sono illuminati dal sole —
             calcoliamo l'angolo tra la direzione sole e il piano dell'anello */
          float sunAngle = abs(uSunDirection.y);  // 0 = sole nel piano, 1 = perpendicolare
          float light = 0.55 + sunAngle * 0.45;

          vec3  color = ring.rgb * light;
          float alpha = ring.a;

          /* Ombra del pianeta sugli anelli (approssimata):
             area nell'ombra opposta al sole */
          vec2  toFrag = normalize(vWorldPos.xz);
          vec2  toSun  = normalize(uSunDirection.xz);
          float shadow = smoothstep(0.88, 1.0, dot(toFrag, -toSun));
          alpha *= 1.0 - shadow * 0.65;

          if (alpha < 0.01) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side:        THREE.DoubleSide,
      depthWrite:  false,
    });

    if (this.options?._texRing)
      this.ringMaterial.uniforms.uTexture.value = this.options._texRing;

    this.ringMesh = new THREE.Mesh(geo, this.ringMaterial);
    this.ringMesh.rotation.x  = Math.PI / 2;
    this.ringMesh.renderOrder = 2;
    this.spinGroup.add(this.ringMesh);
  }

  updateSunDirection(sunWorldPos) {
    super.updateSunDirection(sunWorldPos);
    if (this.ringMaterial?.uniforms?.uSunDirection) {
      const dir = new THREE.Vector3()
        .subVectors(sunWorldPos, this.getWorldPosition())
        .normalize();
      this.ringMaterial.uniforms.uSunDirection.value.copy(dir);
    }
  }
}