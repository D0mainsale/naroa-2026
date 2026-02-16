/**
 * WHACK-A-MOLE: MICA EDITION
 * Obra: ¡Dale al Crítico!
 */

class WhackGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.score = 0;
    this.holes = [];
    this.active = false;
    this.timer = null;
    this.timeLeft = 30;
  }

  init() {
    const container = document.getElementById('whack-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="whack-wrapper">
        <div class="game-header">
          <h2>🔨 ¡Dale al Crítico!</h2>
          <span class="score">Puntos: 0</span>
          <span class="time">Tiempo: 30s</span>
        </div>
        <div class="whack-grid"></div>
        <button class="start-btn">Comenzar</button>
      </div>
    `;

    const grid = container.querySelector('.whack-grid');
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.classList.add('whack-hole');
        hole.addEventListener('click', () => this.whack(hole));
        grid.appendChild(hole);
        this.holes.push(hole);
    }

    container.querySelector('.start-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.score = 0;
    this.timeLeft = 30;
    this.active = true;
    this.updateUI();
    
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
        this.timeLeft--;
        this.updateUI();
        if (this.timeLeft <= 0) this.end();
    }, 1000);

    this.showMole();
  }

  showMole() {
    if (!this.active) return;
    
    // Clear all
    this.holes.forEach(h => h.classList.remove('active'));
    
    // Pick random
    const randomHole = this.holes[Math.floor(Math.random() * this.holes.length)];
    randomHole.classList.add('active');
    
    const delay = Math.random() * 800 + 400;
    setTimeout(() => this.showMole(), delay);
  }

  whack(hole) {
    if (hole.classList.contains('active')) {
        this.score += 10;
        hole.classList.remove('active');
        hole.classList.add('hit');
        setTimeout(() => hole.classList.remove('hit'), 200);
        this.updateUI();
    }
  }

  updateUI() {
    const s = document.querySelector('.whack-wrapper .score');
    const t = document.querySelector('.whack-wrapper .time');
    if (s) s.textContent = `Puntos: ${this.score}`;
    if (t) t.textContent = `Tiempo: ${this.timeLeft}s`;
  }

  end() {
    this.active = false;
    clearInterval(this.timer);
    alert(`¡Crítica Silenciada! Puntuación: ${this.score}`);
  }
}

window.WhackGame = new WhackGame();
