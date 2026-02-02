/**
 * Collage Alquímico - Naroa 2026
 * @description Compose artistic collages using Naroa's signature elements
 * Based on her technique: vintage paper, postal stamps, lottery numbers, organic materials
 */
(function() {
  'use strict';

  const ELEMENTS = [
    { type: 'paper', emoji: '📰', name: 'Papel periódico', emotion: 'nostalgia' },
    { type: 'stamp', emoji: '📮', name: 'Sello postal', emotion: 'viaje' },
    { type: 'lottery', emoji: '🎰', name: 'Número de lotería', emotion: 'azar' },
    { type: 'wire', emoji: '🔗', name: 'Alambre', emotion: 'conexión' },
    { type: 'petal', emoji: '🌸', name: 'Pétalo seco', emotion: 'fragilidad' },
    { type: 'leaf', emoji: '🍂', name: 'Hoja seca', emotion: 'tiempo' },
    { type: 'thread', emoji: '🧵', name: 'Hilo rojo', emotion: 'destino' },
    { type: 'photo', emoji: '📷', name: 'Fotografía', emotion: 'memoria' }
  ];

  const POEMS = {
    nostalgia: ['En páginas amarillas', 'vive el eco del ayer'],
    viaje: ['Cada sello es un puente', 'entre mundos que soñé'],
    azar: ['Los números danzan', 'en la ruleta del ser'],
    conexión: ['Alambres invisibles', 'tejen el entender'],
    fragilidad: ['Pétalos que caen', 'belleza al atardecer'],
    tiempo: ['Hojas que susurran', 'historias por nacer'],
    destino: ['Un hilo rojo me guía', 'hacia donde debo ser'],
    memoria: ['En cada foto un fantasma', 'que no quiero perder']
  };

  let state = {
    canvas: [],
    palette: [],
    artworks: [],
    selectedElement: null,
    emotions: {}
  };

  async function init() {
    const container = document.getElementById('collage-container');
    if (!container) return;

    await loadArtworks();
    createUI(container);
  }

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.filter(a => a.id).slice(0, 10);
    } catch (e) {}
  }

  function createUI(container) {
    state.canvas = [];
    state.emotions = {};
    const randomArt = state.artworks[Math.floor(Math.random() * state.artworks.length)];

    container.innerHTML = `
      <div class="collage-workspace">
        <div class="collage-base">
          <div class="collage-portrait" id="collage-portrait">
            <img src="images/artworks/${randomArt?.id || 'default'}.webp" alt="Base" class="collage-base-img">
            <div class="collage-layers" id="collage-layers"></div>
          </div>
        </div>
        
        <div class="collage-palette" id="collage-palette">
          <h4>Materiales Alquímicos</h4>
          <div class="collage-elements">
            ${ELEMENTS.map(el => `
              <div class="collage-element" data-type="${el.type}" data-emotion="${el.emotion}" draggable="true">
                <span class="collage-element__icon">${el.emoji}</span>
                <span class="collage-element__name">${el.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="collage-poem" id="collage-poem"></div>
      
      <div class="collage-controls">
        <button class="game-btn" id="collage-clear">🗑️ Limpiar</button>
        <button class="game-btn" id="collage-reveal">✨ Revelar poema</button>
        <button class="game-btn" id="collage-new">🔄 Nueva base</button>
      </div>
    `;

    attachEvents(container);
  }

  function attachEvents(container) {
    const portrait = document.getElementById('collage-portrait');
    const layers = document.getElementById('collage-layers');

    // Drag from palette
    // Universal 'Select' handler (Touch & Click)
    container.querySelectorAll('.collage-element').forEach(el => {
      const selectHandler = (e) => {
        // e.preventDefault(); // Don't prevent default, might block scrolling palette
        state.selectedElement = {
          type: el.dataset.type,
          emotion: el.dataset.emotion,
          emoji: el.querySelector('.collage-element__icon').textContent
        };
        container.querySelectorAll('.collage-element').forEach(item => item.classList.remove('selected'));
        el.classList.add('selected');
        
        // Vibration feedback on mobile
        if (navigator.vibrate) navigator.vibrate(20);
      };

      el.addEventListener('click', selectHandler);
      el.addEventListener('touchstart', selectHandler, { passive: true });
    });

    // Drop on canvas
    portrait.addEventListener('dragover', (e) => e.preventDefault());
    portrait.addEventListener('drop', (e) => {
      e.preventDefault();
      if (state.selectedElement) {
        addElement(e.offsetX, e.offsetY);
      }
    });

    // Click to place
    portrait.addEventListener('click', (e) => {
      if (state.selectedElement && e.target === portrait || e.target.classList.contains('collage-base-img')) {
        addElement(e.offsetX, e.offsetY);
      }
    });

    // Controls
    document.getElementById('collage-clear')?.addEventListener('click', () => {
      layers.innerHTML = '';
      state.canvas = [];
      state.emotions = {};
      document.getElementById('collage-poem').innerHTML = '';
    });

    document.getElementById('collage-reveal')?.addEventListener('click', revealPoem);

    document.getElementById('collage-new')?.addEventListener('click', () => {
      createUI(container);
    });
  }

  function addElement(x, y) {
    if (!state.selectedElement) return;

    const layers = document.getElementById('collage-layers');
    const el = document.createElement('div');
    el.className = 'collage-placed';
    el.textContent = state.selectedElement.emoji;
    el.style.cssText = `
      position: absolute;
      left: ${x - 15}px;
      top: ${y - 15}px;
      font-size: 2rem;
      cursor: move;
      transition: transform 0.2s;
      animation: collage-drop 0.3s ease-out;
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      el.remove();
    });

    layers.appendChild(el);
    state.canvas.push({ ...state.selectedElement, x, y });
    
    // Track emotions
    state.emotions[state.selectedElement.emotion] = 
      (state.emotions[state.selectedElement.emotion] || 0) + 1;
    
    // Visual feedback
    el.animate([
      { transform: 'scale(1.5)', opacity: 0.5 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 300 });
  }

  function revealPoem() {
    const poemEl = document.getElementById('collage-poem');
    if (state.canvas.length === 0) {
      poemEl.innerHTML = '<p class="poem-empty">Añade elementos al collage para revelar tu poema</p>';
      return;
    }

    // Find dominant emotion
    const sorted = Object.entries(state.emotions).sort((a, b) => b[1] - a[1]);
    const lines = [];

    sorted.slice(0, 3).forEach(([emotion]) => {
      const poem = POEMS[emotion];
      if (poem) {
        lines.push(poem[0], poem[1]);
      }
    });

    poemEl.innerHTML = `
      <div class="poem-reveal">
        <h4>✨ Tu Poema Alquímico ✨</h4>
        <div class="poem-lines">
          ${lines.map(line => `<p class="poem-line">${line}</p>`).join('')}
        </div>
        <p class="poem-signature">— Generado por tu Collage —</p>
      </div>
    `;

    // Animate reveal
    poemEl.querySelectorAll('.poem-line').forEach((line, i) => {
      line.style.animationDelay = `${i * 0.3}s`;
    });
  }

  window.CollageGame = { init };
})();
