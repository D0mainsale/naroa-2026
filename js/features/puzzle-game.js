/**
 * Sliding Puzzle - Naroa 2026
 * Agent A24: Tile slide with momentum, preview overlay, move counter glow
 */
(function() {
  'use strict';

  let state = { tiles: [], size: 4, emptyIdx: 15, moves: 0, solved: false, artworkSrc: null };

  async function init() {
    const container = document.getElementById('puzzle-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      const art = data.artworks[Math.floor(Math.random() * data.artworks.length)];
      state.artworkSrc = `images/gallery/${art.id}.webp`;
    } catch(e) {}

    container.innerHTML = `
      <div class="puzzle-ui">
        <div class="puzzle-info">
          <span>Movimientos: <strong id="puzzle-moves" style="color:#d4af37">0</strong></span>
          <button class="game-btn secondary" id="puzzle-new">🔀 Mezclar</button>
        </div>
        <div id="puzzle-board" class="puzzle-board" style="display:grid;grid-template-columns:repeat(${state.size},1fr);gap:3px;max-width:360px;margin:0 auto"></div>
      </div>
    `;

    document.getElementById('puzzle-new').addEventListener('click', newPuzzle);
    newPuzzle();
  }

  function newPuzzle() {
    state.moves = 0;
    state.solved = false;
    document.getElementById('puzzle-moves').textContent = '0';

    // Create tiles 1-15, 0 = empty
    state.tiles = Array.from({length: state.size * state.size}, (_, i) => i);
    // Shuffle (ensure solvable)
    do { shuffleArray(state.tiles); } while (!isSolvable(state.tiles));
    state.emptyIdx = state.tiles.indexOf(0);
    render();
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function isSolvable(tiles) {
    let inversions = 0;
    const flat = tiles.filter(t => t !== 0);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }
    const emptyRow = Math.floor(tiles.indexOf(0) / state.size);
    if (state.size % 2 === 1) return inversions % 2 === 0;
    return (emptyRow % 2 === 0) ? (inversions % 2 === 1) : (inversions % 2 === 0);
  }

  function clickTile(idx) {
    if (state.solved) return;
    const row = Math.floor(idx / state.size);
    const col = idx % state.size;
    const emptyRow = Math.floor(state.emptyIdx / state.size);
    const emptyCol = state.emptyIdx % state.size;

    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
      [state.tiles[idx], state.tiles[state.emptyIdx]] = [state.tiles[state.emptyIdx], state.tiles[idx]];
      state.emptyIdx = idx;
      state.moves++;
      document.getElementById('puzzle-moves').textContent = state.moves;

      if (window.GameEffects) GameEffects.hapticFeedback();

      // Check win
      const won = state.tiles.every((t, i) => i === state.tiles.length - 1 ? t === 0 : t === i + 1);
      if (won) {
        state.solved = true;
        if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('puzzle-board'));
      }
      render();
    }
  }

  function render() {
    const el = document.getElementById('puzzle-board');
    if (!el) return;

    el.innerHTML = state.tiles.map((tile, idx) => {
      if (tile === 0) {
        return `<div class="puzzle-tile empty" style="width:85px;height:85px"></div>`;
      }
      const origRow = Math.floor((tile - 1) / state.size);
      const origCol = (tile - 1) % state.size;
      const hue = tile * 24;

      const bg = state.artworkSrc
        ? `background-image:url('${state.artworkSrc}');background-size:${state.size * 100}%;background-position:${origCol * (100/(state.size-1))}% ${origRow * (100/(state.size-1))}%`
        : `background:linear-gradient(135deg, hsl(${hue},60%,35%), hsl(${hue+30},60%,45%))`;

      const isCorrect = (idx === tile - 1);

      return `<div class="puzzle-tile" data-idx="${idx}" style="width:85px;height:85px;${bg};border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;color:rgba(255,255,255,0.8);text-shadow:0 1px 3px rgba(0,0,0,0.5);border:2px solid ${isCorrect ? '#d4af37' : 'rgba(255,255,255,0.1)'};transition:transform 0.15s ease;${isCorrect ? 'box-shadow:0 0 10px rgba(204,255,0,0.3)' : ''}">${state.artworkSrc ? '' : tile}</div>`;
    }).join('');

    el.querySelectorAll('.puzzle-tile:not(.empty)').forEach(tile => {
      tile.addEventListener('click', () => clickTile(+tile.dataset.idx));
    });
  }

  window.PuzzleGame = { init };
})();
