/* ═══════════════════════════════════════════════════════════════
   Breakout — Artwork Brick Textures
   Bricks show actual artwork thumbnails as textures
   ═══════════════════════════════════════════════════════════════ */
window.BreakoutGame = (() => {
  let container, canvas, ctx, ball, paddle, bricks, score, lives, gameOver, animFrame;
  let artImgs = [], bgImg = null;
  const ROWS = 5, COLS = 8;

  async function init() {
    container = document.getElementById('breakout-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getRandomArtworks(ROWS * COLS);
    artImgs = loaded.map(a => a.img).filter(Boolean);
    if (loaded.length) bgImg = loaded[0].img;
    buildUI(); startGame();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:8px">
        <div style="display:flex;justify-content:space-between;max-width:440px;margin:0 auto;color:#ccc;font-size:13px;margin-bottom:8px">
          <span>Score: <b id="brk-score" style="color:#ff6ec7">0</b></span>
          <span>Lives: <b id="brk-lives" style="color:#ef4444">❤❤❤</b></span>
        </div>
        <canvas id="breakout-canvas" style="border-radius:12px;border:1px solid rgba(123,47,247,0.3);display:block;margin:0 auto;background:#0a0a1a;cursor:none"></canvas>
      </div>
    `;
    canvas = document.getElementById('breakout-canvas');
    const maxW = Math.min(container.clientWidth - 20, 440);
    canvas.width = maxW; canvas.height = maxW * 1.1;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousemove', e => { paddle.x = e.offsetX - paddle.w/2; });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); paddle.x = e.touches[0].clientX - r.left - paddle.w/2; });
  }

  function startGame() {
    paddle = { x: canvas.width/2 - 40, y: canvas.height - 30, w: 80, h: 12 };
    ball = { x: canvas.width/2, y: canvas.height - 50, r: 6, dx: 3, dy: -3 };
    score = 0; lives = 3; gameOver = false;
    // Bricks
    const brickW = canvas.width / COLS - 4, brickH = 22;
    bricks = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      bricks.push({ x: c * (brickW + 4) + 2, y: 40 + r * (brickH + 4), w: brickW, h: brickH, alive: true, artIdx: r * COLS + c });
    }
    cancelAnimationFrame(animFrame);
    loop();
  }

  function loop() {
    if (gameOver) return;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (bgImg) window.ArtworkLoader.drawArtworkCover(ctx, bgImg, 0, 0, canvas.width, canvas.height, 0.04);

    // Ball
    ball.x += ball.dx; ball.y += ball.dy;
    if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;
    if (ball.y > canvas.height) {
      lives--; const l = document.getElementById('brk-lives'); if (l) l.textContent = '❤'.repeat(Math.max(0, lives));
      if (lives <= 0) { gameOver = true; endGame(); return; }
      ball.x = canvas.width/2; ball.y = canvas.height - 50; ball.dy = -3;
    }
    // Paddle collision
    if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.dy > 0) {
      ball.dy *= -1;
      ball.dx += (ball.x - (paddle.x + paddle.w/2)) * 0.1;
    }

    // Bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      if (ball.x > b.x && ball.x < b.x + b.w && ball.y - ball.r < b.y + b.h && ball.y + ball.r > b.y) {
        b.alive = false; ball.dy *= -1; score += 10;
        const s = document.getElementById('brk-score'); if (s) s.textContent = score;
      }
      if (b.alive) {
        // Draw with artwork texture
        if (artImgs[b.artIdx % artImgs.length]) {
          window.ArtworkLoader.drawArtworkCover(ctx, artImgs[b.artIdx % artImgs.length], b.x, b.y, b.w, b.h, 0.8);
        } else {
          const hue = (b.artIdx * 40) % 360;
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`; ctx.fillRect(b.x, b.y, b.w, b.h);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
    });

    // Check all cleared
    if (bricks.every(b => !b.alive)) { gameOver = true; endGame(); return; }

    // Draw ball
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fillStyle = '#ff6ec7'; ctx.shadowColor = '#ff6ec7'; ctx.shadowBlur = 12;
    ctx.fill(); ctx.shadowBlur = 0;
    // Ball trail
    ctx.beginPath(); ctx.arc(ball.x - ball.dx, ball.y - ball.dy, ball.r * 0.6, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,110,199,0.3)'; ctx.fill();

    // Paddle
    ctx.fillStyle = 'rgba(123,47,247,0.6)'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.strokeStyle = '#7b2ff7'; ctx.lineWidth = 2;
    ctx.shadowColor = '#7b2ff7'; ctx.shadowBlur = 10;
    ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.shadowBlur = 0;

    animFrame = requestAnimationFrame(loop);
  }

  function endGame() {
    const won = bricks.every(b => !b.alive);
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">${won?'🎉':'💥'}</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">${won?'¡You Win!':'Game Over'}</h2><p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Score: ${score}</p><button onclick="BreakoutGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('breakout', score);
  }

  function destroy() { gameOver = true; cancelAnimationFrame(animFrame); if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
