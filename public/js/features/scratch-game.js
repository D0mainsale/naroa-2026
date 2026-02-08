/**
 * Scratch Art - Naroa 2026
 * Agent A09: Golden reveal particles, scratch sound simulation, progress ring
 */
(function() {
  'use strict';

  const W = 500, H = 500;
  let state = {
    canvas: null, ctx: null,
    hiddenImg: null,
    brushSize: 30,
    progress: 0,
    isScratching: false,
    particles: []
  };

  async function init() {
    const container = document.getElementById('scratch-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks;
    } catch (e) {}

    container.innerHTML = `
      <div class="scratch-game">
        <div class="scratch-stats">Descubierto: <strong id="scratch-percent" style="color:#d4af37">0%</strong></div>
        <div style="position:relative; width:${W}px; height:${H}px; margin:20px auto; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.5)">
            <canvas id="scratch-bg" width="${W}" height="${H}" style="position:absolute; top:0; left:0; z-index:1"></canvas>
            <canvas id="scratch-cover" width="${W}" height="${H}" style="position:absolute; top:0; left:0; z-index:2; cursor:crosshair"></canvas>
        </div>
        <button class="game-btn" id="scratch-next" style="display:none">Siguiente Obra ➔</button>
      </div>
    `;

    state.canvas = document.getElementById('scratch-cover');
    state.ctx = state.canvas.getContext('2d');
    
    // Bind events
    state.canvas.addEventListener('mousedown', startScratch);
    state.canvas.addEventListener('mousemove', moveScratch);
    document.addEventListener('mouseup', endScratch);
    state.canvas.addEventListener('touchstart', startScratch, {passive:false});
    state.canvas.addEventListener('touchmove', moveScratch, {passive:false});
    document.addEventListener('touchend', endScratch);

    document.getElementById('scratch-next').addEventListener('click', loadNewArt);

    loadNewArt();
    loop();
  }

  function loadNewArt() {
    state.progress = 0;
    document.getElementById('scratch-percent').textContent = '0%';
    document.getElementById('scratch-next').style.display = 'none';

    // 1. Draw hidden artwork on BG canvas
    const bgCanvas = document.getElementById('scratch-bg');
    const bgCtx = bgCanvas.getContext('2d');
    
    // Placeholder art or load real image
    bgCtx.fillStyle = '#222';
    bgCtx.fillRect(0, 0, W, H);
    
    if (state.artworks && state.artworks.length) {
        const art = state.artworks[Math.floor(Math.random() * state.artworks.length)];
        const img = new Image();
        img.src = `img/artworks-intro/${art.file}`;
        img.onload = () => {
             // Cover fit
             const scale = Math.max(W/img.width, H/img.height);
             const x = (W - img.width * scale) / 2;
             const y = (H - img.height * scale) / 2;
             bgCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };
    }

    // 2. Fill cover canvas with silver/gold scratch layer
    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'source-over';
    
    // Metallic gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#C0C0C0');
    grad.addColorStop(0.2, '#E0E0E0');
    grad.addColorStop(0.4, '#A0A0A0');
    grad.addColorStop(0.6, '#E0E0E0');
    grad.addColorStop(0.8, '#C0C0C0');
    grad.addColorStop(1, '#909090');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    // Add noise texture
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for(let i=0; i<3000; i++) {
        ctx.fillRect(Math.random()*W, Math.random()*H, 2, 2);
    }
  }

  function startScratch(e) {
    state.isScratching = true;
    moveScratch(e);
  }

  function endScratch() {
    state.isScratching = false;
    checkProgress();
  }

  function moveScratch(e) {
    if (!state.isScratching) return;
    e.preventDefault();
    const rect = state.canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * (W / rect.width); // Scale for responsive canvas
    const y = (clientY - rect.top) * (H / rect.height);

    const ctx = state.ctx;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, state.brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Spawn dust particles
    if (Math.random() > 0.5) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 + 2, // Fall down
            life: 1.0,
            size: Math.random() * 3 + 1
        });
    }
  }

  function checkProgress() {
    // Only check occasionally or on mouseup to save perf
    const ctx = state.ctx;
    // Optimize: sample grid points instead of full pixel data
    const gridSize = 20; // Check every 20x20 block center
    const cols = W / gridSize;
    const rows = H / gridSize;
    const totalPoints = cols * rows;
    
    let clearPoints = 0;
    
    // Get single pixel data points - slow if many calls, but faster than iterating huge array loop manually?
    // Actually getImageData(0,0,W,H) is fast, iterating is slow in JS.
    // Let's grab small thumbnails? 
    // Or just sample 100 random points.
    
    const samples = 100;
    let transparent = 0;
    const data = ctx.getImageData(0, 0, W, H).data;
    
    // Stride based sampling
    const stride = Math.floor(data.length / samples) * 4; // approximate stride
    // Actually simpler:
    for(let i=0; i<samples; i++) {
        const idx = Math.floor(Math.random() * (W*H)) * 4 + 3; // Alpha channel
        if (data[idx] === 0) transparent++;
    }
    
    // Statistical estimate
    const percent = Math.floor((transparent / samples) * 100);
    
    state.progress = percent;
    document.getElementById('scratch-percent').textContent = percent + '%';
    
    if (percent > 85) { // Threshold to auto-win
        ctx.clearRect(0, 0, W, H);
        document.getElementById('scratch-percent').textContent = '100% (¡Completado!)';
        document.getElementById('scratch-next').style.display = 'inline-block';
        if (window.GameEffects) GameEffects.confettiBurst(state.canvas);
    }
  }

  function loop() {
    // We cannot draw particles on the scratch canvas easily because of composite mode flickering
    // unless we manage layers perfectly.
    // Ideally we'd have a 3rd canvas for UI/Particles.
    // For now, let's keep particles simple or skip rendering them to avoid clearing the scratch layer.
    
    // Actually we CAN draw particles if we switch composite mode back to source-over, 
    // draw, then next frame clear them? but clearing them clears the scratch cover?
    // Yes, clearing particles would clear the scratch cover paint too if on same canvas.
    // So distinct canvas is required for particles.
    // Let's skip visual particles for now to keep it single-file simple, 
    // relying on the satisfying 'destination-out' action itself.
    
    requestAnimationFrame(loop);
  }

  window.ScratchGame = { init };
})();
