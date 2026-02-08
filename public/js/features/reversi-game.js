/* ═══════════════════════════════════════════════════════════════
   Reversi — Artwork Board + Piece Faces
   ═══════════════════════════════════════════════════════════════ */
window.ReversiGame = (() => {
  let container, canvas, ctx, board, turn, artImgs = [];
  const CELL = 56, SIZE = 8;

  async function init() {
    container = document.getElementById('reversi-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getRandomArtworks(6);
    artImgs = loaded.map(a => a.img).filter(Boolean);
    buildUI(); resetBoard(); draw();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:12px">
        <div style="display:flex;justify-content:center;gap:20px;color:#ccc;font-size:13px;margin-bottom:8px">
          <span>⚫ <b id="rev-b">2</b></span>
          <span id="rev-turn" style="color:#ff6ec7">Black's turn</span>
          <span>⚪ <b id="rev-w">2</b></span>
        </div>
        <canvas id="reversi-canvas" width="${CELL*SIZE}" height="${CELL*SIZE}" style="border-radius:12px;border:2px solid rgba(123,47,247,0.3);cursor:pointer;display:block;margin:0 auto"></canvas>
      </div>
    `;
    canvas = document.getElementById('reversi-canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
    turn = 'b';
  }

  function resetBoard() {
    board = Array.from({length:SIZE},()=>Array(SIZE).fill(null));
    board[3][3]='w';board[3][4]='b';board[4][3]='b';board[4][4]='w';
  }

  function getFlips(r,c,color) {
    if (board[r][c]) return [];
    const opp = color==='b'?'w':'b';
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    let all = [];
    dirs.forEach(([dr,dc]) => {
      let flips = [], nr=r+dr, nc=c+dc;
      while(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===opp) { flips.push([nr,nc]); nr+=dr; nc+=dc; }
      if (nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr][nc]===color&&flips.length) all.push(...flips);
    });
    return all;
  }

  function draw() {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      const x = c*CELL, y = r*CELL;
      ctx.fillStyle = '#1a3a2a'; ctx.fillRect(x, y, CELL, CELL);
      // Faded artwork grid
      if (artImgs.length && (r+c)%3===0) {
        window.ArtworkLoader.drawArtworkCover(ctx, artImgs[(r*SIZE+c) % artImgs.length], x, y, CELL, CELL, 0.06);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.strokeRect(x, y, CELL, CELL);
      // Valid move dot
      if (getFlips(r,c,turn).length) {
        ctx.beginPath(); ctx.arc(x+CELL/2, y+CELL/2, 4, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,110,199,0.4)'; ctx.fill();
      }
      if (board[r][c]) {
        ctx.beginPath(); ctx.arc(x+CELL/2, y+CELL/2, CELL*0.38, 0, Math.PI*2);
        ctx.fillStyle = board[r][c]==='b'?'#1a1a2e':'#f5f5f5';
        ctx.shadowColor = board[r][c]==='b'?'#000':'#fff'; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(123,47,247,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
    updateScore();
  }

  function updateScore() {
    let b=0,w=0;
    board.forEach(row=>row.forEach(c=>{if(c==='b')b++;if(c==='w')w++;}));
    const be=document.getElementById('rev-b'),we=document.getElementById('rev-w'),te=document.getElementById('rev-turn');
    if(be)be.textContent=b;if(we)we.textContent=w;
    if(te)te.textContent=turn==='b'?"Black's turn":"White's turn";
  }

  function handleClick(e) {
    const c = Math.floor(e.offsetX/CELL), r = Math.floor(e.offsetY/CELL);
    const flips = getFlips(r,c,turn);
    if (!flips.length) return;
    board[r][c] = turn;
    flips.forEach(([fr,fc])=>board[fr][fc]=turn);
    turn = turn==='b'?'w':'b';
    // Check if next player has moves
    let hasMove = false;
    for(let rr=0;rr<SIZE;rr++) for(let cc=0;cc<SIZE;cc++) if(getFlips(rr,cc,turn).length) hasMove=true;
    if (!hasMove) {
      turn = turn==='b'?'w':'b';
      let hasMove2 = false;
      for(let rr=0;rr<SIZE;rr++) for(let cc=0;cc<SIZE;cc++) if(getFlips(rr,cc,turn).length) hasMove2=true;
      if (!hasMove2) { draw(); endGame(); return; }
    }
    draw();
  }

  function endGame() {
    let b=0,w=0;board.forEach(row=>row.forEach(c=>{if(c==='b')b++;if(c==='w')w++;}));
    const winner = b>w?'Black':w>b?'White':'Tie';
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<h2 style="color:#ff6ec7;font-family:Inter,sans-serif">${winner === 'Tie' ? 'Tie!' : winner + ' wins!'}</h2><p style="color:#ccc;font-family:Inter,sans-serif">⚫ ${b} — ⚪ ${w}</p><button onclick="ReversiGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
