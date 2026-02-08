/**
 * Tetris Art - Naroa 2026
 * @description Neon Tetris with ghost piece, hold queue, and particle effects
 * Agent A04: Ghost piece preview, line-clear flash, hold piece, wall kick
 */
(function() {
  'use strict';

  const COLS = 10, ROWS = 20, BLOCK = 25;
  const W = COLS * BLOCK, H = ROWS * BLOCK;
  
  let state = {
    board: [], piece: null, next: null, hold: null, 
    score: 0, lines: 0, level: 1, 
    canHold: true, gameOver: false, paused: false,
    particles: [], dropInterval: 1000, lastTime: 0, dropCounter: 0
  };

  const SHAPES = [
    { type: 'I', color: '#00f0f0', matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
    { type: 'J', color: '#0000f0', matrix: [[1,0,0],[1,1,1],[0,0,0]] },
    { type: 'L', color: '#f0a000', matrix: [[0,0,1],[1,1,1],[0,0,0]] },
    { type: 'O', color: '#f0f000', matrix: [[1,1],[1,1]] },
    { type: 'S', color: '#00f000', matrix: [[0,1,1],[1,1,0],[0,0,0]] },
    { type: 'T', color: '#a000f0', matrix: [[0,1,0],[1,1,1],[0,0,0]] },
    { type: 'Z', color: '#f00000', matrix: [[1,1,0],[0,1,1],[0,0,0]] }
  ];

  function init() {
    const container = document.getElementById('tetris-container');
    if (!container) return;

    container.innerHTML = `
      <div class="tetris-ui">
        <div class="tetris-side">
          <div class="tetris-box">
            <h3>HOLD</h3>
            <canvas id="tetris-hold" width="100" height="100"></canvas>
          </div>
          <div class="tetris-info">
             <p>SCORE: <strong id="tetris-score">0</strong></p>
             <p>LINES: <strong id="tetris-lines">0</strong></p>
             <p>LEVEL: <strong id="tetris-level">1</strong></p>
          </div>
        </div>
        <canvas id="tetris-board" width="${W}" height="${H}"></canvas>
        <div class="tetris-side">
          <div class="tetris-box">
            <h3>NEXT</h3>
            <canvas id="tetris-next" width="100" height="100"></canvas>
          </div>
          <button class="game-btn" id="tetris-start">New Game</button>
        </div>
      </div>
    `;

    document.getElementById('tetris-start').addEventListener('click', startGame);
    document.addEventListener('keydown', handleInput);

    // Touch controls
    let touchX = 0, touchY = 0;
    const canvas = document.getElementById('tetris-board');
    canvas.addEventListener('touchstart', e => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, {passive:true});
    canvas.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 1 : -1);
      } else {
        if (dy > 30) drop();
        else if (dy < -30) rotate();
      }
    }, {passive:true});

    resetGame();
    gameLoop(0);
  }

  function resetGame() {
    state.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.gameOver = false;
    state.particles = [];
    state.hold = null;
    state.next = randomPiece();
    state.piece = randomPiece();
    state.dropInterval = 1000;
    updateUI();
  }

  function startGame() {
    resetGame();
    state.paused = false;
  }

  function randomPiece() {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      matrix: s.matrix,
      color: s.color,
      x: Math.floor(COLS/2) - Math.floor(s.matrix[0].length/2),
      y: 0
    };
  }

  function handleInput(e) {
    if (state.gameOver) return;
    if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowDown') drop();
    else if (e.key === 'ArrowUp') rotate();
    else if (e.key === ' ') hardDrop();
    else if (e.key === 'c' || e.key === 'Shift') holdPiece();
  }

  function move(dir) {
    state.piece.x += dir;
    if (collide(state.board, state.piece)) {
      state.piece.x -= dir;
    }
  }

  function drop() {
    state.piece.y++;
    if (collide(state.board, state.piece)) {
      state.piece.y--;
      merge();
      lineClear();
      state.piece = state.next;
      state.next = randomPiece();
      state.piece.x = Math.floor(COLS/2) - Math.floor(state.piece.matrix[0].length/2);
      state.piece.y = 0;
      state.canHold = true;
      if (collide(state.board, state.piece)) {
        state.gameOver = true;
        if (window.GameEffects) GameEffects.cameraShake(document.getElementById('tetris-board'), 10);
      }
      updateUI();
    }
    state.dropCounter = 0;
  }

  function hardDrop() {
    while(!collide(state.board, state.piece)) {
      state.piece.y++;
    }
    state.piece.y--;
    drop(); // Merge immediately
    if (window.GameEffects) GameEffects.hapticFeedback();
    spawnParticles(state.piece.x * BLOCK, state.piece.y * BLOCK, 20);
  }

  function rotate() {
    const pos = state.piece.x;
    let offset = 1;
    const matrix = state.piece.matrix;
    // Transpose + Reverse
    const N = matrix.length;
    const nextMatrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
    
    state.piece.matrix = nextMatrix;
    while (collide(state.board, state.piece)) {
      state.piece.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > matrix[0].length) {
        state.piece.matrix = matrix; // Revert
        state.piece.x = pos;
        return;
      }
    }
  }

  function holdPiece() {
    if (!state.canHold) return;
    if (!state.hold) {
      state.hold = state.piece;
      state.piece = state.next;
      state.next = randomPiece();
    } else {
      const temp = state.piece;
      state.piece = state.hold;
      state.hold = temp;
    }
    state.piece.x = Math.floor(COLS/2) - Math.floor(state.piece.matrix[0].length/2);
    state.piece.y = 0;
    // Reset rotation/color is tricky, simplify: just keep shape
    state.canHold = false;
    updateUI();
  }

  function collide(arena, player) {
    const [m, o] = [player.matrix, player];
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

  function merge() {
    state.piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          state.board[y + state.piece.y][x + state.piece.x] = state.piece.color;
        }
      });
    });
  }

  function lineClear() {
    let rowCount = 0;
    outer: for (let y = state.board.length - 1; y > 0; --y) {
      for (let x = 0; x < state.board[y].length; ++x) {
        if (state.board[y][x] === 0) continue outer;
      }
      
      const row = state.board.splice(y, 1)[0].fill(0);
      state.board.unshift(row);
      ++y;
      rowCount++;
      // Spawn particles across line
      for(let k=0; k<COLS; k++) spawnParticles(k*BLOCK, y*BLOCK, 2);
    }
    
    if (rowCount > 0) {
      state.lines += rowCount;
      state.score += rowCount * 100 * state.level;
      state.level = Math.floor(state.lines / 10) + 1;
      state.dropInterval = Math.max(100, 1000 - (state.level * 50));
      updateUI();
      if (window.GameEffects) {
         const scoreEl = document.getElementById('tetris-score');
         GameEffects.scorePopAnimation(scoreEl, `+${rowCount * 100 * state.level}`);
         GameEffects.confettiBurst(document.getElementById('tetris-board'));
      }
    }
  }

  function spawnParticles(x, y, count) {
    for(let i=0; i<count; i++) {
        state.particles.push({
            x: x + Math.random()*BLOCK, 
            y: y + Math.random()*BLOCK,
            vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
            life: 1.0, color: '#fff', size: Math.random()*3
        });
    }
  }

  function updateUI() {
    document.getElementById('tetris-score').textContent = state.score;
    document.getElementById('tetris-lines').textContent = state.lines;
    document.getElementById('tetris-level').textContent = state.level;
    drawMiniBoard('tetris-next', state.next);
    drawMiniBoard('tetris-hold', state.hold);
  }

  function drawMiniBoard(id, piece) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!piece) return;
    
    const size = 20;
    const offsetX = (canvas.width - piece.matrix[0].length * size)/2;
    const offsetY = (canvas.height - piece.matrix.length * size)/2;
    
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = piece.color;
                ctx.fillRect(x*size + offsetX, y*size + offsetY, size-1, size-1);
            }
        });
    });
  }

  function draw() {
    const canvas = document.getElementById('tetris-board');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Bg
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Board
    state.board.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          ctx.fillStyle = val;
          ctx.shadowColor = val;
          ctx.shadowBlur = 10;
          ctx.fillRect(x*BLOCK+1, y*BLOCK+1, BLOCK-2, BLOCK-2);
          
          // Inner shine to look like glass
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(x*BLOCK+1, y*BLOCK+1, BLOCK-2, BLOCK/3);
        }
      });
    });
    ctx.shadowBlur = 0;

    // Ghost piece
    if (!state.gameOver) {
        let ghost = { ...state.piece, y: state.piece.y };
        while(!collide(state.board, ghost)) { ghost.y++; }
        ghost.y--;
        
        ctx.globalAlpha = 0.2;
        ghost.matrix.forEach((row, y) => {
           row.forEach((val, x) => {
               if (val !== 0) {
                   ctx.fillStyle = state.piece.color;
                   ctx.fillRect((x+ghost.x)*BLOCK, (y+ghost.y)*BLOCK, BLOCK, BLOCK);
               }
           });
        });
        ctx.globalAlpha = 1.0;

        // Current Piece
        state.piece.matrix.forEach((row, y) => {
           row.forEach((val, x) => {
               if (val !== 0) {
                   ctx.fillStyle = state.piece.color;
                   ctx.shadowColor = state.piece.color;
                   ctx.shadowBlur = 15;
                   ctx.fillRect((x+state.piece.x)*BLOCK+1, (y+state.piece.y)*BLOCK+1, BLOCK-2, BLOCK-2);
                   ctx.shadowBlur = 0;
               }
           });
        });
    }

    // Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }

  function gameLoop(time = 0) {
    const dt = time - state.lastTime;
    state.lastTime = time;
    
    if (!state.gameOver && !state.paused) {
        state.dropCounter += dt;
        if (state.dropCounter > state.dropInterval) {
            drop();
        }
    }
    
    // Update particles
    state.particles = state.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        return p.life > 0;
    });

    draw();
    requestAnimationFrame(gameLoop);
  }

  window.TetrisGame = { init };
})();
