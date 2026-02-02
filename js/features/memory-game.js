/**
 * Memory Game - Naroa 2026
 * @description Match pairs of artworks
 */
(function() {
  'use strict';

  const CONFIG = {
    pairs: 8,
    flipTime: 600
  };

  let state = {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    artworks: [],
    locked: false
  };

  async function init() {
    const container = document.getElementById('memory-container');
    if (!container) return;

    await loadArtworks();
    createBoard(container);
  }

  async function loadArtworks() {
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      state.artworks = data.artworks.slice(0, CONFIG.pairs);
    } catch (e) {
      console.error('[Memory] Error:', e);
    }
  }

  function createBoard(container) {
    state.cards = [];
    state.flipped = [];
    state.matched = 0;
    state.moves = 0;
    state.locked = false;

    // Create pairs
    const cardData = [...state.artworks, ...state.artworks]
      .map((art, i) => ({ ...art, uid: i }))
      .sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="memory-stats">
        <span>Movimientos: <strong id="memory-moves">0</strong></span>
        <span>Parejas: <strong id="memory-matched">0</strong>/${CONFIG.pairs}</span>
      </div>
      <div class="memory-grid">
        ${cardData.map((art, i) => `
          <div class="memory-card" data-index="${i}" data-id="${art.id}">
            <div class="memory-card__inner">
              <div class="memory-card__front">🎨</div>
              <div class="memory-card__back">
                <img src="images/artworks/${art.id}.webp" alt="${art.title}" loading="lazy">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="memory-ranking"></div>
      <button class="game-btn" id="memory-restart">🔄 Reiniciar</button>
    `;

    state.cards = cardData;
    attachEvents(container);
  }

  function attachEvents(container) {
    container.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => flipCard(card));
    });
    document.getElementById('memory-restart')?.addEventListener('click', () => createBoard(container));
  }

  function flipCard(card) {
    if (state.locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    state.flipped.push(card);

    if (state.flipped.length === 2) {
      state.moves++;
      document.getElementById('memory-moves').textContent = state.moves;
      checkMatch();
    }
  }

  function checkMatch() {
    state.locked = true;
    const [c1, c2] = state.flipped;
    const match = c1.dataset.id === c2.dataset.id;

    if (match) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      state.matched++;
      document.getElementById('memory-matched').textContent = state.matched;
      state.flipped = [];
      state.locked = false;

      if (state.matched === CONFIG.pairs) {
        setTimeout(() => {
          if (window.RankingSystem) {
            // Score idea: 1000 - (moves * 10)
            const score = Math.max(0, 1000 - (state.moves * 10));
            window.RankingSystem.showSubmitModal('memory', score, () => {
              window.RankingSystem.renderLeaderboard('memory', 'memory-ranking');
            });
          } else {
            alert(`🎉 ¡Victoria en ${state.moves} movimientos!`);
          }
        }, 300);
      }
    } else {
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        state.flipped = [];
        state.locked = false;
      }, CONFIG.flipTime);
    }
  }

  window.MemoryGame = { init };
})();
