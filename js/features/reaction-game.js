/**
 * REACTION GAME
 * Obra: Reflejos del Futuro
 */

class ReactionGame {
  constructor() {
    this.active = false;
    this.startTime = 0;
    this.timer = null;
  }

  init() {
    const container = document.getElementById('reaction-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="reaction-wrapper">
        <div class="game-header">
          <h2>⚡ Reflejos MICA</h2>
        </div>
        <div class="reaction-screen" style="width: 600px; height: 400px; background: #333; display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 24px;">
           Pulsa para empezar
        </div>
      </div>
    `;

    const screen = container.querySelector('.reaction-screen');
    screen.addEventListener('click', () => this.handleClick(screen));
  }

  handleClick(screen) {
    if (!this.active && !this.waiting) {
        this.startWait(screen);
    } else if (this.waiting) {
        clearTimeout(this.timer);
        this.waiting = false;
        screen.textContent = "¡Demasiado pronto! Pulsa para reintentar";
        screen.style.background = "#FF5722";
    } else if (this.active) {
        const reactionTime = Date.now() - this.startTime;
        this.active = false;
        screen.textContent = `¡${reactionTime}ms! Pulsa para repetir`;
        screen.style.background = "#333";
    }
  }

  startWait(screen) {
    this.waiting = true;
    screen.textContent = "Espera al VERDE...";
    screen.style.background = "#333";
    
    const delay = Math.random() * 3000 + 2000;
    this.timer = setTimeout(() => {
        this.waiting = false;
        this.active = true;
        this.startTime = Date.now();
        screen.textContent = "¡YA!";
        screen.style.background = "#4CAF50";
    }, delay);
  }
}

window.ReactionGame = new ReactionGame();
