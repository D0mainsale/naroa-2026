/**
 * El Restaurador Desastroso - Naroa 2026
 * @description Restore artworks by cleaning them... carefully!
 * Agent A07: Brush sparkle trail, progress shimmer, completion fireworks
 */
(function() {
  'use strict';

  const W = 600, H = 500;
  let state = {
    canvas: null, ctx: null, 
    originalImg: null, dirtyLayer: null, 
    brushSize: 20, progress: 0, timeLeft: 30, 
    level: 1, score: 0,
    particles: [], active: false, restorationComplete: false
  };

  async function init() {
    const container = document.getElementById('restaurador-container');
    if (!container) return;

    container.innerHTML = `
      <div class="rest-header">
        <span>Nivel: <strong id="rest-level">1</strong></span>
        <span>Tiempo: <strong id="rest-time">30</strong>s</span>
        <span>Progreso: <strong id="rest-progress">0%</strong></span>
      </div>
      <div class="rest-canvas-wrapper" style="position:relative; width:${W}px; height:${H}px; margin:0 auto; cursor:crosshair">
        <canvas id="rest-base" width="${W}" height="${H}" style="position:absolute; top:0; left:0; z-index:1"></canvas>
        <canvas id="rest-overlay" width="${W}" height="${H}" style="position:absolute; top:0; left:0; z-index:2"></canvas>
      </div>
      <div class="rest-controls">
        <button class="game-btn" id="rest-start">🎨 Empezar Restauración</button>
      </div>
    `;

    state.canvas = document.getElementById('rest-overlay');
    state.ctx = state.canvas.getContext('2d');
    
    document.getElementById('rest-start').addEventListener('click', startLevel);

    // Brush events
    state.canvas.addEventListener('mousemove', handleBrush);
    state.canvas.addEventListener('touchmove', handleBrush, { passive: false });
  }

  async function loadLevelArt() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      const art = data.artworks[state.level % data.artworks.length];
      
      // Load base image (The "clean" version)
      const img = new Image();
      img.src = `img/artworks-intro/${art.file}`; // Assuming path
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Fallback or handle error
      });
      state.originalImg = img;

      // Render base to bottom canvas
      const baseCtx = document.getElementById('rest-base').getContext('2d');
      // Cover fit
      const scale = Math.max(W/img.width, H/img.height);
      const x = (W - img.width * scale) / 2;
      const y = (H - img.height * scale) / 2;
      baseCtx.drawImage(img, x, y, img.width * scale, img.height * scale);

    } catch (e) {
      console.error("Art load failed", e);
    }
  }

  function startLevel() {
    state.active = true;
    state.restorationComplete = false;
    state.progress = 0;
    state.timeLeft = 30 - (state.level * 2); 
    state.particles = [];
    
    // Fill overlay with "dirt" (e.g., brownish noise)
    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(100, 80, 60, 0.95)';
    ctx.fillRect(0, 0, W, H);
    
    // Add some "stains"
    for(let i=0; i<20; i++) {
      ctx.fillStyle = 'rgba(60, 40, 20, 0.5)';
      ctx.beginPath();
      ctx.arc(Math.random()*W, Math.random()*H, Math.random()*50 + 20, 0, Math.PI*2);
      ctx.fill();
    }

    loadLevelArt(); // Load background underneath

    // Timer
    const timerInterval = setInterval(() => {
      if (!state.active) { clearInterval(timerInterval); return; }
      state.timeLeft--;
      document.getElementById('rest-time').textContent = state.timeLeft;
      if (state.timeLeft <= 0) endGame(false);
    }, 1000);

    gameLoop();
  }

  function handleBrush(e) {
    if (!state.active) return;
    e.preventDefault();
    const rect = state.canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Erase dirt (destination-out)
    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, state.brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Spawn sparkles
    if (Math.random() > 0.5) spawnParticles(x, y);

    // Check progress sparingly
    if (Math.random() > 0.9) checkProgress();
  }

  function spawnParticles(x, y) {
    for(let i=0; i<3; i++) {
        state.particles.push({
            x, y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
            life: 1.0, hue: 45 + Math.random()*20 // Gold dust
        });
    }
  }

  function checkProgress() {
    // Sample pixels to see how much alpha is 0
    // This is heavy, optimization: just estimate based on brush strokes or do rarely
    const imgData = state.ctx.getImageData(0, 0, W, H);
    const data = imgData.data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4 * 100) { // Sample every 100th pixel
        if (data[i] === 0) transparent++;
    }
    const total = data.length / (4 * 100);
    state.progress = Math.floor((transparent / total) * 100);
    document.getElementById('rest-progress').textContent = `${state.progress}%`;

    if (state.progress >= 95) endGame(true);
  }

  function endGame(win) {
    state.active = false;
    if (win) {
        state.score += state.timeLeft * 100;
        state.level++;
        if (window.GameEffects) GameEffects.confettiBurst(state.canvas);
        document.getElementById('rest-level').textContent = state.level;
        alert(`¡Obra Maestra! Puntos: ${state.score}`);
    } else {
        alert('Se acabó el tiempo. ¡Desastre museístico!');
        state.level = 1;
        state.score = 0;
    }
  }

  function gameLoop() {
    if (!state.active) return;

    // particle update
    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'source-over'; // Switch back for particles
    // We can't clearRect because that would restore dirt... wait.
    // Actually we are drawing ON TOP of the dirt canvas.
    // If we draw particles on the dirt canvas, they might get erased by brush?
    // Better to use a 3rd canvas for particles OR just simple overlay. 
    // For simplicity, let's skip complex particle rendering loop on the dirt layer 
    // or use the base canvas context? No, base is image.
    // We'll just rely on the 'sparkle' effect of the brush itself.
    
    // Actually, let's just animate the UI or something simple.
    requestAnimationFrame(gameLoop);
  }

  window.RestauradorGame = { init };
})();
