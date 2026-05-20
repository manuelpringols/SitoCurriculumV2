import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { DeviceManager } from './utils/DeviceManager.js';
import { Universe }      from './scene/Universe.js';
import { MilkyWay }      from './scene/MilkyWay.js';
import { Sun }           from './planets/Sun.js';
import { Earth }         from './planets/Earth.js';
import { Mars }          from './planets/Mars.js';
import { Saturn }        from './planets/Saturn.js';
import { Neptune }       from './planets/Neptune.js';
import { Jupiter }       from './planets/Jupiter.js';
import { Mercury }       from './planets/Mercury.js';
import { PostFX }        from './effects/PostFX.js';
import { SECTIONS }      from './data.js';

class App {
  constructor() {
    this.device    = new DeviceManager();
    this.planets   = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer   = new THREE.Vector2(-10, -10);
    this._hovered  = null;
    this._clock    = new THREE.Clock();

    this._init();
  }

  _init() {
    this._setupRenderer();
    this._setupCamera();
    this._setupControls();
    this._setupScene();
    this._setupPostFX();
    this._setupInteraction();
    this._setupResize();
    this._bootSequence();
    this._loop();
  }

  /* ═══════════════════════════════ RENDERER ═══════════════════════════ */

  _setupRenderer() {
    const canvas = document.getElementById('canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias:       this.device.antialias,
      powerPreference: this.device.isMobile ? 'low-power' : 'high-performance',
    });
    this.renderer.setPixelRatio(this.device.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = false; // bloom + shadows = lentezza inutile
  }

  /* ═══════════════════════════════ CAMERA ═════════════════════════════ */

  _setupCamera() {
    const fov = this.device.isMobile ? 72 : 56;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.camera.position.set(0, 50, this.device.isMobile ? 140 : 110);
  }

  _setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping    = true;
    this.controls.dampingFactor    = 0.045;
    this.controls.minDistance      = this.device.isMobile ? 30 : 20;
    this.controls.maxDistance      = this.device.isMobile ? 240 : 280;
    this.controls.autoRotate       = true;
    this.controls.autoRotateSpeed  = 0.15;
    this.controls.enablePan        = false;
    this.controls.maxPolarAngle    = Math.PI * 0.80;
    this.controls.minPolarAngle    = Math.PI * 0.12;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
  }

  /* ═══════════════════════════════ SCENA ═════════════════════════════ */

  _setupScene() {
    this.scene    = new THREE.Scene();
    this.universe = new Universe(this.scene, this.device);
    this.milkyWay = new MilkyWay(this.scene, this.device);
    this.sun      = new Sun(this.scene);
    this._spawnPlanets();
  }

  _spawnPlanets() {
    /* Definizione pianeti: classe + parametri orbita */
    const defs = [
      {
        Class: Earth,   key: 'chisono',
        name: SECTIONS.chisono.title,
        radius: 2.6, orbitRadius: 24, orbitSpeed: 0.30, rotSpeed: 0.40, inclination: 0.04,
      },
      {
        Class: Mars,    key: 'esperienze',
        name: SECTIONS.esperienze.title,
        radius: 2.0, orbitRadius: 36, orbitSpeed: 0.22, rotSpeed: 0.45, inclination: 0.07,
      },
      {
        Class: Saturn,  key: 'istruzione',
        name: SECTIONS.istruzione.title,
        radius: 2.8, orbitRadius: 50, orbitSpeed: 0.16, rotSpeed: 0.38, inclination: 0.03,
      },
      {
        Class: Neptune, key: 'competenze',
        name: SECTIONS.competenze.title,
        radius: 2.4, orbitRadius: 66, orbitSpeed: 0.11, rotSpeed: 0.42, inclination: 0.05,
      },
      {
        Class: Jupiter, key: 'devops',
        name: SECTIONS.devops.title,
        radius: 4.2, orbitRadius: 84, orbitSpeed: 0.075, rotSpeed: 0.55, inclination: 0.03,
      },
      {
        Class: Mercury, key: 'contatti',
        name: SECTIONS.contatti.title,
        radius: 1.5, orbitRadius: 100, orbitSpeed: 0.052, rotSpeed: 0.30, inclination: 0.02,
      },
    ];

    defs.forEach((def, i) => {
      const p = new def.Class(this.scene, {
        name:        def.name,
        radius:      def.radius,
        orbitRadius: def.orbitRadius,
        orbitSpeed:  def.orbitSpeed,
        rotSpeed:    def.rotSpeed,
        inclination: def.inclination,
        segments:    this.device.planetSegments,
        startAngle:  (i / defs.length) * Math.PI * 2,
        sectionKey:  def.key,
      });

      p.mesh.userData.sectionKey = def.key;
      p.mesh.userData.planetRef  = p;
      this.planets.push(p);
    });
  }

  /* ═══════════════════════════════ POST-FX ═══════════════════════════ */

  _setupPostFX() {
    this.postfx = new PostFX(this.renderer, this.scene, this.camera, this.device);
  }

  /* ═══════════════════════════════ INTERAZIONE ═══════════════════════ */

  _setupInteraction() {
    const canvas = this.renderer.domElement;

    window.addEventListener('mousemove', (e) => {
      this.pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    canvas.addEventListener('click', () => this._onClick());

    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      this.pointer.x =  (t.clientX / window.innerWidth)  * 2 - 1;
      this.pointer.y = -(t.clientY / window.innerHeight) * 2 + 1;
      this._onClick();
    }, { passive: true });
  }

  _onClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.planets.map(p => p.mesh);
    const hits   = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const key = hits[0].object.userData.sectionKey;
      if (key) {
        console.log('[Click] →', key);
        this._showLabel(SECTIONS[key]?.title ?? key);
        // TODO Step successivo: aprire pannello CV con anime.js
      }
    }
  }

  _checkHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.planets.map(p => p.mesh);
    const hits   = this.raycaster.intersectObjects(meshes, false);

    if (hits.length > 0) {
      const planet = hits[0].object.userData.planetRef;
      if (planet !== this._hovered) {
        this._hovered?.highlight(false);
        this._hovered = planet;
        planet.highlight(true);
        const k = hits[0].object.userData.sectionKey;
        this._showLabel(SECTIONS[k]?.title ?? '');
        document.body.style.cursor = 'pointer';
      }
    } else if (this._hovered) {
      this._hovered.highlight(false);
      this._hovered = null;
      this._hideLabel();
      document.body.style.cursor = 'default';
    }
  }

  _showLabel(name) {
    const el = document.getElementById('planet-label');
    document.getElementById('planet-name').textContent = name.toUpperCase();
    el.classList.remove('hidden');
  }
  _hideLabel() {
    document.getElementById('planet-label').classList.add('hidden');
  }

  /* ═══════════════════════════════ RESIZE ════════════════════════════ */

  _setupResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.postfx.setSize(w, h);
      this.device.refresh();
    });
  }

  /* ═══════════════════════════════ BOOT ══════════════════════════════ */

  _bootSequence() {
    setTimeout(() => {
      const loading = document.getElementById('loading-screen');
      loading.classList.add('fade-out');

      setTimeout(() => {
        loading.style.display = 'none';

        anime({
          targets: '#title-block',
          opacity: [0, 1],
          translateY: [-24, 0],
          duration: 1700,
          easing: 'easeOutQuart',
        });
        anime({
          targets: '#hint-block',
          opacity: [0, 0.85],
          duration: 2000,
          delay: 1100,
          easing: 'easeOutCubic',
        });
      }, 900);
    }, 1500);
  }

  /* ═══════════════════════════════ LOOP ══════════════════════════════ */

  _loop() {
    requestAnimationFrame(() => this._loop());

    const delta = Math.min(this._clock.getDelta(), 0.05);
    const time  = this._clock.elapsedTime;

    this.universe.update(time);
    this.milkyWay.update(time);
    this.sun.update(time);

    /* Aggiorna pianeti + direzione sole */
    const sunPos = this.sun.getWorldPosition();
    this.planets.forEach(p => {
      p.update(time, delta);
      p.updateSunDirection(sunPos);
    });

    if (!this.device.isMobile) this._checkHover();

    this.controls.update();
    this.postfx.render();
  }
}

new App();
