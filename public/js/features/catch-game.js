/* ═══════════════════════════════════════════════════════════════
   Catch Game — Premium with Artwork Items
   Falling items show artwork thumbnails with neon glow
   ═══════════════════════════════════════════════════════════════ */
window.CatchGame = (() => {
  let container, canvas, ctx, basket, items, score, lives, combo, gameOver, animFrame;
  let artworks = [];

  async function init() {
    container = document.getElementById('catch-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(10);
    buildUI(); startGame();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:8px">
        <div style="display:flex;justify-content:space-between;max-width:440px;margin:0 auto;color:#ccc;font-size:13px;margin-bottom:8px">
          <span>Score: <b id="catch-score" style="color:#ff6ec7">0</b></span>
          <span>Lives: <b id="catch-lives" style="color:#ef4444">❤❤❤</b></span>
          <span>Combo: <b id="catch-combo" style="color:#7b2ff7">x1</b></span>
        </div>
        <canvas id="catch-canvas" style="border-radius:12px;border:1px solid rgba(123,47,247,0.3);display:block;margin:0 auto;background:#0a0a1a;cursor:none"></canvas>
      </div>
    `;
    canvas = document.getElementById('catch-canvas');
    const maxW = Math.min(container.clientWidth - 20, 440);
    canvas.width = maxW; canvas.height = maxW * 1.2;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousemove', e => { basket.x = e.offsetX; });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); basket.x = e.touches[0].clientX - r.left; });
  }

  function startGame() {
    basket = { x: canvas.width / 2, w: 70, h: 20 };
    items = []; score = 0; lives = 3; combo = 1; gameOver = false;
    cancelAnimationFrame(animFrame);
    setInterval(spawnItem, 800);
    loop();
  }

  function spawnItem() {
    if (gameOver) return;
    const art = artworks.length ? artworks[Math.floor(Math.random() * artworks.length)] : null;
    items.push({
      x: Math.random() * (canvas.width - 40) + 20,
      y: -30, speed: 2 + Math.random() * 2 + score * 0.01,
      size: 28, artwork: art, rotation: Math.random() * Math.PI * 2
    });
  }

  function loop() {
    if (gameOver) return;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Basket
    const bx = basket.x - basket.w / 2, by = canvas.height - 40;
    ctx.fillStyle = 'rgba(123,47,247,0.3)';
    ctx.fillRect(bx, by, basket.w, basket.h);
    ctx.strokeStyle = '#7b2ff7'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, basket.w, basket.h);
    // Basket glow
    ctx.shadowColor = '#7b2ff7'; ctx.shadowBlur = 15;
    ctx.strokeRect(bx, by, basket.w, basket.h);
    ctx.shadowBlur = 0;

    // Items
    items = items.filter(item => {
      item.y += item.speed;
      item.rotation += 0.02;

      // Draw artwork item
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      if (item.artwork && item.artwork.img) {
        window.ArtworkLoader.drawArtworkCover(ctx, item.artwork.img, -item.size/2, -item.size/2, item.size, item.size, 0.9);
        ctx.strokeStyle = '#ff6ec7'; ctx.lineWidth = 1.5;
        ctx.strokeRect(-item.size/2, -item.size/2, item.size, item.size);
      } else {
        ctx.fillStyle = '#ff6ec7';
        ctx.fillRect(-item.size/2, -item.size/2, item.size, item.size);
      }
      ctx.restore();

      // Catch check
      if (item.y > by && item.y < by + basket.h && item.x > bx && item.x < bx + basket.w) {
        score += 10 * combo; combo++;
        updateHUD();
        if (typeof GameEffects !== 'undefined') GameEffects.scorePopup(container, `+${10*combo}`, item.x, item.y);
        return false;
      }
      // Miss
      if (item.y > canvas.height + 30) {
        lives--; combo = 1; updateHUD();
        if (lives <= 0) endGame();
        return false;
      }
      return true;
    });

    animFrame = requestAnimationFrame(loop);
  }

  function updateHUD() {
    const s = document.getElementById('catch-score'), l = document.getElementById('catch-lives'), c = document.getElementById('catch-combo');
    if (s) s.textContent = score;
    if (l) l.textContent = '❤'.repeat(Math.max(0, lives));
    if (c) c.textContent = `x${combo}`;
  }

  function endGame() {
    gameOver = true; cancelAnimationFrame(animFrame);
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🧺</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">Game Over</h2><p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Score: ${score}</p><button onclick="CatchGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('catch', score);
  }

  function destroy() { gameOver = true; cancelAnimationFrame(animFrame); if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
