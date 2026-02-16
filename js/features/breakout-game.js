/**
 * BREAKOUT GAME
 * Obra: Rompiendo el Cuarta Pared
 */

class BreakoutGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.ball = { x: 0, y: 0, dx: 4, dy: -4, radius: 8 };
    this.paddle = { x: 0, y: 0, width: 75, height: 10 };
    this.bricks = [];
    this.brickRowCount = 5;
    this.brickColumnCount = 8;
    this.active = false;
    this.score = 0;
  }

  init() {
    const container = document.getElementById('breakout-game-container');
    if (!container) return;

    container.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'breakout-wrapper';
    
    const header = document.createElement('div');
    header.className = 'game-header';
    const h2 = document.createElement('h2');
    h2.textContent = '🧱 Rompiendo Muros';
    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'score';
    scoreSpan.textContent = 'Puntos: 0';
    header.appendChild(h2);
    header.appendChild(scoreSpan);
    
    const canvas = document.createElement('canvas');
    canvas.id = 'breakout-canvas';
    canvas.width = 600;
    canvas.height = 400;
    
    const btn = document.createElement('button');
    btn.className = 'start-btn';
    btn.textContent = 'Romper';
    
    wrapper.appendChild(header);
    wrapper.appendChild(canvas);
    wrapper.appendChild(btn);
    container.appendChild(wrapper);

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Mouse movement for paddle
    this.canvas.addEventListener('mousemove', (e) => {
        const relativeX = e.clientX - this.canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < this.canvas.width) {
            this.paddle.x = relativeX - this.paddle.width / 2;
        }
    });

    container.querySelector('.start-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.active = true;
    this.score = 0;
    this.initBricks();
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height - 30, dx: 4, dy: -4, radius: 8 };
    this.paddle = { x: (this.canvas.width - 75) / 2, y: this.canvas.height - 20, width: 75, height: 10 };
    
    this.draw();
  }

  initBricks() {
      this.bricks = [];
      const padding = 10;
      const offsetTop = 30;
      const offsetLeft = 30;
      const width = (this.canvas.width - offsetLeft * 2 - padding * (this.brickColumnCount - 1)) / this.brickColumnCount;
      
      for(let c=0; c<this.brickColumnCount; c++) {
          this.bricks[c] = [];
          for(let r=0; r<this.brickRowCount; r++) {
              this.bricks[c][r] = { x: 0, y: 0, status: 1 };
              const brickX = (c * (width + padding)) + offsetLeft;
              const brickY = (r * (20 + padding)) + offsetTop;
              this.bricks[c][r].x = brickX;
              this.bricks[c][r].y = brickY;
              this.bricks[c][r].width = width;
              this.bricks[c][r].height = 20;
          }
      }
  }

  draw() {
      if (!this.active) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.drawBricks();
      this.drawBall();
      this.drawPaddle();
      this.collisionDetection();

      // Ball movement
      if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || this.ball.x + this.ball.dx < this.ball.radius) {
          this.ball.dx = -this.ball.dx;
      }
      if (this.ball.y + this.ball.dy < this.ball.radius) {
          this.ball.dy = -this.ball.dy;
      } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
          if (this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
              this.ball.dy = -this.ball.dy;
          } else {
              this.active = false;
              this.showOverlay('GAME OVER', '¿Otro intento?');
              return;
          }
      }

      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;

      requestAnimationFrame(() => this.draw());
  }

  drawBall() {
      this.ctx.beginPath();
      this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
      this.ctx.fillStyle = "#0095DD";
      this.ctx.fill();
      this.ctx.closePath();
  }

  drawPaddle() {
      this.ctx.beginPath();
      this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
      this.ctx.fillStyle = "#0095DD";
      this.ctx.fill();
      this.ctx.closePath();
  }

  drawBricks() {
      for(let c=0; c<this.brickColumnCount; c++) {
          for(let r=0; r<this.brickRowCount; r++) {
              if(this.bricks[c][r].status === 1) {
                  const b = this.bricks[c][r];
                  this.ctx.beginPath();
                  this.ctx.rect(b.x, b.y, b.width, b.height);
                  this.ctx.fillStyle = `hsl(${c * 40}, 70%, 50%)`;
                  this.ctx.fill();
                  this.ctx.closePath();
              }
          }
      }
  }

  collisionDetection() {
      for(let c=0; c<this.brickColumnCount; c++) {
          for(let r=0; r<this.brickRowCount; r++) {
              const b = this.bricks[c][r];
              if(b.status === 1) {
                  if(this.ball.x > b.x && this.ball.x < b.x + b.width && this.ball.y > b.y && this.ball.y < b.y + b.height) {
                      this.ball.dy = -this.ball.dy;
                      b.status = 0;
                      this.score++;
                      document.querySelector('.breakout-wrapper .score').textContent = `Puntos: ${this.score}`;
                      if(this.score === this.brickRowCount * this.brickColumnCount) {
                          this.active = false;
                          this.showOverlay('¡MURO DERRIBADO!', '🏆 Victoria total');
                      }
                  }
              }
          }
      }
  }

  showOverlay(title, subtitle) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.font = 'bold 36px "Inter", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.fillStyle = '#888';
    this.ctx.font = '18px "Inter", sans-serif';
    this.ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 20);

    this.ctx.font = '14px "Inter", sans-serif';
    this.ctx.fillStyle = '#555';
    this.ctx.fillText('Haz click en "Romper" para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }
}

window.BreakoutGame = new BreakoutGame();
