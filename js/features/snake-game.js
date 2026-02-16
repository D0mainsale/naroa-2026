/**
 * SNAKE GAME - MICA EDITION
 * Obra: Piezas de Arte
 */

class SnakeGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.timer = null;
    this.snake = [];
    this.food = null;
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.active = false;
    this.speed = 150;
  }

  init() {
    const container = document.getElementById('snake-game-container'); // Ensure this ID matches HTML
    if (!container) return;

    container.innerHTML = `
      <div class="snake-wrapper">
        <div class="game-header">
          <h2>🐍 Snake Artístico</h2>
          <span class="score">Puntos: 0</span>
        </div>
        <canvas id="snake-canvas" width="600" height="400"></canvas>
        <button class="start-btn">Jugar</button>
      </div>
    `;

    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Bind controls
    document.addEventListener('keydown', this.handleInput.bind(this));
    container.querySelector('.start-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.active = true;
    this.spawnFood();
    
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.update(), this.speed);
  }

  update() {
    this.direction = this.nextDirection;
    const head = {...this.snake[0]};

    switch(this.direction) {
      case 'right': head.x++; break;
      case 'left': head.x--; break;
      case 'up': head.y--; break;
      case 'down': head.y++; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) {
      this.gameOver();
      return;
    }

    // Self collision
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // Food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.speed = Math.max(50, this.speed - 2);
      clearInterval(this.timer);
      this.timer = setInterval(() => this.update(), this.speed);
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  spawnFood() {
    this.food = {
      x: Math.floor(Math.random() * 30),
      y: Math.floor(Math.random() * 20)
    };
    // Ensure food doesn't spawn on snake
    if (this.snake.some(s => s.x === this.food.x && s.y === this.food.y)) {
      this.spawnFood();
    }
  }

  draw() {
    // Clear
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, 600, 400);

    // Snake
    this.ctx.fillStyle = '#4CAF50';
    this.snake.forEach(s => {
      this.ctx.fillRect(s.x * 20, s.y * 20, 18, 18);
    });

    // Food
    this.ctx.fillStyle = '#FF5722';
    this.ctx.beginPath();
    this.ctx.arc(this.food.x * 20 + 10, this.food.y * 20 + 10, 9, 0, Math.PI*2);
    this.ctx.fill();

    // Score
    document.querySelector('.snake-wrapper .score').textContent = `Puntos: ${this.score}`;
  }

  handleInput(e) {
    if (!this.active) return;
    
    switch(e.key) {
      case 'ArrowUp': if (this.direction !== 'down') this.nextDirection = 'up'; break;
      case 'ArrowDown': if (this.direction !== 'up') this.nextDirection = 'down'; break;
      case 'ArrowLeft': if (this.direction !== 'right') this.nextDirection = 'left'; break;
      case 'ArrowRight': if (this.direction !== 'left') this.nextDirection = 'right'; break;
    }
  }

  gameOver() {
    this.active = false;
    clearInterval(this.timer);
    alert(`Game Over! Puntuación: ${this.score}`);
  }
}

// Global Export
window.SnakeGame = new SnakeGame();
