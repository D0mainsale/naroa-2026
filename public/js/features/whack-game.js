/* ═══════════════════════════════════════════════════════════════
   Whack-a-Mole — Premium with Real Artwork Images
   Moles show actual artwork thumbnails instead of initial letters
   ═══════════════════════════════════════════════════════════════ */
window.WhackGame = (() => {
  let container, canvas, ctx, score = 0, combo = 0, maxCombo = 0, timeLeft = 30;
  let moles = [], holes = [], artworks = [], gameLoop = null, timerLoop = null;
  const COLS = 4, ROWS = 3, HOLE_COUNT = COLS * ROWS;

  async function init() {
    container = document.getElementById('whack-container');
    if (!container) return;
    container.innerHTML = '<div style="color:#aaa;text-align:center;padding:40px">Loading artworks…</div>';

    artworks = await window.ArtworkLoader.getRandomArtworks(12);
    buildUI();
    startGame();
  }

  function buildUI() {
    container.innerHTML = `
      <div class="whack-hud" style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;
        color:#fff;font-family:Inter,sans-serif;font-size:14px;max-width:520px;margin:0 auto">
        <span class="whack-score">Score: 0</span>
        <span class="whack-combo" style="color:#ff6ec7">Combo: x0</span>
        <span class="whack-timer">⏱ 30s</span>
      </div>
      <canvas id="whack-canvas" style="display:block;margin:0 auto;border-radius:12px;
        background:linear-gradient(180deg,#0a0a1a,#1a1a3e);cursor:crosshair"></canvas>
    `;
    canvas = document.getElementById('whack-canvas');
    const maxW = Math.min(container.clientWidth - 20, 500);
    canvas.width = maxW;
    canvas.height = maxW * 0.75;
    ctx = canvas.getContext('2d');

    // Calculate hole positions
    holes = [];
    const cellW = canvas.width / COLS, cellH = canvas.height / ROWS;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        holes.push({
          x: c * cellW + cellW / 2,
          y: r * cellH + cellH / 2,
          radius: Math.min(cellW, cellH) * 0.32
        });
      }
    }

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      handleClick({ offsetX: t.clientX - rect.left, offsetY: t.clientY - rect.top });
    });
  }

  function startGame() {
    score = 0; combo = 0; maxCombo = 0; timeLeft = 30;
    moles = [];
    clearInterval(gameLoop);
    clearInterval(timerLoop);

    gameLoop = setInterval(spawnMole, 800);
    timerLoop = setInterval(() => {
      timeLeft--;
      updateHUD();
      if (timeLeft <= 0) endGame();
    }, 1000);
    animate();
  }

  function spawnMole() {
    if (moles.length >= 3) return;
    const available = holes.filter((_, i) => !moles.find(m => m.holeIndex === i));
    if (!available.length) return;
    const holeIndex = holes.indexOf(available[Math.floor(Math.random() * available.length)]);
    const art = artworks[Math.floor(Math.random() * artworks.length)];
    moles.push({
      holeIndex,
      artwork: art,
      spawnTime: Date.now(),
      lifetime: 1500 + Math.random() * 1000,
      scale: 0, hit: false
    });
  }

  function handleClick(e) {
    const mx = e.offsetX, my = e.offsetY;
    let hitAny = false;
    moles.forEach(mole => {
      if (mole.hit) return;
      const hole = holes[mole.holeIndex];
      const dx = mx - hole.x, dy = my - hole.y;
      if (Math.sqrt(dx * dx + dy * dy) < hole.radius * mole.scale) {
        mole.hit = true;
        hitAny = true;
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        score += 10 * combo;
        updateHUD();
        // Hit burst
        if (typeof GameEffects !== 'undefined') {
          GameEffects.scorePopup(container, `+${10 * combo}`, mx, my);
        }
      }
    });
    if (!hitAny) {
      combo = 0;
      updateHUD();
    }
  }

  function updateHUD() {
    const s = container.querySelector('.whack-score');
    const c = container.querySelector('.whack-combo');
    const t = container.querySelector('.whack-timer');
    if (s) s.textContent = `Score: ${score}`;
    if (c) c.textContent = `Combo: x${combo}`;
    if (t) t.textContent = `⏱ ${timeLeft}s`;
    if (t && timeLeft <= 5) t.style.color = '#ff4444';
  }

  function animate() {
    if (timeLeft <= 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw holes
    holes.forEach((hole) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(hole.x, hole.y + hole.radius * 0.3, hole.radius * 1.1, hole.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();
      ctx.restore();
    });

    // Draw moles
    const now = Date.now();
    moles = moles.filter(mole => {
      const elapsed = now - mole.spawnTime;
      if (elapsed > mole.lifetime) return false;
      if (mole.hit && elapsed > mole.spawnTime + 300) return false;

      const hole = holes[mole.holeIndex];
      // Scale animation
      const t = elapsed / mole.lifetime;
      if (t < 0.15) mole.scale = t / 0.15;
      else if (t > 0.85) mole.scale = (1 - t) / 0.15;
      else mole.scale = 1;

      if (mole.hit) mole.scale *= 0.5;

      const r = hole.radius * mole.scale;
      if (r <= 0) return !mole.hit;

      // Draw artwork in circle
      if (mole.artwork && mole.artwork.img) {
        window.ArtworkLoader.drawArtworkCircle(ctx, mole.artwork.img, hole.x, hole.y, r);
      } else {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6ec7';
        ctx.fill();
      }

      // Neon ring
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = mole.hit ? '#00ff88' : 'rgba(123,47,247,0.7)';
      ctx.lineWidth = mole.hit ? 4 : 2;
      ctx.stroke();

      // Hit X
      if (mole.hit) {
        ctx.save();
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(hole.x - r * 0.5, hole.y - r * 0.5);
        ctx.lineTo(hole.x + r * 0.5, hole.y + r * 0.5);
        ctx.moveTo(hole.x + r * 0.5, hole.y - r * 0.5);
        ctx.lineTo(hole.x - r * 0.5, hole.y + r * 0.5);
        ctx.stroke();
        ctx.restore();
      }
      return true;
    });

    requestAnimationFrame(animate);
  }

  function endGame() {
    clearInterval(gameLoop);
    clearInterval(timerLoop);
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute', inset: '0', background: 'rgba(0,0,0,0.9)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: '100', borderRadius: '16px'
    });
    overlay.innerHTML = `
      <div style="font-size:48px;margin-bottom:16px">🔨</div>
      <h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">¡Tiempo!</h2>
      <p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Score: ${score} · Max Combo: x${maxCombo}</p>
      <button onclick="WhackGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);
        border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">
        Play Again
      </button>
    `;
    container.style.position = 'relative';
    container.appendChild(overlay);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('whack', score);
  }

  function destroy() {
    clearInterval(gameLoop);
    clearInterval(timerLoop);
    if (container) container.innerHTML = '';
  }

  return { init, destroy };
})();
