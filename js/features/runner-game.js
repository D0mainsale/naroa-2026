/**
 * GALERÍA RUNNER - Endless runner por los pasillos de la galería
 * Esquiva obstáculos y recoge obras de arte
 */
(function() {
  'use strict';

  const RUNNER_CONFIG = {
    gravity: 0.8,
    jumpForce: -15,
    speed: 5,
    artworks: []
  };

  let runnerState = {
    canvas: null,
    ctx: null,
    player: { x: 80, y: 200, vy: 0, width: 40, height: 60, jumping: false },
    obstacles: [],
    collectibles: [],
    score: 0,
    distance: 0,
    gameOver: false,
    animFrame: null
  };

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      RUNNER_CONFIG.artworks = (data.artworks || data).slice(0, 10);
    } catch(e) {
      RUNNER_CONFIG.artworks = [{ image: 'images/optimized/amy-rocks.webp' }];
    }
  }

  function initGame(container) {
    runnerState = {
      ...runnerState,
      obstacles: [],
      collectibles: [],
      score: 0,
      distance: 0,
      gameOver: false,
      player: { x: 80, y: 200, vy: 0, width: 40, height: 60, jumping: false }
    };

    container.innerHTML = `
      <div class="runner-game">
        <div class="runner-header">
          <span>Puntos: <strong id="runner-score">0</strong></span>
          <span>Distancia: <strong id="runner-distance">0</strong>m</span>
        </div>
        <canvas id="runner-canvas" width="600" height="300"></canvas>
        <p class="runner-hint">⬆️ Pulsa ESPACIO o toca para saltar</p>
        <button class="game-btn" id="runner-restart" style="display:none;">Reintentar</button>
      </div>
      <style>
        .runner-game { text-align: center; padding: 1rem; }
        .runner-header { display: flex; justify-content: space-around; margin-bottom: 1rem; font-size: 1.1rem; }
        #runner-canvas { background: linear-gradient(#1a1a2e, #2d2d44); border-radius: 12px; max-width: 100%; }
        .runner-hint { color: rgba(255,255,255,0.6); margin: 1rem 0; }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
      </style>
    `;

    const canvas = document.getElementById('runner-canvas');
    const ctx = canvas.getContext('2d');
    runnerState.canvas = canvas;
    runnerState.ctx = ctx;

    // Controls
    const jump = () => {
      if (!runnerState.player.jumping && !runnerState.gameOver) {
        runnerState.player.vy = RUNNER_CONFIG.jumpForce;
        runnerState.player.jumping = true;
      }
    };

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); jump(); }
    });
    canvas.addEventListener('click', jump);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

    document.getElementById('runner-restart').addEventListener('click', () => initGame(container));

    gameLoop();
  }

  function spawnObstacle() {
    const { canvas } = runnerState;
    runnerState.obstacles.push({
      x: canvas.width,
      y: canvas.height - 60,
      width: 30,
      height: 40 + Math.random() * 30
    });
  }

  function spawnCollectible() {
    const { canvas } = runnerState;
    const art = RUNNER_CONFIG.artworks[Math.floor(Math.random() * RUNNER_CONFIG.artworks.length)];
    runnerState.collectibles.push({
      x: canvas.width,
      y: 100 + Math.random() * 100,
      width: 40,
      height: 40,
      image: art.image
    });
  }

  function gameLoop() {
    const { canvas, ctx, player } = runnerState;
    
    if (runnerState.gameOver) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw floor
    ctx.fillStyle = '#3d3d5c';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Physics
    player.vy += RUNNER_CONFIG.gravity;
    player.y += player.vy;
    
    const ground = canvas.height - 20 - player.height;
    if (player.y >= ground) {
      player.y = ground;
      player.vy = 0;
      player.jumping = false;
    }

    // Draw player (simple rectangle with emoji)
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.font = '30px sans-serif';
    ctx.fillText('🏃', player.x + 5, player.y + 40);

    // Spawn
    if (Math.random() < 0.02) spawnObstacle();
    if (Math.random() < 0.01) spawnCollectible();

    // Update obstacles
    runnerState.obstacles = runnerState.obstacles.filter(obs => {
      obs.x -= RUNNER_CONFIG.speed;
      
      // Draw
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
      
      // Collision
      if (player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y + player.height > obs.y - obs.height) {
        gameEnd();
      }
      
      return obs.x > -obs.width;
    });

    // Update collectibles
    runnerState.collectibles = runnerState.collectibles.filter(col => {
      col.x -= RUNNER_CONFIG.speed;
      
      // Draw
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(col.x, col.y, col.width, col.height);
      ctx.font = '25px sans-serif';
      ctx.fillText('🖼️', col.x + 8, col.y + 30);
      
      // Collect
      if (player.x < col.x + col.width &&
          player.x + player.width > col.x &&
          player.y < col.y + col.height &&
          player.y + player.height > col.y) {
        runnerState.score += 50;
        document.getElementById('runner-score').textContent = runnerState.score;
        return false;
      }
      
      return col.x > -col.width;
    });

    // Score
    runnerState.distance++;
    document.getElementById('runner-distance').textContent = Math.floor(runnerState.distance / 10);

    runnerState.animFrame = requestAnimationFrame(gameLoop);
  }

  function gameEnd() {
    runnerState.gameOver = true;
    cancelAnimationFrame(runnerState.animFrame);
    
    const finalScore = runnerState.score + Math.floor(runnerState.distance / 10);
    
    document.getElementById('runner-restart').style.display = 'inline-block';
    
    setTimeout(() => {
      alert(`💥 ¡Game Over!\nPuntuación: ${finalScore}`);
      
      if (window.RankingSystem) {
        window.RankingSystem.submitScore('runner', finalScore);
      }
    }, 100);
  }

  window.initRunnerGame = async function(container) {
    await loadArtworks();
    initGame(container);
  };
})();
