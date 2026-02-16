/**
 * PONG GAME: MICA EDITION
 * Obra: Ping-Pong Existencial
 */

class PongGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.p1 = { y: 150, score: 0 };
    this.p2 = { y: 150, score: 0 };
    this.ball = { x: 300, y: 200, dx: 5, dy: 3 };
    this.active = false;
  }

  init() {
    const container = document.getElementById('pong-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="pong-wrapper">
        <div class="game-header">
          <h2>🏓 Duelo Contra MICA</h2>
          <span class="score">Tú 0 - 0 MICA</span>
        </div>
        <canvas id="pong-canvas" width="600" height="400"></canvas>
      </div>
    `;

    this.canvas = document.getElementById('pong-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.p1.y = e.clientY - rect.top - 40;
    });

    this.start();
  }

  start() {
    this.active = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.active) return;
    
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, 600, 400);

    // AI
    if (this.ball.y > this.p2.y + 40) this.p2.y += 4;
    else this.p2.y -= 4;

    // Ball movement
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    if (this.ball.y < 0 || this.ball.y > 400) this.ball.dy *= -1;

    // Paddles collision
    if (this.ball.x < 20 && this.ball.y > this.p1.y && this.ball.y < this.p1.y + 80) this.ball.dx *= -1;
    if (this.ball.x > 580 && this.ball.y > this.p2.y && this.ball.y < this.p2.y + 80) this.ball.dx *= -1;

    // Scores
    if (this.ball.x < 0) { this.p2.score++; this.resetBall(); }
    if (this.ball.x > 600) { this.p1.score++; this.resetBall(); }

    // Draw
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(10, this.p1.y, 10, 80);
    this.ctx.fillRect(580, this.p2.y, 10, 80);
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, 8, 0, Math.PI*2);
    this.ctx.fill();

    document.querySelector('.pong-wrapper .score').textContent = `Tú ${this.p1.score} - ${this.p2.score} MICA`;

    requestAnimationFrame(() => this.gameLoop());
  }

  resetBall() {
      this.ball = { x: 300, y: 200, dx: this.ball.dx * -1, dy: 3 };
  }
}

window.PongGame = new PongGame();
