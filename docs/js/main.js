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
import { PANEL_DATA }    from './panelData.js';

class App {
  constructor() {
    this.device        = new DeviceManager();
    this.planets       = [];
    this.raycaster     = new THREE.Raycaster();
    this.pointer       = new THREE.Vector2(-10, -10);
    this._hovered      = null;
    this._clock        = new THREE.Clock();
    this._lockedPlanet = null;   // pianeta su cui siamo zoomati
    this._zooming      = false;  // transizione in corso
    this._glitch       = null;   // Glitchium instance
    this._booting      = true;   // blocca input durante il boot

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
    const canvas = document.getElementById('canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias:       this.device.antialias,
      powerPreference: this.device.isMobile ? 'low-power' : 'high-performance',
    });
    this.renderer.setPixelRatio(this.device.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.shadowMap.enabled   = false;
  }

  /* ══════════════════════════════ CAMERA ══════════════════════════════ */
  _setupCamera() {
    const fov = this.device.isMobile ? 72 : 56;
    this.camera = new THREE.PerspectiveCamera(
      fov, window.innerWidth / window.innerHeight, 0.1, 12000
    );
    this.camera.position.set(0, 120, this.device.isMobile ? 520 : 420);
  }

  _setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping      = true;
    this.controls.dampingFactor      = 0.055;
    this.controls.minDistance        = this.device.isMobile ? 60 : 50;
    this.controls.maxDistance      = this.device.isMobile ? 1050 : 1150;
    this.controls.autoRotate         = true;
    this.controls.autoRotateSpeed    = 0.15;
    this.controls.enablePan          = true;
    this.controls.panSpeed           = 0.6;
    this.controls.screenSpacePanning = false;
    this.controls.maxTargetRadius    = 120;
    this.controls.minPolarAngle      = Math.PI * 0.05;
    this.controls.maxPolarAngle      = Math.PI * 0.95;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
  }

  /* ══════════════════════════════ SCENA ═══════════════════════════════ */
  _setupScene() {
    this.scene    = new THREE.Scene();
    this.universe = new Universe(this.scene, this.device);
    this.milkyWay = new MilkyWay(this.scene, this.device);
    this.sun      = new Sun(this.scene);
    this._spawnPlanets();
  }

  _spawnPlanets() {
    /*
     * Orbite allargate per uno zoom drammatico e leggibile.
     * Gap verificati: ogni distanza > r_eff_A + r_B + 28 (margine).
     *   Earth  orbit=160   Mars  orbit=268   Saturn orbit=410
     *   Neptune orbit=554  Jupiter orbit=672  Mercury orbit=782
     */
    const defs = [
      { Class: Earth,   key: 'chisono',    name: SECTIONS.chisono.title,
        radius: 14, orbitRadius: 160,  orbitSpeed: 0.28, rotSpeed: 0.40, inclination: 0.04 },
      { Class: Mars,    key: 'esperienze', name: SECTIONS.esperienze.title,
        radius: 16, orbitRadius: 268,  orbitSpeed: 0.20, rotSpeed: 0.45, inclination: 0.07 },
      { Class: Saturn,  key: 'istruzione', name: SECTIONS.istruzione.title,
        radius: 20, orbitRadius: 410,  orbitSpeed: 0.14, rotSpeed: 0.38, inclination: 0.03 },
      { Class: Neptune, key: 'competenze', name: SECTIONS.competenze.title,
        radius: 18, orbitRadius: 554,  orbitSpeed: 0.09, rotSpeed: 0.42, inclination: 0.05 },
      { Class: Jupiter, key: 'devops',     name: SECTIONS.devops.title,
        radius: 22, orbitRadius: 672,  orbitSpeed: 0.065, rotSpeed: 0.55, inclination: 0.03 },
      { Class: Mercury, key: 'contatti',   name: SECTIONS.contatti.title,
        radius: 10, orbitRadius: 782,  orbitSpeed: 0.045, rotSpeed: 0.30, inclination: 0.02 },
    ];

    defs.forEach((def, i) => {
      const p = new def.Class(this.scene, {
        name: def.name, radius: def.radius, orbitRadius: def.orbitRadius,
        orbitSpeed: def.orbitSpeed, rotSpeed: def.rotSpeed, inclination: def.inclination,
        segments: this.device.planetSegments,
        startAngle: (i / defs.length) * Math.PI * 2,
        sectionKey: def.key,
      });
      p.mesh.userData.sectionKey = def.key;
      p.mesh.userData.planetRef  = p;
      this.planets.push(p);
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

    this.controls.enabled    = false;
    this.controls.autoRotate = false;
    this._hideLabel();

    /* Blocca l'orbita subito — posizione fissa per tutta la transizione */
    planet.freezeOrbit();

    /* Drena la velocità accumulata da autoRotate in OrbitControls
       chiamando update() una volta prima di disabilitarlo */
    this.controls.autoRotate = false;
    this.controls.update();

    /* Ferma qualsiasi animazione in corso sul titolo (es. boot sequence)
       poi lo nasconde da qualunque stato si trovi */
    anime.remove('#title-block');
    anime({
      targets: '#title-block',
      opacity:    0,
      translateY: -20,
      duration:   400,
      easing:     'easeInCubic',
    });

    const planetPos = planet.getWorldPosition();
    const zoomDist  = planet.radius * 4.5;

    /* Direzione attuale camera → pianeta per mantenere l'angolo di vista */
    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, planetPos)
      .normalize();

    const endCamPos = new THREE.Vector3()
      .copy(planetPos)
      .addScaledVector(dir, zoomDist);

    /*
     * Interpoliamo manualmente con proxy plain objects.
     * Il callback update() aggiorna camera.position E camera.lookAt()
     * ogni frame — controls.update() è skippato durante lo zoom
     * per evitare che ricalcoli la camera sul target (0,0,0).
     */
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
        /* Forziamo la camera a guardare il pianeta ad ogni frame */
        this.camera.lookAt(tgtProxy.x, tgtProxy.y, tgtProxy.z);
      },
      complete: () => {
        this._lockedPlanet = planet;
        this._zooming      = false;
        this._showBackHint();

        /* Apri pannello contenuto con leggero ritardo drammatico */
        const k = planet.mesh.userData.sectionKey;
        setTimeout(() => this._openPanel(k), 180);
      },
    });
  }

  _returnToFree() {
    if (this._zooming) return;
    this._zooming = true;

    /* Riprende l'orbita dal punto in cui era stata fermata */
    if (this._lockedPlanet) this._lockedPlanet.unfreezeOrbit();

    this._lockedPlanet = null;
    this._hideLabel();
    this._hideBackHint();
    this._closePanel();

    /* Riporta il titolo visibile da qualunque stato */
    anime.remove('#title-block');
    anime({
      targets: '#title-block',
      opacity:    1,
      translateY: 0,
      duration:   700,
      easing:     'easeOutCubic',
    });

    const startCamPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const endCamPos   = new THREE.Vector3(0, 120, this.device.isMobile ? 520 : 420);

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
        this.controls.enabled    = true;
        this.controls.autoRotate = true;
        this._zooming = false;
      },
    });
  }

  /* ══════════════════════════════ LABEL IN SCREEN SPACE ════════════════ */

  /**
   * Posiziona il label sopra il pianeta in coordinate 2D.
   * Viene chiamato ogni frame quando _lockedPlanet è attivo.
   */
  _updateLockedCamera() {
    if (!this._lockedPlanet || this._zooming) return;

    const planetPos = this._lockedPlanet.getWorldPosition();

    /* Forziamo ogni frame la camera a guardare il pianeta —
       elimina qualsiasi drift o scatto residuo da OrbitControls */
    this.camera.lookAt(planetPos);
  }

  _updateLockedLabel() {
    if (!this._lockedPlanet) return;

    const planet    = this._lockedPlanet;
    const planetPos = planet.getWorldPosition();

    /* Proietta un punto leggermente sopra il pianeta */
    const abovePos = planetPos.clone();
    abovePos.y += planet.radius * 1.5;

    const projected = abovePos.clone().project(this.camera);
    if (projected.z > 1) return;

    const x = ( projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    const el  = document.getElementById('planet-label');
    const key = planet.mesh.userData.sectionKey;

    this._setLabelText(key);
    el.classList.remove('hidden');
    el.style.left      = `${x}px`;
    el.style.top       = `${y}px`;
    el.style.transform = 'translate(-50%, -100%)';
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
    this._glitch      = new Glitchium();
    this._bodyCtrl    = null;  // controllo #detail-body
  }

  _glitchMainPanel() { /* no-op — pannello destro non usa Glitchium */ }

  /* ══════════════════════════════ SCRAMBLE TEXT ═══════════════════════ */

  /*
   * Effetto scramble testo: rivela progressivamente i caratteri reali
   * attraverso un flusso di caratteri casuali — identico a scrambleText anime v4.
   *
   * el       → elemento DOM target
   * finalText → testo finale da rivelare
   * duration  → durata totale in ms
   * density   → 0-1, quanto "rumore" (1 = tutto scramble, 0.3 = leggero)
   */
  _scramble(el, finalText, duration = 450, density = 1.0) {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@!%&';
    const FPS   = 30;
    const steps = Math.round((duration / 1000) * FPS);
    let   step  = 0;

    const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    const tick = () => {
      if (step > steps) { el.textContent = finalText; return; }

      const progress = step / steps;
      const revealed = Math.floor(progress * finalText.length);

      el.textContent = finalText.split('').map((ch, i) => {
        if (i < revealed)             return ch;            // già rivelato
        if (ch === ' ' || ch === '') return ch;           // spazi intatti
        if (Math.random() > density)  return ch;           // densità ridotta
        return rnd();                                       // carattere casuale
      }).join('');

      step++;
      setTimeout(tick, 1000 / FPS);
    };

    tick();
  }

  /*
   * Inizializza Glitchium su #detail-body con createContainers:false.
   * La struttura wrapper è già nel DOM (index.html) — Glitchium non tocca il DOM,
   * applica solo CSS transforms al target. Nessun rischio per position:fixed.
   */
  _initBodyGlitch() {
    if (!this._glitch || this._bodyCtrl) return;
    try {
      /* createContainers:true (default) — Glitchium wrappa #detail-body.
         Il CSS in panel.css dà flex:1 al wrapper generato automaticamente. */
      this._bodyCtrl = this._glitch.glitch('#detail-body', {
        playMode:         'manual',
        intensity:         0.60,
        fps:               24,
        layers:            6,
        smoothTransitions: true,
        glitchFrequency:   8,
        shake:             false,
        hideOverflow:      true,
        slice: { minHeight: 0.01, maxHeight: 0.20, hueRotate: false },
      });
    } catch(e) { console.warn('[Glitchium body]', e); }
  }

  /*
   * Glitch Glitchium su #detail-body — apertura pannello e cambio contenuto.
   * createContainers:false: struttura wrapper già nel DOM (index.html).
   */
  _glitchDetailPanel() {
    if (!this._glitch) return;
    this._initBodyGlitch();
    if (this._bodyCtrl) {
      try {
        this._bodyCtrl.start();
        setTimeout(() => { try { this._bodyCtrl.stop(); } catch(e){} }, 600);
      } catch(e) { console.warn('[Glitchium body start]', e); }
    }
  }

  /* ══════════════════════════════ CONTENT PANEL ══════════════════════ */

  _openPanel(sectionKey) {
    const section = SECTIONS[sectionKey];
    const data    = PANEL_DATA[sectionKey];
    if (!section || !data) return;

    const panel = document.getElementById('content-panel');
    panel.classList.remove('hidden', 'closing');

    document.getElementById('panel-planet-name').textContent =
      (section.planet ?? '').toUpperCase();
    document.getElementById('panel-section-title').textContent =
      (section.title  ?? '').toUpperCase();

    /* Inietta tab bar + area contenuto */
    const body = document.getElementById('panel-body');
    body.innerHTML = `
      <div id="panel-tabs">
        ${data.tabs.map((t, i) =>
          `<button class="p-tab${i===0?' active':''}" data-tab="${i}">${t.label}</button>`
        ).join('')}
      </div>
      <div class="p-content-area"></div>
    `;

    /* Mostra prima tab */
    this._renderSubitems(body, data, 0);

    /* Tab switching */
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

    /* Glitch su tab e sub-item dopo apertura */
    this._glitchMainPanel();
  }

  _renderSubitems(body, data, tabIdx) {
    const area  = body.querySelector('.p-content-area');
    const items = data.tabs[tabIdx].items;

    area.innerHTML = items.map((item, i) => `
      <div class="p-subitem" data-item="${i}" style="animation-delay:${i*0.06}s">
        <span class="p-subitem-title"></span>
        <span class="p-subitem-arrow">›</span>
      </div>
    `).join('');

    /* Scramble staggerato sui titoli */
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
    /* Apre il pannello di dettaglio a sinistra */
    this._openDetailPanel(item, () => {
      /* callback back: chiude il pannello sinistro */
      this._closeDetailPanel();
    });
  }

  /* ── Pannello dettaglio sinistro ── */
  _openDetailPanel(item, onBack) {
    const panel     = document.getElementById('detail-panel');
    const isOpen    = !panel.classList.contains('hidden');

    const applyContent = () => {
      const titleEl = document.getElementById('detail-title');
      const bodyEl  = document.getElementById('detail-body');
      const titleFinal = item.title.toUpperCase();
      const bodyFinal  = item.body;

      /* Ricollega back button (clone evita listener duplicati) */
      const backBtn = document.getElementById('detail-back');
      const newBack = backBtn.cloneNode(true);
      backBtn.parentNode.replaceChild(newBack, backBtn);
      newBack.addEventListener('click', onBack);

      /* Scramble titolo: pieno e veloce */
      this._scramble(titleEl, titleFinal, 420, 1.0);

      /* Scramble body: densità buona, staggerato di 120ms dopo il titolo
         così il titolo parte prima e il body segue — effetto cascata */
      setTimeout(() => this._scramble(bodyEl, bodyFinal, 520, 0.75), 120);
    };

    if (!isOpen) {
      /* Prima apertura: semplice fade, Glitchium è l'unica animazione */
      panel.classList.remove('hidden', 'closing');
      panel.style.clipPath   = 'inset(0% 0 0% 0)';
      panel.style.opacity    = '0';
      panel.style.transition = 'opacity 0.25s ease';
      applyContent();
      void panel.offsetWidth;
      panel.style.opacity    = '1';
      setTimeout(() => this._glitchDetailPanel(), 280);
    } else {
      /*
       * Pannello già aperto: Glitchium gestisce interamente la transizione.
       * 1. Glitchium parte → effetto glitch visibile
       * 2. A metà glitch (200ms) → swap contenuto silenzioso
       * 3. Glitchium continua sul nuovo contenuto → si ferma a 650ms
       */
      this._initBodyGlitch();

      if (this._bodyCtrl) {
        try { this._bodyCtrl.start(); } catch(e) {}
      }

      /* Swap contenuto a metà del glitch */
      setTimeout(() => {
        applyContent();
        /* Scanline rapida in sincrono */
        const scanline = document.getElementById('detail-scanline');
        scanline.style.animation = 'none';
        void scanline.offsetWidth;
        scanline.style.animation = 'detail-scan 0.35s linear forwards';
      }, 200);

      /* Stop Glitchium dopo che il nuovo contenuto è stabile */
      setTimeout(() => {
        if (this._bodyCtrl) try { this._bodyCtrl.stop(); } catch(e) {}
      }, 650);
    }
  }

  _closeDetailPanel() {
    const panel = document.getElementById('detail-panel');
    if (panel.classList.contains('hidden')) return;
    panel.classList.remove('opening');
    panel.classList.add('closing');
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('closing');
    }, 270);
  }

  /* Fade + slide mini-transition tra viste */
  _animateContent(body, renderFn) {
    const area = body.querySelector('.p-content-area');
    area.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    area.style.opacity    = '0';
    area.style.transform  = 'translateX(8px)';
    setTimeout(() => {
      renderFn();
      area.style.transform = 'translateX(-8px)';
      requestAnimationFrame(() => {
        area.style.opacity   = '1';
        area.style.transform = 'translateX(0)';
      });
    }, 160);
  }

  _closePanel() {
    this._closeDetailPanel();  // chiude anche il pannello sinistro
    const panel = document.getElementById('content-panel');
    if (panel.classList.contains('hidden')) return;
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

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._returnToFree();
    });

    document.getElementById('back-hint')
      ?.addEventListener('click', () => this._returnToFree());

    document.getElementById('panel-close')
      ?.addEventListener('click', () => this._returnToFree());
  }

  _onClick() {
    if (this._booting)       return;
    if (this._zooming)       return;

    /* In focus: click ignorato — si esce solo con ESC o tasto back */
    if (this._lockedPlanet) return;

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
        const k = hits[0].object.userData.sectionKey;
        this._showFloatingLabel(k, planet);
        document.body.style.cursor = 'pointer';
      }
    } else if (this._hovered) {
      this._hovered.highlight(false);
      this._hovered = null;
      this._hideLabel();
      document.body.style.cursor = 'default';
    }
  }

  /* Nome pianeta sopra, titolo sezione sotto */
  _setLabelText(sectionKey) {
    const section = SECTIONS[sectionKey] ?? {};
    document.getElementById('planet-name').textContent =
      (section.planet ?? '').toUpperCase();
    document.getElementById('planet-category').textContent =
      (section.title ?? '').toUpperCase();
  }

  /* Label in hover: posizionata sopra il pianeta */
  _showFloatingLabel(sectionKey, planet) {
    const planetPos = planet.getWorldPosition();
    const abovePos  = planetPos.clone();
    abovePos.y += planet.radius * 1.5;

    const projected = abovePos.clone().project(this.camera);
    if (projected.z > 1) return;

    const x = ( projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

    const el = document.getElementById('planet-label');
    this._setLabelText(sectionKey);
    el.classList.remove('hidden');
    el.style.left      = `${x}px`;
    el.style.top       = `${y}px`;
    el.style.transform = 'translate(-50%, -100%)';
  }

  /* Aggiorna posizione label hover ogni frame — segue il pianeta nell orbita */
  _updateHoverLabel() {
    if (!this._hovered || this._lockedPlanet || this._zooming) return;
    const planet    = this._hovered;
    const planetPos = planet.getWorldPosition();
    const abovePos  = planetPos.clone();
    abovePos.y += planet.radius * 1.5;
    const projected = abovePos.clone().project(this.camera);
    if (projected.z > 1) return;
    const x = ( projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    const el = document.getElementById('planet-label');
    el.style.left      = `${x}px`;
    el.style.top       = `${y}px`;
    el.style.transform = 'translate(-50%, -100%)';
  }

  _hideLabel() {
    const el = document.getElementById('planet-label');
    /* NON resettiamo left/top/transform — se li azzeriamo il browser
       per un frame applica i default CSS (top:50% left:50%) prima
       che opacity:0 faccia effetto, causando il flash al centro. */
    el.classList.add('hidden');
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
        anime({ targets: '#title-block', opacity: [0, 1], translateY: [-24, 0], duration: 1700, easing: 'easeOutQuart',
          complete: () => { this._booting = false; } });
        anime({ targets: '#hint-block',  opacity: [0, 0.85], duration: 2000, delay: 1100, easing: 'easeOutCubic' });
      }, 900);
    }, 1500);
  }

  /* ══════════════════════════════ LOOP ════════════════════════════════ */

  _loop() {
    requestAnimationFrame(() => this._loop());

    const delta = Math.min(this._clock.getDelta(), 0.05);
    const time  = this._clock.elapsedTime;

    this.universe.update(time);
    this.milkyWay.update(time);
    this.sun.update(time);

    const sunPos = this.sun.getWorldPosition();
    this.planets.forEach(p => {
      p.update(time, delta);
      p.updateSunDirection(sunPos);
    });

    /* Aggiorna camera e label sul pianeta agganciato ogni frame */
    if (this._lockedPlanet) {
      this._updateLockedCamera();
      this._updateLockedLabel();
    }

    if (!this.device.isMobile) {
      this._checkHover();
      this._updateHoverLabel();   // label segue il pianeta orbitante
    }

    /* controls.update() solo quando né in zoom né agganciati —
       in entrambi i casi gestiamo la camera manualmente */
    if (!this._zooming && !this._lockedPlanet) this.controls.update();

    this.postfx.render();
  }
}

new App();