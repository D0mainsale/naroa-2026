/**
 * Quiz Game - Naroa 2026
 * @description Guess the artwork title/series
 */
(function() {
  'use strict';

  let state = { questions: [], current: 0, score: 0, artworks: [] };

  async function init() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.filter(a => a.title && a.series);
    } catch (e) {}

    createQuiz(container);
  }

  function createQuiz(container) {
    state.questions = generateQuestions();
    state.current = 0;
    state.score = 0;

    container.innerHTML = `
      <div class="quiz-header">
        <span>Pregunta: <strong id="quiz-num">1</strong>/10</span>
        <span>Puntos: <strong id="quiz-score">0</strong></span>
      </div>
      <div class="quiz-card" id="quiz-card"></div>
      <button class="game-btn" id="quiz-restart" style="display:none">🔄 Reiniciar</button>
    `;

    document.getElementById('quiz-restart')?.addEventListener('click', () => createQuiz(container));
    showQuestion();
  }

  function generateQuestions() {
    const shuffled = [...state.artworks].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map(art => {
      const type = Math.random() > 0.5 ? 'title' : 'series';
      const options = getOptions(art, type);
      return { art, type, options, correct: type === 'title' ? art.title : art.series };
    });
  }

  function getOptions(correct, type) {
    const key = type === 'title' ? 'title' : 'series';
    const all = [...new Set(state.artworks.map(a => a[key]))].filter(x => x !== correct[key]);
    const wrong = all.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, correct[key]].sort(() => Math.random() - 0.5);
  }

  function showQuestion() {
    if (state.current >= state.questions.length) {
      endQuiz();
      return;
    }

    const q = state.questions[state.current];
    const card = document.getElementById('quiz-card');
    
    card.innerHTML = `
      <img src="images/artworks/${q.art.id}.webp" alt="Quiz" class="quiz-image">
      <p class="quiz-question">${q.type === 'title' ? '¿Cuál es el título?' : '¿A qué serie pertenece?'}</p>
      <div class="quiz-options">
        ${q.options.map(opt => `<button class="quiz-option">${opt}</button>`).join('')}
      </div>
    `;

    card.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => checkAnswer(btn.textContent, q.correct));
    });
  }

  function checkAnswer(selected, correct) {
    const isCorrect = selected === correct;
    if (isCorrect) {
      state.score += 10;
      document.getElementById('quiz-score').textContent = state.score;
    }

    const card = document.getElementById('quiz-card');
    card.querySelectorAll('.quiz-option').forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correct) btn.classList.add('correct');
      else if (btn.textContent === selected && !isCorrect) btn.classList.add('wrong');
    });

    setTimeout(() => {
      state.current++;
      document.getElementById('quiz-num').textContent = Math.min(state.current + 1, 10);
      showQuestion();
    }, 1500);
  }

  function endQuiz() {
    document.getElementById('quiz-card').innerHTML = `
      <h3>🎉 Quiz Completado</h3>
      <p>Puntuación: ${state.score}/100</p>
      <div id="quiz-ranking"></div>
    `;
    document.getElementById('quiz-restart').style.display = 'block';

    if (window.RankingSystem) {
      window.RankingSystem.showSubmitModal('quiz', state.score, () => {
        window.RankingSystem.renderLeaderboard('quiz', 'quiz-ranking');
      });
    }
  }

  window.QuizGame = { init };
})();
