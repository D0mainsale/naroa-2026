/**
 * TETRIS SARDINAS
 * Obra: Sardine Tin Collage
 */

class TetrisGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.grid = [];
    this.activePiece = null;
    this.score = 0;
    this.timer = null;
    this.active = false;
    this.colors = [
      null,
      '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
    ];
    
    this.pieces = 'ILJOTSZ';
  }

  init() {
    const container = document.getElementById('tetris-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="tetris-wrapper">
        <div class="game-header">
          <h2>🥫 Tetris Sardinero</h2>
          <span class="score">Líneas: 0</span>
        </div>
        <canvas id="tetris-canvas" width="240" height="400"></canvas>
        <button class="start-btn">Empaquetar</button>
      </div>
    `;

    this.canvas = document.getElementById('tetris-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(20, 20);

    // Controls
    document.addEventListener('keydown', this.handleInput.bind(this));
    container.querySelector('.start-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.grid = this.createMatrix(12, 20);
    this.activePiece = this.createPiece();
    this.score = 0;
    this.active = true;
    
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.update(), 1000);
    this.draw();
  }

  createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  createPiece() {
      const type = this.pieces[this.pieces.length * Math.random() | 0];
      if (type === 'I') {
          return { matrix: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], pos: {x: 3, y: 0}, type: 1 };
      } else if (type === 'L') {
          return { matrix: [[0, 2, 0], [0, 2, 0], [0, 2, 2]], pos: {x: 3, y: 0}, type: 2 };
      } else if (type === 'J') {
          return { matrix: [[0, 3, 0], [0, 3, 0], [3, 3, 0]], pos: {x: 3, y: 0}, type: 3 };
      } else if (type === 'O') {
          return { matrix: [[4, 4], [4, 4]], pos: {x: 4, y: 0}, type: 4 };
      } else if (type === 'Z') {
          return { matrix: [[5, 5, 0], [0, 5, 5], [0, 0, 0]], pos: {x: 3, y: 0}, type: 5 };
      } else if (type === 'S') {
          return { matrix: [[0, 6, 6], [6, 6, 0], [0, 0, 0]], pos: {x: 3, y: 0}, type: 6 };
      } else if (type === 'T') {
          return { matrix: [[0, 7, 0], [7, 7, 7], [0, 0, 0]], pos: {x: 3, y: 0}, type: 7 };
      }
      // Fallback
      return { matrix: [[0, 1, 0], [0, 1, 0], [0, 1, 0]], pos: {x: 3, y: 0}, type: 1 };
  }

  update() {
      this.activePiece.pos.y++;
      if (this.collide(this.grid, this.activePiece)) {
          this.activePiece.pos.y--;
          this.merge(this.grid, this.activePiece);
          this.arenaSweep();
          this.activePiece = this.createPiece();
          if (this.collide(this.grid, this.activePiece)) {
              this.gameOver();
          }
      }
      this.draw();
  }

  collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
          for (let x = 0; x < m[y].length; ++x) {
              if (m[y][x] !== 0 &&
                 (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                  return true;
              }
          }
      }
      return false;
  }

  merge(arena, player) {
      player.matrix.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  arena[y + player.pos.y][x + player.pos.x] = value;
              }
          });
      });
  }

  arenaSweep() {
      let rowCount = 1;
      outer: for (let y = this.grid.length - 1; y > 0; --y) {
          for (let x = 0; x < this.grid[y].length; ++x) {
              if (this.grid[y][x] === 0) {
                  continue outer;
              }
          }
          const row = this.grid.splice(y, 1)[0].fill(0);
          this.grid.unshift(row);
          ++y;
          this.score += rowCount * 10;
          rowCount *= 2;
      }
      document.querySelector('.tetris-wrapper .score').textContent = `Líneas: ${this.score}`;
  }

  draw() {
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawMatrix(this.grid, {x: 0, y: 0});
      this.drawMatrix(this.activePiece.matrix, this.activePiece.pos);
  }

  drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  this.ctx.fillStyle = this.colors[value];
                  this.ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
              }
          });
      });
  }

  handleInput(e) {
      if (!this.active) return;
      if (e.key === 'ArrowLeft') {
          this.activePiece.pos.x--;
          if (this.collide(this.grid, this.activePiece)) {
              this.activePiece.pos.x++;
          }
      } else if (e.key === 'ArrowRight') {
          this.activePiece.pos.x++;
          if (this.collide(this.grid, this.activePiece)) {
              this.activePiece.pos.x--;
          }
      } else if (e.key === 'ArrowDown') {
          this.update();
      } else if (e.key === 'ArrowUp') {
          this.playerRotate(1);
      }
      this.draw();
  }

  playerRotate(dir) {
      const pos = this.activePiece.pos.x;
      let offset = 1;
      this.rotate(this.activePiece.matrix, dir);
      while (this.collide(this.grid, this.activePiece)) {
          this.activePiece.pos.x += offset;
          offset = -(offset + (offset > 0 ? 1 : -1));
          if (offset > this.activePiece.matrix[0].length) {
              this.rotate(this.activePiece.matrix, -dir);
              this.activePiece.pos.x = pos;
              return;
          }
      }
  }

  rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
          for (let x = 0; x < y; ++x) {
              [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
          }
      }
      if (dir > 0) {
          matrix.forEach(row => row.reverse());
      } else {
          matrix.reverse();
      }
  }

  gameOver() {
    this.active = false;
    clearInterval(this.timer);
    alert(`Game Over! Puntuación final: ${this.score}`);
  }
}

window.TetrisGame = new TetrisGame();
