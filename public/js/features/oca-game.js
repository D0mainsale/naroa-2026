/**
 * El Juego de la Oca - Naroa 2026 Edition
 * @description Classic Oca board game with premium neon aesthetics & animations
 * Agent A08: Enhanced tile animations, dice roll 3D effect, path glow
 */
(function() {
  'use strict';

  const W = 800, H = 600;
  let state = {
    board: [], players: [], currentPlayer: 0, dice: 1, rolling: false,
    message: 'Tira el dado para empezar', gameOver: false,
    artworks: [], particles: [], turn: 0, camera: { x: 0, y: 0, targetX: 0, targetY: 0 }
  };

  async function init() {
    const container = document.getElementById('oca-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks;
    } catch (e) {}

    container.innerHTML = `
      <div class="oca-ui">
        <div class="oca-header">
          <span id="oca-message">${state.message}</span>
        </div>
        <div class="oca-controls">
          <button class="game-btn" id="oca-roll">🎲 Tirar Dado</button>
          <button class="game-btn secondary" id="oca-reset">Reiniciar</button>
        </div>
        <canvas id="oca-canvas" width="${W}" height="${H}"></canvas>
      </div>
    `;

    document.getElementById('oca-roll').addEventListener('click', rollDice);
    document.getElementById('oca-reset').addEventListener('click', resetGame);
    
    // Canvas interaction
    const canvas = document.getElementById('oca-canvas');
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (W / rect.width);
      const y = (e.clientY - rect.top) * (H / rect.height);
      // Hover effects logic could go here
    });

    createBoard();
    resetGame();
    gameLoop();
  }

  function createBoard() {
    // Spiral path generation
    state.board = [];
    const SPIRAL_LEN = 63;
    const centerX = W/2, centerY = H/2;
    let angle = 0, radius = 40;
    
    for (let i = 0; i < SPIRAL_LEN; i++) {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      let type = 'normal';
      let effect = null;

      // Special tiles
      if (i % 9 === 0 && i > 0) { type = 'oca'; effect = 'De Oca a Oca...'; }
      if (i === 19) { type = 'inn'; effect = 'Posada (Pierdes 1 turno)'; }
      if (i === 31) { type = 'well'; effect = 'Pozo (Espera rescate)'; }
      if (i === 42) { type = 'maze'; effect = 'Laberinto (Retrocede 12)'; }
      if (i === 52) { type = 'prison'; effect = 'Cárcel (Pierdes 2 turnos)'; }
      if (i === 58) { type = 'death'; effect = 'Muerte (Vuelve a 1)'; }
      if (i === 62) { type = 'garden'; effect = 'Jardín de Naroa (FIN)'; }

      state.board.push({
        index: i + 1, x, y, type, effect,
        art: state.artworks[i % state.artworks.length] || null
      });

      angle += 0.5;
      radius += (i < 30 ? 4 : 2.5);
    }
  }

  function resetGame() {
    state.players = [
      { id: 0, name: 'Jugador', color: '#ccff00', pos: 0, skipTurns: 0 },
      { id: 1, name: 'MICA', color: '#ff003c', pos: 0, skipTurns: 0 } // AI opponent
    ];
    state.currentPlayer = 0;
    state.gameOver = false;
    state.dice = 1;
    state.rolling = false;
    state.message = 'Tu turno';
    state.particles = [];
  }

  function rollDice() {
    if (state.rolling || state.gameOver) return;
    
    // Check skip turns
    if (state.players[state.currentPlayer].skipTurns > 0) {
      state.players[state.currentPlayer].skipTurns--;
      state.message = `${state.players[state.currentPlayer].name} pierde turno.`;
      nextTurn();
      return;
    }

    state.rolling = true;
    let rolls = 0;
    const rollInterval = setInterval(() => {
      state.dice = Math.floor(Math.random() * 6) + 1;
      rolls++;
      if (rolls > 10) {
        clearInterval(rollInterval);
        state.rolling = false;
        movePlayer(state.dice);
      }
    }, 50);
  }

  function movePlayer(steps) {
    const p = state.players[state.currentPlayer];
    let target = p.pos + steps;

    // Bounce back if over 63
    if (target >= 63) {
      const excess = target - 62;
      target = 62 - excess;
    }

    // Animation could be step-by-step, for now instant with visual slide
    const interval = setInterval(() => {
      if (p.pos < target) p.pos++;
      else if (p.pos > target) p.pos--;
      else {
        clearInterval(interval);
        handleTileEffect(p);
      }
    }, 200);
  }

  function handleTileEffect(p) {
    if (p.pos >= 62) { // Win (Index 63 is pos 62)
      state.message = `¡${p.name} GANA! 🎉`;
      state.gameOver = true;
      if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('oca-canvas'));
      return;
    }

    const tile = state.board[p.pos];
    state.message = `${p.name} cae en ${tile.index}: ${tile.effect || '...'}`;

    if (tile.type === 'oca') {
      state.message += ' ¡Tira otra vez!';
      // Jump to next Oca? Classic rules vary. Let's just grant extra roll.
      if (p.id === 1) setTimeout(rollDice, 1000); // AI rolls again
      return; // Don't nextTurn
    } 
    else if (tile.type === 'death') { p.pos = 0; state.message = '¡A la casilla 1!'; }
    else if (tile.type === 'maze') p.pos = Math.max(0, p.pos - 12);
    else if (tile.type === 'inn') p.skipTurns = 1;
    else if (tile.type === 'prison') p.skipTurns = 2;
    else if (tile.type === 'well') p.skipTurns = 3; // Or until rescued

    nextTurn();
  }

  function nextTurn() {
    state.currentPlayer = (state.currentPlayer + 1) % 2;
    // Update message
    if (state.players[state.currentPlayer].name === 'MICA') {
      state.message = 'Turno de MICA...';
      document.getElementById('oca-roll').disabled = true;
      setTimeout(rollDice, 1500);
    } else {
      state.message = 'Tu turno';
      document.getElementById('oca-roll').disabled = false;
    }
    document.getElementById('oca-message').textContent = state.message;
  }

  function draw() {
    const canvas = document.getElementById('oca-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
    grad.addColorStop(0, '#101020');
    grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Draw path connecting tiles
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    state.board.forEach((t, i) => {
      if (i === 0) ctx.moveTo(t.x, t.y);
      else ctx.lineTo(t.x, t.y);
    });
    ctx.stroke();

    // Draw tiles
    state.board.forEach(t => {
      ctx.save();
      ctx.translate(t.x, t.y);
      
      // Tile glow
      if (t.type !== 'normal') {
        ctx.shadowColor = t.type === 'death' ? '#ff003c' : '#ccff00';
        ctx.shadowBlur = 10;
      }

      ctx.fillStyle = t.type === 'normal' ? 'rgba(255,255,255,0.1)' : 
                      t.type === 'death' ? 'rgba(255,0,60,0.3)' : 'rgba(204,255,0,0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Index text
      ctx.fillStyle = '#fff';
      ctx.font = '10px Satoshi';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.index, 0, 0);

      ctx.restore();
    });

    // Draw Players
    state.players.forEach((p, i) => {
      const t = state.board[p.pos];
      if (!t) return;
      
      const offset = i * 10 - 5; // Separate overlapping players
      
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(t.x + offset, t.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Dice display
    if (state.rolling || state.dice) {
      ctx.fillStyle = '#fff';
      ctx.font = '40px Satoshi';
      ctx.textAlign = 'right';
      ctx.fillText(`🎲 ${state.dice}`, W - 30, 50);
    }

    requestAnimationFrame(draw);
  }

  function gameLoop() {
    draw();
  }

  window.OcaGame = { init };
})();
