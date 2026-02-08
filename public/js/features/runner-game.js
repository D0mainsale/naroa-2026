/* ═══════════════════════════════════════════════════════════════
   Runner — Art Runner with Real Artwork Collectibles
   Collectibles show actual artwork thumbnails; museum walls
   ═══════════════════════════════════════════════════════════════ */
window.RunnerGame = (() => {
  let container, canvas, ctx, player, obstacles, collectibles, score, gameOver, speed, animFrame;
  let artworks = [], bgImg = null;
  const GROUND = 0.8; // ground at 80% height

  async function init() {
    container = document.getElementById('runner-container');
    if (!container) return;
    artworks = await window.ArtworkLoader.getRandomArtworks(8);
    if (artworks.length) bgImg = artworks[0].img;
    buildUI(); startGame();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:8px">
        <div style="color:#ccc;font-size:13px;margin-bottom:8px">
          Score: <b id="run-score" style="color:#ff6ec7">0</b> &nbsp;·&nbsp; 
          <span style="color:#aaa;font-size:11px">Space/Tap to jump</span>
        </div>
        <canvas id="runner-canvas" style="border-radius:12px;border:1px solid rgba(123,47,247,0.3);display:block;margin:0 auto;background:#0a0a1a"></canvas>
      </div>
    `;
    canvas = document.getElementById('runner-canvas');
    const maxW = Math.min(container.clientWidth - 20, 500);
    canvas.width = maxW; canvas.height = maxW * 0.45;
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); });
  }

  function startGame() {
    const gh = canvas.height * GROUND;
    player = { x: 60, y: gh, w: 28, h: 36, vy: 0, grounded: true };
    obstacles = []; collectibles = []; score = 0; gameOver = false; speed = 3;
    cancelAnimationFrame(animFrame);
    loop();
  }

  function jump() {
    if (gameOver) { startGame(); return; }
    if (player.grounded) { player.vy = -10; player.grounded = false; }
  }

  function loop() {
    if (gameOver) return;
    const gh = canvas.height * GROUND;
    // Physics
    player.vy += 0.5;
    player.y += player.vy;
    if (player.y >= gh) { player.y = gh; player.vy = 0; player.grounded = true; }

    // Spawn
    if (Math.random() < 0.02) obstacles.push({ x: canvas.width, y: gh, w: 20, h: 30 + Math.random() * 20 });
    if (Math.random() < 0.015) {
      const art = artworks.length ? artworks[Math.floor(Math.random() * artworks.length)] : null;
      collectibles.push({ x: canvas.width, y: gh - 50 - Math.random() * 40, size: 24, artwork: art });
    }

    // Move
    obstacles.forEach(o => o.x -= speed);
    collectibles.forEach(c => c.x -= speed);
    obstacles = obstacles.filter(o => o.x > -50);
    collectibles = collectibles.filter(c => c.x > -50);

    // Collision
    obstacles.forEach(o => {
      if (player.x + player.w > o.x && player.x < o.x + o.w && player.y > o.y - o.h) {
        gameOver = true;
      }
    });
    collectibles = collectibles.filter(c => {
      if (player.x + player.w > c.x && player.x < c.x + c.size && player.y > c.y - c.size && player.y - player.h < c.y) {
        score += 10; speed = Math.min(8, speed + 0.1);
        const s = document.getElementById('run-score'); if (s) s.textContent = score;
        return false;
      }
      return true;
    });

    // Draw
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Museum wall artwork
    if (artworks.length > 1) {
      for (let i = 1; i < Math.min(4, artworks.length); i++) {
        const wx = (i * canvas.width / 4) - 30 + (Date.now() * 0.01 * speed) % canvas.width;
        const finalX = ((wx % canvas.width) + canvas.width) % canvas.width - canvas.width / 4;
        if (artworks[i].img) {
          window.ArtworkLoader.drawArtworkCover(ctx, artworks[i].img, finalX, 20, 50, 40, 0.08);
          ctx.strokeStyle = 'rgba(123,47,247,0.15)'; ctx.strokeRect(finalX, 20, 50, 40);
        }
      }
    }
    // Ground
    ctx.fillStyle = '#1a1a3e'; ctx.fillRect(0, gh, canvas.width, canvas.height - gh);
    ctx.strokeStyle = 'rgba(123,47,247,0.3)'; ctx.beginPath(); ctx.moveTo(0, gh); ctx.lineTo(canvas.width, gh); ctx.stroke();

    // Player
    ctx.fillStyle = '#ff6ec7'; ctx.fillRect(player.x, player.y - player.h, player.w, player.h);
    ctx.shadowColor = '#ff6ec7'; ctx.shadowBlur = 8;
    ctx.fillRect(player.x, player.y - player.h, player.w, player.h);
    ctx.shadowBlur = 0;

    // Obstacles
    obstacles.forEach(o => {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(o.x, o.y - o.h, o.w, o.h);
    });

    // Collectibles — artwork thumbnails
    collectibles.forEach(c => {
      if (c.artwork && c.artwork.img) {
        window.ArtworkLoader.drawArtworkCover(ctx, c.artwork.img, c.x, c.y - c.size, c.size, c.size, 0.9);
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.5;
        ctx.strokeRect(c.x, c.y - c.size, c.size, c.size);
        // Glow
        ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 8;
        ctx.strokeRect(c.x, c.y - c.size, c.size, c.size);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#22c55e'; ctx.beginPath();
        ctx.arc(c.x + c.size/2, c.y - c.size/2, c.size/2, 0, Math.PI*2); ctx.fill();
      }
    });

    score++; speed += 0.001;
    if (!gameOver) animFrame = requestAnimationFrame(loop);
    else {
      // Game over overlay
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff6ec7'; ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
      ctx.fillStyle = '#ccc'; ctx.font = '14px Inter';
      ctx.fillText(`Score: ${score} · Tap to retry`, canvas.width/2, canvas.height/2 + 20);
      if (typeof RankingSystem !== 'undefined') RankingSystem.submit('runner', score);
    }
  }

  function destroy() { gameOver = true; cancelAnimationFrame(animFrame); if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
