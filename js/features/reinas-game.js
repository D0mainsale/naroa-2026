/**
 * Repóker de Reinas - Naroa 2026
 * @description Trivia game about powerful women from Naroa's "Repóker de Reinas" series
 */
(function() {
  'use strict';

  const REINAS = [
    { name: 'Frida Kahlo', pista: 'Pintora mexicana, cejas icónicas', detalle: 'Flores en el pelo' },
    { name: 'Virginia Woolf', pista: 'Escritora británica, modernismo', detalle: 'Mirada penetrante' },
    { name: 'Marie Curie', pista: 'Dos premios Nobel, radiactividad', detalle: 'Luz emanando' },
    { name: 'Simone de Beauvoir', pista: 'Existencialismo, feminismo', detalle: 'Turbante distintivo' },
    { name: 'Coco Chanel', pista: 'Alta costura francesa', detalle: 'Collar de perlas' },
    { name: 'Billie Holiday', pista: 'Jazz, voz única', detalle: 'Gardenia blanca' },
    { name: 'Rosa Parks', pista: 'Derechos civiles, autobús', detalle: 'Dignidad en la mirada' },
    { name: 'Amelia Earhart', pista: 'Aviadora pionera', detalle: 'Gorro de vuelo' }
  ];

  let state = {
    current: 0,
    score: 0,
    revealed: 0,
    artworks: [],
    queens: []
  };

  async function init() {
    const container = document.getElementById('reinas-container');
    if (!container) return;

    await loadArtworks();
    startGame(container);
  }

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.filter(a => a.id).slice(0, 8);
    } catch (e) {}
  }

  function startGame(container) {
    state.current = 0;
    state.score = 0;
    state.queens = [...REINAS].sort(() => Math.random() - 0.5).slice(0, 5);

    showQuestion(container);
  }

  function showQuestion(container) {
    if (state.current >= state.queens.length) {
      showResults(container);
      return;
    }

    const queen = state.queens[state.current];
    const art = state.artworks[state.current % state.artworks.length];
    state.revealed = 0;

    // Generate wrong options
    const options = [queen.name];
    while (options.length < 4) {
      const wrong = REINAS[Math.floor(Math.random() * REINAS.length)].name;
      if (!options.includes(wrong)) options.push(wrong);
    }
    options.sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="reinas-header">
        <span>Pregunta ${state.current + 1}/${state.queens.length}</span>
        <span>Puntos: ${state.score}</span>
      </div>
      
      <div class="reinas-card">
        <div class="reinas-portrait" id="reinas-portrait">
          <img src="images/artworks/${art?.id || 'default'}.webp" alt="Reina misteriosa">
          <div class="reinas-cover" id="reinas-cover">
            <span>?</span>
          </div>
        </div>
        
        <p class="reinas-question">¿Quién es esta Reina?</p>
        
        <div class="reinas-hints">
          <button class="reinas-hint" id="hint-1" data-hint="${queen.pista}">💡 Pista 1</button>
          <button class="reinas-hint" id="hint-2" data-hint="${queen.detalle}">💡 Pista 2</button>
        </div>
        
        <div class="reinas-options">
          ${options.map(opt => `
            <button class="reinas-option" data-answer="${opt}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;

    // Hint buttons
    container.querySelectorAll('.reinas-hint').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.textContent = btn.dataset.hint;
        btn.disabled = true;
        state.revealed++;
        
        // Reveal part of portrait
        const cover = document.getElementById('reinas-cover');
        cover.style.clipPath = state.revealed === 1 
          ? 'polygon(30% 0, 100% 0, 100% 100%, 30% 100%)'
          : 'polygon(60% 0, 100% 0, 100% 100%, 60% 100%)';
      });
    });

    // Answer buttons
    container.querySelectorAll('.reinas-option').forEach(btn => {
      btn.addEventListener('click', () => checkAnswer(btn, queen.name, container));
    });
  }

  function checkAnswer(btn, correct, container) {
    const isCorrect = btn.dataset.answer === correct;
    
    container.querySelectorAll('.reinas-option').forEach(b => {
      b.disabled = true;
      if (b.dataset.answer === correct) b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
    });

    // Reveal full portrait
    const cover = document.getElementById('reinas-cover');
    cover.style.opacity = '0';

    if (isCorrect) {
      const points = Math.max(30 - state.revealed * 10, 10);
      state.score += points;
    }

    setTimeout(() => {
      state.current++;
      showQuestion(container);
    }, 2000);
  }

  function showResults(container) {
    const maxScore = state.queens.length * 30;
    const percent = Math.round((state.score / maxScore) * 100);
    
    let message = '';
    if (percent >= 80) message = '👑 ¡Eres una experta en Reinas! 👑';
    else if (percent >= 50) message = '💫 Buen conocimiento histórico';
    else message = '📚 ¡Sigue aprendiendo sobre mujeres poderosas!';

    container.innerHTML = `
      <div class="reinas-results">
        <h3>👑 Repóker Completado</h3>
        <p class="reinas-score">${state.score} puntos</p>
        <p class="reinas-message">${message}</p>
        <div id="reinas-ranking"></div>
        <button class="game-btn" id="reinas-restart">🔄 Jugar de nuevo</button>
      </div>
    `;

    document.getElementById('reinas-restart')?.addEventListener('click', () => startGame(container));

    if (window.RankingSystem) {
      window.RankingSystem.showSubmitModal('reinas', state.score, () => {
        window.RankingSystem.renderLeaderboard('reinas', 'reinas-ranking');
      });
    }
  }

  window.ReinasGame = { init };
})();
