/* ═══════════════════════════════════════════════════════════════
   Tetris — Premium with Artwork Block Textures
   Blocks show artwork thumbnails; background shows faded artwork
   ═══════════════════════════════════════════════════════════════ */
window.TetrisGame = (() => {
  let container, canvas, ctx, board, piece, nextPiece, holdPiece, holdUsed;
  let score = 0, lines = 0, level = 1, gameOver = false, dropTimer = 0, lastTime = 0;
  let artImgs = [], bgImg = null;
  const COLS = 10, ROWS = 20, CELL = 28;
  const SHAPES = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[0,1,0],[1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]]
  ];
  const COLORS = ['#00f5ff','#ffe600','#a855f7','#ff6b35','#3b82f6','#22c55e','#ef4444'];

  async function init() {
    container = document.getElementById('tetris-container');
    if (!container) return;

    const loaded = await window.ArtworkLoader.getRandomArtworks(8);
    artImgs = loaded.map(a => a.img).filter(Boolean);
    if (loaded.length > 0) bgImg = loaded[0].img;

    buildUI();
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    score = 0; lines = 0; level = 1; gameOver = false; holdPiece = null; holdUsed = false;
    piece = newPiece(); nextPiece = newPiece();
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function buildUI() {
    container.innerHTML = `
      <div style="display:flex;justify-content:center;gap:16px;padding:10px;font-family:Inter,sans-serif">
        <div>
          <div style="color:#aaa;font-size:11px;margin-bottom:4px">HOLD</div>
          <canvas id="tetris-hold" width="90" height="70" style="background:rgba(10,10,26,0.8);border-radius:8px;border:1px solid rgba(123,47,247,0.3)"></canvas>
        </div>
        <div>
          <canvas id="tetris-canvas" style="border-radius:8px;border:1px solid rgba(123,47,247,0.3)"></canvas>
          <div id="tetris-hud" style="display:flex;justify-content:space-between;color:#ccc;font-size:12px;padding:6px 0">
            <span>Score: <b style="color:#ff6ec7">0</b></span>
            <span>Lines: <b>0</b></span>
            <span>Lvl: <b>1</b></span>
          </div>
        </div>
        <div>
          <div style="color:#aaa;font-size:11px;margin-bottom:4px">NEXT</div>
          <canvas id="tetris-next" width="90" height="70" style="background:rgba(10,10,26,0.8);border-radius:8px;border:1px solid rgba(123,47,247,0.3)"></canvas>
        </div>
      </div>
    `;
    canvas = document.getElementById('tetris-canvas');
    canvas.width = COLS * CELL; canvas.height = ROWS * CELL;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', handleKey);
  }

  function newPiece() {
    const i = Math.floor(Math.random() * SHAPES.length);
    return { shape: SHAPES[i].map(r => [...r]), color: COLORS[i], ci: i, x: Math.floor(COLS/2) - 1, y: 0 };
  }

  function handleKey(e) {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') movePiece(-1, 0);
    else if (e.key === 'ArrowRight') movePiece(1, 0);
    else if (e.key === 'ArrowDown') { movePiece(0, 1); score++; }
    else if (e.key === 'ArrowUp') rotatePiece();
    else if (e.key === ' ') hardDrop();
    else if (e.key === 'c' || e.key === 'C') holdSwap();
  }

  function valid(shape, ox, oy) {
    return shape.every((row, r) => row.every((v, c) => {
      if (!v) return true;
      const nx = ox + c, ny = oy + r;
      return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !board[ny][nx]);
    }));
  }
  function movePiece(dx, dy) {
    if (valid(piece.shape, piece.x + dx, piece.y + dy)) { piece.x += dx; piece.y += dy; return true; }
    return false;
  }
  function rotatePiece() {
    const rot = piece.shape[0].map((_, i) => piece.shape.map(r => r[i]).reverse());
    if (valid(rot, piece.x, piece.y)) piece.shape = rot;
  }
  function hardDrop() { while(movePiece(0,1)) score += 2; lockPiece(); }
  function holdSwap() {
    if (holdUsed) return;
    holdUsed = true;
    if (holdPiece) { const t = holdPiece; holdPiece = { ...piece, x: Math.floor(COLS/2)-1, y: 0 }; piece = t; piece.x = Math.floor(COLS/2)-1; piece.y = 0; }
    else { holdPiece = piece; piece = nextPiece; nextPiece = newPiece(); }
  }

  function lockPiece() {
    piece.shape.forEach((row, r) => row.forEach((v, c) => {
      if (v && piece.y + r >= 0) board[piece.y + r][piece.x + c] = piece.ci + 1;
    }));
    clearLines();
    piece = nextPiece; nextPiece = newPiece(); holdUsed = false;
    if (!valid(piece.shape, piece.x, piece.y)) { gameOver = true; endGame(); }
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c)) { board.splice(r, 1); board.unshift(Array(COLS).fill(0)); cleared++; r++; }
    }
    if (cleared) {
      lines += cleared; score += [0, 100, 300, 500, 800][cleared] * level;
      level = Math.floor(lines / 10) + 1;
      updateHUD();
    }
  }

  function updateHUD() {
    const hud = document.getElementById('tetris-hud');
    if (hud) hud.innerHTML = `<span>Score: <b style="color:#ff6ec7">${score}</b></span><span>Lines: <b>${lines}</b></span><span>Lvl: <b>${level}</b></span>`;
  }

  function drawCell(x, y, ci) {
    const px = x * CELL, py = y * CELL;
    // Try artwork texture
    if (artImgs[ci]) {
      window.ArtworkLoader.drawArtworkCover(ctx, artImgs[ci], px + 1, py + 1, CELL - 2, CELL - 2, 0.85);
    } else {
      ctx.fillStyle = COLORS[ci];
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    }
    // Highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
  }

  function loop(now) {
    if (gameOver) return;
    const dt = now - lastTime; lastTime = now; dropTimer += dt;
    const speed = Math.max(100, 800 - (level - 1) * 60);
    if (dropTimer > speed) { dropTimer = 0; if (!movePiece(0, 1)) lockPiece(); }

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (bgImg) window.ArtworkLoader.drawArtworkCover(ctx, bgImg, 0, 0, canvas.width, canvas.height, 0.06);

    // Grid
    ctx.strokeStyle = 'rgba(123,47,247,0.08)';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);

    // Board
    board.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(c, r, v - 1); }));

    // Ghost piece
    let gy = piece.y;
    while (valid(piece.shape, piece.x, gy + 1)) gy++;
    ctx.globalAlpha = 0.2;
    piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(piece.x + c, gy + r, piece.ci); }));
    ctx.globalAlpha = 1;

    // Active piece
    piece.shape.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(piece.x + c, piece.y + r, piece.ci); }));

    // Side panels
    drawSidePanel('tetris-next', nextPiece);
    if (holdPiece) drawSidePanel('tetris-hold', holdPiece);

    requestAnimationFrame(loop);
  }

  function drawSidePanel(id, p) {
    const c = document.getElementById(id);
    if (!c) return;
    const x = c.getContext('2d');
    x.fillStyle = '#0a0a1a'; x.fillRect(0, 0, c.width, c.height);
    const sz = 18;
    const ox = (c.width - p.shape[0].length * sz) / 2;
    const oy = (c.height - p.shape.length * sz) / 2;
    p.shape.forEach((row, r) => row.forEach((v, cc) => {
      if (v) {
        if (artImgs[p.ci]) window.ArtworkLoader.drawArtworkCover(x, artImgs[p.ci], ox + cc * sz + 1, oy + r * sz + 1, sz - 2, sz - 2, 0.8);
        else { x.fillStyle = p.color; x.fillRect(ox + cc * sz + 1, oy + r * sz + 1, sz - 2, sz - 2); }
      }
    }));
  }

  function endGame() {
    document.removeEventListener('keydown', handleKey);
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🎮</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">Game Over</h2><p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Score: ${score} · Lines: ${lines} · Level: ${level}</p><button onclick="TetrisGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('tetris', score);
  }

  function destroy() { document.removeEventListener('keydown', handleKey); gameOver = true; if (container) container.innerHTML = ''; }

  return { init, destroy };
})();
