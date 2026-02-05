/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EPHEMERAL CHAOS ENGINE (Anti-Template)
 * Naroa Gutiérrez Gil 2026
 * 
 * Concepto: Layouts que nunca se repiten. Organismo fluido.
 * Mecánica: Aleatorización controlada de transformaciones, z-index y filtros.
 * Estilo: Collage brutalista.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════
// VIBE ENGINE: Context-Aware Parameters
// ════════════════════════════════════════════
const VIBE_PRESETS = {
  'rocks': { 
    maxRot: 15, maxX: 60, maxY: 80, scale: [0.85, 1.3],
    highlightProb: 0.4,
    vibe: 'aggressive'
  },
  'espejos-del-alma': { 
    maxRot: 2, maxX: 20, maxY: 40, scale: [0.95, 1.05],
    highlightProb: 0.1,
    vibe: 'ethereal'
  },
  'tributos-musicales': { 
    maxRot: 5, maxX: 30, maxY: 50, scale: [0.9, 1.1],
    highlightProb: 0.2,
    vibe: 'rhythmic'
  },
  'enlatas': { 
    maxRot: 45, maxX: 10, maxY: 10, scale: [0.9, 1.0],
    highlightProb: 0.3,
    vibe: 'industrial'
  },
  'golden': { 
    maxRot: 3, maxX: 25, maxY: 35, scale: [0.95, 1.1],
    highlightProb: 0.15,
    vibe: 'golden'
  },
  'amor': { 
    maxRot: 8, maxX: 40, maxY: 55, scale: [0.88, 1.2],
    highlightProb: 0.25,
    vibe: 'romantic'
  },
  'retratos': { 
    maxRot: 4, maxX: 30, maxY: 45, scale: [0.92, 1.08],
    highlightProb: 0.1,
    vibe: 'portrait'
  },
  'naturaleza': { 
    maxRot: 12, maxX: 50, maxY: 70, scale: [0.85, 1.25],
    highlightProb: 0.35,
    vibe: 'organic'
  },
  'default': { 
    maxRot: 6, maxX: 40, maxY: 60, scale: [0.9, 1.15],
    highlightProb: 0.2,
    vibe: 'balanced'
  }
};

const ChaosEngine = {
  config: {
    containerSelector: '.gallery-massive',
    itemSelector: '.gallery-massive__item',
    chaosCurrent: 0.5,
    loopInterval: 8000, // 8 seconds per breath
  },

  isHovering: false,
  loopTimer: null,

  isActive: false,

  init() {
    console.log('🌪️ initializing Ephemeral Chaos Engine (Vibe Aware)...');
    // Don't auto-start, wait for user interaction or check localStorage if persistence desired
    // But we need to listen to keys globally
    
    // Regenerate on 'R' key only if active
    document.addEventListener('keydown', (e) => {
      if (this.isActive && e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        this.regenerate();
      }
    });
  },

  enable() {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) return;
    
    this.isActive = true;
    container.classList.add('gallery-mode-chaos');
    this.applyChaos();
    this.startLoop();
    console.log('🌪️ Chaos Mode ENABLED');
  },

  disable() {
    const container = document.querySelector(this.config.containerSelector);
    if (!container) return;

    this.isActive = false;
    container.classList.remove('gallery-mode-chaos');
    this.stopLoop();
    
    // Clean up inline styles
    const items = document.querySelectorAll(this.config.itemSelector);
    items.forEach(item => {
      item.style.transform = '';
      item.style.zIndex = '';
      item.style.boxShadow = '';
      item.style.filter = '';
      item.style.border = '';
      // Remove all vibe classes
      Object.keys(VIBE_PRESETS).forEach(key => {
        item.classList.remove(`vibe-${VIBE_PRESETS[key].vibe}`);
      });
      item.classList.remove('chaos-highlight');
      
      // Clean properties
      item.style.removeProperty('--chaos-rotate');
      item.style.removeProperty('--chaos-x');
      item.style.removeProperty('--chaos-y');
      item.style.removeProperty('--chaos-scale');
      item.style.removeProperty('--chaos-z');
      item.style.removeProperty('--chaos-delay');
    });

    console.log('🌪️ Chaos Mode DISABLED');
  },

  toggle() {
    if (this.isActive) {
      this.disable();
      return false;
    } else {
      this.enable();
      return true;
    }
  },

  startLoop() {
    if (this.loopTimer) clearInterval(this.loopTimer);
    this.loopTimer = setInterval(() => {
      if (!this.isHovering) {
        this.regenerate();
      }
    }, this.config.loopInterval);
  },

  stopLoop() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  },

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Obtener nombre de archivo desde src o data-src
  getFilenameFromItem(item) {
    const img = item.querySelector('img');
    if (!img) return '';
    const src = img.dataset.src || img.src || '';
    return src.split('/').pop().replace('.webp', '').replace('.jpg', '');
  },

  // Determinar la categoría basándose en la imagen (Heurística simple si no hay metadata explícita en DOM)
  // En una implementación ideal, el DOM tendría data-category
  detectCategory(item) {
    const filename = this.getFilenameFromItem(item);
    
    // Rocks series
    if (filename.includes('rocks') || filename.includes('amy') || filename.includes('johnny') || filename.includes('marilyn') || filename.includes('james-rocks')) return 'rocks';
    // Espejos
    if (filename.includes('espejos')) return 'espejos-del-alma';
    // En.lata.das
    if (filename.includes('lata') || filename.includes('conserva') || filename.includes('hugo-box')) return 'enlatas';
    // Tributos musicales
    if (filename.includes('baroque') || filename.includes('audrey') || filename.includes('tributo') || filename.includes('farrokh') || filename.includes('fahrenheit')) return 'tributos-musicales';
    // Golden series
    if (filename.includes('golden') || filename.includes('lagrimas') || filename.includes('oro')) return 'golden';
    // Amor series
    if (filename.includes('love') || filename.includes('amor') || filename.includes('smile') || filename.includes('corazon')) return 'amor';
    // Retratos
    if (filename.includes('dakari') || filename.includes('peter') || filename.includes('pensadora') || filename.includes('geisha') || filename.includes('tedas')) return 'retratos';
    // Naturaleza
    if (filename.includes('pajarra') || filename.includes('llorona') || filename.includes('bird') || filename.includes('natura')) return 'naturaleza';
    
    // Fallback: tratar de leer data-category si existe (inyectado por Gallery.js)
    if (item.dataset.category) return item.dataset.category;
    
    return 'default';
  },

  getVibe(category) {
    return VIBE_PRESETS[category] || VIBE_PRESETS['default'];
  },

  applyChaos() {
    const items = document.querySelectorAll(this.config.itemSelector);
    
    items.forEach((item, index) => {
      // 0. Ensure Lazy Loading happens for static items
      const img = item.querySelector('img');
      if (img && img.dataset.src && !img.src.endsWith(img.dataset.src)) {
        img.onload = () => {
          item.classList.add('loaded');
        };
        img.src = img.dataset.src;
        // If cached and instant load:
        if (img.complete) {
           item.classList.add('loaded');
        }
      } else if (img && img.complete) {
        // Already loaded
        item.classList.add('loaded');
      }

      const category = this.detectCategory(item);
      const vibe = this.getVibe(category);

      // 1. Generar valores basados en el VIBE de la obra
      const random = {
        rot: this.randomRange(-vibe.maxRot, vibe.maxRot),
        x: this.randomRange(-vibe.maxX, vibe.maxX),
        y: this.randomRange(-vibe.maxY, vibe.maxY),
        scale: this.randomRange(vibe.scale[0], vibe.scale[1]),
        z: Math.floor(Math.random() * 20),
        delay: Math.random() * 0.5
      };

      // 2. Aplicar estilos
      item.style.setProperty('--chaos-rotate', `${random.rot}deg`);
      item.style.setProperty('--chaos-x', `${random.x}px`);
      item.style.setProperty('--chaos-y', `${random.y}px`);
      item.style.setProperty('--chaos-scale', `${random.scale}`);
      item.style.setProperty('--chaos-z', `${random.z}`);
      item.style.setProperty('--chaos-delay', `${random.delay}s`);
      
      // Inject Vibe Class for specific CSS overrides
      item.classList.add(`vibe-${vibe.vibe}`);

      // 3. Highlight basado en probabilidad del vibe
      if (Math.random() < vibe.highlightProb) {
        item.classList.add('chaos-highlight');
      } else {
        item.classList.remove('chaos-highlight');
      }
    });

    console.log(`🌪️ Chaos Applied. Layout regenerated with Vibe Engine.`);
  },

  regenerate() {
    console.log('🌪️ Regenerating Chaos...');
    const items = document.querySelectorAll(this.config.itemSelector);
    items.forEach(item => {
        item.style.animation = 'none';
        item.offsetHeight; /* trigger reflow */
        item.style.animation = null;
        // Re-trigger visual style changes
    });
    this.applyChaos();
  },

  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }
};


// Auto-init cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ChaosEngine.init());
} else {
  ChaosEngine.init();
}

window.ChaosEngine = ChaosEngine;
