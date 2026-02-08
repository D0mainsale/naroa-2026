/**
 * Kintsugi Game - Naroa 2026
 * Agent A25: Gold particle trail, wisdom quote typewriter, completion aurora
 */
(function() {
  'use strict';

  const QUOTES = [
    'El arte de reparar hace lo roto más valioso que lo intacto.',
    'Las cicatrices doradas son mapas de la resiliencia.',
    'Lo que se quiebra puede renacer con más belleza.',
    'El oro líquido fluye donde la vida dejó sus marcas.',
    'Cada grieta es una historia que merece ser contada.'
  ];

  let state = { canvas: null, ctx: null, cracks: [], repaired: 0, total: 0, particles: [], complete: false, artworkSrc: null };

  async function init() {
    const container = document.getElementById('kintsugi-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      const art = data.artworks[Math.floor(Math.random() * data.artworks.length)];
      state.artworkSrc = `images/gallery/${art.id}.webp`;
    } catch (e) {}

    container.innerHTML = `
      <div class="kintsugi-ui">
        <p style="color:#ffd700;text-align:center;font-style:italic">🪙 Arrastra tu pincel dorado para reparar las grietas</p>
        <div class="kintsugi-progress">
          <div id="kintsugi-bar" style="height:4px;background:#ffd700;width:0%;border-radius:2px;transition:width 0.3s"></div>
        </div>
        <canvas id="kintsugi-canvas" width="500" height="500" style="border-radius:12px;cursor:none;display:block;margin:0 auto;border:1px solid rgba(255,215,0,0.2)"></canvas>
        <div id="kintsugi-quote" style="text-align:center;color:#ffd700;min-height:40px;padding:15px;font-style:italic"></div>
        <button class="game-btn" id="kintsugi-new">🪙 Nuevo Retrato</button>
      </div>
    `;

    state.canvas = document.getElementById('kintsugi-canvas');
    state.ctx = state.canvas.getContext('2d');

    document.getElementById('kintsugi-new').addEventListener('click', newPortrait);

    // Mouse/touch for gold painting
    let painting = false;
    state.canvas.addEventListener('mousedown', () => painting = true);
    state.canvas.addEventListener('mouseup', () => painting = false);
    state.canvas.addEventListener('mouseleave', () => painting = false);
    state.canvas.addEventListener('mousemove', e => {
      if (!painting || state.complete) return;
      const rect = state.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (500 / rect.width);
      const y = (e.clientY - rect.top) * (500 / rect.height);
      repairAt(x, y);
    });

    // Touch
    state.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = state.canvas.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) * (500 / rect.width);
      const y = (e.touches[0].clientY - rect.top) * (500 / rect.height);
      repairAt(x, y);
    }, {passive: false});

    newPortrait();
  }

  function newPortrait() {
    state.complete = false;
    state.repaired = 0;
    state.particles = [];
    document.getElementById('kintsugi-quote').textContent = '';

    const ctx = state.ctx;
    // Draw dark portrait base
    ctx.fillStyle = '#1a1020';
    ctx.fillRect(0, 0, 500, 500);

    // Draw abstract portrait
    const hue = Math.random() * 360;
    ctx.fillStyle = `hsl(${hue}, 30%, 25%)`;
    ctx.beginPath();
    ctx.ellipse(250, 200, 100, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = `hsl(${hue}, 25%, 20%)`;
    ctx.beginPath();
    ctx.ellipse(250, 420, 150, 120, 0, Math.PI, 0);
    ctx.fill();

    // Generate cracks
    state.cracks = [];
    const numCracks = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numCracks; i++) {
      const points = [];
      let x = 50 + Math.random() * 400;
      let y = 50 + Math.random() * 400;
      const steps = 5 + Math.floor(Math.random() * 8);
      for (let s = 0; s < steps; s++) {
        points.push({ x, y });
        x += (Math.random() - 0.5) * 80;
        y += (Math.random() - 0.5) * 80;
        x = Math.max(10, Math.min(490, x));
        y = Math.max(10, Math.min(490, y));
      }
      state.cracks.push({ points, repaired: false, hitCount: 0, threshold: steps * 2 });
    }
    state.total = state.cracks.length;

    // Draw cracks
    drawCracks();

    document.getElementById('kintsugi-bar').style.width = '0%';
    requestAnimationFrame(loop);
  }

  function drawCracks() {
    const ctx = state.ctx;
    state.cracks.forEach(crack => {
      if (crack.repaired) return;
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      crack.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }

  function repairAt(x, y) {
    const ctx = state.ctx;
    const RADIUS = 20;

    state.cracks.forEach(crack => {
      if (crack.repaired) return;
      crack.points.forEach(p => {
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist < RADIUS) {
          crack.hitCount++;
          // Draw gold
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Spawn gold particle
          state.particles.push({
            x: p.x, y: p.y,
            vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3,
            life: 1.0, size: Math.random() * 3 + 1
          });
        }
      });

      if (crack.hitCount >= crack.threshold && !crack.repaired) {
        crack.repaired = true;
        state.repaired++;
        // Draw gold line over crack
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        crack.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (window.GameEffects) GameEffects.hapticFeedback();

        const pct = Math.round((state.repaired / state.total) * 100);
        document.getElementById('kintsugi-bar').style.width = pct + '%';

        if (state.repaired >= state.total) {
          state.complete = true;
          revealQuote();
          if (window.GameEffects) GameEffects.confettiBurst(state.canvas);
        }
      }
    });
  }

  function revealQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const el = document.getElementById('kintsugi-quote');
    el.textContent = '';
    let i = 0;
    const type = () => { if (i < quote.length) { el.textContent += quote[i++]; setTimeout(type, 60); } };
    type();
  }

  function loop() {
    // Draw particles on top
    const ctx = state.ctx;
    state.particles = state.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.03;
      if (p.life <= 0) return false;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1.0;

    if (!state.complete) requestAnimationFrame(loop);
  }

  window.KintsugiGame = { init };
})();
