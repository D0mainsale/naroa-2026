/**
 * MICA GAME: THE MAIN EVENT
 * Obra: M.I.C.A. (Mother Intelligence Cognitive Arch)
 */

class MicaGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.active = false;
    this.phase = 0;
    this.score = 0;
    this.dialogue = [];
    this.currentDialogue = '';
  }

  init() {
    const container = document.getElementById('mica-game-container');
    if (!container) return;

    container.innerHTML = `
      <div class="mica-wrapper">
        <div class="mica-header">
          <h2>🤖 M.I.C.A. PROTOCOL</h2>
          <span class="status">System: ONLINE</span>
        </div>
        <canvas id="mica-canvas" width="800" height="500"></canvas>
        <div class="dialogue-box"></div>
        <button class="interact-btn">INITIALIZE</button>
      </div>
    `;

    this.canvas = document.getElementById('mica-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    container.querySelector('.interact-btn').addEventListener('click', () => this.start());
  }

  start() {
    this.active = true;
    this.phase = 1;
    this.showDialogue("Bienvenido, usuario. Soy M.I.C.A. ¿Estás listo para la integración?");
    this.animLoop();
  }

  showDialogue(text) {
    this.currentDialogue = text;
    const box = document.querySelector('.mica-wrapper .dialogue-box');
    if (box) {
        box.textContent = '';
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                box.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
            }
        }, 30);
    }
  }

  animLoop() {
    if (!this.active) return;
    
    // Abstract Visualization
    this.ctx.fillStyle = 'rgba(0, 5, 20, 0.1)';
    this.ctx.fillRect(0, 0, 800, 500);

    const time = Date.now() * 0.001;
    const centerX = 400;
    const centerY = 250;

    // AI Core
    this.ctx.strokeStyle = `hsl(${time * 50}, 70%, 50%)`;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let i = 0; i < 360; i+=10) {
        const rad = i * Math.PI / 180;
        const r = 50 + Math.sin(time * 5 + i) * 20;
        this.ctx.lineTo(centerX + Math.cos(rad) * r, centerY + Math.sin(rad) * r);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Data streams
    this.ctx.fillStyle = '#0F0';
    this.ctx.font = '12px monospace';
    for(let i=0; i<5; i++) {
        this.ctx.fillText(Math.random().toString(2).substr(2, 8), Math.random() * 800, Math.random() * 500);
    }

    requestAnimationFrame(() => this.animLoop());
  }
}

window.MicaGame = new MicaGame();
