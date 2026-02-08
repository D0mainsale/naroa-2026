/* ═══════════════════════════════════════════════════════════════
   Oca — Classic with Artwork Tiles
   Special Oca tiles show real artwork thumbnails
   ═══════════════════════════════════════════════════════════════ */
window.OcaGame = (() => {
  let container, canvas, ctx, players, currentPlayer, tiles, diceValue, rolling, artworks = [];
  const TOTAL_TILES = 63;

  async function init() {
    container = document.getElementById('oca-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(10);
    buildUI();
    players = [{ pos: 0, color: '#ff6ec7' }, { pos: 0, color: '#7b2ff7' }];
    currentPlayer = 0; diceValue = 0; rolling = false;
    generateTiles(); draw();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:12px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          <span id="oca-turn" style="color:#ff6ec7;font-weight:700">Player 1</span> &nbsp;·&nbsp;
          Dice: <span id="oca-dice" style="color:#eab308;font-weight:700">—</span>
        </div>
        <canvas id="oca-canvas" style="border-radius:12px;border:2px solid rgba(123,47,247,0.3);cursor:pointer;display:block;margin:0 auto;background:#0a0a1a"></canvas>
        <button id="oca-roll" onclick="OcaGame.roll()" style="margin-top:12px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 28px;border-radius:24px;cursor:pointer;font-size:15px;font-weight:600">🎲 Roll</button>
      </div>
    `;
    canvas = document.getElementById('oca-canvas');
    const maxW = Math.min(container.clientWidth - 20, 500);
    canvas.width = maxW; canvas.height = maxW;
    ctx = canvas.getContext('2d');
  }

  function generateTiles() {
    tiles = [];
    const cols = 8, rows = 8;
    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= TOTAL_TILES) break;
        const x = (r % 2 === 0) ? c : (cols - 1 - c);
        tiles.push({
          index, x: x * (canvas.width / cols) + (canvas.width / cols) / 2,
          y: (rows - 1 - r) * (canvas.height / rows) + (canvas.height / rows) / 2,
          special: index % 9 === 0 && index > 0 ? 'oca' : (index % 14 === 0 ? 'bridge' : null)
        });
        index++;
      }
    }
  }

  function draw() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const tileR = Math.min(canvas.width, canvas.height) / 20;

    tiles.forEach((t, i) => {
      // Tile circle
      ctx.beginPath(); ctx.arc(t.x, t.y, tileR, 0, Math.PI * 2);
      if (t.special === 'oca') {
        // Artwork tile
        const art = artworks[Math.floor(i / 9) % artworks.length];
        if (art && art.img) {
          window.ArtworkLoader.drawArtworkCircle(ctx, art.img, t.x, t.y, tileR, 0.7);
        } else {
          ctx.fillStyle = '#22c55e'; ctx.fill();
        }
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke();
      } else if (t.special === 'bridge') {
        ctx.fillStyle = '#eab308'; ctx.fill();
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2; ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(26,26,46,0.8)'; ctx.fill();
        ctx.strokeStyle = 'rgba(123,47,247,0.2)'; ctx.lineWidth = 1; ctx.stroke();
      }
      // Number
      ctx.fillStyle = '#aaa'; ctx.font = '9px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(i, t.x, t.y);
    });

    // Path lines
    ctx.strokeStyle = 'rgba(123,47,247,0.1)'; ctx.lineWidth = 1; ctx.beginPath();
    tiles.forEach((t, i) => { if (i === 0) ctx.moveTo(t.x, t.y); else ctx.lineTo(t.x, t.y); });
    ctx.stroke();

    // Players
    players.forEach((p, pi) => {
      if (p.pos < tiles.length) {
        const t = tiles[p.pos];
        const offset = pi === 0 ? -6 : 6;
        ctx.beginPath(); ctx.arc(t.x + offset, t.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    });
  }

  function roll() {
    if (rolling) return;
    rolling = true;
    diceValue = Math.floor(Math.random() * 6) + 1;
    const dEl = document.getElementById('oca-dice');
    if (dEl) dEl.textContent = diceValue;

    const p = players[currentPlayer];
    p.pos = Math.min(TOTAL_TILES - 1, p.pos + diceValue);

    // Check special
    if (p.pos < tiles.length && tiles[p.pos].special === 'oca') {
      p.pos = Math.min(TOTAL_TILES - 1, p.pos + diceValue); // Double advance
    }

    draw();
    if (p.pos >= TOTAL_TILES - 1) { endGame(); return; }

    currentPlayer = (currentPlayer + 1) % players.length;
    const tEl = document.getElementById('oca-turn');
    if (tEl) { tEl.textContent = `Player ${currentPlayer + 1}`; tEl.style.color = players[currentPlayer].color; }
    rolling = false;
  }

  function endGame() {
    rolling = true;
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🦆</div><h2 style="color:${players[currentPlayer].color};font-family:Inter,sans-serif;margin:0 0 8px">Player ${currentPlayer+1} wins!</h2><button onclick="OcaGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy, roll };
})();
