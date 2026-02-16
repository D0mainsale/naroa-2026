/**
 * PUZZLE GAME
 * Obra: Fragmentos de Identidad
 */

class PuzzleGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.pieces = [];
    this.rows = 3;
    this.cols = 3;
    this.selectedPiece = null;
  }

  init() {
    const container = document.getElementById('puzzle-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="puzzle-wrapper">
        <div class="game-header">
          <h2>🧩 Puzzle de Identidad</h2>
          <span class="status">Reconstruye la imagen</span>
        </div>
        <canvas id="puzzle-canvas" width="600" height="400"></canvas>
        <button class="shuffle-btn">Mezclar</button>
      </div>
    `;

    this.canvas = document.getElementById('puzzle-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('mousedown', this.handleInput.bind(this));
    
    container.querySelector('.shuffle-btn').addEventListener('click', () => this.shuffle());

    this.createPieces();
    this.draw();
  }

  createPieces() {
    // Placeholder numbers instead of image slices for simplicity without external assets
    this.pieces = [];
    const w = 600 / this.cols;
    const h = 400 / this.rows;
    
    for (let r=0; r<this.rows; r++) {
        for (let c=0; c<this.cols; c++) {
            this.pieces.push({
                val: r * this.cols + c + 1,
                r: r,
                c: c, // correct position
                x: c * w,
                y: r * h,
                w: w, 
                h: h,
                currentR: r,
                currentC: c
            });
        }
    }
  }

  shuffle() {
    // Simple shuffle by swapping grid positions
    for(let i=0; i<20; i++) {
        const p1 = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        const p2 = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        
        // Swap visual positions
        const tempX = p1.x; const tempY = p1.y;
        p1.x = p2.x; p1.y = p2.y;
        p2.x = tempX; p2.y = tempY;
    }
    this.draw();
  }

  handleInput(e) {
    // Simple click to swap logic or drag? Let's use click-swap for stability
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clicked = this.pieces.find(p => x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h);
    
    if (this.selectedPiece) {
        // Swap
        const tempX = this.selectedPiece.x; const tempY = this.selectedPiece.y;
        this.selectedPiece.x = clicked.x; this.selectedPiece.y = clicked.y;
        clicked.x = tempX; clicked.y = tempY;
        
        this.selectedPiece = null;
        this.checkWin();
    } else {
        this.selectedPiece = clicked;
    }
    this.draw();
  }

  checkWin() {
      // Check if all pieces are back in correct geometric slots matching their r/c
      const w = 600 / this.cols;
      const h = 400 / this.rows;
      const won = this.pieces.every(p => Math.abs(p.x - p.c * w) < 10 && Math.abs(p.y - p.r * h) < 10);
      
      if (won) alert("¡Identidad Reconstruida!");
  }

  draw() {
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, 600, 400);
    
    this.pieces.forEach(p => {
        this.ctx.fillStyle = p === this.selectedPiece ? '#5C6BC0' : '#3949AB';
        this.ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.val, p.x + p.w/2, p.y + p.h/2);
    });
  }
}

window.PuzzleGame = new PuzzleGame();
