import * as THREE from 'three';

/**
 * MilkyWay — disco galattico a 3 bracci spirali.
 *
 * FIX flickering: aggiunto floor 3.0px su gl_PointSize.
 * Le stelle ai bordi del disco (r vicino a 4500) con aSize piccolo
 * scendevano sotto 1px → pop sub-pixel ad ogni frame di rotazione.
 */
export class MilkyWay {
  constructor(scene, device) {
    this.scene = scene;
    this.device = device;
    this._build();
  }

  _build() {
    const count = this.device.isMobile ? 22000 : 80000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

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
      const r = Math.pow(u, 0.38) * 2800 + 1800;
      const armOffset = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3);
      const spiral = (r / 4500) * Math.PI * 2.2;
      const scatter = (Math.random() - 0.5) * 0.55;
      const theta = Math.random() * Math.PI * 2 * 0.15
        + armOffset + spiral + scatter;

      const thickness = 80 * Math.exp(-r / 2200);
      const yOff = (Math.random() - 0.5) * thickness * 2;

      positions[i3] = Math.cos(theta) * r;
      positions[i3 + 1] = yOff;
      positions[i3 + 2] = Math.sin(theta) * r;

      const distNorm = r / 4500;
      const palIdx = distNorm < 0.25
        ? 0
        : distNorm < 0.50 ? 1
          : distNorm < 0.72 ? 2
            : Math.random() < 0.65 ? 3 : 4;
      const col = palette[palIdx];
      colors[i3] = col.r; colors[i3 + 1] = col.g; colors[i3 + 2] = col.b;

      const sizeBase = distNorm < 0.15 ? 1.8 : 0.7;
      sizes[i] = sizeBase + Math.random() * 1.1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        attribute vec3  aColor;
        attribute float aSize;
        varying vec3  vColor;
        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);

          /*
           * FIX: floor 3.0px — senza questo le stelle distanti (r~4500)
           * scendono sotto 1px e flicekrano ad ogni frame di rotazione.
           * Nessun blink sulla dimensione: scala solo con la distanza.
           */
          float size = aSize * (1400.0 / -mv.z);
          gl_PointSize = max(size, 3.0);

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
          gl_FragColor = vec4(vColor, a * 0.55);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.rotation.x = Math.PI * 0.30;
    this.points.rotation.z = Math.PI * 0.18;
    this.points.position.y = -80;
    this.scene.add(this.points);
  }

  update(time) {
    if (this.points) {
      this.points.rotation.y = time * 0.0015;
    }
  }
}