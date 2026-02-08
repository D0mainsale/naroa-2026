/**
 * PONG ARTÍSTICO - Classic Pong with neon trails & particles
 * Agent A03: Ball trail, net glow, score confetti, paddle neon
 */
(function() {
  'use strict';

  let gameState = {
    canvas: null, ctx: null, running: false,
    score: 0, aiScore: 0, maxScore: 5,
    ball: { x: 0, y: 0, vx: 5, vy: 3, size: 12 },
    paddle: { y: 0, height: 80, width: 12 },
    aiPaddle: { y: 0 },
    artworkImg: null, trails: [], particles: [], shakeFrames: 0
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
    } catch (e) {}
  }

  function initGame() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <div class="pong-game">
        <div class="pong-scores">
          <span id="pong-player-score" style="color:#ffd700;font-size:2rem;font-weight:bold">0</span>
          <span class="pong-vs" style="color:rgba(255,255,255,0.3)">VS</span>
          <span id="pong-ai-score" style="color:#666;font-size:2rem;font-weight:bold">0</span>
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
    gameState.trails = [];
    gameState.particles = [];

    resetBall();
    gameState.paddle.y = gameState.canvas.height / 2 - gameState.paddle.height / 2;
    gameState.aiPaddle.y = gameState.paddle.y;

    document.getElementById('pong-start').addEventListener('click', startGame);

    gameState.canvas.addEventListener('mousemove', (e) => {
      const rect = gameState.canvas.getBoundingClientRect();
      gameState.paddle.y = e.clientY - rect.top - gameState.paddle.height / 2;
      clampPaddle();
    });

    gameState.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = gameState.canvas.getBoundingClientRect();
      const scaleY = gameState.canvas.height / rect.height;
      gameState.paddle.y = (e.touches[0].clientY - rect.top) * scaleY - gameState.paddle.height / 2;
      clampPaddle();
    }, { passive: false });

    gameState.canvas.addEventListener('touchstart', () => {
      if (!gameState.running) startGame();
    }, { passive: true });

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
    gameState.trails = [];
  }

  function spawnParticles(x, y, hue, count = 8) {
    for (let i = 0; i < count; i++) {
      gameState.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1, hue, size: 2 + Math.random() * 3
      });
    }
  }

  function startGame() {
    gameState.score = 0;
    gameState.aiScore = 0;
    gameState.running = true;
    gameState.shakeFrames = 0;
    document.getElementById('pong-start').style.display = 'none';
    resetBall();
    updateScoreDisplay();
    gameLoop();
  }

  function endGame(won) {
    gameState.running = false;
    document.getElementById('pong-start').style.display = 'inline-block';

    if (won && window.GameEffects) {
      GameEffects.confettiBurst(gameState.canvas);
    }

    if (won && window.RankingSystem) {
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

    // Trail
    gameState.trails.push({ x: ball.x, y: ball.y, life: 1 });
    if (gameState.trails.length > 15) gameState.trails.shift();

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom bounce
    if (ball.y <= ball.size || ball.y >= canvas.height - ball.size) {
      ball.vy *= -1;
      spawnParticles(ball.x, ball.y, 50, 3);
    }

    // Player paddle collision
    if (ball.x <= paddle.width + ball.size) {
      if (ball.y >= paddle.y && ball.y <= paddle.y + paddle.height) {
        ball.vx = Math.abs(ball.vx) * 1.05;
        ball.vy += (ball.y - (paddle.y + paddle.height / 2)) * 0.1;
        spawnParticles(ball.x, ball.y, 45, 6);
        gameState.shakeFrames = 3;
      } else if (ball.x < 0) {
        gameState.aiScore++;
        updateScoreDisplay();
        spawnParticles(0, ball.y, 0, 15);
        gameState.shakeFrames = 6;
        if (gameState.aiScore >= gameState.maxScore) { endGame(false); return; }
        resetBall();
      }
    }

    // AI paddle collision
    if (ball.x >= canvas.width - paddle.width - ball.size) {
      if (ball.y >= aiPaddle.y && ball.y <= aiPaddle.y + paddle.height) {
        ball.vx = -Math.abs(ball.vx) * 1.05;
        ball.vy += (ball.y - (aiPaddle.y + paddle.height / 2)) * 0.1;
        spawnParticles(ball.x, ball.y, 200, 4);
      } else if (ball.x > canvas.width) {
        gameState.score++;
        updateScoreDisplay();
        spawnParticles(canvas.width, ball.y, 45, 15);
        if (window.GameEffects) GameEffects.scorePopAnimation(document.getElementById('pong-player-score'), '+1');
        if (gameState.score >= gameState.maxScore) { endGame(true); return; }
        resetBall();
      }
    }

    // AI movement
    const aiCenter = aiPaddle.y + paddle.height / 2;
    aiPaddle.y += (ball.y - aiCenter) * 0.06;
    aiPaddle.y = Math.max(0, Math.min(canvas.height - paddle.height, aiPaddle.y));

    // Speed limits
    ball.vx = Math.max(-14, Math.min(14, ball.vx));
    ball.vy = Math.max(-10, Math.min(10, ball.vy));

    // Shake decay
    if (gameState.shakeFrames > 0) gameState.shakeFrames--;

    // Particles
    gameState.particles = gameState.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.03;
      return p.life > 0;
    });

    // Trails
    gameState.trails.forEach(t => t.life -= 0.07);
    gameState.trails = gameState.trails.filter(t => t.life > 0);
  }

  function draw() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    const ball = gameState.ball;
    const paddle = gameState.paddle;
    const aiPaddle = gameState.aiPaddle;

    // Shake
    const sx = gameState.shakeFrames > 0 ? (Math.random() - 0.5) * 5 : 0;
    const sy = gameState.shakeFrames > 0 ? (Math.random() - 0.5) * 5 : 0;
    ctx.save();
    ctx.translate(sx, sy);

    // Background
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(1, '#06060e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center line with glow
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.setLineDash([8, 12]);
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Ball trail
    gameState.trails.forEach(t => {
      ctx.globalAlpha = t.life * 0.3;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(t.x, t.y, ball.size * t.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Player paddle — gold neon
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(0, paddle.y, paddle.width, paddle.height, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // AI paddle — cool gray
    ctx.fillStyle = '#555';
    ctx.shadowColor = 'rgba(100, 100, 255, 0.3)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(canvas.width - paddle.width, aiPaddle.y, paddle.width, paddle.height, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball
    if (gameState.artworkImg) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(gameState.artworkImg, ball.x - ball.size, ball.y - ball.size, ball.size * 2, ball.size * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Particles
    gameState.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
      ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  function gameLoop() {
    if (!gameState.running) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  window.PongGame = { init: initGame };
})();
