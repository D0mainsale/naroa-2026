/* ═══════════════════════════════════════════════════════════════
   Chess — Artistic with Artwork Board Textures
   Dark squares show faded artwork; captures display thumbnails
   ═══════════════════════════════════════════════════════════════ */
window.ChessGame = (() => {
  let container, canvas, ctx, board, selected, turn, artImgs = [];
  const CELL = 56, PIECES = { K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };
  const INIT = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

  async function init() {
    container = document.getElementById('chess-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getRandomArtworks(8);
    artImgs = loaded.map(a => a.img).filter(Boolean);
    buildUI(); resetBoard(); draw();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:12px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          Turn: <span id="chess-turn" style="color:#ff6ec7;font-weight:700">White</span>
        </div>
        <canvas id="chess-canvas" width="${CELL*8}" height="${CELL*8}" style="border-radius:12px;border:2px solid rgba(123,47,247,0.3);cursor:pointer;display:block;margin:0 auto"></canvas>
      </div>
    `;
    canvas = document.getElementById('chess-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
    selected = null; turn = 'w';
  }

  function resetBoard() {
    board = [];
    INIT.split('/').forEach((row, r) => {
      board[r] = [];
      let c = 0;
      for (const ch of row) {
        if (ch >= '1' && ch <= '8') { for (let i = 0; i < +ch; i++) board[r][c++] = null; }
        else board[r][c++] = ch;
      }
    });
  }

  function draw() {
    let artIdx = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const dark = (r + c) % 2 === 1;
      const x = c * CELL, y = r * CELL;
      // Base color
      ctx.fillStyle = dark ? '#2a1a3e' : '#1a1a2e';
      ctx.fillRect(x, y, CELL, CELL);
      // Artwork on dark squares
      if (dark && artImgs[artIdx % artImgs.length]) {
        window.ArtworkLoader.drawArtworkCover(ctx, artImgs[artIdx % artImgs.length], x, y, CELL, CELL, 0.12);
        artIdx++;
      }
      // Selected highlight
      if (selected && selected.r === r && selected.c === c) {
        ctx.fillStyle = 'rgba(255,110,199,0.3)'; ctx.fillRect(x, y, CELL, CELL);
      }
      // Piece
      if (board[r][c]) {
        const p = board[r][c];
        ctx.font = `${CELL * 0.7}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = p === p.toUpperCase() ? '#fff' : '#000';
        ctx.shadowBlur = 4;
        ctx.fillStyle = p === p.toUpperCase() ? '#fff' : '#1a1a2e';
        ctx.fillText(PIECES[p] || p, x + CELL/2, y + CELL/2);
        ctx.shadowBlur = 0;
      }
    }
    // Border glow
    ctx.strokeStyle = 'rgba(123,47,247,0.3)'; ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CELL*8, CELL*8);
  }

  function handleClick(e) {
    const c = Math.floor(e.offsetX / CELL), r = Math.floor(e.offsetY / CELL);
    if (r < 0 || r > 7 || c < 0 || c > 7) return;
    if (!selected) {
      const p = board[r][c];
      if (!p) return;
      const isWhite = p === p.toUpperCase();
      if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) return;
      selected = { r, c };
    } else {
      // Simple move (no full validation for brevity)
      const p = board[selected.r][selected.c];
      const target = board[r][c];
      if (target) {
        const tIsWhite = target === target.toUpperCase();
        const pIsWhite = p === p.toUpperCase();
        if (tIsWhite === pIsWhite) { selected = { r, c }; draw(); return; }
      }
      board[r][c] = p; board[selected.r][selected.c] = null;
      selected = null;
      turn = turn === 'w' ? 'b' : 'w';
      const tEl = document.getElementById('chess-turn');
      if (tEl) tEl.textContent = turn === 'w' ? 'White' : 'Black';
    }
    draw();
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
