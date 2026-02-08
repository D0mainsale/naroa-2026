/* ═══════════════════════════════════════════════════════════════
   Collage Creator — Premium with Real Artwork Fragments
   Users stamp artwork fragments onto a canvas
   ═══════════════════════════════════════════════════════════════ */
window.CollageGame = (() => {
  let container, canvas, ctx, artworks = [], placed = [], currentArt = null;
  let rotation = 0, scale = 1;

  async function init() {
    container = document.getElementById('collage-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(12);
    buildUI();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:12px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px;text-align:center">
          Click a thumbnail below, then click the canvas to place it
        </div>
        <canvas id="collage-canvas" style="width:100%;border-radius:12px;border:2px solid rgba(123,47,247,0.3);
          background:#0a0a1a;cursor:crosshair;display:block"></canvas>
        <div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding:8px 0" id="collage-palette"></div>
        <div style="display:flex;gap:8px;margin-top:8px;justify-content:center">
          <button onclick="CollageGame.rotate(-45)" style="background:rgba(123,47,247,0.3);border:1px solid #7b2ff7;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px">↻ Rotate</button>
          <button onclick="CollageGame.scaleUp()" style="background:rgba(123,47,247,0.3);border:1px solid #7b2ff7;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px">+ Bigger</button>
          <button onclick="CollageGame.scaleDown()" style="background:rgba(123,47,247,0.3);border:1px solid #7b2ff7;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px">− Smaller</button>
          <button onclick="CollageGame.clear()" style="background:rgba(239,68,68,0.3);border:1px solid #ef4444;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px">🗑 Clear</button>
        </div>
      </div>
    `;
    canvas = document.getElementById('collage-canvas');
    canvas.width = 500; canvas.height = 400;
    ctx = canvas.getContext('2d');
    placed = []; rotation = 0; scale = 1;

    // Palette
    const palette = document.getElementById('collage-palette');
    artworks.forEach((art, i) => {
      const thumb = document.createElement('div');
      Object.assign(thumb.style, {
        width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden',
        border: '2px solid rgba(255,110,199,0.3)', cursor: 'pointer', flexShrink: '0',
        transition: 'all 0.2s'
      });
      if (art.img) {
        const img = document.createElement('img');
        img.src = art.img.src;
        Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover' });
        thumb.appendChild(img);
      }
      thumb.addEventListener('click', () => {
        currentArt = art;
        palette.querySelectorAll('div').forEach(d => d.style.borderColor = 'rgba(255,110,199,0.3)');
        thumb.style.borderColor = '#ff6ec7';
        thumb.style.boxShadow = '0 0 12px rgba(255,110,199,0.5)';
      });
      palette.appendChild(thumb);
    });

    canvas.addEventListener('click', placeArtwork);
    drawCanvas();
  }

  function placeArtwork(e) {
    if (!currentArt) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleX;
    placed.push({ art: currentArt, x, y, rotation, scale, opacity: 0.9 });
    drawCanvas();
  }

  function drawCanvas() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Light grid
    ctx.strokeStyle = 'rgba(123,47,247,0.05)';
    for (let x = 0; x < canvas.width; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    placed.forEach(p => {
      if (!p.art.img) return;
      const sz = 80 * p.scale;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = p.opacity;
      // Shadow
      ctx.shadowColor = '#ff6ec7'; ctx.shadowBlur = 12;
      window.ArtworkLoader.drawArtworkCover(ctx, p.art.img, -sz/2, -sz/2, sz, sz);
      ctx.shadowBlur = 0;
      // Border
      ctx.strokeStyle = 'rgba(255,110,199,0.4)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(-sz/2, -sz/2, sz, sz);
      ctx.restore();
    });

    // Watermark
    if (placed.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#fff'; ctx.font = '10px Inter';
      ctx.fillText('Collage by Naroa', 10, canvas.height - 10);
      ctx.restore();
    }
  }

  function destroy() { if (container) container.innerHTML = ''; }

  return {
    init, destroy,
    rotate: (deg) => { rotation += deg; },
    scaleUp: () => { scale = Math.min(3, scale + 0.2); },
    scaleDown: () => { scale = Math.max(0.3, scale - 0.2); },
    clear: () => { placed = []; drawCanvas(); }
  };
})();
