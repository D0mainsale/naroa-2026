/**
 * Golden Ratio Visualizer
 * Draws the Golden Spiral and Grid over the viewport.
 */
class GoldenRatioOverlay {
  constructor() {
    this.isActive = false;
    this.init();
  }

  init() {
    // Create the canvas if it doesn't exist (handled in HTML usually, but let's check)
    // Actually, let's inject it if missing
    if (!document.getElementById('golden-overlay')) {
      const canvas = document.createElement('canvas');
      canvas.id = 'golden-overlay';
      document.body.appendChild(canvas);
    }
    
    // Create toggle button if missing
    if (!document.getElementById('phi-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'phi-toggle';
      btn.className = 'phi-toggle';
      btn.innerHTML = 'φ';
      btn.title = 'Show Golden Ratio Overlay';
      document.body.appendChild(btn);
      
      btn.addEventListener('click', () => this.toggle());
    }

    this.canvas = document.getElementById('golden-overlay');
    this.ctx = this.canvas.getContext('2d');
    
    window.addEventListener('resize', () => {
      if (this.isActive) this.draw();
    });
  }

  toggle() {
    this.isActive = !this.isActive;
    const btn = document.getElementById('phi-toggle');
    const overlay = document.getElementById('golden-overlay');
    
    if (this.isActive) {
      btn.classList.add('active');
      overlay.classList.add('active');
      this.draw();
    } else {
      btn.classList.remove('active');
      overlay.classList.remove('active');
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    // Style
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'; // Gold
    ctx.lineWidth = 1;
    
    // Draw Golden Rectangle Spiral
    this.drawGoldenSpiral(ctx, 0, 0, width, height);
    
    // Draw Phi Grid (Thirds approx)
    this.drawPhiGrid(ctx, width, height);
  }

  drawGoldenSpiral(ctx, x, y, width, height) {
    const phi = 1.61803398875;
    let w = width;
    let h = height;
    let currentX = x;
    let currentY = y;
    
    // Start spiral
    ctx.beginPath();
    ctx.moveTo(currentX, currentY + h); // Start bottom-left for landscape usually?
    
    // Let's implement a recursive box method
    // 1. Draw square
    // 2. Remaining rectangle becomes new canvas
    // 3. Repeat
    // But spiral path: 
    // Usually starts large. 
    
    // Simplified visual: Just the major division lines
    // A | B where A/B = Phi
    
    // Vertical line at 1/phi
    const xPhi = width / phi;
    ctx.beginPath();
    ctx.moveTo(xPhi, 0);
    ctx.lineTo(xPhi, height);
    ctx.stroke();

    // Horizontal line at 1/phi
    const yPhi = height / phi;
    ctx.beginPath();
    ctx.moveTo(0, yPhi);
    ctx.lineTo(width, yPhi);
    ctx.stroke();
    
    // Spiral Approx
    // (This is tricky to get perfect mathematically on arbitrary aspect ratio screens without distortion,
    // so we often center a perfect golden rectangle or just show the grid lines)
    
  }

  drawPhiGrid(ctx, width, height) {
    const phi = 1.61803398875;
    const invPhi = 1 / phi; // 0.618
    const invPhi2 = 1 - invPhi; // 0.382

    // Vertical lines
    const x1 = width * invPhi2;
    const x2 = width * invPhi;

    ctx.beginPath();
    ctx.moveTo(x1, 0);
    ctx.lineTo(x1, height);
    ctx.moveTo(x2, 0);
    ctx.lineTo(x2, height);
    ctx.stroke();

    // Horizontal lines
    const y1 = height * invPhi2;
    const y2 = height * invPhi;

    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(width, y1);
    ctx.moveTo(0, y2);
    ctx.lineTo(width, y2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GoldenRatioOverlay());
} else {
  new GoldenRatioOverlay();
}
