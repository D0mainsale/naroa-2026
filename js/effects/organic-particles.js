/**
 * ORGANIC PARTICLES - Floating Pigment Dust
 * Partículas orgánicas que flotan como polvo de pigmento
 * Usando SOLO los 4 colores de la paleta
 */

class OrganicParticles {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.count = 30; // Subtle, not overwhelming
    this.colors = [];
    this.animationId = null;
    
    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'organic-particles';
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.6;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    this.getColors();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    
    // Listen for palette changes
    document.addEventListener('climatePaletteChanged', () => {
      this.getColors();
      this.particles.forEach((p, i) => {
        p.color = this.colors[i % this.colors.length];
      });
    });
  }

  getColors() {
    const style = getComputedStyle(document.documentElement);
    this.colors = [
      style.getPropertyValue('--naroa-terracotta').trim() || '#c38d7a',
      style.getPropertyValue('--naroa-blue').trim() || '#002fa7',
      style.getPropertyValue('--naroa-cream').trim() || '#faf7f2'
    ];
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3 - 0.1, // Slight upward drift
        color: this.colors[i % this.colors.length],
        opacity: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      // Update position
      p.x += p.speedX + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.2;
      p.y += p.speedY;
      p.angle += p.rotationSpeed;
      
      // Wrap around
      if (p.x < -10) p.x = this.canvas.width + 10;
      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.canvas.height + 10;
      if (p.y > this.canvas.height + 10) p.y = -10;
      
      // Draw organic blob shape
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);
      this.ctx.globalAlpha = p.opacity;
      
      // Organic blob path
      this.ctx.beginPath();
      const points = 6;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = p.size * (0.8 + Math.sin(angle * 3) * 0.2);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      this.ctx.restore();
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas?.remove();
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new OrganicParticles());
} else {
  new OrganicParticles();
}

window.OrganicParticles = OrganicParticles;
