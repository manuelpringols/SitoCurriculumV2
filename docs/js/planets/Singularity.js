import * as THREE from 'three';

/**
 * Singularity — buco nero con lensing gravitazionale.
 *
 * 1. Event horizon  — sfera nera pura
 * 2. Lensing glow   — Einstein ring + spirale di infall + onde contrattili
 *                     (tutto mascherato: il centro rimane SEMPRE nero)
 * 3. Photon ring    — toro sottile equatoriale
 * 4. Accretion disk — plasma Kepleriano animato
 * 5. Outer halo     — alone viola con onde gravitazionali
 */
export class Singularity {
  constructor(scene, opts = {}) {
    this.scene           = scene;
    this.radius          = opts.radius    ?? 28;
    this.rotSpeed        = opts.rotSpeed  ?? 0.03;
    this.sectionKey      = opts.sectionKey ?? 'singularity';
    this.atmosphereColor = 0x9900ff;

    this._scaleTarget  = 1.0;
    this._scaleCurrent = 1.0;
    this._shaderMats   = [];

    this.bodyGroup = new THREE.Group();
    this.scene.add(this.bodyGroup);

    const pos = opts.fixedPosition ?? new THREE.Vector3(3400, 650, -2600);
    this.bodyGroup.position.copy(pos);

    this._buildEventHorizon();
    this._buildLensingGlow();
    this._buildPhotonRing();
    this._buildAccretionDisk();
    this._buildOuterHalo();

    this.mesh = this._horizonMesh;
    this.mesh.userData.sectionKey = this.sectionKey;
    this.mesh.userData.planetRef  = this;
  }

  /* ── 1. Event horizon ── */
  _buildEventHorizon() {
    const geo = new THREE.SphereGeometry(this.radius, 64, 64);
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this._horizonMesh = new THREE.Mesh(geo, mat);
    this.bodyGroup.add(this._horizonMesh);
  }

  /* ── 2. Lensing glow ── */
  _buildLensingGlow() {
    const geo = new THREE.SphereGeometry(this.radius * 1.18, 64, 64);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal  = normalize(normalMatrix * normal);
          vec4 mv  = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        varying vec3  vNormal;
        varying vec3  vViewDir;

        void main() {
          float ndv = max(0.0, dot(vNormal, vViewDir));
          float t   = 1.0 - ndv;  /* 0 al centro, 1 al bordo */

          /* ── Maschera centrale: NIENTE colore per t < 0.28 ──
             Garantisce che il centro (event horizon) resti nero.        */
          float centerMask = smoothstep(0.0, 0.28, t);

          /* Anello Einstein — presente solo al bordo (pow alta) */
          float ring = pow(t, 5.5);

          /* Gradiente morbido — azzerato verso il centro */
          float soft = pow(t, 1.8) * 0.55 * centerMask;

          /* Spirale di infall — appare SOLO oltre t=0.28 */
          float az     = vNormal.x * cos(uTime * 0.28) - vNormal.z * sin(uTime * 0.28);
          float spiral = sin(az * 10.0 + t * 14.0 - uTime * 2.4) * 0.5 + 0.5;
          spiral      *= smoothstep(0.28, 0.55, t);

          /* Onde radiali contrattili — solo zona anulare esterna */
          float ripple = sin(t * 24.0 - uTime * 1.8) * 0.5 + 0.5;
          ripple      *= smoothstep(0.28, 0.55, t) * smoothstep(1.0, 0.62, t);

          float pulse = 0.82 + 0.18 * sin(uTime * 0.60);

          /* Colori */
          vec3 colBase    = mix(vec3(1.0, 0.60, 0.10),
                                vec3(0.95, 0.90, 1.00), ring);
          vec3 colDistort = vec3(0.45, 0.15, 1.0);
          vec3 col = colBase
                   + colDistort            * spiral * soft * 0.28
                   + vec3(0.9, 0.55, 0.15) * ripple        * 0.14;
          col *= pulse;

          float alpha = (ring
                       + soft
                       + spiral * soft * 0.32
                       + ripple        * 0.13) * pulse;
          gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      side:        THREE.FrontSide,
    });
    this._shaderMats.push(mat);
    this.bodyGroup.add(new THREE.Mesh(geo, mat));
  }

  /* ── 3. Photon ring ── */
  _buildPhotonRing() {
    const geo = new THREE.TorusGeometry(
      this.radius * 1.58,
      this.radius * 0.09,
      24, 160
    );
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        varying vec3 vNorm;
        varying vec3 vViewDir;
        void main() {
          vNorm    = normalize(normalMatrix * normal);
          vec4 mv  = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        varying vec3  vNorm;
        varying vec3  vViewDir;
        void main() {
          float ndv   = max(0.0, dot(vNorm, vViewDir));
          float pulse = 0.78 + 0.22 * sin(uTime * 0.80 + 1.2);
          vec3  col   = mix(vec3(1.00, 0.85, 0.55),
                            vec3(1.00, 0.98, 0.92),
                            pow(1.0 - ndv, 2.0)) * pulse;
          float alpha = (0.70 + 0.30 * pow(1.0 - ndv, 3.0)) * pulse;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI * 0.28;
    this._shaderMats.push(mat);
    this._photonRing = mesh;
    this.bodyGroup.add(mesh);
  }

  /* ── 4. Accretion disk ── */
  _buildAccretionDisk() {
    const R  = this.radius;
    const iR = R * 2.2;
    const oR = R * 6.8;

    const geo = new THREE.RingGeometry(iR, oR, 128, 14);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:   { value: 0 },
        uInnerR: { value: iR },
        uOuterR: { value: oR },
      },
      vertexShader: /* glsl */`
        varying vec3 vPos;
        void main() {
          vPos        = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform float uInnerR;
        uniform float uOuterR;
        varying vec3  vPos;

        void main() {
          float r = length(vPos.xy);
          float v = clamp((r - uInnerR) / (uOuterR - uInnerR), 0.0, 1.0);

          /* Rotazione Kepleriana (no atan) */
          float speed = mix(2.8, 0.28, v);
          float ang   = speed * uTime;
          float cosA  = cos(ang), sinA = sin(ang);
          vec2 rot = vec2(
            vPos.x * cosA - vPos.y * sinA,
            vPos.x * sinA + vPos.y * cosA
          );

          /* Plasma */
          float sc = 0.20 / max(r, 1.0);
          float p1 = sin(rot.x * sc * 65.0 + v * 14.0)       * 0.5 + 0.5;
          float p2 = sin(rot.y * sc * 90.0 - v *  9.0 + 1.7) * 0.5 + 0.5;
          float p3 = sin((rot.x + rot.y) * sc * 42.0 + 3.1)  * 0.5 + 0.5;
          float plasma = p1 * 0.50 + p2 * 0.32 + p3 * 0.18;

          vec3 c0 = vec3(1.00, 0.97, 0.86);
          vec3 c1 = vec3(1.00, 0.52, 0.08);
          vec3 c2 = vec3(0.55, 0.05, 0.01);
          vec3 c3 = vec3(0.12, 0.01, 0.00);

          vec3 col = mix(c0, c1, smoothstep(0.00, 0.26, v));
               col = mix(col, c2, smoothstep(0.24, 0.62, v));
               col = mix(col, c3, smoothstep(0.58, 1.00, v));
               col *= 0.50 + plasma * 0.90;
          col      *= 1.0 + normalize(vPos.xy).x * 0.60;

          float alpha = smoothstep(0.0, 0.10, v) * smoothstep(1.0, 0.70, v);
          alpha      *= 0.94 + plasma * 0.06;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      side:        THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI * 0.28;
    this._diskMat  = mat;
    this._diskMesh = mesh;
    this._shaderMats.push(mat);
    this.bodyGroup.add(mesh);
  }

  /* ── 5. Outer halo ── */
  _buildOuterHalo() {
    const geo = new THREE.SphereGeometry(this.radius * 5.5, 32, 32);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal  = normalize(normalMatrix * normal);
          vec4 mv  = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        varying vec3  vNormal;
        varying vec3  vViewDir;

        void main() {
          float ndv   = max(0.0, dot(vNormal, vViewDir));
          float t     = 1.0 - ndv;
          float pulse = 0.85 + 0.15 * sin(uTime * 0.40);

          float halo = pow(t, 1.4) * 0.22;

          /* Onde gravitazionali che si propagano verso l'esterno */
          float wave = sin(pow(t, 0.55) * 9.0 - uTime * 0.85) * 0.5 + 0.5;
          wave      *= pow(t, 1.2) * 0.10;

          vec3 col = vec3(0.18, 0.0, 0.55) * pulse
                   + vec3(0.10, 0.0, 0.35) * wave;
          gl_FragColor = vec4(col, (halo + wave) * pulse);
        }
      `,
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      side:        THREE.FrontSide,
    });
    this._shaderMats.push(mat);
    this.bodyGroup.add(new THREE.Mesh(geo, mat));
  }

  /* ── Interfaccia pianeta ── */
  getWorldPosition() {
    const v = new THREE.Vector3();
    this.bodyGroup.getWorldPosition(v);
    return v;
  }

  freezeOrbit()          { }
  unfreezeOrbit()        { }
  highlight(_on)         { }
  updateSunDirection(_s) { }

  update(time, _delta) {
    this.bodyGroup.rotation.y = time * this.rotSpeed;
    this._shaderMats.forEach(m => { m.uniforms.uTime.value = time; });
  }
}