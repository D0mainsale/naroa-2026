/**
 * TYPING ARTÍSTICO - Type artwork names quickly
 * Features persistent ranking
 */

(function() {
  'use strict';

  let gameState = {
    artworks: [],
    currentWord: '',
    typed: '',
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 60,
    running: false,
    timerId: null
  };

  const CONTAINER_ID = 'typing-container';

  // Art-related words to type
  const WORDS = [
    'COLLAGE', 'RETRATO', 'MARILYN', 'JOHNNY', 'AMY', 'JAMES',
    'PINTURA', 'ARTE', 'MICA', 'KINTSUGI', 'DIVINO', 'ROCK',
    'BILBAO', 'NAROA', 'VINTAGE', 'POEMA', 'ORO', 'ALMA',
    'REINA', 'ESTRELLA', 'LOTERIA', 'PAPEL', 'SELLO', 'TIEMPO',
    'COLOR', 'TEXTURA', 'DORADO', 'PLATA', 'AZUL', 'ROJO'
  ];

  function getRandomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function initGame() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.innerHTML = `
      <div class="typing-game">
        <div class="typing-header">
          <div class="typing-stat">
            <span class="typing-label">Tiempo</span>
            <span class="typing-value" id="typing-time">60</span>
          </div>
          <div class="typing-stat">
            <span class="typing-label">Puntos</span>
            <span class="typing-value" id="typing-score">0</span>
          </div>
          <div class="typing-stat">
            <span class="typing-label">Combo</span>
            <span class="typing-value" id="typing-combo">x0</span>
          </div>
        </div>
        <div class="typing-area">
          <div class="typing-word" id="typing-word">ARTE</div>
          <div class="typing-input-wrap">
            <input type="text" 
                   id="typing-input" 
                   class="typing-input" 
                   placeholder="Escribe aquí..."
                   autocomplete="off"
                   autocapitalize="characters"
                   disabled>
          </div>
        </div>
        <button class="game-btn" id="typing-start">🎮 Empezar</button>
        <div id="typing-ranking"></div>
      </div>
    `;

    document.getElementById('typing-start').addEventListener('click', startGame);
    document.getElementById('typing-input').addEventListener('input', handleInput);
    document.getElementById('typing-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkWord();
    });

    if (window.RankingSystem) {
      window.RankingSystem.renderLeaderboard('typing', 'typing-ranking');
    }
  }

  function startGame() {
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.timeLeft = 60;
    gameState.running = true;
    gameState.typed = '';

    const input = document.getElementById('typing-input');
    const startBtn = document.getElementById('typing-start');
    
    input.disabled = false;
    input.value = '';
    input.focus();
    // Mobile optimization: ensure game area is visible above keyboard
    setTimeout(() => {
      document.getElementById(CONTAINER_ID).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    startBtn.style.display = 'none';

    nextWord();
    updateDisplay();

    gameState.timerId = setInterval(() => {
      gameState.timeLeft--;
      document.getElementById('typing-time').textContent = gameState.timeLeft;
      
      if (gameState.timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    gameState.running = false;
    clearInterval(gameState.timerId);

    const input = document.getElementById('typing-input');
    const startBtn = document.getElementById('typing-start');
    
    input.disabled = true;
    startBtn.style.display = 'inline-block';
    startBtn.textContent = '🔄 Jugar de nuevo';

    if (window.RankingSystem) {
      window.RankingSystem.showSubmitModal('typing', gameState.score, () => {
        window.RankingSystem.renderLeaderboard('typing', 'typing-ranking');
      });
    }
  }

  function nextWord() {
    gameState.currentWord = getRandomWord();
    gameState.typed = '';
    document.getElementById('typing-word').textContent = gameState.currentWord;
    document.getElementById('typing-input').value = '';
  }

  function handleInput(e) {
    if (!gameState.running) return;
    
    gameState.typed = e.target.value.toUpperCase();
    
    // Check if matches
    if (gameState.typed === gameState.currentWord) {
      // Correct!
      gameState.combo++;
      gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
      
      // Score: word length * combo multiplier
      const points = gameState.currentWord.length * (1 + gameState.combo * 0.5);
      gameState.score += Math.floor(points);
      
      // Visual feedback
      const wordEl = document.getElementById('typing-word');
      wordEl.classList.add('typing-correct');
      setTimeout(() => wordEl.classList.remove('typing-correct'), 200);
      
      nextWord();
      updateDisplay();
    }
    
    // Check for mistakes
    if (!gameState.currentWord.startsWith(gameState.typed)) {
      // Reset combo on mistake
      gameState.combo = 0;
      document.getElementById('typing-combo').textContent = 'x0';
      document.getElementById('typing-input').classList.add('typing-error');
      setTimeout(() => {
        document.getElementById('typing-input').classList.remove('typing-error');
      }, 200);
    }
  }

  function checkWord() {
    // Enter pressed - handled by input event
  }

  function updateDisplay() {
    document.getElementById('typing-score').textContent = gameState.score;
    document.getElementById('typing-combo').textContent = `x${gameState.combo}`;
  }

  // Export
  window.TypingGame = { init: initGame };
})();
