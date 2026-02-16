/**
 * REINAS GAME
 * Obra: Las 8 Reinas / Ajedrez Metafórico
 */

class ReinasGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.boardSize = 8;
    this.queens = [];
    this.cellSize = 50;
    this.active = false;
  }

  init() {
    const container = document.getElementById('reinas-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="reinas-wrapper">
        <div class="game-header">
          <h2>♛ El Dilema de las Reinas</h2>
          <span class="status">Coloca 8 reinas sin que se ataquen</span>
        </div>
        <canvas id="reinas-canvas" width="400" height="400"></canvas>
        <button class="reset-btn">Limpiar Tablero</button>
      </div>
    `;

    this.canvas = document.getElementById('reinas-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    container.querySelector('.reset-btn').addEventListener('click', () => this.start());

    this.start();
  }

  start() {
    this.queens = [];
    this.active = true;
    this.draw();
  }

  handleClick(e) {
    if (!this.active) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / this.cellSize);
    const y = Math.floor((e.clientY - rect.top) / this.cellSize);

    // Toggle queen
    const existingIndex = this.queens.findIndex(q => q.x === x && q.y === y);
    if (existingIndex >= 0) {
      this.queens.splice(existingIndex, 1);
    } else {
      // Check logical validity? Allow placement and show conflicts?
      // Let's show conflicts visually
      this.queens.push({x, y});
    }

    this.draw();
    this.checkWin();
  }

  checkWin() {
    // Check conflicts
    let conflicts = false;
    for (let i = 0; i < this.queens.length; i++) {
        for (let j = i + 1; j < this.queens.length; j++) {
            const q1 = this.queens[i];
            const q2 = this.queens[j];
            if (q1.x === q2.x || q1.y === q2.y || Math.abs(q1.x - q2.x) === Math.abs(q1.y - q2.y)) {
                conflicts = true;
            }
        }
    }

    if (!conflicts && this.queens.length === 8) {
        setTimeout(() => alert("¡Reinas en Armonía! Has resuelto el puzzle."), 100);
        this.active = false;
    }
  }

  draw() {
    for (let y = 0; y < this.boardSize; y++) {
        for (let x = 0; x < this.boardSize; x++) {
            this.ctx.fillStyle = (x + y) % 2 === 0 ? '#EEE' : '#333';
            this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
    }

    this.queens.forEach(q => {
        this.ctx.fillStyle = 'red';
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('♛', q.x * this.cellSize + this.cellSize/2, q.y * this.cellSize + this.cellSize/2);
        
        // Highlight attacks?
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.lineWidth = 2;
        // Horizontal
        this.ctx.beginPath(); this.ctx.moveTo(0, q.y * this.cellSize + this.cellSize/2); this.ctx.lineTo(400, q.y * this.cellSize + this.cellSize/2); this.ctx.stroke();
        // Vertical
        this.ctx.beginPath(); this.ctx.moveTo(q.x * this.cellSize + this.cellSize/2, 0); this.ctx.lineTo(q.x * this.cellSize + this.cellSize/2, 400); this.ctx.stroke();
        // Diagonals... (omitted for cleaner visual)
    });
  }
}

window.ReinasGame = new ReinasGame();
