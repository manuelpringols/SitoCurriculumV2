import * as THREE from 'three';
import { ATMOSPHERE_VERT, ATMOSPHERE_FRAG } from '../shaders/chunks.js';

/**
 * Planet — classe base.
 * Le sottoclassi sovrascrivono _buildBody() per fornire shader propri.
 *
 * orbitFrozen: se true, il pianeta smette di orbitare ma continua
 * a ruotare su se stesso. Usato per il focus camera.
 */
export class Planet {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.name        = options.name        ?? 'Pianeta';
    this.radius      = options.radius      ?? 2;
    this.orbitRadius = options.orbitRadius ?? 30;
    this.orbitSpeed  = options.orbitSpeed  ?? 0.2;
    this.rotSpeed    = options.rotSpeed    ?? 0.4;
    this.inclination = options.inclination ?? 0;
    this.startAngle  = options.startAngle  ?? Math.random() * Math.PI * 2;
    this.segments    = options.segments    ?? 64;
    this.sectionKey  = options.sectionKey  ?? null;
    this.axialTilt   = options.axialTilt   ?? 0.0;

    this.atmosphereColor     = options.atmosphereColor     ?? null;
    this.atmosphereIntensity = options.atmosphereIntensity ?? 0.6;
    this.atmospherePower     = options.atmospherePower     ?? 2.5;
    this.atmosphereScale     = options.atmosphereScale     ?? 1.08;

    this._angle      = this.startAngle;
    this.orbitFrozen = false;
    this.options     = options;  // disponibile in _buildBody() delle sottoclassi   // ← freeze orbita senza fermare la rotazione

    this.orbitGroup = new THREE.Group();
    this.pivotGroup = new THREE.Group();
    this.bodyGroup  = new THREE.Group();
    this.spinGroup  = new THREE.Group();
    this.spinGroup.rotation.z = this.axialTilt;

    this.orbitGroup.rotation.x = this.inclination;
    this.orbitGroup.add(this.pivotGroup);
    this.pivotGroup.add(this.bodyGroup);
    this.bodyGroup.add(this.spinGroup);
    this.scene.add(this.orbitGroup);

    this._buildBody();
    this._buildAtmosphere();
  }

  /* ── Anello orbitale (opzionale) ── */
  _buildOrbitRing() {
    const pts = [];
    const seg = 128;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * this.orbitRadius, 0, Math.sin(a) * this.orbitRadius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 0x2a3a55, transparent: true, opacity: 0.22 });
    this.orbitRing = new THREE.Line(geo, mat);
    this.orbitGroup.add(this.orbitRing);
  }

  /* ── Corpo ── */
  _buildBody() {
    const geo = new THREE.SphereGeometry(this.radius, this.segments, this.segments);
    this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = this.name;
    this.spinGroup.add(this.mesh);
  }

  /* ── Atmosfera Fresnel ── */
  _buildAtmosphere() {
    if (!this.atmosphereColor) return;
    const geo = new THREE.SphereGeometry(this.radius * this.atmosphereScale, 48, 48);
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor:        { value: new THREE.Color(this.atmosphereColor) },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uIntensity:    { value: this.atmosphereIntensity },
        uPower:        { value: this.atmospherePower },
      },
      vertexShader:   ATMOSPHERE_VERT,
      fragmentShader: ATMOSPHERE_FRAG,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmosphereMesh = new THREE.Mesh(geo, this.atmosphereMaterial);
    this.bodyGroup.add(this.atmosphereMesh);
  }

  /* ── Sun direction ── */
  updateSunDirection(sunWorldPos) {
    const planetPos = this.getWorldPosition();
    const dir = new THREE.Vector3().subVectors(sunWorldPos, planetPos).normalize();
    if (this.material?.uniforms?.uSunDirection)
      this.material.uniforms.uSunDirection.value.copy(dir);
    if (this.atmosphereMaterial?.uniforms?.uSunDirection)
      this.atmosphereMaterial.uniforms.uSunDirection.value.copy(dir);
    if (this.cloudMaterial?.uniforms?.uSunDirection)
      this.cloudMaterial.uniforms.uSunDirection.value.copy(dir);
  }

  /* ── Update ── */
  update(time, delta = 0.016) {
    /*
     * Orbita: si aggiorna solo se non è frozen.
     * La rotazione assiale (spinGroup) continua sempre —
     * il pianeta ruota su se stesso anche quando agganciato dalla camera.
     */
    if (!this.orbitFrozen) {
      this._angle += this.orbitSpeed * delta * 0.6;
      const x = Math.cos(this._angle) * this.orbitRadius;
      const z = Math.sin(this._angle) * this.orbitRadius;
      this.bodyGroup.position.set(x, 0, z);
    }

    /* Rotazione assiale — sempre attiva */
    this.spinGroup.rotation.y += this.rotSpeed * delta * 0.6;

    if (this.material?.uniforms?.uTime)      this.material.uniforms.uTime.value = time;
    if (this.cloudMaterial?.uniforms?.uTime) this.cloudMaterial.uniforms.uTime.value = time;

    this._onUpdate?.(time, delta);
  }

  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);
    return pos;
  }

  /* ── Freeze / Unfreeze orbita ── */
  freezeOrbit()   { this.orbitFrozen = true;  }
  unfreezeOrbit() { this.orbitFrozen = false; }

  /* ── Highlight hover ── */
  highlight(on) {
    if (this.atmosphereMaterial?.uniforms?.uIntensity) {
      this.atmosphereMaterial.uniforms.uIntensity.value =
        on ? this.atmosphereIntensity * 1.8 : this.atmosphereIntensity;
    }
  }
}