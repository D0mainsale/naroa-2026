/**
 * RESTAURADOR GAME
 * Obra: Restauración Fallida
 */

class RestauradorGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.active = false;
  }

  init() {
    const container = document.getElementById('restaurador-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="restaurador-wrapper">
        <div class="game-header">
          <h2>👨‍🎨 El Restaurador Desastroso</h2>
        </div>
        <canvas id="restaurador-canvas" width="600" height="500"></canvas>
        <div class="controls">
             <button id="restaurar-btn">RESTAURAR (ARRASTRAR)</button>
             <button id="mint-btn">INMORTALIZAR (NFT)</button>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('restaurador-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Logic for painting/messing up
    this.canvas.addEventListener('mousemove', (e) => {
        if (e.buttons !== 1) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI*2);
        this.ctx.fill();
    });

    container.querySelector('#mint-btn').addEventListener('click', () => {
        if (window.RestauradorWeb3) {
            window.RestauradorWeb3.mintNFT(this.canvas.toDataURL());
        } else {
            alert("Sistema Web3 no detectado.");
        }
    });

    this.drawBase();
  }

  drawBase() {
    // Draw a "classic painting" to be restored
    this.ctx.fillStyle = '#DDD';
    this.ctx.fillRect(0, 0, 600, 500);
    this.ctx.fillStyle = '#000';
    this.ctx.font = '80px serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🖼️', 300, 250);
    this.ctx.font = '20px serif';
    this.ctx.fillText('Pintura Inestimable', 300, 300);
  }
}

window.RestauradorGame = new RestauradorGame();
