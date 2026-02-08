/* ═══════════════════════════════════════════════════════════════
   Target Practice — Artwork Circular Targets
   Targets show artwork images; hit shatters them
   ═══════════════════════════════════════════════════════════════ */
window.TargetGame = (() => {
  let container, canvas, ctx, targets = [], score = 0, combo = 0, timeLeft = 30, timer, artworks = [];

  async function init() {
    container = document.getElementById('target-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(12);
    buildUI(); startGame();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:8px">
        <div style="display:flex;justify-content:space-between;max-width:440px;margin:0 auto;color:#ccc;font-size:13px;margin-bottom:8px">
          <span>Score: <b id="tgt-score" style="color:#ff6ec7">0</b></span>
          <span>Combo: <b id="tgt-combo" style="color:#7b2ff7">x0</b></span>
          <span>⏱ <b id="tgt-timer">30s</b></span>
        </div>
        <canvas id="target-canvas" style="border-radius:12px;border:1px solid rgba(123,47,247,0.3);display:block;margin:0 auto;background:#0a0a1a;cursor:crosshair"></canvas>
      </div>
    `;
    canvas = document.getElementById('target-canvas');
    const maxW = Math.min(container.clientWidth - 20, 440);
    canvas.width = maxW; canvas.height = maxW * 0.85;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', handleClick);
  }

  function startGame() {
    score = 0; combo = 0; timeLeft = 30; targets = [];
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      const t = document.getElementById('tgt-timer');
      if (t) { t.textContent = timeLeft + 's'; if (timeLeft <= 5) t.style.color = '#ef4444'; }
      if (timeLeft <= 0) endGame();
    }, 1000);
    setInterval(spawnTarget, 700);
    animate();
  }

  function spawnTarget() {
    if (targets.length >= 5 || timeLeft <= 0) return;
    const r = 20 + Math.random() * 25;
    const art = artworks.length ? artworks[Math.floor(Math.random() * artworks.length)] : null;
    targets.push({
      x: r + Math.random() * (canvas.width - r * 2),
      y: r + Math.random() * (canvas.height - r * 2),
      r, lifetime: 2000 + Math.random() * 1500, spawn: Date.now(),
      artwork: art, hit: false, hitTime: 0
    });
  }

  function handleClick(e) {
    const mx = e.offsetX, my = e.offsetY;
    let hitAny = false;
    targets.forEach(t => {
      if (t.hit) return;
      const d = Math.sqrt((mx-t.x)**2 + (my-t.y)**2);
      if (d < t.r) {
        t.hit = true; t.hitTime = Date.now();
        hitAny = true; combo++; score += 10 * combo;
        if (typeof GameEffects !== 'undefined') GameEffects.scorePopup(container, `+${10*combo}`, mx, my);
      }
    });
    if (!hitAny) combo = 0;
    updateHUD();
  }

  function updateHUD() {
    const s = document.getElementById('tgt-score'), c = document.getElementById('tgt-combo');
    if (s) s.textContent = score; if (c) c.textContent = `x${combo}`;
  }

  function animate() {
    if (timeLeft <= 0) return;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    targets = targets.filter(t => {
      const elapsed = now - t.spawn;
      if (t.hit && now - t.hitTime > 300) return false;
      if (!t.hit && elapsed > t.lifetime) { combo = 0; updateHUD(); return false; }

      const progress = t.hit ? 0.3 : Math.min(1, elapsed / 200);
      const scale = t.hit ? 1.3 : progress;
      const r = t.r * scale;

      // Draw artwork circle
      if (t.artwork && t.artwork.img) {
        window.ArtworkLoader.drawArtworkCircle(ctx, t.artwork.img, t.x, t.y, r, t.hit ? 0.3 : 0.9);
      }
      // Ring
      ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = t.hit ? '#22c55e' : `rgba(255,110,199,${1 - elapsed/t.lifetime})`;
      ctx.lineWidth = t.hit ? 3 : 2;
      ctx.shadowColor = t.hit ? '#22c55e' : '#ff6ec7'; ctx.shadowBlur = 10;
      ctx.stroke(); ctx.shadowBlur = 0;

      // Shrink ring (remaining time)
      if (!t.hit) {
        const remain = 1 - elapsed / t.lifetime;
        ctx.beginPath(); ctx.arc(t.x, t.y, r + 4, -Math.PI/2, -Math.PI/2 + Math.PI*2*remain);
        ctx.strokeStyle = 'rgba(123,47,247,0.5)'; ctx.lineWidth = 2; ctx.stroke();
      }
      return true;
    });
    requestAnimationFrame(animate);
  }

  function endGame() {
    clearInterval(timer);
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🎯</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">Time's Up!</h2><p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Score: ${score}</p><button onclick="TargetGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('target', score);
  }

  function destroy() { clearInterval(timer); if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
