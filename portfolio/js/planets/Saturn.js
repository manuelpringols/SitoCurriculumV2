import * as THREE from 'three';
import { Planet }      from './Planet.js';
import { NOISE_GLSL }  from '../shaders/noise.js';
import { PLANET_VERT } from '../shaders/chunks.js';

/**
 * Saturn — Istruzione
 * Bande latitudinali color crema, anelli procedurali con divisione di Cassini,
 * inclinazione assiale di 27° (caratteristica reale).
 */
export class Saturn extends Planet {
  constructor(scene, options = {}) {
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

          /* Bande latitudinali con turbolenza orizzontale */
          float turb = fbm(vec3(N.x * 4.0, lat * 16.0, N.z * 4.0) + uTime * 0.02);
          float bands = sin(lat * 14.0 + turb * 1.5) * 0.5 + 0.5;
          /* Modulazione secondaria */
          bands *= 0.7 + sin(lat * 28.0 + turb) * 0.3;

          /* Palette Saturno */
          vec3 darkBand  = vec3(0.65, 0.50, 0.30);
          vec3 midBand   = vec3(0.85, 0.72, 0.50);
          vec3 lightBand = vec3(0.96, 0.88, 0.68);

          vec3 col = mix(darkBand, midBand,   smoothstep(0.20, 0.55, bands));
          col      = mix(col,      lightBand, smoothstep(0.55, 0.90, bands));

          /* Esagono polare nord (caratteristica reale, semplificata) */
          float polarHex = smoothstep(0.85, 0.92, abs(lat));
          col = mix(col, vec3(0.55, 0.45, 0.25), polarHex * 0.6);

          /* Illuminazione */
          vec3 Nworld = normalize(vWorldNormal);
          float lightDot = dot(Nworld, uSunDirection);
          float dayMix = smoothstep(-0.2, 0.3, lightDot);

          vec3 day   = col * (0.35 + max(lightDot, 0.0) * 0.85);
          vec3 night = col * 0.05;
          vec3 color = mix(night, day, dayMix);

          /* Limb darkening */
          float limb = pow(clamp(dot(Nworld, vViewDir), 0.0, 1.0), 0.6);
          color = mix(color * 0.6, color, limb);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }

  /* ── Anelli procedurali ── */
  _buildRings() {
    const innerR = this.radius * 1.35;
    const outerR = this.radius * 2.40;
    const geo    = new THREE.RingGeometry(innerR, outerR, 128, 8);

    /* Forza UV.y radiale: 0 = bordo interno, 1 = bordo esterno */
    const pos = geo.attributes.position;
    const uv  = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const t = (r - innerR) / (outerR - innerR);
      uv.setXY(i, t, t);
    }
    uv.needsUpdate = true;

    this.ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uPlanetRadius: { value: this.radius },
        uInnerRadius:  { value: innerR },
        uOuterRadius:  { value: outerR },
      },
      vertexShader: /* glsl */`
        varying vec2  vUv;
        varying vec3  vWorldPosition;
        varying vec3  vLocalPosition;
        void main() {
          vUv             = uv;
          vLocalPosition  = position;
          vec4 wp         = modelMatrix * vec4(position, 1.0);
          vWorldPosition  = wp.xyz;
          gl_Position     = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform vec3  uSunDirection;
        uniform float uPlanetRadius;
        uniform float uInnerRadius;
        uniform float uOuterRadius;

        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vLocalPosition;

        void main() {
          /* Posizione radiale 0-1 (interno → esterno) */
          float t = vUv.x;

          /* Bande di densità: combinazione di frequenze */
          float n = fbm(vec3(t * 80.0, 0.0, 0.0));
          float band1 = sin(t * 90.0) * 0.5 + 0.5;
          float band2 = sin(t * 35.0 + n * 4.0) * 0.5 + 0.5;
          float density = band1 * 0.5 + band2 * 0.5;
          density *= 0.5 + fbm(vec3(t * 20.0, 0.0, 0.0)) * 0.6;

          /* Divisione di Cassini (gap netto attorno a t ≈ 0.55) */
          float cassini = smoothstep(0.52, 0.54, t) * (1.0 - smoothstep(0.58, 0.60, t));
          density *= 1.0 - cassini * 0.95;

          /* Gap esterno minore (Encke) */
          float encke = smoothstep(0.84, 0.85, t) * (1.0 - smoothstep(0.86, 0.87, t));
          density *= 1.0 - encke * 0.7;

          /* Fade ai bordi */
          density *= smoothstep(0.0, 0.04, t) * (1.0 - smoothstep(0.96, 1.0, t));

          /* Colore: dal grigio caldo (interno) al beige chiaro (esterno) */
          vec3 cInner = vec3(0.55, 0.45, 0.32);
          vec3 cOuter = vec3(0.92, 0.85, 0.68);
          vec3 color  = mix(cInner, cOuter, t);

          /* Ombra del pianeta sugli anelli (approssimata) */
          /* Vettore dalla origin del pianeta al frammento, proiettato sul piano del sole */
          vec3 toFrag    = normalize(vWorldPosition - (modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz);
          float shadowDot = dot(toFrag, -uSunDirection);
          float shadow    = smoothstep(0.85, 0.99, shadowDot);
          color *= 1.0 - shadow * 0.7;

          gl_FragColor = vec4(color, density * 0.85);
        }
      `,
      transparent: true,
      side:        THREE.DoubleSide,
      depthWrite:  false,
    });

    this.ringMesh = new THREE.Mesh(geo, this.ringMaterial);
    this.ringMesh.rotation.x = Math.PI / 2; // mette il ring sul piano equatoriale
    this.spinGroup.add(this.ringMesh);
  }

  updateSunDirection(sunWorldPos) {
    super.updateSunDirection(sunWorldPos);
    if (this.ringMaterial?.uniforms?.uSunDirection) {
      const planetPos = this.getWorldPosition();
      const dir = new THREE.Vector3().subVectors(sunWorldPos, planetPos).normalize();
      this.ringMaterial.uniforms.uSunDirection.value.copy(dir);
    }
  }
}
