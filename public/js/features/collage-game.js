/**
 * Collage Creator - Naroa 2026
 * Agent A17: Drag-drop glow, element placement burst, poem typewriter
 */
(function() {
  'use strict';

  let state = { elements: [], canvas: null, ctx: null, dragging: null, emotion: 'neutral', poems: {
    joy: 'La luz se fragmenta\nen mil colores vivos\nque danzan sin cesar.',
    sadness: 'Las sombras abrazan\nlos recuerdos perdidos\nen un mar de silencio.',
    anger: 'Fuego que consume\nlas cadenas del alma\nlibertad que arde.',
    neutral: 'El lienzo en blanco\nespera tus palabras\nhechas de color.'
  }};

  function init() {
    const container = document.getElementById('collage-container');
    if (!container) return;

    container.innerHTML = `
      <div class="collage-ui">
        <div class="collage-palette" id="collage-palette"></div>
        <canvas id="collage-canvas" width="500" height="500" style="border:1px solid rgba(204,255,0,0.2);border-radius:12px;cursor:crosshair;background:#0d0d1a"></canvas>
        <div class="collage-controls">
          <button class="game-btn" id="collage-clear">🗑️ Limpiar</button>
          <button class="game-btn" id="collage-poem">📜 Revelar Poema</button>
        </div>
        <div id="collage-poem-text" style="font-style:italic;color:#ccff00;min-height:60px;text-align:center;padding:10px"></div>
      </div>
    `;

    state.canvas = document.getElementById('collage-canvas');
    state.ctx = state.canvas.getContext('2d');

    // Build palette
    const palette = document.getElementById('collage-palette');
    const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
    const hues = [0, 60, 120, 200, 280];
    shapes.forEach((shape, i) => {
      const btn = document.createElement('div');
      btn.className = 'palette-item';
      btn.style.cssText = `width:40px;height:40px;background:hsl(${hues[i]},80%,50%);border-radius:${shape==='circle'?'50%':'4px'};cursor:grab;display:inline-block;margin:4px;box-shadow:0 0 10px hsla(${hues[i]},80%,50%,0.5)`;
      btn.dataset.shape = shape;
      btn.dataset.hue = hues[i];
      btn.draggable = true;
      btn.addEventListener('dragstart', e => {
        e.dataTransfer.setData('shape', shape);
        e.dataTransfer.setData('hue', hues[i]);
      });
      palette.appendChild(btn);
    });

    state.canvas.addEventListener('dragover', e => e.preventDefault());
    state.canvas.addEventListener('drop', e => {
      e.preventDefault();
      const rect = state.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const shape = e.dataTransfer.getData('shape');
      const hue = parseInt(e.dataTransfer.getData('hue'));
      addElement(x, y, shape, hue);
    });

    // Click to place
    state.canvas.addEventListener('click', e => {
      const rect = state.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const hue = Math.random() * 360;
      const shapes = ['circle', 'square', 'triangle'];
      addElement(x, y, shapes[Math.floor(Math.random() * shapes.length)], hue);
    });

    document.getElementById('collage-clear').addEventListener('click', () => {
      state.elements = [];
      state.ctx.clearRect(0, 0, 500, 500);
    });

    document.getElementById('collage-poem').addEventListener('click', revealPoem);
  }

  function addElement(x, y, shape, hue) {
    const size = 20 + Math.random() * 40;
    const rotation = Math.random() * Math.PI * 2;
    state.elements.push({ x, y, shape, hue, size, rotation, alpha: 0 });
    
    // Update emotion based on dominant hue
    const avgHue = state.elements.reduce((s, e) => s + e.hue, 0) / state.elements.length;
    if (avgHue < 60) state.emotion = 'anger';
    else if (avgHue < 150) state.emotion = 'joy';
    else if (avgHue < 250) state.emotion = 'sadness';
    else state.emotion = 'neutral';

    if (window.GameEffects) GameEffects.hapticFeedback();
    renderCanvas();
  }

  function renderCanvas() {
    const ctx = state.ctx;
    ctx.clearRect(0, 0, 500, 500);

    state.elements.forEach(el => {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rotation);
      ctx.globalAlpha = Math.min(1, (el.alpha += 0.1));
      ctx.fillStyle = `hsl(${el.hue}, 80%, 55%)`;
      ctx.shadowColor = `hsl(${el.hue}, 80%, 50%)`;
      ctx.shadowBlur = 12;

      switch (el.shape) {
        case 'circle':
          ctx.beginPath(); ctx.arc(0, 0, el.size/2, 0, Math.PI*2); ctx.fill(); break;
        case 'square':
          ctx.fillRect(-el.size/2, -el.size/2, el.size, el.size); break;
        case 'triangle':
          ctx.beginPath(); ctx.moveTo(0, -el.size/2); ctx.lineTo(el.size/2, el.size/2); ctx.lineTo(-el.size/2, el.size/2); ctx.closePath(); ctx.fill(); break;
        default:
          ctx.beginPath(); ctx.arc(0, 0, el.size/2, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });
    ctx.shadowBlur = 0;
  }

  function revealPoem() {
    const text = state.poems[state.emotion];
    const el = document.getElementById('collage-poem-text');
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, 50);
      }
    };
    type();
    if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('collage-canvas'));
  }

  window.CollageGame = { init };
})();
