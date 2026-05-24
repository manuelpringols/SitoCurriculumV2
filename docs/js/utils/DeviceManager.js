/**
 * DeviceManager
 * Rileva il dispositivo e imposta preset di qualità automaticamente.
 * Tutti i moduli Three.js leggono da qui per scalare carico GPU.
 */
export class DeviceManager {
  constructor() {
    this.isMobile  = this._detectMobile();
    this.isTablet  = this._detectTablet();
    this.isLowEnd  = this._detectLowEnd();
    this.quality   = this._resolveQuality();
    this.pixelRatio = this._resolvePixelRatio();

    console.log(
      `[Device] ${this.quality.toUpperCase()} | mobile:${this.isMobile} | ` +
      `cores:${navigator.hardwareConcurrency ?? '?'} | dpr:${this.pixelRatio}`
    );
  }

  _detectMobile() {
    return (
      window.innerWidth < 768 ||
      /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  _detectTablet() {
    return (
      (window.innerWidth >= 768 && window.innerWidth < 1024) ||
      /iPad|Tablet/i.test(navigator.userAgent)
    );
  }

  _detectLowEnd() {
    const cores = navigator.hardwareConcurrency;
    return cores !== undefined && cores <= 4;
  }

  _resolveQuality() {
    if (this.isMobile)  return 'low';
    if (this.isLowEnd)  return 'medium';
    return 'high';
  }

  _resolvePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    if (this.isMobile)  return Math.min(dpr, 1.5);
    if (this.isTablet)  return Math.min(dpr, 2.0);
    return Math.min(dpr, 2.0);
  }

  get antialias()          { return !this.isMobile; }
  get shadowsEnabled()     { return !this.isMobile; }

  get starCount() {
    /* Ridotto ~20% — meno stelline sparse, le grandi brillanti rimangono */
    return { low: 2000, medium: 4800, high: 9600 }[this.quality];
  }

  get nebulaParticles() {
    return { low: 600, medium: 1200, high: 2500 }[this.quality];
  }

  get planetSegments() {
    return { low: 32, medium: 48, high: 64 }[this.quality];
  }

  get atmosphereSegments() {
    return { low: 28, medium: 40, high: 56 }[this.quality];
  }

  get shadowMapSize() {
    return { low: 512, medium: 1024, high: 2048 }[this.quality];
  }

  get orbitSegments() {
    return { low: 64, medium: 96, high: 128 }[this.quality];
  }

  refresh() {
    const wasMobile = this.isMobile;
    this.isMobile   = this._detectMobile();
    this.isTablet   = this._detectTablet();
    this.quality    = this._resolveQuality();
    this.pixelRatio = this._resolvePixelRatio();
    return wasMobile !== this.isMobile;
  }
}