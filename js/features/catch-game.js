/**
 * CATCH GAME: MICA EDITION
 * Obra: Recolector de Inspiración
 */

class CatchGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.player = { x: 300, y: 350, w: 60, h: 20 };
    this.items = [];
    this.score = 0;
    this.active = false;
  }

  init() {
    const container = document.getElementById('catch-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="catch-wrapper">
        <div class="game-header">
          <h2>🧺 Colector de Musas</h2>
          <span class="score">Inspiración: 0</span>
        </div>
        <canvas id="catch-canvas" width="600" height="400"></canvas>
        <button class="start-btn">Recolectar</button>
      </div>
    `;

    this.canvas = document.getElementById('catch-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.player.x = e.clientX - rect.left - this.player.w/2;
    });

    container.querySelector('.start-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.active = true;
    this.score = 0;
    this.items = [];
    this.gameLoop();
  }

  spawnItem() {
    if (Math.random() < 0.05) {
        this.items.push({
            x: Math.random() * 580,
            y: 0,
            speed: 3 + Math.random() * 3,
            val: Math.random() > 0.8 ? 5 : 1
        });
    }
  }

  gameLoop() {
    if (!this.active) return;
    
    this.ctx.clearRect(0, 0, 600, 400);
    this.spawnItem();
    
    this.items.forEach((item, i) => {
        item.y += item.speed;
        this.ctx.fillStyle = item.val === 5 ? '#FFD700' : '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, 8, 0, Math.PI*2);
        this.ctx.fill();
        
        // Collision
        if (item.y > 350 && item.y < 370 && item.x > this.player.x && item.x < this.player.x + this.player.w) {
            this.score += item.val;
            this.items.splice(i, 1);
            document.querySelector('.catch-wrapper .score').textContent = `Inspiración: ${this.score}`;
        }
        
        // Falloff
        if (item.y > 400) this.items.splice(i, 1);
    });

    // Draw Player
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);

    requestAnimationFrame(() => this.gameLoop());
  }
}

window.CatchGame = new CatchGame();
