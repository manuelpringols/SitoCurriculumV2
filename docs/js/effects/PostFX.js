import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * PostFX — pipeline di post-processing.
 * UnrealBloomPass: aggiunge il glow cinematico a stelle, sole, prominenze.
 * I parametri sono tarati per qualità "spaziale": forte sui punti luminosi,
 * delicato sulle aree scure.
 */
export class PostFX {
  constructor(renderer, scene, camera, device) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.device = device;

    this.composer = new EffectComposer(renderer);
    this.composer.setPixelRatio(device.pixelRatio);
    this.composer.setSize(window.innerWidth, window.innerHeight);

    /* Render base */
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    /* Bloom — parametri tarati per spazio */
    /* Resolution, strength, radius, threshold */
    const bloomStrength = device.isMobile ? 0.45 : 0.70;
    const bloomRadius = 0.65;
    const bloomThreshold = 0.38;
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold,
    );
    this.composer.addPass(this.bloomPass);

    /* Output finale (gestisce tone mapping e color space) */
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  render() {
    this.composer.render();
  }

  setSize(w, h) {
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(w, h);
  }
}
