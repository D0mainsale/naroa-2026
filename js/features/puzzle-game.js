/**
 * Puzzle Game - Naroa 2026
 * @description Sliding puzzle with artwork image
 */
(function() {
  'use strict';

  const SIZE = 4;
  let state = { tiles: [], empty: 15, moves: 0, artwork: null };

  async function init() {
    const container = document.getElementById('puzzle-container');
    if (!container) return;

    await loadArtwork();
    createPuzzle(container);
  }

  async function loadArtwork() {
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      const valid = data.artworks.filter(a => a.id);
      state.artwork = valid[Math.floor(Math.random() * valid.length)];
    } catch (e) {}
  }

  function createPuzzle(container) {
    state.tiles = [...Array(16).keys()];
    state.empty = 15;
    state.moves = 0;
    shuffle();

    const imgUrl = `images/artworks/${state.artwork?.id || 'default'}.webp`;
    
    container.innerHTML = `
      <div class="puzzle-info">
        <span>Movimientos: <strong id="puzzle-moves">0</strong></span>
        <span>${state.artwork?.title || 'Puzzle'}</span>
      </div>
      <div class="puzzle-grid" id="puzzle-grid"></div>
      <div id="puzzle-ranking"></div>
      <div class="puzzle-controls">
        <button class="game-btn" id="puzzle-shuffle">🔀 Mezclar</button>
        <button class="game-btn" id="puzzle-hint">👁 Ver imagen</button>
      </div>
    `;

    renderTiles(imgUrl);
    
    document.getElementById('puzzle-shuffle')?.addEventListener('click', () => {
      shuffle();
      state.moves = 0;
      document.getElementById('puzzle-moves').textContent = 0;
      renderTiles(imgUrl);
    });
    
    document.getElementById('puzzle-hint')?.addEventListener('click', () => {
      const grid = document.getElementById('puzzle-grid');
      grid.style.backgroundImage = `url(${imgUrl})`;
      setTimeout(() => grid.style.backgroundImage = '', 1500);
    });
  }

  function shuffle() {
    for (let i = 0; i < 200; i++) {
      const neighbors = getNeighbors(state.empty);
      const rand = neighbors[Math.floor(Math.random() * neighbors.length)];
      swap(rand, state.empty);
      state.empty = rand;
    }
  }

  function getNeighbors(pos) {
    const row = Math.floor(pos / SIZE), col = pos % SIZE;
    const n = [];
    if (row > 0) n.push(pos - SIZE);
    if (row < SIZE - 1) n.push(pos + SIZE);
    if (col > 0) n.push(pos - 1);
    if (col < SIZE - 1) n.push(pos + 1);
    return n;
  }

  function swap(a, b) {
    [state.tiles[a], state.tiles[b]] = [state.tiles[b], state.tiles[a]];
  }

  function renderTiles(imgUrl) {
    const grid = document.getElementById('puzzle-grid');
    if (!grid) return;

    grid.innerHTML = state.tiles.map((tile, i) => {
      if (tile === 15) return `<div class="puzzle-tile puzzle-tile--empty" data-pos="${i}"></div>`;
      const row = Math.floor(tile / SIZE), col = tile % SIZE;
      return `
        <div class="puzzle-tile" data-pos="${i}" data-tile="${tile}">
          <div style="background-image: url(${imgUrl}); background-position: ${-col * 75}px ${-row * 75}px;"></div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.puzzle-tile:not(.puzzle-tile--empty)').forEach(tile => {
      tile.addEventListener('click', () => moveTile(parseInt(tile.dataset.pos)));
    });
  }

  function moveTile(pos) {
    if (!getNeighbors(pos).includes(state.empty)) return;
    
    swap(pos, state.empty);
    state.empty = pos;
    state.moves++;
    document.getElementById('puzzle-moves').textContent = state.moves;
    renderTiles(`images/artworks/${state.artwork?.id || 'default'}.webp`);
    
    if (checkWin()) {
      setTimeout(() => {
        if (window.RankingSystem) {
          // Score: 1000 - moves
          const score = Math.max(0, 1000 - state.moves);
          window.RankingSystem.showSubmitModal('puzzle', score, () => {
            window.RankingSystem.renderLeaderboard('puzzle', 'puzzle-ranking');
          });
        } else {
          alert(`🎉 ¡Puzzle resuelto en ${state.moves} movimientos!`);
        }
      }, 300);
    }
  }

  function checkWin() {
    return state.tiles.every((t, i) => t === i);
  }

  window.PuzzleGame = { init };
})();
