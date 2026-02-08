/**
 * Art Runner - Naroa 2026
 * @description Parallax infinite runner avoiding crowds in a museum
 * Agent A05: Parallax scrolling layers, dust particles, art collectible glow
 */
(function() {
  'use strict';

  const W = 600, H = 300;
  let state = {
    canvas: null, ctx: null,
    player: { x: 50, y: 0, w: 30, h: 50, vy: 0, grounded: false },
    obstacles: [], collectibles: [],
    score: 0, speed: 4, gravity: 0.6,
    bgLayer1: 0, bgLayer2: 0,
    artworks: [], particles: [], running: false
  };

  async function init() {
    const container = document.getElementById('runner-container');
    if (!container) return;

    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks;
    } catch (e) {}

    container.innerHTML = `
      <div class="runner-ui">
        <div class="runner-score">SCORE: <span id="runner-score">0</span></div>
        <canvas id="runner-canvas" width="${W}" height="${H}"></canvas>
        <button class="game-btn" id="runner-start">RUN!</button>
      </div>
    `;

    state.canvas = document.getElementById('runner-canvas');
    state.ctx = state.canvas.getContext('2d');

    document.getElementById('runner-start').addEventListener('click', startGame);
    
    // Controls: Jump (Space / Click)
    const jump = () => {
        if (!state.running) return;
        if (state.player.grounded) {
            state.player.vy = -12;
            state.player.grounded = false;
            spawnParticles(state.player.x + 15, H-20, 5, '#fff'); // Dust
        }
    };
    document.addEventListener('keydown', e => { if(e.code === 'Space') jump(); });
    state.canvas.addEventListener('touchstart', jump, {passive:true});
    state.canvas.addEventListener('mousedown', jump);
  }

  function startGame() {
    state.running = true;
    state.score = 0;
    state.obstacles = [];
    state.collectibles = [];
    state.particles = [];
    state.player.y = H - 50;
    state.player.vy = 0;
    document.getElementById('runner-start').style.display = 'none';
    loop();
  }

  function spawnObstacle() {
    if (Math.random() < 0.02) {
        state.obstacles.push({
            x: W, y: H - 40, w: 30, h: 40,
            color: '#ff003c' // Security guard or rope
        });
    }
  }

  function spawnCollectible() {
    if (Math.random() < 0.01) {
        const art = state.artworks[Math.floor(Math.random()*state.artworks.length)];
        state.collectibles.push({
            x: W, y: H - 100 - Math.random()*50, w: 25, h: 25,
            hue: Math.random()*360
        });
    }
  }

  function spawnParticles(x, y, count, color) {
    for(let i=0; i<count; i++) {
        state.particles.push({
            x, y, vx: (Math.random()-0.5)*4, vy: (Math.random()-1)*4,
            life: 1.0, color: color || '#fff', size: Math.random()*3
        });
    }
  }

  function loop() {
    if (!state.running) return;

    // Logic
    state.speed += 0.001; // Accel
    state.player.vy += state.gravity;
    state.player.y += state.player.vy;

    // Ground collision
    if (state.player.y >= H - 50) {
        state.player.y = H - 50;
        state.player.vy = 0;
        state.player.grounded = true;
    }

    // Parallax
    state.bgLayer1 -= state.speed * 0.5;
    state.bgLayer2 -= state.speed * 0.2;
    if (state.bgLayer1 < -W) state.bgLayer1 = 0;
    if (state.bgLayer2 < -W) state.bgLayer2 = 0;

    spawnObstacle();
    spawnCollectible();

    // Move & Collide Obstacles
    state.obstacles.forEach(o => o.x -= state.speed);
    state.obstacles = state.obstacles.filter(o => o.x > -50);
    state.obstacles.forEach(o => {
        if (rectIntersect(state.player, o)) {
            gameOver();
        }
    });

    // Move & Collide Collectibles
    state.collectibles.forEach(c => c.x -= state.speed);
    state.collectibles = state.collectibles.filter(c => !c.collected && c.x > -50);
    state.collectibles.forEach(c => {
        if (rectIntersect(state.player, c)) {
            c.collected = true;
            state.score += 100;
            spawnParticles(c.x, c.y, 10, `hsl(${c.hue}, 100%, 50%)`);
            if (window.GameEffects) GameEffects.scorePopAnimation(document.getElementById('runner-score'), '+100');
        }
    });

    state.score++;
    document.getElementById('runner-score').textContent = Math.floor(state.score);

    // Particles
    state.particles = state.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        return p.life > 0;
    });

    draw();
    requestAnimationFrame(loop);
  }

  function rectIntersect(r1, r2) {
      return !(r2.x > r1.x + r1.w || 
               r2.x + r2.w < r1.x || 
               r2.y > r1.y + r1.h || 
               r2.y + r2.h < r1.y);
  }

  function gameOver() {
    state.running = false;
    if (window.GameEffects) GameEffects.cameraShake(state.canvas, 10);
    alert(`Game Over! Score: ${Math.floor(state.score)}`);
    document.getElementById('runner-start').style.display = 'inline-block';
  }

  function draw() {
    const ctx = state.ctx;
    const bg1 = state.bgLayer1;
    const bg2 = state.bgLayer2;

    // Clear
    ctx.clearRect(0,0,W,H);

    // BG Layer 2 (Far) - Dark museum
    ctx.fillStyle = '#100a1a';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#1a102a';
    // Draw repeating pillars or arches
    for(let i=0; i<W*2; i+=200) {
        ctx.fillRect(bg2 + i, 50, 40, H-50);
    }

    // BG Layer 1 (Mid) - Paintings
    ctx.fillStyle = '#222';
    ctx.fillRect(0, H-20, W, 20); // Floor

    // Player
    ctx.fillStyle = '#d4af37';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 10;
    ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);
    ctx.shadowBlur = 0;

    // Obstacles
    state.obstacles.forEach(o => {
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });

    // Collectibles
    state.collectibles.forEach(c => {
        ctx.fillStyle = `hsl(${c.hue}, 100%, 60%)`;
        ctx.shadowColor = `hsl(${c.hue}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }

  window.RunnerGame = { init };
})();
