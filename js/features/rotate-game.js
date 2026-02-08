/**
 * Rotate Puzzle - Naroa 2026
 * Agent A23: Rotation ring animation, completion burst, timer pulse
 */
(function() {
  'use strict';

  let state = { pieces: [], size: 3, moves: 0, timeStart: 0, timer: null, solved: false, artworkSrc: null };

  async function init() {
    const container = document.getElementById('rotate-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      const art = data.artworks[Math.floor(Math.random() * data.artworks.length)];
      state.artworkSrc = `images/gallery/${art.id}.webp`;
    } catch (e) {
      state.artworkSrc = null;
    }

    container.innerHTML = `
      <div class="rotate-ui">
        <div class="rotate-info">
          <span>Movimientos: <strong id="rotate-moves">0</strong></span>
          <span>⏱️ <strong id="rotate-time">0:00</strong></span>
        </div>
        <div id="rotate-board" class="rotate-board" style="display:grid;grid-template-columns:repeat(${state.size},1fr);gap:3px;max-width:360px;margin:0 auto"></div>
        <button class="game-btn" id="rotate-new">🔄 Nuevo Puzzle</button>
      </div>
    `;

    document.getElementById('rotate-new').addEventListener('click', newPuzzle);
    newPuzzle();
  }

  function newPuzzle() {
    state.moves = 0;
    state.solved = false;
    state.pieces = [];

    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        state.pieces.push({ r, c, rotation, correct: rotation === 0 });
      }
    }

    // Start timer
    state.timeStart = Date.now();
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(updateTimer, 1000);

    render();
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - state.timeStart) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    const el = document.getElementById('rotate-time');
    if (el) el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }

  function rotatePiece(idx) {
    if (state.solved) return;
    state.pieces[idx].rotation = (state.pieces[idx].rotation + 90) % 360;
    state.pieces[idx].correct = state.pieces[idx].rotation === 0;
    state.moves++;
    document.getElementById('rotate-moves').textContent = state.moves;

    if (window.GameEffects) GameEffects.hapticFeedback();

    // Check win
    if (state.pieces.every(p => p.correct)) {
      state.solved = true;
      clearInterval(state.timer);
      if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('rotate-board'));
    }

    render();
  }

  function render() {
    const el = document.getElementById('rotate-board');
    if (!el) return;

    el.innerHTML = state.pieces.map((p, i) => {
      const hue = (p.r * state.size + p.c) * 40;
      const bg = state.artworkSrc
        ? `background-image:url('${state.artworkSrc}');background-size:${state.size * 100}%;background-position:${p.c * (100/(state.size-1))}% ${p.r * (100/(state.size-1))}%`
        : `background:linear-gradient(${p.r * 45}deg, hsl(${hue},70%,40%), hsl(${hue + 60},70%,50%))`;

      return `<div class="rotate-piece${p.correct ? ' correct' : ''}" data-idx="${i}" style="width:120px;height:120px;${bg};border-radius:8px;cursor:pointer;transform:rotate(${p.rotation}deg);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);border:2px solid ${p.correct ? '#ccff00' : 'rgba(255,255,255,0.1)'};${p.correct ? 'box-shadow:0 0 15px rgba(204,255,0,0.4)' : ''}"></div>`;
    }).join('');

    el.querySelectorAll('.rotate-piece').forEach(piece => {
      piece.addEventListener('click', () => rotatePiece(+piece.dataset.idx));
    });
  }

  window.RotateGame = { init };
})();
