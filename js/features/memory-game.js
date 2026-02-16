/**
 * MEMORY GAME
 * Obra: Recuerdos Fragmentados
 */

class MemoryGame {
  constructor() {
    this.container = null;
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.totalPairs = 6;
    this.active = false;
    this.lockBoard = false;
    this.timer = null;
    this.seconds = 0;
  }

  init() {
    this.container = document.getElementById('memory-game-container');
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="memory-wrapper">
        <div class="game-header">
          <h2>🧠 Recuerdos Fragmentados</h2>
          <span class="timer">Tiempo: 0s</span>
        </div>
        <div class="memory-grid"></div>
        <button class="restart-btn">Olvidar y Reiniciar</button>
      </div>
    `;

    this.container.querySelector('.restart-btn').addEventListener('click', () => this.start());
    this.start();
  }

  start() {
    const grid = this.container.querySelector('.memory-grid');
    grid.innerHTML = '';
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.seconds = 0;
    this.active = true;
    this.lockBoard = false;
    
    // Generate pairs (using emojis/text as content for now)
    const items = ['🎭', '🎨', '🎬', '🎹', '🎻', '🖌️'];
    const deck = [...items, ...items].sort(() => 0.5 - Math.random());

    deck.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('memory-card');
      card.dataset.value = item;
      card.innerHTML = `
        <div class="front">?</div>
        <div class="back">${item}</div>
      `;
      card.addEventListener('click', () => this.flipCard(card));
      grid.appendChild(card);
    });

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
        this.seconds++;
        this.container.querySelector('.timer').textContent = `Tiempo: ${this.seconds}s`;
    }, 1000);
  }

  flipCard(card) {
    if (this.lockBoard) return;
    if (card === this.flippedCards[0]) return; // Don't flip same card twice
    if (card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (this.flippedCards.length === 0) {
      this.flippedCards.push(card);
    } else {
      this.flippedCards.push(card);
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const [card1, card2] = this.flippedCards;
    const isMatch = card1.dataset.value === card2.dataset.value;

    if (isMatch) {
      this.disableCards();
    } else {
      this.unflipCards();
    }
  }

  disableCards() {
    this.flippedCards.forEach(card => card.classList.add('matched'));
    this.flippedCards = [];
    this.matchedPairs++;
    if (this.matchedPairs === this.totalPairs) {
      this.active = false;
      clearInterval(this.timer);
      setTimeout(() => alert(`¡Recuerdos Recuperados en ${this.seconds} segundos!`), 500);
    }
  }

  unflipCards() {
    this.lockBoard = true;
    setTimeout(() => {
      this.flippedCards.forEach(card => card.classList.remove('flipped'));
      this.flippedCards = [];
      this.lockBoard = false;
    }, 1000);
  }
}

// Global Export
window.MemoryGame = new MemoryGame();
