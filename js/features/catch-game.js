/**
 * Catch Game - Naroa 2026
 * @description Catch falling artworks with a basket
 */
(function() {
  'use strict';

  const W = 400, H = 500;
  let state = { basket: null, items: [], score: 0, misses: 0, timer: null, artworks: [] };

  async function init() {
    const container = document.getElementById('catch-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.slice(0, 15);
    } catch (e) {}

    container.innerHTML = `
      <div class="catch-header">
        <span>Puntos: <strong id="catch-score">0</strong></span>
        <span>Fallos: <strong id="catch-misses">0</strong>/5</span>
        <button class="game-btn" id="catch-start">▶ Jugar</button>
      </div>
      <canvas id="catch-canvas" width="${W}" height="${H}"></canvas>
      <div id="catch-ranking"></div>
    `;

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('catch', 'catch-ranking');
    }

    document.getElementById('catch-start')?.addEventListener('click', startGame);
    document.addEventListener('mousemove', e => {
      const canvas = document.getElementById('catch-canvas');
      if (canvas && state.basket) {
        const rect = canvas.getBoundingClientRect();
        state.basket.x = Math.max(0, Math.min(W - 60, e.clientX - rect.left - 30));
      }
    });
  }

  function startGame() {
    state.basket = { x: W/2 - 30, y: H - 40, w: 60, h: 30 };
    state.items = [];
    state.score = 0;
    state.misses = 0;
    document.getElementById('catch-score').textContent = 0;
    document.getElementById('catch-misses').textContent = 0;

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(gameLoop, 30);
    spawnItem();
  }

  function spawnItem() {
    if (state.misses >= 5) return;
    
    state.items.push({
      x: Math.random() * (W - 40) + 20,
      y: -30,
      speed: 2 + Math.random() * 2,
      art: state.artworks[Math.floor(Math.random() * state.artworks.length)]
    });

    setTimeout(spawnItem, 1000 + Math.random() * 1000);
  }

  function gameLoop() {
    state.items.forEach(item => {
      item.y += item.speed;

      // Caught
      if (item.y + 20 >= state.basket.y && item.x >= state.basket.x && item.x <= state.basket.x + state.basket.w) {
        state.score += 10;
        document.getElementById('catch-score').textContent = state.score;
        item.caught = true;
      }

      // Missed
      if (item.y > H && !item.caught) {
        state.misses++;
        document.getElementById('catch-misses').textContent = state.misses;
        item.caught = true;

        if (state.misses >= 5) {
          clearInterval(state.timer);
          if (window.RankingSystem) {
            window.RankingSystem.showSubmitModal('catch', state.score, () => {
              window.RankingSystem.renderLeaderboard('catch', 'catch-ranking');
            });
          } else {
            alert(`Game Over - Puntos: ${state.score}`);
          }
        }
      }
    });

    state.items = state.items.filter(i => !i.caught);
    draw();
  }

  function draw() {
    const canvas = document.getElementById('catch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Items
    state.items.forEach(item => {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(item.x - 15, item.y - 15, 30, 30);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.fillText('🎨', item.x - 8, item.y + 5);
    });

    // Basket
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(state.basket.x, state.basket.y, state.basket.w, state.basket.h);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(state.basket.x + 5, state.basket.y + 5, state.basket.w - 10, 10);
  }

  window.CatchGame = { init };
})();
