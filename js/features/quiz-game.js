/**
 * QUIZ GAME: ART EDITION
 * Obra: Examen de Consciencia
 */

class QuizGame {
  constructor() {
    this.questions = [
      { q: "¿En qué año se fundó el estilo Naroa?", a: ["2020", "2024", "2026", "Siempre existió"], correct: 2 },
      { q: "¿Cuál es el color predominante en 'MICA'?", a: ["Rojo", "Cian", "Oro", "Negro"], correct: 1 },
      { q: "¿Qué significa Kintsugi?", a: ["Reparación con oro", "Arte efímero", "Vuelo del alma", "Grito silencioso"], correct: 0 }
    ];
    this.currentQuestion = 0;
    this.score = 0;
  }

  init() {
    const container = document.getElementById('quiz-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="quiz-wrapper">
        <div class="game-header">
          <h2>📝 El Examen de MICA</h2>
        </div>
        <div class="quiz-content">
          <p class="question"></p>
          <div class="options"></div>
        </div>
        <div class="quiz-footer">
          <span class="score">Aciertos: 0</span>
        </div>
      </div>
    `;

    this.showQuestion();
  }

  showQuestion() {
    const q = this.questions[this.currentQuestion];
    document.querySelector('.quiz-wrapper .question').textContent = q.q;
    const optionsCont = document.querySelector('.quiz-wrapper .options');
    optionsCont.innerHTML = '';
    
    q.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.addEventListener('click', () => this.checkAnswer(i));
        optionsCont.appendChild(btn);
    });
  }

  checkAnswer(index) {
    if (index === this.questions[this.currentQuestion].correct) {
        this.score++;
    }
    
    this.currentQuestion++;
    if (this.currentQuestion < this.questions.length) {
        this.showQuestion();
    } else {
        alert(`Quiz terminado. Puntuación: ${this.score}/${this.questions.length}`);
    }
    document.querySelector('.quiz-wrapper .score').textContent = `Aciertos: ${this.score}`;
  }
}

window.QuizGame = new QuizGame();
