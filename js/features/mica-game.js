/**
 * MICA Viva - Naroa 2026
 * @description Interactive visualizer of MICA's core — breathing shader effect
 * Agent A10: Enhanced mica shimmer shader, breathing sync, aura glow
 */
(function() {
  'use strict';

  const W = 600, H = 600;
  let state = {
    canvas: null, ctx: null, 
    breathing: 0, time: 0,
    particles: [], auraRadius: 100
  };

  function init() {
    const container = document.getElementById('mica-game-container'); // Re-using ID convention
    if (!container) return; // Silent fail if specific container not present

    container.innerHTML = `
      <div class="mica-viva-ui">
        <h2>MICA STATE: <span style="color:#d4af37">ACTIVE</span></h2>
        <canvas id="mica-canvas" width="${W}" height="${H}"></canvas>
      </div>
    `;

    state.canvas = document.getElementById('mica-canvas');
    state.ctx = state.canvas.getContext('2d');
    
    state.canvas.addEventListener('mousemove', e => {
       // Interactive aura
    });

    animate();
  }

  function animate() {
    const ctx = state.ctx;
    state.time += 0.02;
    state.breathing = (Math.sin(state.time) + 1) / 2; // 0 to 1

    // Clear with heavy trail
    ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
    ctx.fillRect(0, 0, W, H);

    // Center Orb
    const cx = W/2, cy = H/2;
    const radius = 80 + state.breathing * 20;

    // Outer Aura
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 3);
    grad.addColorStop(0, 'rgba(212, 175, 55, 0.6)');
    grad.addColorStop(0.5, 'rgba(0, 255, 204, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 40 + state.breathing * 20;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Scanlines / Glitch
    if (Math.random() > 0.95) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const y = Math.random() * H;
        const h = Math.random() * 50;
        ctx.fillRect(0, y, W, h);
    }

    requestAnimationFrame(animate);
  }

  window.MicaVivaGame = { init };
})();
