/**
 * Simon Says Game - Naroa 2026
 * @description Memory sequence with artworks
 */
(function() {
  'use strict';

  let state = { sequence: [], playerSeq: [], level: 1, artworks: [], playing: false };

  async function init() {
    const container = document.getElementById('simon-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.slice(0, 4);
    } catch (e) {}

    container.innerHTML = `
      <div class="simon-header">
        <span>Nivel: <strong id="simon-level">1</strong></span>
        <button class="game-btn" id="simon-start">▶ Jugar</button>
      </div>
      <div class="simon-grid" id="simon-grid">
        ${state.artworks.map((art, i) => `
          <div class="simon-btn" data-index="${i}" style="background-image: url(images/artworks/${art.id}.webp)">
            <span class="simon-overlay"></span>
          </div>
        `).join('')}
      </div>
      <p id="simon-status">Pulsa Jugar para empezar</p>
      <div id="simon-ranking"></div>
    `;

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('simon', 'simon-ranking');
    }

    document.getElementById('simon-start')?.addEventListener('click', startGame);
    document.querySelectorAll('.simon-btn').forEach(btn => {
      btn.addEventListener('click', () => playerClick(parseInt(btn.dataset.index)));
    });
  }

  function startGame() {
    state.sequence = [];
    state.level = 1;
    state.playing = true;
    document.getElementById('simon-level').textContent = 1;
    nextRound();
  }

  function nextRound() {
    state.playerSeq = [];
    state.sequence.push(Math.floor(Math.random() * 4));
    document.getElementById('simon-status').textContent = 'Observa...';
    
    setTimeout(() => playSequence(), 500);
  }

  async function playSequence() {
    for (const idx of state.sequence) {
      await flash(idx);
      await sleep(300);
    }
    document.getElementById('simon-status').textContent = '¡Tu turno!';
  }

  function flash(idx) {
    return new Promise(resolve => {
      const btn = document.querySelector(`[data-index="${idx}"]`);
      btn?.classList.add('active');
      setTimeout(() => {
        btn?.classList.remove('active');
        resolve();
      }, 400);
    });
  }

  function playerClick(idx) {
    if (!state.playing) return;
    
    flash(idx);
    state.playerSeq.push(idx);

    const current = state.playerSeq.length - 1;
    if (state.playerSeq[current] !== state.sequence[current]) {
      document.getElementById('simon-status').innerHTML = `❌ Game Over - Nivel ${state.level}`;
      state.playing = false;
      
      if (window.RankingSystem) {
        // Score: level * 100
        const score = state.level * 100;
        window.RankingSystem.showSubmitModal('simon', score, () => {
          window.RankingSystem.renderLeaderboard('simon', 'simon-ranking');
        });
      }
      return;
    }

    if (state.playerSeq.length === state.sequence.length) {
      state.level++;
      document.getElementById('simon-level').textContent = state.level;
      document.getElementById('simon-status').textContent = '✅ ¡Correcto!';
      setTimeout(nextRound, 1000);
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  window.SimonGame = { init };
})();
