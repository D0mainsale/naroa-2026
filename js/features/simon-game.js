/**
 * SIMON SAYS: MICA EDITION
 * Obra: Secuencia de la Cordura
 */

class SimonGame {
  constructor() {
    this.sequence = [];
    this.userSequence = [];
    this.active = false;
    this.lockBoard = false;
    this.score = 0;
    this.colors = ['red', 'blue', 'green', 'yellow'];
  }

  init() {
    const container = document.getElementById('simon-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="simon-wrapper">
        <div class="game-header">
          <h2>🧠 Simon: Cordura</h2>
          <span class="score">Nivel: 0</span>
        </div>
        <div class="simon-grid">
          <div class="simon-pad red" data-color="red"></div>
          <div class="simon-pad blue" data-color="blue"></div>
          <div class="simon-pad green" data-color="green"></div>
          <div class="simon-pad yellow" data-color="yellow"></div>
        </div>
        <button class="start-btn">Repetir</button>
      </div>
    `;

    container.querySelectorAll('.simon-pad').forEach(pad => {
        pad.addEventListener('click', () => this.handleInput(pad.dataset.color));
    });

    container.querySelector('.start-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.sequence = [];
    this.score = 0;
    this.active = true;
    this.nextLevel();
  }

  nextLevel() {
    this.userSequence = [];
    this.score++;
    document.querySelector('.simon-wrapper .score').textContent = `Nivel: ${this.score}`;
    
    // Add new color
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.sequence.push(randomColor);
    
    this.playSequence();
  }

  async playSequence() {
    this.lockBoard = true;
    for (const color of this.sequence) {
        await this.flashPad(color);
        await new Promise(r => setTimeout(r, 200));
    }
    this.lockBoard = false;
  }

  flashPad(color) {
    return new Promise(resolve => {
        const pad = document.querySelector(`.simon-pad.${color}`);
        pad.classList.add('flash');
        setTimeout(() => {
            pad.classList.remove('flash');
            resolve();
        }, 500);
    });
  }

  handleInput(color) {
    if (this.lockBoard || !this.active) return;
    
    this.userSequence.push(color);
    const index = this.userSequence.length - 1;
    
    if (this.userSequence[index] !== this.sequence[index]) {
        this.gameOver();
        return;
    }
    
    if (this.userSequence.length === this.sequence.length) {
        setTimeout(() => this.nextLevel(), 500);
    }
  }

  gameOver() {
    this.active = false;
    alert(`¡Error en la secuencia! Llegaste al nivel ${this.score}`);
  }
}

window.SimonGame = new SimonGame();
