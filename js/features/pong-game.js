/**
 * PONG ARTÍSTICO - Classic Pong with artwork ball
 * Features persistent ranking
 */

(function() {
  'use strict';

  let gameState = {
    canvas: null,
    ctx: null,
    running: false,
    score: 0,
    aiScore: 0,
    maxScore: 5,
    ball: { x: 0, y: 0, vx: 5, vy: 3, size: 20 },
    paddle: { y: 0, height: 80, width: 12 },
    aiPaddle: { y: 0 },
    artworkImg: null
  };

  const CONTAINER_ID = 'pong-container';

  async function loadArtwork() {
    try {
      const response = await fetch('data/intro-artworks.json');
      const data = await response.json();
      const art = data.artworks[Math.floor(Math.random() * data.artworks.length)];
      const img = new Image();
      img.src = `img/artworks-intro/${art.file}`;
      await new Promise(r => { img.onload = r; img.onerror = r; });
      gameState.artworkImg = img;
    } catch (e) {
      console.log('Pong: using default ball');
    }
  }

  function initGame() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <div class="pong-game">
        <div class="pong-scores">
          <span id="pong-player-score">0</span>
          <span class="pong-vs">VS</span>
          <span id="pong-ai-score">0</span>
        </div>
        <canvas id="pong-canvas" width="600" height="400"></canvas>
        <div class="pong-controls">
          <p>↑↓ o arrastra para mover</p>
          <button class="game-btn" id="pong-start">🎮 Jugar</button>
        </div>
        <div id="pong-ranking"></div>
      </div>
    `;

    gameState.canvas = document.getElementById('pong-canvas');
    gameState.ctx = gameState.canvas.getContext('2d');

    // Init positions
    resetBall();
    gameState.paddle.y = gameState.canvas.height / 2 - gameState.paddle.height / 2;
    gameState.aiPaddle.y = gameState.paddle.y;

    // Events
    document.getElementById('pong-start').addEventListener('click', startGame);
    
    gameState.canvas.addEventListener('mousemove', (e) => {
      const rect = gameState.canvas.getBoundingClientRect();
      gameState.paddle.y = e.clientY - rect.top - gameState.paddle.height / 2;
      clampPaddle();
    });

    // Touch support
    // Touch support with preventing default scroll
    gameState.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Stop scrolling while playing
      const rect = gameState.canvas.getBoundingClientRect();
      const scaleY = gameState.canvas.height / rect.height; // Account for CSS resizing
      const touchY = (e.touches[0].clientY - rect.top) * scaleY;
      
      gameState.paddle.y = touchY - gameState.paddle.height / 2;
      clampPaddle();
    }, { passive: false });
    
    // Auto-start on touch
    gameState.canvas.addEventListener('touchstart', (e) => {
      if (!gameState.running) startGame();
    }, { passive: true });

    // Load artwork and render ranking
    loadArtwork();
    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('pong', 'pong-ranking');
    }

    draw();
  }

  function clampPaddle() {
    const max = gameState.canvas.height - gameState.paddle.height;
    gameState.paddle.y = Math.max(0, Math.min(max, gameState.paddle.y));
  }

  function resetBall() {
    const canvas = gameState.canvas;
    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height / 2;
    gameState.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
    gameState.ball.vy = (Math.random() - 0.5) * 6;
  }

  function startGame() {
    gameState.score = 0;
    gameState.aiScore = 0;
    gameState.running = true;
    document.getElementById('pong-start').style.display = 'none';
    resetBall();
    updateScoreDisplay();
    gameLoop();
  }

  function endGame(won) {
    gameState.running = false;
    document.getElementById('pong-start').style.display = 'inline-block';

    if (won && window.RankingSystem) {
      // Score = (player score - AI score) * 100 + speed bonus
      const finalScore = gameState.score * 100;
      window.RankingSystem.showSubmitModal('pong', finalScore, () => {
        window.RankingSystem.renderLeaderboard('pong', 'pong-ranking');
      });
    }
  }

  function updateScoreDisplay() {
    document.getElementById('pong-player-score').textContent = gameState.score;
    document.getElementById('pong-ai-score').textContent = gameState.aiScore;
  }

  function update() {
    const ball = gameState.ball;
    const canvas = gameState.canvas;
    const paddle = gameState.paddle;
    const aiPaddle = gameState.aiPaddle;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom bounce
    if (ball.y <= ball.size || ball.y >= canvas.height - ball.size) {
      ball.vy *= -1;
    }

    // Player paddle collision (left side)
    if (ball.x <= paddle.width + ball.size) {
      if (ball.y >= paddle.y && ball.y <= paddle.y + paddle.height) {
        ball.vx = Math.abs(ball.vx) * 1.05; // Speed up
        ball.vy += (ball.y - (paddle.y + paddle.height / 2)) * 0.1;
      } else if (ball.x < 0) {
        gameState.aiScore++;
        updateScoreDisplay();
        if (gameState.aiScore >= gameState.maxScore) {
          endGame(false);
          return;
        }
        resetBall();
      }
    }

    // AI paddle collision (right side)
    if (ball.x >= canvas.width - paddle.width - ball.size) {
      if (ball.y >= aiPaddle.y && ball.y <= aiPaddle.y + paddle.height) {
        ball.vx = -Math.abs(ball.vx) * 1.05;
        ball.vy += (ball.y - (aiPaddle.y + paddle.height / 2)) * 0.1;
      } else if (ball.x > canvas.width) {
        gameState.score++;
        updateScoreDisplay();
        if (gameState.score >= gameState.maxScore) {
          endGame(true);
          return;
        }
        resetBall();
      }
    }

    // AI movement (follows ball with some lag)
    const aiCenter = aiPaddle.y + paddle.height / 2;
    const diff = ball.y - aiCenter;
    aiPaddle.y += diff * 0.06;
    aiPaddle.y = Math.max(0, Math.min(canvas.height - paddle.height, aiPaddle.y));

    // Limit ball speed
    ball.vx = Math.max(-12, Math.min(12, ball.vx));
    ball.vy = Math.max(-8, Math.min(8, ball.vy));
  }

  function draw() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    const ball = gameState.ball;
    const paddle = gameState.paddle;
    const aiPaddle = gameState.aiPaddle;

    // Clear
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#888';
    ctx.fillRect(canvas.width - paddle.width, aiPaddle.y, paddle.width, paddle.height);

    // Ball (artwork or circle)
    if (gameState.artworkImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        gameState.artworkImg,
        ball.x - ball.size,
        ball.y - ball.size,
        ball.size * 2,
        ball.size * 2
      );
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function gameLoop() {
    if (!gameState.running) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Export
  window.PongGame = { init: initGame };
})();
