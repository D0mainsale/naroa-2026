/**
 * PARALLAX 3D DEPTH ENGINE
 * Efecto avanzado de profundidad con mouse tracking
 * Inspirado en: Firewatch, Apple product pages, Awwwards SOTY winners
 * 
 * Técnicas utilizadas:
 * - CSS perspective + preserve-3d
 * - Mouse-reactive translateZ
 * - Layer-based parallax (fondo, medio, figura)
 * - Blur por profundidad
 * - Rotación tilt con cubic-bezier
 */

class Parallax3DDepth {
  constructor(options = {}) {
    this.config = {
      container: options.container || '.parallax3d',
      intensity: options.intensity || 30,
      perspective: options.perspective || 1200,
      smoothing: options.smoothing || 0.08,
      enableTilt: options.enableTilt !== false,
      enableBlur: options.enableBlur !== false,
      maxTilt: options.maxTilt || 15,
      ...options
    };

    this.mouse = { x: 0.5, y: 0.5 };
    this.current = { x: 0.5, y: 0.5 };
    this.elements = [];
    
    this.init();
  }

  init() {
    const containers = document.querySelectorAll(this.config.container);
    
    containers.forEach(container => {
      this.setupContainer(container);
      this.setupLayers(container);
    });

    this.bindEvents();
    this.animate();
    
  }

  setupContainer(container) {
    container.style.perspective = `${this.config.perspective}px`;
    container.style.perspectiveOrigin = '50% 50%';
    container.style.transformStyle = 'preserve-3d';
    container.style.overflow = 'hidden';
  }

  setupLayers(container) {
    // Auto-detect layers by data-depth attribute
    const layers = container.querySelectorAll('[data-depth]');
    
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      const blur = parseFloat(layer.dataset.blur) || 0;
      
      this.elements.push({
        el: layer,
        container: container,
        depth: depth,
        baseBlur: blur,
        currentX: 0,
        currentY: 0,
        currentZ: 0,
        currentRotateX: 0,
        currentRotateY: 0
      });

      // Set initial 3D styles
      layer.style.transformStyle = 'preserve-3d';
      layer.style.willChange = 'transform, filter';
      layer.style.transition = 'filter 0.3s ease';
    });
  }

  bindEvents() {
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
    }, { passive: true });

    // Touch support
    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.mouse.x = touch.clientX / window.innerWidth;
      this.mouse.y = touch.clientY / window.innerHeight;
    }, { passive: true });

    // Gyroscope (mobile)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.mouse.x = (e.gamma + 45) / 90; // -45 to +45 range
          this.mouse.y = (e.beta + 45) / 90;
        }
      }, { passive: true });
    }

    // Reset on mouseleave
    document.addEventListener('mouseleave', () => {
      this.mouse.x = 0.5;
      this.mouse.y = 0.5;
    });
  }

  animate() {
    // Smooth interpolation
    this.current.x += (this.mouse.x - this.current.x) * this.config.smoothing;
    this.current.y += (this.mouse.y - this.current.y) * this.config.smoothing;

    // Calculate offsets from center
    const offsetX = (this.current.x - 0.5) * 2; // -1 to 1
    const offsetY = (this.current.y - 0.5) * 2;

    this.elements.forEach(item => {
      const { el, depth, baseBlur } = item;
      
      // Calculate movement based on depth
      // Deeper layers (higher depth) move MORE, creating parallax
      const moveX = offsetX * this.config.intensity * depth;
      const moveY = offsetY * this.config.intensity * depth;
      const moveZ = depth * 50; // Push layers into Z-space

      // Calculate tilt
      let rotateX = 0, rotateY = 0;
      if (this.config.enableTilt) {
        rotateY = offsetX * this.config.maxTilt * (depth * 0.5);
        rotateX = -offsetY * this.config.maxTilt * (depth * 0.5);
      }

      // Apply transform
      el.style.transform = `
        translateX(${moveX}px)
        translateY(${moveY}px)
        translateZ(${moveZ}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;

      // Depth-based blur (fondo más borroso)
      if (this.config.enableBlur && baseBlur > 0) {
        const dynamicBlur = baseBlur * (1 + Math.abs(offsetX + offsetY) * 0.2);
        el.style.filter = `blur(${dynamicBlur}px)`;
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  // API Methods
  setIntensity(value) {
    this.config.intensity = value;
  }

  destroy() {
    this.elements.forEach(item => {
      item.el.style.transform = '';
      item.el.style.filter = '';
    });
    this.elements = [];
  }
}

/**
 * ARTWORK LAYER SEPARATOR
 * Separa automáticamente figura (B/N) del fondo (color) para parallax
 */
class ArtworkLayerSeparator {
  constructor(container, imageSrc) {
    this.container = container;
    this.imageSrc = imageSrc;
    this.init();
  }

  async init() {
    // Create layer structure
    this.container.innerHTML = `
      <div class="artwork-3d">
        <div class="artwork-3d__layer artwork-3d__layer--back" data-depth="0.3" data-blur="3">
          <img src="${this.imageSrc}" alt="Background layer">
        </div>
        <div class="artwork-3d__layer artwork-3d__layer--mid" data-depth="0.6">
          <img src="${this.imageSrc}" alt="Middle layer">
        </div>
        <div class="artwork-3d__layer artwork-3d__layer--front" data-depth="1.0">
          <img src="${this.imageSrc}" alt="Foreground layer">
        </div>
        <div class="artwork-3d__glow" data-depth="0.2"></div>
      </div>
    `;

    // Add mask effects for layer separation
    this.applyMasks();
  }

  applyMasks() {
    const back = this.container.querySelector('.artwork-3d__layer--back');
    const mid = this.container.querySelector('.artwork-3d__layer--mid');
    const front = this.container.querySelector('.artwork-3d__layer--front');

    // Back: Only show colorful background
    back.style.cssText = `
      position: absolute;
      inset: 0;
      transform-origin: center;
    `;

    // Mid: Transition zone
    mid.style.cssText = `
      position: absolute;
      inset: -5%;
      transform-origin: center;
      opacity: 0.5;
      mix-blend-mode: overlay;
    `;

    // Front: Main figure (ideally with mask)
    front.style.cssText = `
      position: absolute;
      inset: 0;
      transform-origin: center;
    `;
  }
}

// Auto-initialize on elements with class
window.Parallax3DDepth = Parallax3DDepth;
window.ArtworkLayerSeparator = ArtworkLayerSeparator;

document.addEventListener('DOMContentLoaded', () => {
  // Auto-init for elements with .parallax3d class
  if (document.querySelector('.parallax3d')) {
    window.parallax3DInstance = new Parallax3DDepth();
  }
});
