/**
 * Tetris Artístico - Naroa 2026
 * @module features/tetris-game
 * @description Classic Tetris with Naroa's artworks as block textures
 * @author IA Alliance Protocol
 */

(function() {
  'use strict';

  // ===========================================
  // GAME CONFIGURATION
  // ===========================================
  
  const CONFIG = {
    cols: 10,
    rows: 20,
    blockSize: 30,
    dropInterval: 1000,      // Initial speed (ms)
    speedIncrease: 50,       // Speed increase per level
    linesPerLevel: 10,
    pointsPerLine: [0, 100, 300, 500, 800] // 0, 1, 2, 3, 4 lines
  };

  // Tetromino shapes (I, O, T, S, Z, J, L)
  const TETROMINOES = {
    I: { shape: [[1,1,1,1]], color: '#00f5ff' },
    O: { shape: [[1,1],[1,1]], color: '#ffd700' },
    T: { shape: [[0,1,0],[1,1,1]], color: '#a855f7' },
    S: { shape: [[0,1,1],[1,1,0]], color: '#22c55e' },
    Z: { shape: [[1,1,0],[0,1,1]], color: '#ef4444' },
    J: { shape: [[1,0,0],[1,1,1]], color: '#3b82f6' },
    L: { shape: [[0,0,1],[1,1,1]], color: '#f97316' }
  };

  // ===========================================
  // GAME STATE
  // ===========================================
  
  let gameState = {
    board: [],
    currentPiece: null,
    currentX: 0,
    currentY: 0,
    score: 0,
    highScore: parseInt(localStorage.getItem('tetris-highscore') || '0'),
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    artworks: [],
    artworkIndex: 0,
    dropTimer: null,
    ctx: null,
    nextPiece: null,
    holdPiece: null,
    canHold: true,
    combo: 0
  };

  // ===========================================
  // INITIALIZATION
  // ===========================================

  async function initGame() {
    const container = document.getElementById('tetris-container');
    if (!container) return;

    // Load artworks for block textures
    await loadArtworks();

    // Create game structure
    container.innerHTML = `
      <div class="tetris-wrapper">
        <div class="tetris-main">
          <canvas id="tetris-canvas" width="${CONFIG.cols * CONFIG.blockSize}" height="${CONFIG.rows * CONFIG.blockSize}"></canvas>
          <div class="tetris-overlay" id="tetris-overlay" hidden>
            <div class="tetris-overlay__content">
              <h3 id="overlay-title">PAUSA</h3>
              <p id="overlay-text">Pulsa ESPACIO para continuar</p>
              <button class="tetris-btn" id="overlay-btn">Continuar</button>
            </div>
          </div>
        </div>
        <div class="tetris-sidebar">
          <div class="tetris-next">
            <h4>Siguiente</h4>
            <canvas id="tetris-next" width="120" height="80"></canvas>
          </div>
          <div class="tetris-stats">
            <div class="tetris-stat">
              <span class="tetris-stat__label">Puntos</span>
              <span class="tetris-stat__value" id="tetris-score">0</span>
            </div>
            <div class="tetris-stat">
              <span class="tetris-stat__label">Nivel</span>
              <span class="tetris-stat__value" id="tetris-level">1</span>
            </div>
            <div class="tetris-stat">
              <span class="tetris-stat__label">Líneas</span>
              <span class="tetris-stat__value" id="tetris-lines">0</span>
            </div>
            <div class="tetris-stat tetris-stat--combo">
              <span class="tetris-stat__label">Combo</span>
              <span class="tetris-stat__value" id="tetris-combo">x0</span>
            </div>
            <div class="tetris-stat tetris-stat--highscore">
              <span class="tetris-stat__label">Récord</span>
              <span class="tetris-stat__value" id="tetris-highscore">${gameState.highScore}</span>
            </div>
            <div id="tetris-ranking" style="margin-top: 20px;"></div>
          </div>
          <div class="tetris-controls">
            <button class="tetris-btn tetris-btn--start" id="tetris-start">▶ Jugar</button>
            <button class="tetris-btn" id="tetris-pause" disabled>⏸ Pausa</button>
          </div>
          <div class="tetris-help">
            <p>← → Mover</p>
            <p>↑ Rotar</p>
            <p>↓ Bajar</p>
            <p>ESPACIO Caer</p>
          </div>
        </div>
      </div>
    `;

    // Get canvas context
    const canvas = document.getElementById('tetris-canvas');
    gameState.ctx = canvas.getContext('2d');

    // Initialize board
    resetBoard();
    draw();

    // Attach controls
    attachControls();
  }

  async function loadArtworks() {
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      
      // Get artworks with images
      for (const artwork of data.artworks) {
        const img = new Image();
        img.src = `images/artworks/${artwork.id}.webp`;
        
        // Only add if image loads
        await new Promise((resolve) => {
          img.onload = () => {
            gameState.artworks.push({
              id: artwork.id,
              title: artwork.title,
              img: img
            });
            resolve();
          };
          img.onerror = resolve;
        });
        
        // Limit to 7 artworks (one per tetromino type)
        if (gameState.artworks.length >= 7) break;
      }
      
      console.log(`[Tetris] Loaded ${gameState.artworks.length} artwork textures`);
    } catch (error) {
      console.error('[Tetris] Error loading artworks:', error);
    }
  }

  function resetBoard() {
    gameState.board = [];
    for (let row = 0; row < CONFIG.rows; row++) {
      gameState.board.push(new Array(CONFIG.cols).fill(0));
    }
    gameState.score = 0;
    gameState.level = 1;
    gameState.lines = 0;
    gameState.combo = 0;
    gameState.gameOver = false;
    gameState.isPaused = false;
    gameState.artworkIndex = 0;
    gameState.canHold = true;
    gameState.holdPiece = null;
    updateStats();
  }

  // === SOUND EFFECTS ===
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  function playSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0.1;
    
    switch(type) {
      case 'move':
        oscillator.frequency.value = 200;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        break;
      case 'rotate':
        oscillator.frequency.value = 400;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
        break;
      case 'drop':
        oscillator.frequency.value = 100;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        break;
      case 'clear':
        oscillator.type = 'sine';
        oscillator.frequency.value = 600;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        break;
      case 'tetris':
        oscillator.type = 'square';
        oscillator.frequency.value = 800;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        break;
      case 'gameover':
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 150;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        break;
      case 'levelup':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  // ===========================================
  // GAME MECHANICS
  // ===========================================

  function startGame() {
    resetBoard();
    spawnPiece();
    gameState.nextPiece = getRandomPiece();
    drawNextPiece();
    
    if (gameState.dropTimer) clearInterval(gameState.dropTimer);
    gameState.dropTimer = setInterval(gameLoop, getDropSpeed());
    
    document.getElementById('tetris-start').disabled = true;
    document.getElementById('tetris-pause').disabled = false;
    document.getElementById('tetris-overlay').hidden = true;
  }

  function gameLoop() {
    if (gameState.gameOver || gameState.isPaused) return;
    
    if (!moveDown()) {
      placePiece();
      clearLines();
      spawnPiece();
      
      if (!isValidPosition(gameState.currentPiece, gameState.currentX, gameState.currentY)) {
        endGame();
      }
    }
    
    draw();
  }

  function getDropSpeed() {
    return Math.max(100, CONFIG.dropInterval - (gameState.level - 1) * CONFIG.speedIncrease);
  }

  function getRandomPiece() {
    const types = Object.keys(TETROMINOES);
    const type = types[Math.floor(Math.random() * types.length)];
    const tetromino = TETROMINOES[type];
    
    // Assign artwork texture
    const artwork = gameState.artworks[gameState.artworkIndex % gameState.artworks.length];
    gameState.artworkIndex++;
    
    return {
      type,
      shape: tetromino.shape.map(row => [...row]),
      color: tetromino.color,
      artwork: artwork
    };
  }

  function spawnPiece() {
    gameState.currentPiece = gameState.nextPiece || getRandomPiece();
    gameState.nextPiece = getRandomPiece();
    gameState.currentX = Math.floor((CONFIG.cols - gameState.currentPiece.shape[0].length) / 2);
    gameState.currentY = 0;
    drawNextPiece();
  }

  function isValidPosition(piece, x, y) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          if (newX < 0 || newX >= CONFIG.cols || newY >= CONFIG.rows) {
            return false;
          }
          
          if (newY >= 0 && gameState.board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function moveDown() {
    if (isValidPosition(gameState.currentPiece, gameState.currentX, gameState.currentY + 1)) {
      gameState.currentY++;
      return true;
    }
    return false;
  }

  function moveLeft() {
    if (isValidPosition(gameState.currentPiece, gameState.currentX - 1, gameState.currentY)) {
      gameState.currentX--;
      playSound('move');
      draw();
    }
  }

  function moveRight() {
    if (isValidPosition(gameState.currentPiece, gameState.currentX + 1, gameState.currentY)) {
      gameState.currentX++;
      playSound('move');
      draw();
    }
  }

  function rotate() {
    const rotated = {
      ...gameState.currentPiece,
      shape: gameState.currentPiece.shape[0].map((_, i) =>
        gameState.currentPiece.shape.map(row => row[i]).reverse()
      )
    };
    
    // Wall kick: try to fit rotated piece
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (isValidPosition(rotated, gameState.currentX + kick, gameState.currentY)) {
        gameState.currentPiece = rotated;
        gameState.currentX += kick;
        playSound('rotate');
        draw();
        return;
      }
    }
  }

  function getGhostY() {
    let ghostY = gameState.currentY;
    while (isValidPosition(gameState.currentPiece, gameState.currentX, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  function hardDrop() {
    const dropDistance = getGhostY() - gameState.currentY;
    gameState.score += dropDistance * 2; // Bonus for hard drop
    gameState.currentY = getGhostY();
    playSound('drop');
    placePiece();
    clearLines();
    spawnPiece();
    
    if (!isValidPosition(gameState.currentPiece, gameState.currentX, gameState.currentY)) {
      endGame();
    }
    
    draw();
    updateStats();
  }

  function placePiece() {
    for (let row = 0; row < gameState.currentPiece.shape.length; row++) {
      for (let col = 0; col < gameState.currentPiece.shape[row].length; col++) {
        if (gameState.currentPiece.shape[row][col]) {
          const y = gameState.currentY + row;
          const x = gameState.currentX + col;
          if (y >= 0) {
            gameState.board[y][x] = {
              color: gameState.currentPiece.color,
              artwork: gameState.currentPiece.artwork
            };
          }
        }
      }
    }
  }

  function clearLines() {
    let linesCleared = 0;
    const clearedRows = [];
    
    for (let row = CONFIG.rows - 1; row >= 0; row--) {
      if (gameState.board[row].every(cell => cell !== 0)) {
        clearedRows.push(row);
        gameState.board.splice(row, 1);
        gameState.board.unshift(new Array(CONFIG.cols).fill(0));
        linesCleared++;
        row++; // Check same row again
      }
    }
    
    if (linesCleared > 0) {
      // Combo system
      gameState.combo++;
      const comboBonus = gameState.combo > 1 ? 50 * gameState.combo : 0;
      
      gameState.lines += linesCleared;
      gameState.score += (CONFIG.pointsPerLine[linesCleared] + comboBonus) * gameState.level;
      
      // Play sound based on lines
      if (linesCleared === 4) {
        playSound('tetris');
        showLineClearEffect('T E T R I S !');
      } else {
        playSound('clear');
        if (linesCleared >= 2) {
          showLineClearEffect(linesCleared === 2 ? 'D O B L E' : 'T R I P L E');
        }
      }
      
      // Level up
      const newLevel = Math.floor(gameState.lines / CONFIG.linesPerLevel) + 1;
      if (newLevel > gameState.level) {
        gameState.level = newLevel;
        playSound('levelup');
        // Update drop speed
        clearInterval(gameState.dropTimer);
        gameState.dropTimer = setInterval(gameLoop, getDropSpeed());
      }
      
      // High score check
      if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('tetris-highscore', gameState.highScore.toString());
      }
      
      updateStats();
    } else {
      // Reset combo if no lines cleared
      gameState.combo = 0;
      updateStats();
    }
  }

  function showLineClearEffect(text) {
    const canvas = document.getElementById('tetris-canvas');
    if (!canvas) return;
    
    const effect = document.createElement('div');
    effect.className = 'tetris-effect';
    effect.textContent = text;
    effect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: bold;
      color: #ffd700;
      text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700;
      pointer-events: none;
      animation: tetris-clear-text 1s ease-out forwards;
      z-index: 100;
    `;
    
    canvas.parentElement.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
  }

  function endGame() {
    gameState.gameOver = true;
    clearInterval(gameState.dropTimer);
    playSound('gameover');
    
    document.getElementById('tetris-start').disabled = false;
    document.getElementById('tetris-pause').disabled = true;
    
    const newRecord = gameState.score > gameState.highScore;
    if (newRecord) {
      localStorage.setItem('tetris-highscore', gameState.highScore.toString());
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('tetris', gameState.score, () => {
          window.RankingSystem.renderLeaderboard('tetris', 'tetris-ranking');
        });
      }
      showOverlay('¡N U E V O  R É C O R D!', `Puntuación: ${gameState.score}`, 'Jugar de nuevo');
    } else {
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('tetris', gameState.score, () => {
          window.RankingSystem.renderLeaderboard('tetris', 'tetris-ranking');
        });
      }
      showOverlay('G A M E  O V E R', `Puntuación: ${gameState.score}`, 'Jugar de nuevo');
    }
  }

  function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
      showOverlay('P A U S A', 'Pulsa ESPACIO para continuar', 'Continuar');
    } else {
      document.getElementById('tetris-overlay').hidden = true;
    }
  }

  function showOverlay(title, text, btnText) {
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-text').textContent = text;
    document.getElementById('overlay-btn').textContent = btnText;
    document.getElementById('tetris-overlay').hidden = false;
  }

  // ===========================================
  // RENDERING
  // ===========================================

  function draw() {
    const ctx = gameState.ctx;
    const size = CONFIG.blockSize;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CONFIG.cols * size, CONFIG.rows * size);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CONFIG.cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * size, 0);
      ctx.lineTo(x * size, CONFIG.rows * size);
      ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * size);
      ctx.lineTo(CONFIG.cols * size, y * size);
      ctx.stroke();
    }
    
    // Draw placed blocks
    for (let row = 0; row < CONFIG.rows; row++) {
      for (let col = 0; col < CONFIG.cols; col++) {
        if (gameState.board[row][col]) {
          drawBlock(ctx, col, row, gameState.board[row][col]);
        }
      }
    }
    
    // Draw ghost piece (preview)
    if (gameState.currentPiece && !gameState.gameOver && !gameState.isPaused) {
      const ghostY = getGhostY();
      if (ghostY !== gameState.currentY) {
        for (let row = 0; row < gameState.currentPiece.shape.length; row++) {
          for (let col = 0; col < gameState.currentPiece.shape[row].length; col++) {
            if (gameState.currentPiece.shape[row][col]) {
              drawGhostBlock(ctx, gameState.currentX + col, ghostY + row, gameState.currentPiece.color);
            }
          }
        }
      }
    }
    
    // Draw current piece
    if (gameState.currentPiece && !gameState.gameOver) {
      for (let row = 0; row < gameState.currentPiece.shape.length; row++) {
        for (let col = 0; col < gameState.currentPiece.shape[row].length; col++) {
          if (gameState.currentPiece.shape[row][col]) {
            drawBlock(ctx, gameState.currentX + col, gameState.currentY + row, {
              color: gameState.currentPiece.color,
              artwork: gameState.currentPiece.artwork
            });
          }
        }
      }
    }
  }

  function drawGhostBlock(ctx, x, y, color) {
    const size = CONFIG.blockSize;
    const px = x * size;
    const py = y * size;
    
    ctx.strokeStyle = color + '60';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
    ctx.setLineDash([]);
  }

  function drawBlock(ctx, x, y, block) {
    const size = CONFIG.blockSize;
    const px = x * size;
    const py = y * size;
    
    // Draw artwork texture if available
    if (block.artwork && block.artwork.img) {
      ctx.drawImage(block.artwork.img, px + 1, py + 1, size - 2, size - 2);
      // Add semi-transparent color overlay
      ctx.fillStyle = block.color + '40';
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
    } else {
      // Fallback to solid color
      ctx.fillStyle = block.color;
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
    }
    
    // Block border
    ctx.strokeStyle = '#ffffff30';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
  }

  function drawNextPiece() {
    const canvas = document.getElementById('tetris-next');
    if (!canvas || !gameState.nextPiece) return;
    
    const ctx = canvas.getContext('2d');
    const size = 25;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const offsetX = (canvas.width - gameState.nextPiece.shape[0].length * size) / 2;
    const offsetY = (canvas.height - gameState.nextPiece.shape.length * size) / 2;
    
    for (let row = 0; row < gameState.nextPiece.shape.length; row++) {
      for (let col = 0; col < gameState.nextPiece.shape[row].length; col++) {
        if (gameState.nextPiece.shape[row][col]) {
          const px = offsetX + col * size;
          const py = offsetY + row * size;
          
          ctx.fillStyle = gameState.nextPiece.color;
          ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
          
          ctx.strokeStyle = '#ffffff30';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
        }
      }
    }
  }

  function updateStats() {
    const scoreEl = document.getElementById('tetris-score');
    const levelEl = document.getElementById('tetris-level');
    const linesEl = document.getElementById('tetris-lines');
    const comboEl = document.getElementById('tetris-combo');
    const highscoreEl = document.getElementById('tetris-highscore');
    
    if (scoreEl) scoreEl.textContent = gameState.score;
    if (levelEl) levelEl.textContent = gameState.level;
    if (linesEl) linesEl.textContent = gameState.lines;
    if (comboEl) {
      comboEl.textContent = `x${gameState.combo}`;
      comboEl.style.color = gameState.combo > 1 ? '#ffd700' : '';
    }
    if (highscoreEl) highscoreEl.textContent = gameState.highScore;
  }

  // ===========================================
  // CONTROLS
  // ===========================================

  function attachControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (gameState.gameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (!gameState.isPaused) moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!gameState.isPaused) moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!gameState.isPaused) {
            moveDown();
            draw();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!gameState.isPaused) rotate();
          break;
        case ' ':
          e.preventDefault();
          if (gameState.dropTimer && !gameState.gameOver) {
            if (gameState.isPaused) {
              togglePause();
            } else {
              hardDrop();
            }
          }
          break;
        case 'Escape':
        case 'p':
        case 'P':
          if (gameState.dropTimer && !gameState.gameOver) {
            togglePause();
          }
          break;
      }
    });

    // Button controls
    document.getElementById('tetris-start')?.addEventListener('click', startGame);
    document.getElementById('tetris-pause')?.addEventListener('click', togglePause);
    document.getElementById('overlay-btn')?.addEventListener('click', () => {
      if (gameState.gameOver) {
        startGame();
      } else {
        togglePause();
      }
    });

    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    const canvas = document.getElementById('tetris-canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      });

      canvas.addEventListener('touchend', (e) => {
        if (gameState.isPaused || gameState.gameOver) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > 30) moveRight();
          else if (dx < -30) moveLeft();
        } else {
          // Vertical swipe
          if (dy > 30) {
            hardDrop();
          } else if (dy < -30) {
            rotate();
          }
        }
      });

      canvas.addEventListener('click', () => {
        if (!gameState.isPaused && !gameState.gameOver) {
          rotate();
        }
      });
    }
  }

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.TetrisGame = {
    init: initGame,
    start: startGame,
    pause: togglePause,
    reset: () => {
      if (gameState.dropTimer) clearInterval(gameState.dropTimer);
      resetBoard();
      draw();
    }
  };

})();
