import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { DeviceManager } from './utils/DeviceManager.js';
import { Universe } from './scene/Universe.js';
import { MilkyWay } from './scene/MilkyWay.js';
import { Sun } from './planets/Sun.js';
import { Earth } from './planets/Earth.js';
import { Mars } from './planets/Mars.js';
import { Saturn } from './planets/Saturn.js';
import { Neptune } from './planets/Neptune.js';
import { Jupiter } from './planets/Jupiter.js';
import { Mercury } from './planets/Mercury.js';
import { PostFX } from './effects/PostFX.js';
import { SECTIONS } from './data.js';
import { PANEL_DATA } from './panelData.js';
import { Singularity } from './planets/Singularity.js';
class App {
  constructor() {
    this.device = new DeviceManager();
    this.planets = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-10, -10);
    this._hovered = null;
    this._clock = new THREE.Clock();
    this._lockedPlanet = null;
    this._zooming = false;
    this._glitch = null;
    this._booting = true;
    this._mouseX = 0;
    this._mouseY = 0;
    this._onSun = false;

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
    this._setupGlitch();
    this._bootSequence();
    this._loop();
  }

  /* ══════════════════════════════ RENDERER ═══════════════════════════ */
  _setupRenderer() {
    if (this.device.isMobile) {
      const cur = document.getElementById('cursor');
      if (cur) cur.style.display = 'none';
    }

    const canvas = document.getElementById('canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.device.antialias,
      powerPreference: this.device.isMobile ? 'low-power' : 'high-performance',
    });
    this.renderer.setPixelRatio(this.device.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.60;
    this.renderer.shadowMap.enabled = false;
  }

  /* ══════════════════════════════ CAMERA ══════════════════════════════ */
  _setupCamera() {
    const fov = this.device.isMobile ? 72 : 56;
    this.camera = new THREE.PerspectiveCamera(
      fov, window.innerWidth / window.innerHeight, 0.1, 30000
    );
    this.camera.position.set(0, 300, this.device.isMobile ? 1670 : 1340);
  }

  _setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.minDistance = this.device.isMobile ? 60 : 50;
    this.controls.maxDistance = this.device.isMobile ? 3200 : 3800;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.15;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.6;
    this.controls.screenSpacePanning = false;
    this.controls.maxTargetRadius = 120;
    this.controls.minPolarAngle = Math.PI * 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.95;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
  }

  /* ══════════════════════════════ SCENA ═══════════════════════════════ */
  _setupScene() {
    this.scene = new THREE.Scene();
    this.universe = new Universe(this.scene, this.device);
    this.milkyWay = new MilkyWay(this.scene, this.device);
    this.sun = new Sun(this.scene);
    this._spawnPlanets();
  }

  _spawnPlanets() {
    const defs = [
      {
        Class: Earth, key: 'chisono', name: SECTIONS.chisono.title,
        radius: 36, orbitRadius: 510, orbitSpeed: 0.28, rotSpeed: 0.40, inclination: 0.04
      },
      {
        Class: Mars, key: 'esperienze', name: SECTIONS.esperienze.title,
        radius: 40, orbitRadius: 660, orbitSpeed: 0.20, rotSpeed: 0.45, inclination: 0.07
      },
      {
        Class: Saturn, key: 'istruzione', name: SECTIONS.istruzione.title,
        radius: 52, orbitRadius: 900, orbitSpeed: 0.14, rotSpeed: 0.38, inclination: 0.03
      },
      {
        Class: Neptune, key: 'competenze', name: SECTIONS.competenze.title,
        radius: 46, orbitRadius: 1150, orbitSpeed: 0.09, rotSpeed: 0.42, inclination: 0.05
      },
      {
        Class: Jupiter, key: 'devops', name: SECTIONS.devops.title,
        radius: 56, orbitRadius: 1330, orbitSpeed: 0.065, rotSpeed: 0.55, inclination: 0.03
      },
      {
        Class: Mercury, key: 'contatti', name: SECTIONS.contatti.title,
        radius: 26, orbitRadius: 1490, orbitSpeed: 0.045, rotSpeed: 0.30, inclination: 0.02
      },
      {
        Class: Singularity, key: 'singularity', name: 'Genesi',
        radius: 28, rotSpeed: 0.04
      },
    ];

    const hud = document.getElementById('hud');

    defs.forEach((def, i) => {
      const p = new def.Class(this.scene, {
        name: def.name, radius: def.radius, orbitRadius: def.orbitRadius,
        orbitSpeed: def.orbitSpeed, rotSpeed: def.rotSpeed, inclination: def.inclination,
        segments: this.device.planetSegments,
        startAngle: (i / defs.length) * Math.PI * 2,
        sectionKey: def.key,
      });
      p.mesh.userData.sectionKey = def.key;
      p.mesh.userData.planetRef = p;
      this.planets.push(p);

      // ── Label sempre visibile per questo pianeta ──
      const section = SECTIONS[def.key] ?? {};
      const tag = document.createElement('div');
      tag.className = 'planet-tag';
      tag.innerHTML = `
        <span class="planet-tag-name">${(section.planet ?? '').toUpperCase()}</span>
        <span class="planet-tag-section">${(section.title ?? '').toUpperCase()}</span>
      `;
      hud.appendChild(tag);
      p._tag = tag;
    });
  }

  /* ══════════════════════════════ POST-FX ══════════════════════════════ */
  _setupPostFX() {
    this.postfx = new PostFX(this.renderer, this.scene, this.camera, this.device);
  }

  /* ══════════════════════════════ ZOOM SU PIANETA ══════════════════════ */

  _zoomToPlanet(planet) {
    if (this._zooming) return;
    this._zooming = true;

    this.controls.enabled = false;
    this.controls.autoRotate = false;
    this._hideLabel();

    planet.freezeOrbit();

    planet._scaleTarget = 1.0;
    planet._scaleCurrent = 1.0;
    planet.bodyGroup.scale.setScalar(1.0);

    this.controls.autoRotate = false;
    this.controls.update();

    anime.remove('#title-block');
    anime({
      targets: '#title-block',
      opacity: 0,
      translateY: -20,
      duration: 400,
      easing: 'easeInCubic',
    });

    anime.remove('#hint-block');
    anime({
      targets: '#hint-block',
      opacity: 0,
      translateX: '-50%',
      translateY: 10,
      duration: 300,
      easing: 'easeInCubic',
      complete: () => {
        const h = document.getElementById('hint-block');
        if (h) h.style.pointerEvents = 'none';
      },
    });

    const planetPos = planet.getWorldPosition();
    const zoomDist = planet.radius * 4.5;

    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, planetPos)
      .normalize();

    const endCamPos = new THREE.Vector3()
      .copy(planetPos)
      .addScaledVector(dir, zoomDist);

    const camProxy = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };
    const tgtProxy = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z,
    };

    anime({
      targets: camProxy,
      x: endCamPos.x, y: endCamPos.y, z: endCamPos.z,
      duration: 1600,
      easing: 'easeInOutQuart',
      update: () => {
        this.camera.position.set(camProxy.x, camProxy.y, camProxy.z);
      },
    });

    anime({
      targets: tgtProxy,
      x: planetPos.x, y: planetPos.y, z: planetPos.z,
      duration: 1600,
      easing: 'easeInOutQuart',
      update: () => {
        this.controls.target.set(tgtProxy.x, tgtProxy.y, tgtProxy.z);
        this.camera.lookAt(tgtProxy.x, tgtProxy.y, tgtProxy.z);
      },
      complete: () => {
        this._lockedPlanet = planet;
        this._zooming = false;
        this._showBackHint();

        const k = planet.mesh.userData.sectionKey;
        setTimeout(() => this._openPanel(k), 180);
      },
    });
  }

  _returnToFree() {
    if (this._zooming) return;
    this._zooming = true;

    if (this._lockedPlanet) this._lockedPlanet.unfreezeOrbit();

    this._lockedPlanet = null;
    this._hideLabel();
    this._hideBackHint();
    this._closePanel();

    anime.remove('#title-block');
    anime({
      targets: '#title-block',
      opacity: 1,
      translateY: 0,
      duration: 700,
      easing: 'easeOutCubic',
    });

    anime.remove('#hint-block');
    const hintEl = document.getElementById('hint-block');
    if (hintEl) hintEl.style.pointerEvents = '';
    anime({
      targets: '#hint-block',
      opacity: 0.85,
      translateX: '-50%',
      translateY: 0,
      duration: 800,
      delay: 400,
      easing: 'easeOutCubic',
    });

    const startCamPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const endCamPos = new THREE.Vector3(0, 300, this.device.isMobile ? 1670 : 1340);

    const camProxy = { x: startCamPos.x, y: startCamPos.y, z: startCamPos.z };
    const tgtProxy = { x: startTarget.x, y: startTarget.y, z: startTarget.z };

    anime({
      targets: camProxy,
      x: endCamPos.x, y: endCamPos.y, z: endCamPos.z,
      duration: 1400,
      easing: 'easeInOutQuart',
      update: () => {
        this.camera.position.set(camProxy.x, camProxy.y, camProxy.z);
      },
    });

    anime({
      targets: tgtProxy,
      x: 0, y: 0, z: 0,
      duration: 1400,
      easing: 'easeInOutQuart',
      update: () => {
        this.controls.target.set(tgtProxy.x, tgtProxy.y, tgtProxy.z);
        this.camera.lookAt(tgtProxy.x, tgtProxy.y, tgtProxy.z);
      },
      complete: () => {
        this.controls.enabled = true;
        this.controls.autoRotate = true;
        this._zooming = false;
      },
    });
  }

  /* ══════════════════════════════ LABEL IN SCREEN SPACE ════════════════ */

  _updateLockedCamera() {
    if (!this._lockedPlanet || this._zooming) return;
    const planetPos = this._lockedPlanet.getWorldPosition();
    this.camera.lookAt(planetPos);
  }

  _updateLockedLabel() {
    if (!this._lockedPlanet) return;

    const planet = this._lockedPlanet;
    const planetPos = planet.getWorldPosition();

    const abovePos = planetPos.clone();
    abovePos.y += planet.radius * 1.5;

    const projected = abovePos.clone().project(this.camera);
    if (projected.z > 1) return;

    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.getElementById('planet-label');
    const key = planet.mesh.userData.sectionKey;

    this._setLabelText(key);
    el.classList.remove('hidden');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = 'translate(-50%, -100%)';
  }

  /* ══════════════════════════════ PLANET TAGS (sempre visibili) ════════ */

  _updatePlanetTags() {
    const hide = !!(this._lockedPlanet || this._zooming);

    this.planets.forEach(p => {
      if (!p._tag) return;

      if (hide) {
        p._tag.classList.add('planet-tag--hidden');
        return;
      }

      const planetPos = p.getWorldPosition();
      const abovePos = planetPos.clone();
      abovePos.y += p.radius * 2.2;

      const projected = abovePos.clone().project(this.camera);

      if (projected.z > 1) {
        p._tag.classList.add('planet-tag--hidden');
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

      p._tag.style.left = `${x}px`;
      p._tag.style.top = `${y}px`;
      p._tag.classList.remove('planet-tag--hidden');
      p._tag.classList.toggle('planet-tag--active', p === this._hovered);
    });
  }

  /* ══════════════════════════════ HUD HINTS ════════════════════════════ */

  _showBackHint() {
    const el = document.getElementById('back-hint');
    if (!el) return;
    el.classList.remove('hidden');
    anime({ targets: el, opacity: [0, 1], duration: 500, easing: 'easeOutCubic' });
  }
  _hideBackHint() {
    const el = document.getElementById('back-hint');
    if (!el) return;
    anime({
      targets: el, opacity: [1, 0], duration: 300, easing: 'easeInCubic',
      complete: () => el.classList.add('hidden'),
    });
  }

  /* ══════════════════════════════ GLITCHIUM ══════════════════════════ */

  _setupGlitch() {
    if (typeof Glitchium === 'undefined') return;
    this._glitch = new Glitchium();
    this._bodyCtrl = null;
  }

  _glitchMainPanel() { /* no-op */ }

  /* ══════════════════════════════ SCRAMBLE TEXT ═══════════════════════ */

  _scramble(el, finalText, duration = 450, density = 1.0, onComplete = null) {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@!%&';
    const FPS = 30;
    const steps = Math.round((duration / 1000) * FPS);
    let step = 0;

    const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    const tick = () => {
      if (step > steps) {
        el.textContent = finalText;
        el.innerHTML = el.innerHTML.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        if (onComplete) onComplete(el);
        return;
      }

      const progress = step / steps;
      const revealed = Math.floor(progress * finalText.length);

      el.textContent = finalText.split('').map((ch, i) => {
        if (i < revealed) return ch;
        if (ch === ' ' || ch === '') return ch;
        if (Math.random() > density) return ch;
        return rnd();
      }).join('');

      step++;
      setTimeout(tick, 1000 / FPS);
    };

    tick();
  }

  _initBodyGlitch() {
    if (!this._glitch || this._bodyCtrl) return;
    try {
      this._bodyCtrl = this._glitch.glitch('#detail-body', {
        playMode: 'manual',
        intensity: 0.60,
        fps: 24,
        layers: 6,
        smoothTransitions: true,
        glitchFrequency: 8,
        shake: false,
        hideOverflow: true,
        slice: { minHeight: 0.01, maxHeight: 0.20, hueRotate: false },
      });
    } catch (e) { console.warn('[Glitchium body]', e); }
  }

  _glitchDetailPanel() {
    if (!this._glitch) return;
    this._initBodyGlitch();
    if (this._bodyCtrl) {
      try {
        this._bodyCtrl.start();
        setTimeout(() => { try { this._bodyCtrl.stop(); } catch (e) { } }, 600);
      } catch (e) { console.warn('[Glitchium body start]', e); }
    }
  }

  /* ══════════════════════════════ CONTENT PANEL ══════════════════════ */

  _openPanel(sectionKey) {
    const section = SECTIONS[sectionKey];
    const data = PANEL_DATA[sectionKey];
    if (!section || !data) return;

    const panel = document.getElementById('content-panel');
    panel.classList.remove('hidden', 'closing', 'nav-hidden');
    panel.style.opacity = '';
    panel.style.transform = '';

    document.getElementById('panel-planet-name').textContent =
      (section.planet ?? '').toUpperCase();
    document.getElementById('panel-section-title').textContent =
      (section.title ?? '').toUpperCase();

    const body = document.getElementById('panel-body');
    body.innerHTML = `
      <div id="panel-tabs">
        ${data.tabs.map((t, i) =>
      `<button class="p-tab${i === 0 ? ' active' : ''}" data-tab="${i}">${t.label}</button>`
    ).join('')}
      </div>
      <div class="p-content-area"></div>
    `;

    this._renderSubitems(body, data, 0);

    body.querySelectorAll('.p-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.p-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const idx = parseInt(btn.dataset.tab);
        this._animateContent(body, () => {
          this._renderSubitems(body, data, idx);
          this._glitchMainPanel();
        });
      });
    });

    void panel.offsetWidth;
    panel.classList.add('opening');
    this._glitchMainPanel();
  }

  _renderSubitems(body, data, tabIdx) {
    const area = body.querySelector('.p-content-area');
    const items = data.tabs[tabIdx].items;

    area.innerHTML = items.map((item, i) => `
      <div class="p-subitem" data-item="${i}" style="animation-delay:${i * 0.06}s">
        <span class="p-subitem-title"></span>
        <span class="p-subitem-arrow">›</span>
      </div>
    `).join('');

    area.querySelectorAll('.p-subitem-title').forEach((el, i) => {
      setTimeout(() => this._scramble(el, items[i].title, 360, 0.80), i * 75);
    });

    area.querySelectorAll('.p-subitem').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.item);
        this._animateContent(body,
          () => this._renderDetail(body, data, tabIdx, items[idx]));
      });
    });
  }

  _renderDetail(body, data, tabIdx, item) {
    this._openDetailPanel(item, () => {
      this._closeDetailPanel();
    });
  }

  /* ── Pannello dettaglio sinistro ── */
  _openDetailPanel(item, onBack) {
    const panel = document.getElementById('detail-panel');
    const titleEl = document.getElementById('detail-title');
    const bodyEl = document.getElementById('detail-body');
    const isOpen = !panel.classList.contains('hidden');

    const wireBack = () => {
      const backBtn = document.getElementById('detail-back');
      const newBack = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(newBack, backBtn);
      newBack.addEventListener('click', onBack);
    };

    const doScramble = () => {
      this._scramble(titleEl, item.title.toUpperCase(), 420, 1.0);
      setTimeout(() => this._scramble(bodyEl, item.body, 520, 0.75, (el) => {
        if (window.twemoji) twemoji.parse(el);
      }), 130);
    };

    const openDetail = () => {
      if (!isOpen) {
        panel.classList.remove('hidden', 'closing');
        panel.style.clipPath = 'inset(0% 0 0% 0)';
        panel.style.opacity = '0';
        panel.style.transition = 'opacity 0.25s ease';
        titleEl.textContent = '';
        bodyEl.textContent = '';
        wireBack();
        void panel.offsetWidth;
        panel.style.opacity = '1';
        setTimeout(doScramble, 270);

      } else {
        this._initBodyGlitch();
        if (this._bodyCtrl) try { this._bodyCtrl.start(); } catch (e) { }

        setTimeout(() => {
          titleEl.textContent = '';
          bodyEl.textContent = '';
          wireBack();
          const sl = document.getElementById('detail-scanline');
          sl.style.animation = 'none';
          void sl.offsetWidth;
          sl.style.animation = 'detail-scan 0.35s linear forwards';
        }, 220);

        setTimeout(() => {
          if (this._bodyCtrl) try { this._bodyCtrl.stop(); } catch (e) { }
          doScramble();
        }, 660);
      }
    };

    if (this.device.isMobile) {
      const nav = document.getElementById('content-panel');
      const alreadyHidden = !nav || nav.classList.contains('nav-hidden');

      if (!alreadyHidden) {
        anime.remove('#title-block');
        anime({
          targets: '#title-block',
          opacity: 0,
          translateY: -16,
          duration: 220,
          easing: 'easeInCubic',
        });

        anime.remove(nav);
        anime({
          targets: nav,
          opacity: 0,
          translateY: 18,
          duration: 240,
          easing: 'easeInCubic',
          complete: () => {
            nav.style.pointerEvents = 'none';
            nav.classList.add('nav-hidden');
            openDetail();
          },
        });
      } else {
        openDetail();
      }

    } else {
      openDetail();
    }
  }

  _closeDetailPanel(restoreNav = true) {
    const panel = document.getElementById('detail-panel');
    if (panel.classList.contains('hidden')) return;
    panel.classList.remove('opening');
    panel.classList.add('closing');
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('closing');
    }, 270);

    if (restoreNav && this.device.isMobile) {
      const nav = document.getElementById('content-panel');
      if (!nav) return;
      nav.classList.remove('nav-hidden');
      nav.style.pointerEvents = '';
      nav.style.opacity = '0';
      nav.style.transform = 'translateY(18px)';
      anime.remove(nav);
      anime({
        targets: nav,
        opacity: 1,
        translateY: 0,
        duration: 320,
        delay: 120,
        easing: 'easeOutCubic',
      });
    }
  }

  _animateContent(body, renderFn) {
    const area = body.querySelector('.p-content-area');
    area.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    area.style.opacity = '0';
    area.style.transform = 'translateX(8px)';
    setTimeout(() => {
      renderFn();
      area.style.transform = 'translateX(-8px)';
      requestAnimationFrame(() => {
        area.style.opacity = '1';
        area.style.transform = 'translateX(0)';
      });
    }, 160);
  }

  _closePanel() {
    this._closeDetailPanel(false);
    const panel = document.getElementById('content-panel');
    if (panel.classList.contains('hidden')) return;
    panel.classList.remove('nav-hidden');
    panel.style.opacity = '';
    panel.style.transform = '';
    panel.classList.remove('opening');
    panel.classList.add('closing');
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('closing');
    }, 300);
  }

  /* ══════════════════════════════ INTERAZIONE ═════════════════════════ */

  _setupInteraction() {
    const canvas = this.renderer.domElement;

    window.addEventListener('mousemove', (e) => {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    canvas.addEventListener('click', () => this._onClick());

    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      this.pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(t.clientY / window.innerHeight) * 2 + 1;
      this._onClick();
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._returnToFree();
    });

    document.getElementById('back-hint')
      ?.addEventListener('click', () => this._returnToFree());

    document.getElementById('panel-close')
      ?.addEventListener('click', () => this._returnToFree());
  }

  _onClick() {
    if (this._booting) return;
    if (this._zooming) return;

    if (this._lockedPlanet) {
      if (this.device.isMobile) this._returnToFree();
      return;
    }

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets.map(p => p.mesh), false);

    if (hits.length > 0) {
      const planet = hits[0].object.userData.planetRef;
      if (planet) this._zoomToPlanet(planet);
    }
  }

  _checkHover() {
    if (this._booting || this._lockedPlanet || this._zooming) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets.map(p => p.mesh), false);

    if (hits.length > 0) {
      const planet = hits[0].object.userData.planetRef;
      if (planet !== this._hovered) {
        this._hovered?.highlight(false);
        this._hovered = planet;
        planet.highlight(true);
        document.body.style.cursor = 'pointer';
      }
    } else if (this._hovered) {
      this._hovered.highlight(false);
      this._hovered = null;
      document.body.style.cursor = 'default';
    }
  }

  _setLabelText(sectionKey) {
    const section = SECTIONS[sectionKey] ?? {};
    document.getElementById('planet-name').textContent =
      (section.planet ?? '').toUpperCase();
    document.getElementById('planet-category').textContent =
      (section.title ?? '').toUpperCase();
  }

  _showFloatingLabel(sectionKey, planet) {
    const planetPos = planet.getWorldPosition();
    const abovePos = planetPos.clone();
    abovePos.y += planet.radius * 1.5;

    const projected = abovePos.clone().project(this.camera);
    if (projected.z > 1) return;

    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.getElementById('planet-label');
    this._setLabelText(sectionKey);
    el.classList.remove('hidden');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = 'translate(-50%, -100%)';
  }

  _updateHoverLabel() {
    if (!this._hovered || this._lockedPlanet || this._zooming) return;
    const planet = this._hovered;
    const planetPos = planet.getWorldPosition();
    const abovePos = planetPos.clone();
    abovePos.y += planet.radius * 1.5;
    const projected = abovePos.clone().project(this.camera);
    if (projected.z > 1) return;
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    const el = document.getElementById('planet-label');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = 'translate(-50%, -100%)';
  }

  _hideLabel() {
    document.getElementById('planet-label')?.classList.add('hidden');
  }

  /* ══════════════════════════════ RESIZE ═══════════════════════════════ */

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

  /* ══════════════════════════════ BOOT ════════════════════════════════ */

  _bootSequence() {
    setTimeout(() => {
      const loading = document.getElementById('loading-screen');
      loading.classList.add('fade-out');
      setTimeout(() => {
        loading.style.display = 'none';
        anime({
          targets: '#title-block',
          opacity: [0, 1], translateY: [-24, 0],
          duration: 1700, easing: 'easeOutQuart',
          complete: () => { this._booting = false; },
        });
        anime({
          targets: '#hint-block',
          opacity: [0, 0.85],
          duration: 2000, delay: 1100,
          easing: 'easeOutCubic',
        });
      }, 900);
    }, 1500);
  }

  /* ══════════════════════════════ CURSORE ════════════════════════════ */

  _updateCursor() {
    const el = document.getElementById('cursor');
    if (!el || this.device.isMobile) return;

    el.style.transform = `translate(${this._mouseX}px, ${this._mouseY}px)`;

    if (this._lockedPlanet || this._zooming) {
      el.classList.remove('on-sun', 'on-planet');
      return;
    }

    const projected = new THREE.Vector3(0, 0, 0).project(this.camera);
    const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    const edgePx = new THREE.Vector3(200, 0, 0).project(this.camera);
    const ex = (edgePx.x * 0.5 + 0.5) * window.innerWidth;
    const sunR = Math.abs(ex - sx);
    const onSun = Math.hypot(this._mouseX - sx, this._mouseY - sy) < sunR;

    const onPlanet = !onSun && this._hovered !== null;
    const planetColor = onPlanet && this._hovered?.atmosphereColor
      ? '#' + this._hovered.atmosphereColor.toString(16).padStart(6, '0')
      : null;

    const wasOnSun = el.classList.contains('on-sun');
    const wasOnPlanet = el.classList.contains('on-planet');

    if (onSun !== wasOnSun || onPlanet !== wasOnPlanet) {
      el.classList.toggle('on-sun', onSun);
      el.classList.toggle('on-planet', onPlanet);
      if (onPlanet && planetColor) {
        el.style.setProperty('--planet-color', planetColor);
      }
    }
  }

  /* ══════════════════════════════ LOOP ════════════════════════════════ */

  _loop() {
    requestAnimationFrame(() => this._loop());

    const delta = Math.min(this._clock.getDelta(), 0.05);
    const time = this._clock.elapsedTime;

    this.universe.update(time);
    this.milkyWay.update(time);
    this.sun.update(time);

    const sunPos = this.sun.getWorldPosition();
    this.planets.forEach(p => {
      p.update(time, delta);
      p.updateSunDirection(sunPos);
    });

    if (this._lockedPlanet) {
      this._updateLockedCamera();
      this._updateLockedLabel();
    }

    // Planet tags: sempre aggiornati (desktop e mobile)
    this._updatePlanetTags();

    if (!this.device.isMobile) {
      this._checkHover();
      this._updateHoverLabel();
      this._updateCursor();
    }

    if (!this._zooming && !this._lockedPlanet) this.controls.update();

    this.postfx.render();
  }
}

new App();