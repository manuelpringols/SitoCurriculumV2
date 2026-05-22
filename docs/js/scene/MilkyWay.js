import * as THREE from 'three';

/**
 * MilkyWay — disco galattico inclinato sullo sfondo.
 *
 * Fix animazione: rimosso gl_PointSize variabile con z nella rotazione.
 * Le stelle della Via Lattea ora hanno dimensione stabile — nessuno
 * strobo visivo quando il disco ruota.
 * Rotazione galattica: time * 0.0008 (quasi ferma, come realtà).
 */
export class MilkyWay {
  constructor(scene, device) {
    this.scene  = scene;
    this.device = device;
    this._build();
  }

  _build() {
    const count = this.device.isMobile ? 4000 : 10000;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

    const palette = [
      new THREE.Color(0xffeebb),
      new THREE.Color(0xfff5e1),
      new THREE.Color(0xfffaf0),
      new THREE.Color(0xffd9a0),
      new THREE.Color(0xc8d0ff),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const u = Math.random();
      const r = Math.pow(u, 0.4) * 1300 + 200;

      const armOffset = Math.floor(Math.random() * 4) * (Math.PI * 0.5);
      const spiral    = (r / 1500) * Math.PI * 1.5;
      const theta     = Math.random() * Math.PI * 2 + armOffset + spiral;

      const thickness = 70 * Math.exp(-r / 1000);
      const yOff = (Math.random() - 0.5) * thickness * 2;

      positions[i3]     = Math.cos(theta) * r;
      positions[i3 + 1] = yOff;
      positions[i3 + 2] = Math.sin(theta) * r;

      const distNorm = r / 1500;
      const palIdx = distNorm < 0.3
        ? 0
        : distNorm < 0.55 ? 1
        : distNorm < 0.75 ? 2
        : Math.random() < 0.7 ? 3 : 4;
      const c = palette[palIdx];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;

      /* Dimensioni fisse — non dipendono da z per evitare strobo */
      const sizeBase = distNorm < 0.2 ? 1.4 : 0.5;
      sizes[i] = sizeBase + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        attribute vec3  aColor;
        attribute float aSize;
        varying vec3  vColor;
        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);

          /* Minimo 1.2px: sotto questa soglia WebGL causa sub-pixel
             flickering — la stella appare e sparisce ogni frame. */
          float dist = max(-mv.z, 1.0);
          float size = aSize * (220.0 / dist);
          gl_PointSize = max(size, 1.8);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(vColor, a * 0.50);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);

    this.points.rotation.x = Math.PI * 0.30;
    this.points.rotation.z = Math.PI * 0.18;
    this.points.position.y = -50;

    this.scene.add(this.points);
  }

  update(time) {
    if (this.points) {
      /* Rotazione galattica quasi impercettibile */
      this.points.rotation.y = time * 0.0008;
    }
  }
}