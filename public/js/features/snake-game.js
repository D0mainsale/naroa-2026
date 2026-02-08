/* ═══════════════════════════════════════════════════════════════
   Snake — Premium with Artwork Food + Background
   Food items show artwork thumbnails; background shows faded art
   ═══════════════════════════════════════════════════════════════ */
window.SnakeGame = (() => {
  let container, canvas, ctx, snake, dir, food, score, combo, gameOver, interval;
  let artworks = [], bgImg = null, foodArt = null;
  const CELL = 20;
  let COLS, ROWS;

  async function init() {
    container = document.getElementById('snake-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getRandomArtworks(6);
    artworks = loaded;
    if (loaded.length > 0) bgImg = loaded[0].img;
    buildUI();
    startGame();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:8px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          Score: <span id="snake-score" style="color:#ff6ec7;font-weight:700">0</span>
          &nbsp;·&nbsp; Combo: <span id="snake-combo" style="color:#7b2ff7;font-weight:700">x1</span>
        </div>
        <canvas id="snake-canvas" style="border-radius:12px;border:1px solid rgba(123,47,247,0.3);display:block;margin:0 auto;background:#0a0a1a"></canvas>
      </div>
    `;
    canvas = document.getElementById('snake-canvas');
    const maxW = Math.min(container.clientWidth - 20, 440);
    COLS = Math.floor(maxW / CELL); ROWS = Math.floor(maxW * 0.8 / CELL);
    canvas.width = COLS * CELL; canvas.height = ROWS * CELL;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', handleKey);
    // Touch
    let tx, ty;
    canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; e.preventDefault(); });
    canvas.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? {x:1,y:0} : {x:-1,y:0};
      else dir = dy > 0 ? {x:0,y:1} : {x:0,y:-1};
    });
  }

  function startGame() {
    snake = [{x: Math.floor(COLS/2), y: Math.floor(ROWS/2)}];
    dir = {x:1, y:0}; score = 0; combo = 1; gameOver = false;
    spawnFood();
    clearInterval(interval);
    interval = setInterval(tick, 120);
  }

  function spawnFood() {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    foodArt = artworks.length ? artworks[Math.floor(Math.random() * artworks.length)] : null;
  }

  function handleKey(e) {
    if (e.key === 'ArrowUp' && dir.y !== 1) dir = {x:0,y:-1};
    else if (e.key === 'ArrowDown' && dir.y !== -1) dir = {x:0,y:1};
    else if (e.key === 'ArrowLeft' && dir.x !== 1) dir = {x:-1,y:0};
    else if (e.key === 'ArrowRight' && dir.x !== -1) dir = {x:1,y:0};
  }

  function tick() {
    if (gameOver) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // Wrap
    if (head.x < 0) head.x = COLS - 1; if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1; if (head.y >= ROWS) head.y = 0;
    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) { endGame(); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10 * combo; combo++;
      updateHUD(); spawnFood();
    } else {
      snake.pop(); combo = 1;
    }
    draw();
  }

  function draw() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (bgImg) window.ArtworkLoader.drawArtworkCover(ctx, bgImg, 0, 0, canvas.width, canvas.height, 0.05);

    // Grid
    ctx.strokeStyle = 'rgba(123,47,247,0.05)';
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);

    // Snake with rainbow gradient
    snake.forEach((s, i) => {
      const hue = (i * 12 + Date.now() * 0.05) % 360;
      ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      if (i === 0) { // Head glow
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 12;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
        ctx.shadowBlur = 0;
      }
    });

    // Food artwork
    if (foodArt && foodArt.img) {
      window.ArtworkLoader.drawArtworkCover(ctx, foodArt.img, food.x * CELL, food.y * CELL, CELL, CELL, 0.9);
      ctx.strokeStyle = '#ff6ec7'; ctx.lineWidth = 1.5;
      ctx.strokeRect(food.x * CELL, food.y * CELL, CELL, CELL);
      // Glow
      ctx.shadowColor = '#ff6ec7'; ctx.shadowBlur = 8;
      ctx.strokeRect(food.x * CELL, food.y * CELL, CELL, CELL);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#ff6ec7'; ctx.beginPath();
      ctx.arc(food.x * CELL + CELL/2, food.y * CELL + CELL/2, CELL/3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateHUD() {
    const s = document.getElementById('snake-score'), c = document.getElementById('snake-combo');
    if (s) s.textContent = score; if (c) c.textContent = `x${combo}`;
  }

  function endGame() {
    gameOver = true; clearInterval(interval);
    document.removeEventListener('keydown', handleKey);
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🐍</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">Game Over</h2><p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Score: ${score}</p><button onclick="SnakeGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('snake', score);
  }

  function destroy() { clearInterval(interval); document.removeEventListener('keydown', handleKey); if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
