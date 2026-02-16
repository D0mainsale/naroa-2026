/**
 * KINTSUGI GAME
 * Obra: La Belleza de las Cicatrices
 */

class KintsugiGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.shards = [];
    this.activeShard = null;
    this.completed = false;
    this.score = 0;
  }

  init() {
    const container = document.getElementById('kintsugi-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="kintsugi-wrapper">
        <div class="game-header">
          <h2>🏺 Kintsugi: Repara con Oro</h2>
          <span class="status">Une las piezas</span>
        </div>
        <canvas id="kintsugi-canvas" width="600" height="500"></canvas>
        <button class="reset-btn">Reiniciar</button>
      </div>
    `;

    this.canvas = document.getElementById('kintsugi-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.addEventListener('mousedown', this.handleInputStart.bind(this));
    this.canvas.addEventListener('mousemove', this.handleInputMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleInputEnd.bind(this));
    
    container.querySelector('.reset-btn').addEventListener('click', () => this.start());

    // Start immediately
    this.start();
  }

  start() {
    this.shards = [
      { id: 1, x: 50, y: 50, w: 100, h: 100, color: '#8B4513', targetX: 250, targetY: 200, placed: false },
      { id: 2, x: 450, y: 50, w: 100, h: 100, color: '#A0522D', targetX: 350, targetY: 200, placed: false },
      { id: 3, x: 50, y: 350, w: 100, h: 100, color: '#CD853F', targetX: 250, targetY: 300, placed: false },
      { id: 4, x: 450, y: 350, w: 100, h: 100, color: '#D2691E', targetX: 350, targetY: 300, placed: false }
    ];
    this.completed = false;
    this.draw();
  }

  handleInputStart(e) {
    if (this.completed) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.activeShard = this.shards.find(s => 
      !s.placed && x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h
    );
  }

  handleInputMove(e) {
    if (!this.activeShard) return;
    const rect = this.canvas.getBoundingClientRect();
    this.activeShard.x = e.clientX - rect.left - this.activeShard.w/2;
    this.activeShard.y = e.clientY - rect.top - this.activeShard.h/2;
    this.draw();
  }

  handleInputEnd() {
    if (!this.activeShard) return;
    
    // Check placement
    const dist = Math.hypot(this.activeShard.x - this.activeShard.targetX, this.activeShard.y - this.activeShard.targetY);
    if (dist < 30) {
      this.activeShard.x = this.activeShard.targetX;
      this.activeShard.y = this.activeShard.targetY;
      this.activeShard.placed = true;
      this.playGoldEffect(this.activeShard);
    }
    
    this.activeShard = null;
    this.draw();
    this.checkCompletion();
  }

  playGoldEffect(shard) {
     // Visual flair for correct placement
     this.ctx.save();
     this.ctx.strokeStyle = '#FFD700';
     this.ctx.lineWidth = 5;
     this.ctx.strokeRect(shard.x, shard.y, shard.w, shard.h);
     this.ctx.restore();
  }

  checkCompletion() {
    if (this.shards.every(s => s.placed)) {
      this.completed = true;
      alert("¡Obra Restaurada! Tus cicatrices son ahora oro.");
    }
  }

  draw() {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, 600, 500);

    // Draw silhouette
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(250, 200, 200, 200);

    // Draw shards
    this.shards.forEach(s => {
      this.ctx.fillStyle = s.color;
      this.ctx.fillRect(s.x, s.y, s.w, s.h);
      if (s.placed) {
        this.ctx.strokeStyle = '#FFD700'; // Gold seams
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(s.x, s.y, s.w, s.h);
      }
    });
  }
}

window.KintsugiGame = new KintsugiGame();
