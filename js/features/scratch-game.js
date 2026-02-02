/**
 * PINCEL MÁGICO - Scratch para revelar arte oculto
 * Rasca con el pincel para descubrir las obras de Naroa
 */
(function() {
  'use strict';

  const SCRATCH_CONFIG = {
    brushSize: 40,
    revealThreshold: 70,
    artworks: []
  };

  let scratchState = {
    canvas: null,
    ctx: null,
    artworkImg: null,
    isDrawing: false,
    revealed: 0,
    score: 0,
    timer: 30,
    interval: null
  };

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      SCRATCH_CONFIG.artworks = data.artworks || data;
    } catch(e) {
      SCRATCH_CONFIG.artworks = [
        { image: 'images/optimized/amy-rocks.webp', title: 'Amy Rocks' },
        { image: 'images/optimized/marilyn-rocks.webp', title: 'Marilyn Rocks' }
      ];
    }
  }

  function getRandomArtwork() {
    const arts = SCRATCH_CONFIG.artworks;
    return arts[Math.floor(Math.random() * arts.length)];
  }

  function initGame(container) {
    const art = getRandomArtwork();
    
    container.innerHTML = `
      <div class="scratch-game">
        <div class="scratch-header">
          <span class="scratch-score">Revelado: <strong id="scratch-percent">0%</strong></span>
          <span class="scratch-timer">⏱️ <strong id="scratch-time">30</strong>s</span>
          <span class="scratch-total">Puntos: <strong id="scratch-score">0</strong></span>
        </div>
        <div class="scratch-canvas-wrap">
          <img id="scratch-artwork" src="${art.image}" alt="${art.title}" />
          <canvas id="scratch-canvas"></canvas>
        </div>
        <p class="scratch-hint">🖌️ Rasca con el ratón o dedo para revelar la obra</p>
        <button class="game-btn" id="scratch-next">Siguiente Obra →</button>
      </div>
      <style>
        .scratch-game { text-align: center; padding: 1rem; }
        .scratch-header { display: flex; justify-content: space-around; margin-bottom: 1rem; font-size: 1.1rem; }
        .scratch-canvas-wrap { position: relative; display: inline-block; border-radius: 12px; overflow: hidden; }
        .scratch-canvas-wrap img { max-width: 400px; max-height: 400px; display: block; }
        #scratch-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: crosshair; }
        .scratch-hint { color: rgba(255,255,255,0.6); margin: 1rem 0; }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
        .game-btn:hover { filter: brightness(1.1); }
      </style>
    `;

    const img = document.getElementById('scratch-artwork');
    const canvas = document.getElementById('scratch-canvas');
    
    img.onload = () => {
      canvas.width = img.offsetWidth;
      canvas.height = img.offsetHeight;
      const ctx = canvas.getContext('2d');
      
      // Fill with scratch overlay
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add "scratch here" text
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '24px Satoshi, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎨 Rasca aquí', canvas.width/2, canvas.height/2);
      
      scratchState.canvas = canvas;
      scratchState.ctx = ctx;
      scratchState.artworkImg = img;
      scratchState.revealed = 0;
      
      setupEvents(canvas, ctx);
      startTimer();
    };

    document.getElementById('scratch-next').addEventListener('click', () => {
      clearInterval(scratchState.interval);
      initGame(container);
    });
  }

  function setupEvents(canvas, ctx) {
    const scratch = (e) => {
      if (!scratchState.isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, SCRATCH_CONFIG.brushSize, 0, Math.PI * 2);
      ctx.fill();
      
      calculateReveal();
    };

    canvas.addEventListener('mousedown', () => scratchState.isDrawing = true);
    canvas.addEventListener('mouseup', () => scratchState.isDrawing = false);
    canvas.addEventListener('mouseleave', () => scratchState.isDrawing = false);
    canvas.addEventListener('mousemove', scratch);
    
    canvas.addEventListener('touchstart', (e) => { scratchState.isDrawing = true; e.preventDefault(); });
    canvas.addEventListener('touchend', () => scratchState.isDrawing = false);
    canvas.addEventListener('touchmove', (e) => { scratch(e); e.preventDefault(); });
  }

  function calculateReveal() {
    const { canvas, ctx } = scratchState;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    
    const percent = Math.round((transparent / (pixels.length / 4)) * 100);
    scratchState.revealed = percent;
    document.getElementById('scratch-percent').textContent = percent + '%';
    
    if (percent >= SCRATCH_CONFIG.revealThreshold) {
      scratchState.score += 100;
      document.getElementById('scratch-score').textContent = scratchState.score;
      
      // Clear entire canvas to reveal fully
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (window.RankingSystem) {
        window.RankingSystem.submitScore('scratch', scratchState.score);
      }
    }
  }

  function startTimer() {
    scratchState.timer = 30;
    const timerEl = document.getElementById('scratch-time');
    
    scratchState.interval = setInterval(() => {
      scratchState.timer--;
      timerEl.textContent = scratchState.timer;
      
      if (scratchState.timer <= 0) {
        clearInterval(scratchState.interval);
        alert(`¡Tiempo! Puntuación: ${scratchState.score}`);
      }
    }, 1000);
  }

  window.initScratchGame = async function(container) {
    await loadArtworks();
    initGame(container);
  };
})();
