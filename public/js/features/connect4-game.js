/* ═══════════════════════════════════════════════════════════════
   Connect 4 — Artwork Pieces (Rocks vs Tributos series)
   ═══════════════════════════════════════════════════════════════ */
window.Connect4Game = (() => {
  let container, canvas, ctx, board, turn, gameOver, artP1 = [], artP2 = [];
  const COLS = 7, ROWS = 6, CELL = 60;

  async function init() {
    container = document.getElementById('connect4-container');
    if (!container) return;
    const [s1, s2] = await Promise.all([
      window.ArtworkLoader.getArtworksBySeries('rocks', 4),
      window.ArtworkLoader.getArtworksBySeries('tributos-musicales', 4)
    ]);
    artP1 = s1; artP2 = s2;
    buildUI(); board = Array.from({length:ROWS},()=>Array(COLS).fill(0)); turn = 1; gameOver = false; draw();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:12px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          Turn: <span id="c4-turn" style="color:#ef4444;font-weight:700">Rocks ●</span>
        </div>
        <canvas id="c4-canvas" width="${COLS*CELL}" height="${ROWS*CELL}" style="border-radius:12px;border:2px solid rgba(123,47,247,0.3);cursor:pointer;display:block;margin:0 auto;background:#0a0a2e"></canvas>
      </div>
    `;
    canvas = document.getElementById('c4-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
  }

  function draw() {
    ctx.fillStyle = '#0a0a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = c*CELL+CELL/2, y = r*CELL+CELL/2, rad = CELL*0.4;
      // Hole
      ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
      const v = board[r][c];
      if (v) {
        const arts = v === 1 ? artP1 : artP2;
        const art = arts.length ? arts[c % arts.length] : null;
        if (art && art.img) {
          window.ArtworkLoader.drawArtworkCircle(ctx, art.img, x, y, rad, 0.85);
        } else {
          ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI*2);
          ctx.fillStyle = v === 1 ? '#ef4444' : '#eab308'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI*2);
        ctx.strokeStyle = v === 1 ? '#ef4444' : '#eab308'; ctx.lineWidth = 2.5; ctx.stroke();
      }
    }
  }

  function handleClick(e) {
    if (gameOver) return;
    const col = Math.floor(e.offsetX / CELL);
    if (col < 0 || col >= COLS) return;
    for (let r = ROWS-1; r >= 0; r--) {
      if (!board[r][col]) {
        board[r][col] = turn;
        if (checkWin(r, col)) { gameOver = true; draw(); endGame(); return; }
        turn = turn === 1 ? 2 : 1;
        const t = document.getElementById('c4-turn');
        if (t) t.innerHTML = turn === 1 ? '<span style="color:#ef4444">Rocks ●</span>' : '<span style="color:#eab308">Tributos ●</span>';
        draw(); return;
      }
    }
  }

  function checkWin(r, c) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    return dirs.some(([dr,dc]) => {
      let count = 1;
      for (let i = 1; i < 4; i++) { const nr=r+dr*i,nc=c+dc*i; if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===turn) count++; else break; }
      for (let i = 1; i < 4; i++) { const nr=r-dr*i,nc=c-dc*i; if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===turn) count++; else break; }
      return count >= 4;
    });
  }

  function endGame() {
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🏆</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">${turn===1?'Rocks':'Tributos'} wins!</h2><button onclick="Connect4Game.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
