import * as THREE from 'three';

/**
 * MilkyWay — disco galattico a 3 bracci spirali.
 * Colori aurora animati: zone discrete di colore che scorrono
 * lungo i bracci spirali nel tempo.
 */
export class MilkyWay {
  constructor(scene, device) {
    this.scene  = scene;
    this.device = device;
    this._build();
  }

  _build() {
    const count     = this.device.isMobile ? 24000 : 96000;
    const positions = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const u         = Math.random();
      const r         = Math.pow(u, 0.38) * 2500 + 1700;
      const armOffset = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3);
      const spiral    = (r / 4500) * Math.PI * 2.2;
      const scatter   = (Math.random() - 0.5) * 0.40;
      const theta     = Math.random() * Math.PI * 2 * 0.15
                        + armOffset + spiral + scatter;
      const thickness = 80 * Math.exp(-r / 2200);
      const yOff      = (Math.random() - 0.5) * thickness * 2;

      positions[i3]     = Math.cos(theta) * r;
      positions[i3 + 1] = yOff;
      positions[i3 + 2] = Math.sin(theta) * r;

      const distNorm = r / 4500;
      const sizeBase = distNorm < 0.15 ? 2.0 : 0.85;
      sizes[i] = sizeBase + Math.random() * 1.3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uBrightness: { value: this.device.isMobile ? 1.45 : 1.0 },
      },

      vertexShader: /* glsl */`
        attribute float aSize;
        varying float   vPhase;
        void main() {
          float angle  = atan(position.z, position.x);
          float radius = length(position.xz) / 4500.0;
          vPhase = angle + radius * 6.28318;

          vec4  mv   = modelViewMatrix * vec4(position, 1.0);
          float size = aSize * (1520.0 / -mv.z);
          gl_PointSize = max(size, 3.5);
          gl_Position  = projectionMatrix * mv;
        }
      `,

      fragmentShader: /* glsl */`
        varying float vPhase;
        uniform float uTime;
        uniform float uBrightness;

        void main() {
          vec2  uv = gl_PointCoord - 0.5;
          float r  = length(uv);
          if (r > 0.5) discard;

          /* Anti-aliasing bordo: fade smooth invece di taglio netto */
          float edgeFade = 1.0 - smoothstep(0.38, 0.50, r);

          vec2  n  = uv / max(r, 0.001);
          float c2 = n.x * n.x - n.y * n.y;
          float c4 = 2.0 * c2 * c2 - 1.0;
          float spike = pow(max(0.0, c4), 5.0);
          float arm   = spike * max(0.0, 1.0 - r * 1.7);
          float core  = exp(-r * r * 36.0);          /* era 45 → più morbido */
          float halo  = exp(-r * r * 7.0) * 0.15;   /* alone leggermente più ampio */

          /* ── Palette: canali dominanti ben separati, valori RAW bassi
             (ACES + bloom li amplifica — sopra 0.5 rischio bianco)      ── */
          vec3 cRed     = vec3(0.45, 0.02, 0.02);   /* rosso vivo    */
          vec3 cGreen   = vec3(0.02, 0.08, 0.38);   /* blu scuro     */
          vec3 cCyan    = vec3(0.02, 0.20, 0.42);   /* ciano freddo  */
          vec3 cPurple  = vec3(0.30, 0.02, 0.45);   /* viola         */
          vec3 cMagenta = vec3(0.45, 0.04, 0.30);   /* magenta       */

          /* Fase 0→1 che scorre lungo i bracci nel tempo.
             Zone di colore nette (transizione solo nel 4% di confine)   */
          float t = fract((uTime * 0.035 + vPhase) / 6.28318);
          float w = 0.04;

          vec3 col = cRed;
          col = mix(col, cGreen,   smoothstep(0.20-w, 0.20+w, t));
          col = mix(col, cCyan,    smoothstep(0.40-w, 0.40+w, t));
          col = mix(col, cPurple,  smoothstep(0.60-w, 0.60+w, t));
          col = mix(col, cMagenta, smoothstep(0.80-w, 0.80+w, t));
          /* t→1 torna a cRed (fract riporta a 0) → ciclo continuo      */

          float a = clamp(core + arm * 1.1 + halo, 0.0, 1.0) * 0.45 * uBrightness * edgeFade;
          gl_FragColor = vec4(col, a);
        }
      `,

      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, this.mat);
    this.points.rotation.x = Math.PI * 0.30;
    this.points.rotation.z = Math.PI * 0.18;
    this.points.position.y = -80;
    this.scene.add(this.points);
  }

  update(time) {
    if (this.points) {
      this.points.rotation.y        = time * 0.0015;
      this.mat.uniforms.uTime.value = time;
    }
  }
}