/* ═══════════════════════════════════════════════════════════════
   MICA Viva — Interactive Particles with Artwork Backdrop
   Artwork background behind particle system
   ═══════════════════════════════════════════════════════════════ */
window.MicaVivaGame = (() => {
  let container, canvas, ctx, particles = [], mouse = { x: 0, y: 0 }, bgImg = null;

  async function init() {
    container = document.getElementById('mica-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getFeaturedArtworks(1);
    if (loaded.length) bgImg = loaded[0].img;
    buildUI(); createParticles(); animate();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:8px">
        <div style="color:#aaa;font-size:12px;margin-bottom:8px">Move your mouse/finger to interact</div>
        <canvas id="mica-canvas" style="border-radius:12px;border:1px solid rgba(123,47,247,0.3);display:block;margin:0 auto;cursor:none"></canvas>
      </div>
    `;
    canvas = document.getElementById('mica-canvas');
    const maxW = Math.min(container.clientWidth - 20, 500);
    canvas.width = maxW; canvas.height = maxW * 0.75;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousemove', e => { mouse.x = e.offsetX; mouse.y = e.offsetY; });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - r.left;
      mouse.y = e.touches[0].clientY - r.top;
    });
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 1.5 + Math.random() * 2.5,
        hue: Math.random() * 60 + 280 // purple-pink range
      });
    }
  }

  function animate() {
    ctx.fillStyle = 'rgba(10,10,26,0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Faded artwork backdrop (drawn once per ~60 frames to reduce overdraw)
    if (bgImg && Math.random() < 0.02) {
      ctx.save(); ctx.globalAlpha = 0.03;
      window.ArtworkLoader.drawArtworkCover(ctx, bgImg, 0, 0, canvas.width, canvas.height, 1);
      ctx.restore();
    }

    // Mouse gravity
    particles.forEach(p => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 5) {
        const force = 0.3 / dist;
        p.vx += dx * force; p.vy += dy * force;
      }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      // Wrap
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    });

    // Draw connections
    ctx.strokeStyle = 'rgba(123,47,247,0.08)'; ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = dx * dx + dy * dy;
        if (d < 3600) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.globalAlpha = 1 - d / 3600;
          ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, 0.8)`;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, 0.5)`;
      ctx.shadowBlur = 6;
      ctx.fill(); ctx.shadowBlur = 0;
    });

    // Center glow
    const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 100);
    grad.addColorStop(0, 'rgba(123,47,247,0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glitch text
    if (Math.random() < 0.01) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,110,199,0.15)';
      ctx.font = 'bold 28px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('M I C A', canvas.width/2 + (Math.random()-0.5)*10, canvas.height/2 + (Math.random()-0.5)*10);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
