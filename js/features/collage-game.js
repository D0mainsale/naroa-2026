/**
 * COLLAGE GAME
 * Obra: Composición Caótica
 */

class CollageGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.elements = [];
    this.activeElement = null;
    this.active = false;
  }

  init() {
    const container = document.getElementById('collage-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="collage-wrapper">
        <div class="game-header">
          <h2>✂️ Collage Dadaísta</h2>
          <span class="status">Crea tu composición</span>
        </div>
        <canvas id="collage-canvas" width="600" height="400"></canvas>
        <div class="controls">
             <button id="add-text">Texto</button>
             <button id="add-shape">Forma</button>
             <button id="clear-canvas">Limpiar</button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('collage-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Inputs
    this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
    
    container.querySelector('#add-text').addEventListener('click', () => this.addText());
    container.querySelector('#add-shape').addEventListener('click', () => this.addShape());
    container.querySelector('#clear-canvas').addEventListener('click', () => this.clear());

    this.active = true;
    this.draw();
  }

  addText() {
    const texts = ["MICA", "ART", "CHAOS", "DADA", "VOID", "LIFE"];
    this.elements.push({
        type: 'text',
        content: texts[Math.floor(Math.random() * texts.length)],
        x: Math.random() * 500,
        y: Math.random() * 300 + 50,
        rotation: (Math.random() - 0.5),
        color: '#000',
        size: 30 + Math.random() * 30
    });
    this.draw();
  }

  addShape() {
    this.elements.push({
        type: 'rect',
        x: Math.random() * 500,
        y: Math.random() * 300,
        w: 50 + Math.random() * 100,
        h: 50 + Math.random() * 100,
        color: `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.7)`,
        rotation: (Math.random() - 0.5)
    });
    this.draw();
  }

  clear() {
    this.elements = [];
    this.draw();
  }

  handleStart(e) {
      if (!this.active) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Select top-most element
      for (let i = this.elements.length - 1; i >= 0; i--) {
          const el = this.elements[i];
          // Rough hit test
          if (Math.abs(el.x - x) < 50 && Math.abs(el.y - y) < 50) {
              this.activeElement = el;
              // Bring to front
              this.elements.splice(i, 1);
              this.elements.push(el);
              break;
          }
      }
  }

  handleMove(e) {
      if (this.activeElement) {
          const rect = this.canvas.getBoundingClientRect();
          this.activeElement.x = e.clientX - rect.left;
          this.activeElement.y = e.clientY - rect.top;
          this.draw();
      }
  }

  handleEnd() {
      this.activeElement = null;
  }

  draw() {
    this.ctx.fillStyle = '#F0F0F0';
    this.ctx.fillRect(0, 0, 600, 400);

    this.elements.forEach(el => {
        this.ctx.save();
        this.ctx.translate(el.x, el.y);
        this.ctx.rotate(el.rotation);
        
        if (el.type === 'text') {
            this.ctx.font = `bold ${el.size}px Courier New`;
            this.ctx.fillStyle = el.color;
            this.ctx.fillText(el.content, -this.ctx.measureText(el.content).width/2, 0);
        } else if (el.type === 'rect') {
            this.ctx.fillStyle = el.color;
            this.ctx.fillRect(-el.w/2, -el.h/2, el.w, el.h);
        }
        
        this.ctx.restore();
    });
  }
}

window.CollageGame = new CollageGame();
