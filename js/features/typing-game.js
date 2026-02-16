/**
 * TYPING GAME
 * Obra: Escritura Automática
 */

class TypingGame {
  constructor() {
    this.words = ["ABSTRACTO", "SINFONIA", "DIGITAL", "KINTSUGI", "BELLEZA", "CAOS", "ORDEN", "MICA"];
    this.currentWord = "";
    this.score = 0;
    this.active = false;
  }

  init() {
    const container = document.getElementById('typing-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="typing-wrapper">
        <div class="game-header">
          <h2>⌨️ Escritor de Realidades</h2>
          <span class="score">Palabras: 0</span>
        </div>
        <div class="typing-content">
           <h3 class="target-word">---</h3>
           <input type="text" class="typing-input" placeholder="Escribe aquí...">
        </div>
      </div>
    `;

    const input = container.querySelector('.typing-input');
    input.addEventListener('input', () => {
        if (input.value.toUpperCase() === this.currentWord) {
            this.score++;
            input.value = "";
            this.nextWord();
        }
    });

    this.start();
  }

  start() {
    this.active = true;
    this.score = 0;
    this.nextWord();
  }

  nextWord() {
    this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
    document.querySelector('.typing-wrapper .target-word').textContent = this.currentWord;
    document.querySelector('.typing-wrapper .score').textContent = `Palabras: ${this.score}`;
  }
}

window.TypingGame = new TypingGame();
