/**
 * Typing Art - Naroa 2026
 * Agent A20: Keystroke particle burst, combo fire streak, word shatter on complete
 */
(function() {
  'use strict';

  const WORDS = [
    'acuarela', 'óleo', 'lienzo', 'pincel', 'paleta', 'grabado', 'escultura',
    'perspectiva', 'claroscuro', 'impresionismo', 'surrealismo', 'abstracto',
    'autorretrato', 'bodegón', 'fresco', 'mural', 'collage', 'gouache',
    'pigmento', 'composición', 'textura', 'contorno', 'matiz', 'tonalidad',
    'barroco', 'renacentista', 'expresionismo', 'cubismo', 'dadaísmo'
  ];

  let state = { words: [], currentWord: '', typed: '', score: 0, combo: 0, timeLeft: 60, timer: null, running: false };

  function init() {
    const container = document.getElementById('typing-container');
    if (!container) return;

    container.innerHTML = `
      <div class="typing-ui">
        <div class="typing-stats">
          <span>⏱️ <strong id="typing-time">60</strong>s</span>
          <span>Puntos: <strong id="typing-score" style="color:#ccff00">0</strong></span>
          <span>🔥 <strong id="typing-combo">x0</strong></span>
        </div>
        <div id="typing-word" style="font-size:2.5rem;text-align:center;font-family:monospace;letter-spacing:4px;min-height:60px;color:#fff;padding:20px"></div>
        <input type="text" id="typing-input" class="typing-input" placeholder="Escribe aquí..." autocomplete="off" autocapitalize="off" style="font-size:1.5rem;text-align:center;background:rgba(255,255,255,0.05);border:2px solid rgba(204,255,0,0.3);border-radius:8px;color:#fff;padding:12px;width:80%;display:block;margin:10px auto;outline:none" />
        <button class="game-btn" id="typing-start">⌨️ Empezar</button>
        <div id="typing-ranking"></div>
      </div>
    `;

    document.getElementById('typing-start').addEventListener('click', startGame);
    document.getElementById('typing-input').addEventListener('input', handleType);

    if (window.RankingSystem) window.RankingSystem.renderLeaderboard('typing', 'typing-ranking');
  }

  function startGame() {
    state.score = 0;
    state.combo = 0;
    state.timeLeft = 60;
    state.running = true;
    state.words = shuffle([...WORDS]);
    nextWord();

    document.getElementById('typing-start').style.display = 'none';
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').focus();
    document.getElementById('typing-score').textContent = '0';
    document.getElementById('typing-combo').textContent = 'x0';

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.timeLeft--;
      document.getElementById('typing-time').textContent = state.timeLeft;
      if (state.timeLeft <= 0) endGame();
    }, 1000);
  }

  function shuffle(a) { for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function nextWord() {
    if (state.words.length === 0) state.words = shuffle([...WORDS]);
    state.currentWord = state.words.pop();
    state.typed = '';
    renderWord();
  }

  function handleType(e) {
    if (!state.running) return;
    const val = e.target.value.toLowerCase();
    state.typed = val;

    if (val === state.currentWord) {
      // Word complete!
      state.combo++;
      const points = state.currentWord.length * 10 * (1 + Math.floor(state.combo / 3));
      state.score += points;
      document.getElementById('typing-score').textContent = state.score;
      document.getElementById('typing-combo').textContent = `x${state.combo}`;
      if (window.GameEffects) {
        GameEffects.scorePopAnimation(document.getElementById('typing-score'), `+${points}`);
        GameEffects.hapticFeedback();
        if (state.combo >= 5) GameEffects.confettiBurst(document.getElementById('typing-word'));
      }
      e.target.value = '';
      nextWord();
    } else {
      renderWord();
    }
  }

  function renderWord() {
    const el = document.getElementById('typing-word');
    if (!el) return;
    let html = '';
    for (let i = 0; i < state.currentWord.length; i++) {
      const ch = state.currentWord[i];
      if (i < state.typed.length) {
        if (state.typed[i] === ch) {
          html += `<span style="color:#ccff00">${ch}</span>`;
        } else {
          html += `<span style="color:#ff003c;text-decoration:underline">${ch}</span>`;
        }
      } else {
        html += `<span style="color:rgba(255,255,255,0.3)">${ch}</span>`;
      }
    }
    el.innerHTML = html;
  }

  function endGame() {
    state.running = false;
    clearInterval(state.timer);
    document.getElementById('typing-start').style.display = 'inline-block';
    document.getElementById('typing-input').blur();

    if (window.RankingSystem) {
      window.RankingSystem.showSubmitModal('typing', state.score, () => {
        window.RankingSystem.renderLeaderboard('typing', 'typing-ranking');
      });
    }
  }

  window.TypingGame = { init };
})();
