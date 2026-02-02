/**
 * Whack-a-Mole Game - Naroa 2026
 * @description Click artworks as they appear
 */
(function() {
  'use strict';

  let state = { score: 0, timer: null, timeLeft: 30, artworks: [], holes: [] };

  async function init() {
    const container = document.getElementById('whack-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.slice(0, 20);
    } catch (e) {}

    container.innerHTML = `
      <div class="whack-header">
        <span>Puntos: <strong id="whack-score">0</strong></span>
        <span>Tiempo: <strong id="whack-time">30</strong>s</span>
        <button class="game-btn" id="whack-start">▶ Jugar</button>
      </div>
      <div class="whack-grid" id="whack-grid">
        ${[...Array(9)].map((_, i) => `
          <div class="whack-hole" data-hole="${i}">
            <div class="whack-mole"></div>
          </div>
        `).join('')}
      </div>
      <div id="whack-ranking"></div>
    `;

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('whack', 'whack-ranking');
    }

    document.getElementById('whack-start')?.addEventListener('click', startGame);
    document.querySelectorAll('.whack-hole').forEach(hole => {
      hole.addEventListener('click', () => whack(parseInt(hole.dataset.hole)));
    });
  }

  function startGame() {
    state.score = 0;
    state.timeLeft = 30;
    state.holes = Array(9).fill(null);
    document.getElementById('whack-score').textContent = 0;
    document.getElementById('whack-time').textContent = 30;

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(tick, 1000);
    spawnMole();
  }

  function tick() {
    state.timeLeft--;
    document.getElementById('whack-time').textContent = state.timeLeft;
    
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      if (window.RankingSystem) {
        window.RankingSystem.showSubmitModal('whack', state.score, () => {
          window.RankingSystem.renderLeaderboard('whack', 'whack-ranking');
        });
      } else {
        alert(`⏰ Tiempo! Puntos: ${state.score}`);
      }
    } else {
      if (Math.random() > 0.5) spawnMole();
    }
  }

  function spawnMole() {
    const emptyHoles = state.holes.map((h, i) => h === null ? i : -1).filter(i => i >= 0);
    if (emptyHoles.length === 0) return;

    const hole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
    const art = state.artworks[Math.floor(Math.random() * state.artworks.length)];
    state.holes[hole] = art;

    const el = document.querySelector(`[data-hole="${hole}"] .whack-mole`);
    if (el) {
      el.style.backgroundImage = `url(images/artworks/${art.id}.webp)`;
      el.classList.add('active');
    }

    setTimeout(() => hideMole(hole), 1500 + Math.random() * 1000);
  }

  function hideMole(hole) {
    state.holes[hole] = null;
    const el = document.querySelector(`[data-hole="${hole}"] .whack-mole`);
    if (el) el.classList.remove('active');
  }

  function whack(hole) {
    if (state.holes[hole]) {
      state.score += 10;
      document.getElementById('whack-score').textContent = state.score;
      hideMole(hole);
      spawnMole();
    }
  }

  window.WhackGame = { init };
})();
