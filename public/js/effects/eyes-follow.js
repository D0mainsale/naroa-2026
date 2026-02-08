/**
 * OJOS QUE TE MIRAN - Eyes Follow Cursor Effect
 * Los retratos de Naroa siguen al visitante con la mirada
 * 
 * Features:
 * - Parallax sutil en imágenes de galería
 * - Los "ojos" de los retratos siguen el cursor
 * - Efecto de profundidad 3D
 * 
 * @author MICA (Mineral Intelligence Creative Assistant)
 */

class EyesFollow {
  constructor(options = {}) {
    this.intensity = options.intensity || 0.02; // Subtle movement
    this.maxOffset = options.maxOffset || 15;   // Max pixels of movement
    this.easing = options.easing || 0.08;       // Smooth follow
    
    this.targets = [];
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.currentX = 0;
    this.currentY = 0;
    this.rafId = null;
    
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (this.isReduced) {
      console.log('[EyesFollow] Disabled: prefers-reduced-motion');
      return this;
    }
    
    this.collectTargets();
    this.bindEvents();
    this.startLoop();
    
    console.log(`👁️ EyesFollow: ${this.targets.length} elementos rastreando tu mirada`);
    return this;
  }

  collectTargets() {
    // Select gallery images and intro portraits
    const selectors = [
      '.gallery__item img',
      '.gallery-massive__item img',
      '.intro-portrait img',
      '.hero__featured-image',
      '[data-eyes-follow]'
    ];
    
    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      this.targets.push({
        el,
        offsetX: 0,
        offsetY: 0,
        intensity: parseFloat(el.dataset.eyesIntensity) || this.intensity
      });
    });
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Re-collect on navigation (for SPA)
    window.addEventListener('hashchange', () => {
      setTimeout(() => {
        this.targets = [];
        this.collectTargets();
      }, 500);
    });

    // Re-collect when gallery loads new items
    const observer = new MutationObserver(() => {
      this.targets = [];
      this.collectTargets();
    });

    const galleryContainer = document.querySelector('.gallery-massive') || document.querySelector('.gallery');
    if (galleryContainer) {
      observer.observe(galleryContainer, { childList: true, subtree: true });
    }
  }

  startLoop() {
    const update = () => {
      this.update();
      this.rafId = requestAnimationFrame(update);
    };
    this.rafId = requestAnimationFrame(update);
  }

  update() {
    // Smooth easing towards target
    this.currentX += (this.mouseX - this.currentX) * this.easing;
    this.currentY += (this.mouseY - this.currentY) * this.easing;

    this.targets.forEach(target => {
      if (!target.el || !target.el.isConnected) return;

      const rect = target.el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate offset based on cursor distance from center
      const deltaX = (this.currentX - centerX) * target.intensity;
      const deltaY = (this.currentY - centerY) * target.intensity;

      // Clamp to max offset
      const offsetX = Math.max(-this.maxOffset, Math.min(this.maxOffset, deltaX));
      const offsetY = Math.max(-this.maxOffset, Math.min(this.maxOffset, deltaY));

      // Apply subtle 3D transform
      target.el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.01)`;
    });
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.targets.forEach(target => {
      if (target.el) {
        target.el.style.transform = '';
      }
    });
    this.targets = [];
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure gallery is loaded
  setTimeout(() => {
    window.eyesFollowInstance = new EyesFollow().init();
  }, 1000);
});

// Export for manual control
window.EyesFollow = EyesFollow;
