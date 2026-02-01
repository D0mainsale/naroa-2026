/**
 * Golden Cursor Trail - SOTY 2026
 * Premium particle trail effect following cursor movement
 * 
 * Features:
 * - Canvas-based for 60fps performance
 * - Golden particle system with fade
 * - Velocity-based particle emission
 * - Full accessibility support
 * 
 * @see Premium Effects Library 2026 #36
 */

class CursorTrail {
  constructor(options = {}) {
    this.particleCount = options.particleCount || 15;
    this.particleSize = options.particleSize || 4;
    this.particleLife = options.particleLife || 600;
    this.color = options.color || { r: 201, g: 162, b: 39 };
    this.minVelocity = options.minVelocity || 3;
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.rafId = null;
    this.lastEmit = 0;
    
    this.isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (this.isReduced) {
      console.log('[CursorTrail] Reduced motion detected, skipping init');
      return this;
    }

    this.createCanvas();
    this.bindEvents();
    this.startLoop();
    
    return this;
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'cursor-trail-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener('resize', () => this.resize());

    // Handle reduced motion preference change
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReduced = e.matches;
      if (this.isReduced) {
        this.destroy();
      }
    });
  }

  startLoop() {
    const update = (timestamp) => {
      if (this.isReduced) return;
      
      this.update(timestamp);
      this.render();
      
      this.rafId = requestAnimationFrame(update);
    };
    
    this.rafId = requestAnimationFrame(update);
  }

  update(timestamp) {
    // Calculate velocity
    const dx = this.mouseX - this.lastMouseX;
    const dy = this.mouseY - this.lastMouseY;
    const velocity = Math.sqrt(dx * dx + dy * dy);
    
    // Emit particles based on velocity
    if (velocity > this.minVelocity && timestamp - this.lastEmit > 16) {
      this.emitParticle();
      this.lastEmit = timestamp;
    }
    
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    
    // Update existing particles
    this.particles = this.particles.filter(p => {
      p.age += 16;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.size *= 0.97;
      
      return p.age < p.life && p.size > 0.5;
    });
  }

  emitParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2;
    
    this.particles.push({
      x: this.mouseX,
      y: this.mouseY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: this.particleSize + Math.random() * 2,
      life: this.particleLife,
      age: 0
    });
    
    // Limit particle count
    if (this.particles.length > this.particleCount * 3) {
      this.particles.shift();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      const progress = p.age / p.life;
      const alpha = 1 - progress;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.8})`;
      this.ctx.fill();
      
      // Add glow effect
      this.ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.5})`;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.particles = [];
  }
}

// Export for module systems and global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CursorTrail;
}

window.CursorTrail = CursorTrail;

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.cursorTrailInstance = new CursorTrail({
    particleCount: 15,
    color: { r: 201, g: 162, b: 39 } // SOTY Gold
  }).init();
});
