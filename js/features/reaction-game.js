/**
 * REACTION TEST - Test reflex speed with artworks
 * Features persistent ranking (lower time = higher score)
 */

(function() {
  'use strict';

  let gameState = {
    phase: 'wait', // wait, ready, go, result
    startTime: 0,
    reactionTime: 0,
    attempts: 0,
    bestTime: Infinity,
    timeoutId: null,
    artworks: [],
    currentArt: null
  };

  const CONTAINER_ID = 'reaction-container';

  async function loadArtworks() {
    try {
      const response = await fetch('data/intro-artworks.json');
      const data = await response.json();
      gameState.artworks = data.artworks;
    } catch (e) {
      console.log('Reaction: no artworks');
    }
  }

  function getRandomArtwork() {
    if (gameState.artworks.length === 0) return null;
    return gameState.artworks[Math.floor(Math.random() * gameState.artworks.length)];
  }

  function initGame() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <div class="reaction-game">
        <div class="reaction-zone" id="reaction-zone">
          <div class="reaction-content" id="reaction-content">
            <h3>⚡ Test de Reflejos</h3>
            <p>Haz clic cuando aparezca la obra</p>
            <button class="game-btn" id="reaction-start">Empezar</button>
          </div>
        </div>
        <div class="reaction-stats">
          <div class="reaction-stat">
            <span class="reaction-label">Mejor tiempo</span>
            <span class="reaction-value" id="reaction-best">--</span>
          </div>
          <div class="reaction-stat">
            <span class="reaction-label">Intentos</span>
            <span class="reaction-value" id="reaction-attempts">0</span>
          </div>
        </div>
        <div id="reaction-ranking"></div>
      </div>
    `;

    const zone = document.getElementById('reaction-zone');
    
    document.getElementById('reaction-start').addEventListener('click', startRound);
    document.getElementById('reaction-start').addEventListener('click', startRound);
    zone.addEventListener('click', handleClick);
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent double triggering (touch + click)
      handleClick(e);
    }, { passive: false });

    loadArtworks();
    
    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('reaction', 'reaction-ranking');
    }
  }

  function startRound() {
    const zone = document.getElementById('reaction-zone');
    const content = document.getElementById('reaction-content');
    
    gameState.phase = 'ready';
    zone.className = 'reaction-zone reaction-ready';
    content.innerHTML = '<h3>⏳ Espera...</h3>';

    // Random delay 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    gameState.timeoutId = setTimeout(() => {
      gameState.phase = 'go';
      gameState.startTime = performance.now();
      gameState.currentArt = getRandomArtwork();
      
      zone.className = 'reaction-zone reaction-go';
      
      if (gameState.currentArt) {
        content.innerHTML = `
          <img src="img/artworks-intro/${gameState.currentArt.file}" 
               alt="${gameState.currentArt.subject || 'Artwork'}"
               class="reaction-artwork">
          <h3>¡AHORA!</h3>
        `;
      } else {
        content.innerHTML = '<h3 class="reaction-now">¡CLICK!</h3>';
      }
    }, delay);
  }

  function handleClick(e) {
    // Ignore clicks on start button
    if (e.target.id === 'reaction-start') return;

    const zone = document.getElementById('reaction-zone');
    const content = document.getElementById('reaction-content');

    if (gameState.phase === 'ready') {
      // Clicked too early!
      clearTimeout(gameState.timeoutId);
      gameState.phase = 'wait';
      zone.className = 'reaction-zone reaction-early';
      content.innerHTML = `
        <h3>❌ ¡Demasiado pronto!</h3>
        <p>Espera a que aparezca la imagen</p>
        <button class="game-btn" id="reaction-retry">Reintentar</button>
      `;
      document.getElementById('reaction-retry').addEventListener('click', startRound);
    }
    else if (gameState.phase === 'go') {
      // Good click!
      const reactionTime = performance.now() - gameState.startTime;
      gameState.reactionTime = reactionTime;
      gameState.attempts++;
      
      if (reactionTime < gameState.bestTime) {
        gameState.bestTime = reactionTime;
      }

      gameState.phase = 'result';
      zone.className = 'reaction-zone reaction-result';
      
      const rating = reactionTime < 200 ? '🚀 INCREÍBLE' :
                     reactionTime < 300 ? '⚡ Excelente' :
                     reactionTime < 400 ? '👍 Bien' :
                     reactionTime < 500 ? '😊 Normal' : '🐢 Lento';

      content.innerHTML = `
        <div class="reaction-time">${Math.round(reactionTime)}<span>ms</span></div>
        <p class="reaction-rating">${rating}</p>
        <div class="reaction-buttons">
          <button class="game-btn" id="reaction-again">Otra vez</button>
          <button class="game-btn game-btn--secondary" id="reaction-save">Guardar</button>
        </div>
      `;

      document.getElementById('reaction-again').addEventListener('click', startRound);
      document.getElementById('reaction-save').addEventListener('click', () => saveScore(reactionTime));

      // Update stats
      document.getElementById('reaction-best').textContent = Math.round(gameState.bestTime) + 'ms';
      document.getElementById('reaction-attempts').textContent = gameState.attempts;
    }
  }

  function saveScore(reactionTime) {
    if (!window.RankingSystem) return;
    
    // Convert reaction time to score (faster = higher)
    // Formula: max 10000 - time (capped)
    const score = Math.max(0, Math.round(10000 - reactionTime * 10));
    
    window.RankingSystem.showSubmitModal('reaction', score, () => {
      window.RankingSystem.renderLeaderboard('reaction', 'reaction-ranking');
    });
  }

  // Export
  window.ReactionGame = { init: initGame };
})();
