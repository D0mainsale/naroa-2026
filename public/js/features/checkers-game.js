/* ═══════════════════════════════════════════════════════════════
   Checkers — Artwork Board Textures + King Crown Particles
   ═══════════════════════════════════════════════════════════════ */
window.CheckersGame = (() => {
  let container, canvas, ctx, board, selected, turn, artImgs = [];
  const CELL = 56, ROWS = 8, COLS = 8;

  async function init() {
    container = document.getElementById('checkers-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getRandomArtworks(6);
    artImgs = loaded.map(a => a.img).filter(Boolean);
    buildUI(); resetBoard(); draw();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:12px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          Turn: <span id="check-turn" style="color:#ff6ec7;font-weight:700">Red</span>
        </div>
        <canvas id="checkers-canvas" width="${CELL*8}" height="${CELL*8}" style="border-radius:12px;border:2px solid rgba(123,47,247,0.3);cursor:pointer;display:block;margin:0 auto"></canvas>
      </div>
    `;
    canvas = document.getElementById('checkers-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
    selected = null; turn = 'r';
  }

  function resetBoard() {
    board = Array.from({length:8}, () => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r+c)%2===1) board[r][c] = {color:'b',king:false};
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r+c)%2===1) board[r][c] = {color:'r',king:false};
  }

  function draw() {
    let artIdx = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const dark = (r+c)%2===1, x = c*CELL, y = r*CELL;
      ctx.fillStyle = dark ? '#2a1a3e' : '#1a1a2e';
      ctx.fillRect(x, y, CELL, CELL);
      if (dark && artImgs[artIdx % artImgs.length]) {
        window.ArtworkLoader.drawArtworkCover(ctx, artImgs[artIdx % artImgs.length], x, y, CELL, CELL, 0.1);
        artIdx++;
      }
      if (selected && selected.r === r && selected.c === c) {
        ctx.fillStyle = 'rgba(255,110,199,0.3)'; ctx.fillRect(x, y, CELL, CELL);
      }
      const p = board[r][c];
      if (p) {
        ctx.beginPath(); ctx.arc(x+CELL/2, y+CELL/2, CELL*0.38, 0, Math.PI*2);
        ctx.fillStyle = p.color === 'r' ? '#ef4444' : '#3b82f6';
        ctx.shadowColor = p.color === 'r' ? '#ef4444' : '#3b82f6'; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
        if (p.king) {
          ctx.fillStyle = '#ffd700'; ctx.font = `${CELL*0.35}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('♛', x+CELL/2, y+CELL/2);
        }
      }
    }
  }

  function handleClick(e) {
    const c = Math.floor(e.offsetX/CELL), r = Math.floor(e.offsetY/CELL);
    if (r<0||r>7||c<0||c>7) return;
    if (!selected) {
      const p = board[r][c];
      if (!p || p.color !== turn) return;
      selected = {r,c};
    } else {
      const p = board[selected.r][selected.c];
      const dr = r - selected.r, dc = c - selected.c;
      if (Math.abs(dr)===1 && Math.abs(dc)===1 && !board[r][c]) {
        board[r][c] = p; board[selected.r][selected.c] = null;
        if ((p.color==='r'&&r===0)||(p.color==='b'&&r===7)) p.king = true;
        turn = turn==='r'?'b':'r';
      } else if (Math.abs(dr)===2 && Math.abs(dc)===2) {
        const mr = selected.r+dr/2, mc = selected.c+dc/2;
        if (board[mr][mc] && board[mr][mc].color !== p.color && !board[r][c]) {
          board[r][c] = p; board[selected.r][selected.c] = null; board[mr][mc] = null;
          if ((p.color==='r'&&r===0)||(p.color==='b'&&r===7)) p.king = true;
          turn = turn==='r'?'b':'r';
        }
      }
      selected = null;
      const t = document.getElementById('check-turn');
      if (t) t.textContent = turn==='r'?'Red':'Blue';
    }
    draw();
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
