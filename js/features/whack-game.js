// === FILE: js/features/whack-game.js ===
// Premium Whack-a-Mole Game with artworks
// Features: Spring pop-up animation, hit shockwave, miss X-mark, combo multiplier, timer bar

(function() {
  'use strict';

  const CONFIG = {
    gridSize: 3,
    gameDuration: 60,
    spawnInterval: 800,
    minSpawnInterval: 400,
    moleDuration: 1500,
    colors: {
      primary: '#ccff00',
      danger: '#ff003c',
      info: '#3b82f6',
      gold: '#ffd700',
      bg: '#0d0d1a',
      hole: '#0a0a14'
    }
  };

  let artworks = [];
  let holes = [];
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let timeLeft = CONFIG.gameDuration;
  let gameActive = false;
  let spawnTimer;
  let countdownTimer;
  let currentSpawnInterval = CONFIG.spawnInterval;
  let particles = [];
  let shockwaves = [];

  class Particle {
    constructor(x, y, color, type = 'spark') {
      this.x = x;
      this.y = y;
      this.type = type;
      this.vx = (Math.random() - 0.5) * 12;
      this.vy = (Math.random() - 0.5) * 12 - 3;
      this.life = 1;
      this.decay = type === 'shockwave' ? 0.03 : Math.random() * 0.03 + 0.02;
      this.color = color;
      this.size = type === 'shockwave' ? 10 : Math.random() * 8 + 4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15;
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;
      
      if (this.type === 'shockwave') {
        this.size += 3;
      }
    }

    draw(ctx) {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      if (this.type === 'shockwave') {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.type === 'xmark') {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(-s, -s);
        ctx.lineTo(s, s);
        ctx.moveTo(s, -s);
        ctx.lineTo(-s, s);
        ctx.stroke();
      } else {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      }

      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }

  async function loadArtworks() {
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      return data.artworks.slice(0, 9);
    } catch (error) {
      return Array.from({ length: 9 }, (_, i) => ({
        id: i,
        title: `Art ${i + 1}`,
        series: 'Series',
        technique: 'Mixed'
      }));
    }
  }

  function createHole(index) {
    const hole = document.createElement('div');
    hole.className = 'whack-hole';
    hole.dataset.index = index;

    const artwork = artworks[index % artworks.length];

    hole.innerHTML = `
      <div class="hole-base" style="
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, ${CONFIG.colors.hole} 0%, #000 70%);
        border: 3px solid ${CONFIG.colors.primary}30;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 10px 30px rgba(0,0,0,0.8), 0 5px 20px rgba(0,0,0,0.5);
      ">
        <div class="mole" style="
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${CONFIG.colors.primary}20, ${CONFIG.colors.info}20);
          border: 2px solid ${CONFIG.colors.primary};
          position: absolute;
          bottom: -100%;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: none;
          box-shadow: 0 0 30px ${CONFIG.colors.primary}40;
        ">
          <div class="mole-content" style="text-align: center;">
            <div class="mole-icon" style="font-size: 32px; color: ${CONFIG.colors.gold}; text-shadow: 0 0 15px ${CONFIG.colors.gold};">${artwork.title.charAt(0)}</div>
          </div>
        </div>
        <div class="hole-overlay" style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          border-radius: 0 0 60px 60px;
          pointer-events: none;
        "></div>
      </div>
    `;

    hole.style.cssText = `
      padding: 10px;
      position: relative;
    `;

    const mole = hole.querySelector('.mole');
    let isUp = false;
    let hideTimeout;

    hole.showMole = () => {
      if (isUp || !gameActive) return;
      isUp = true;
      
      // Spring pop-up animation
      mole.animate([
        { bottom: '-100%', transform: 'translateX(-50%) scale(0.5)' },
        { bottom: '10%', transform: 'translateX(-50%) scale(1.1)', offset: 0.6 },
        { bottom: '15%', transform: 'translateX(-50%) scale(1)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        fill: 'forwards'
      });

      mole.style.bottom = '15%';
      mole.style.transform = 'translateX(-50%) scale(1)';

      hideTimeout = setTimeout(() => {
        if (isUp) hole.hideMole();
      }, CONFIG.moleDuration - level * 50);
    };

    hole.hideMole = () => {
      if (!isUp) return;
      isUp = false;

      mole.animate([
        { bottom: '15%', transform: 'translateX(-50%) scale(1)' },
        { bottom: '-100%', transform: 'translateX(-50%) scale(0.8)' }
      ], {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards'
      });

      mole.style.bottom = '-100%';
    };

    hole.hit = (x, y) => {
      if (!isUp) {
        // Miss - show X mark
        createXMark(x, y);
        combo = 0;
        updateComboDisplay();
        return false;
      }

      clearTimeout(hideTimeout);
      hole.hideMole();

      // Calculate points with combo
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      const points = 10 * Math.max(1, Math.floor(combo / 3));
      score += points;

      // Effects
      createShockwave(x, y);
      createParticles(x, y, CONFIG.colors.gold);

      // Visual feedback
      const pointsEl = document.createElement('div');
      pointsEl.textContent = `+${points}`;
      pointsEl.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: ${CONFIG.colors.gold};
        font-size: 24px;
        font-weight: 700;
        text-shadow: 0 0 20px ${CONFIG.colors.gold};
        pointer-events: none;
        z-index: 100;
        animation: floatUp 0.8s ease-out forwards;
      `;
      document.getElementById('whack-container').appendChild(pointsEl);
      setTimeout(() => pointsEl.remove(), 800);

      if (window.GameEffects?.scorePopAnimation) {
        window.GameEffects.scorePopAnimation(hole, `+${points}`);
      }
      if (window.GameEffects?.hapticFeedback) {
        window.GameEffects.hapticFeedback();
      }

      updateUI();
      updateComboDisplay();

      return true;
    };

    mole.addEventListener('mousedown', (e) => {
      if (!gameActive) return;
      const rect = mole.getBoundingClientRect();
      hole.hit(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    mole.addEventListener('touchstart', (e) => {
      if (!gameActive) return;
      e.preventDefault();
      const touch = e.touches[0];
      hole.hit(touch.clientX, touch.clientY);
    });

    return hole;
  }

  function createParticles(x, y, color) {
    const canvas = document.getElementById('whack-particles');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(x - rect.left, y - rect.top, color));
    }
  }

  function createShockwave(x, y) {
    const canvas = document.getElementById('whack-particles');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    shockwaves.push(new Particle(x - rect.left, y - rect.top, CONFIG.colors.gold, 'shockwave'));
  }

  function createXMark(x, y) {
    const canvas = document.getElementById('whack-particles');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    shockwaves.push(new Particle(x - rect.left, y - rect.top, CONFIG.colors.danger, 'xmark'));
  }

  function updateComboDisplay() {
    const comboEl = document.getElementById('whack-combo');
    const comboContainer = document.getElementById('whack-combo-container');
    
    if (combo >= 3) {
      comboEl.textContent = `x${combo}`;
      comboContainer.style.opacity = '1';
      comboContainer.style.transform = 'scale(1)';
      
      // Pulse animation
      comboContainer.animate([
        { transform: 'scale(1)', boxShadow: `0 0 20px ${CONFIG.colors.gold}40` },
        { transform: 'scale(1.1)', boxShadow: `0 0 40px ${CONFIG.colors.gold}80` },
        { transform: 'scale(1)', boxShadow: `0 0 20px ${CONFIG.colors.gold}40` }
      ], { duration: 300 });
    } else {
      comboContainer.style.opacity = '0.5';
      comboContainer.style.transform = 'scale(0.9)';
    }
  }

  function updateUI() {
    const scoreEl = document.getElementById('whack-score');
    if (scoreEl) {
      scoreEl.textContent = score;
      scoreEl.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
      ], { duration: 200 });
    }
  }

  function updateTimer() {
    timeLeft--;
    const timerEl = document.getElementById('whack-timer');
    const timerBar = document.getElementById('timer-bar');
    
    if (timerEl) timerEl.textContent = timeLeft;
    
    if (timerBar) {
      const percent = (timeLeft / CONFIG.gameDuration) * 100;
      timerBar.style.width = `${percent}%`;
      
      if (percent < 30) {
        timerBar.style.background = `linear-gradient(90deg, ${CONFIG.colors.danger}, #ff3366)`;
        timerBar.parentElement.style.boxShadow = `0 0 20px ${CONFIG.colors.danger}40`;
      } else if (percent < 60) {
        timerBar.style.background = `linear-gradient(90deg, ${CONFIG.colors.gold}, #ffcc00)`;
      }
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }

  function spawnMole() {
    if (!gameActive) return;

    const availableHoles = holes.filter(h => !h.querySelector('.mole').style.bottom || 
                                           h.querySelector('.mole').style.bottom === '-100%');
    
    if (availableHoles.length > 0) {
      const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
      randomHole.showMole();
    }

    // Increase difficulty
    currentSpawnInterval = Math.max(CONFIG.minSpawnInterval, 
                                    CONFIG.spawnInterval - (CONFIG.gameDuration - timeLeft) * 5);
    
    spawnTimer = setTimeout(spawnMole, currentSpawnInterval);
  }

  function startGame() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    timeLeft = CONFIG.gameDuration;
    currentSpawnInterval = CONFIG.spawnInterval;
    gameActive = true;
    particles = [];
    shockwaves = [];

    document.getElementById('whack-start').style.display = 'none';
    document.getElementById('whack-game').style.display = 'block';

    updateUI();
    updateComboDisplay();

    countdownTimer = setInterval(updateTimer, 1000);
    spawnMole();

    // Start particle animation
    animateParticles();
  }

  function endGame() {
    gameActive = false;
    clearInterval(countdownTimer);
    clearTimeout(spawnTimer);

    // Hide all moles
    holes.forEach(hole => hole.hideMole());

    if (window.GameEffects?.confettiBurst) {
      window.GameEffects.confettiBurst(document.querySelector('.whack-grid'));
    }

    setTimeout(() => {
      const finalScore = score + maxCombo * 50;
      if (window.RankingSystem?.showSubmitModal) {
        window.RankingSystem.showSubmitModal('whack', finalScore, () => {
          document.getElementById('whack-start').style.display = 'inline-block';
          document.getElementById('whack-game').style.display = 'none';
        });
      }
    }, 500);
  }

  function animateParticles() {
    if (!gameActive && particles.length === 0 && shockwaves.length === 0) return;

    const canvas = document.getElementById('whack-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // Update and draw shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].update();
      shockwaves[i].draw(ctx);
      if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);
    }

    if (gameActive || particles.length > 0 || shockwaves.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  }

  async function initGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    artworks = await loadArtworks();

    container.innerHTML = `
      <div class="whack-game-wrapper" style="font-family: Satoshi, sans-serif; text-align: center; position: relative;">
        <div class="game-ui" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="score-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid ${CONFIG.colors.primary}; box-shadow: 0 0 15px rgba(204, 255, 0, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Score</span>
            <div id="whack-score" style="color: ${CONFIG.colors.primary}; font-size: 28px; font-weight: 700; text-shadow: 0 0 10px rgba(204, 255, 0, 0.5);">0</div>
          </div>
          <div class="timer-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid ${CONFIG.colors.info}; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</span>
            <div id="whack-timer" style="color: ${CONFIG.colors.info}; font-size: 28px; font-weight: 700;">${CONFIG.gameDuration}</div>
          </div>
          <div id="whack-combo-container" class="combo-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid ${CONFIG.colors.gold}; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); opacity: 0.5; transform: scale(0.9); transition: all 0.3s ease;">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Combo</span>
            <div id="whack-combo" style="color: ${CONFIG.colors.gold}; font-size: 28px; font-weight: 700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">x1</div>
          </div>
        </div>

        <div class="timer-bar-container" style="width: 100%; max-width: 400px; margin: 0 auto 20px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
          <div id="timer-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, ${CONFIG.colors.primary}, ${CONFIG.colors.gold}); border-radius: 4px; transition: width 1s linear, background 0.3s ease;"></div>
        </div>

        <div id="whack-game" style="display: none; position: relative;">
          <div class="whack-grid" style="display: grid; grid-template-columns: repeat(${CONFIG.gridSize}, 140px); gap: 15px; justify-content: center;"></div>
          <canvas id="whack-particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"></canvas>
        </div>

        <button id="whack-start" style="
          background: linear-gradient(135deg, ${CONFIG.colors.primary}, #88cc00);
          color: #000;
          border: none;
          padding: 18px 50px;
          font-size: 18px;
          font-weight: 700;
          border-radius: 30px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 0 30px ${CONFIG.colors.primary}60;
          transition: all 0.3s ease;
          font-family: Satoshi, sans-serif;
          margin-top: 20px;
        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 50px ${CONFIG.colors.primary}80'" 
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 30px ${CONFIG.colors.primary}60'">START GAME</button>
      </div>
    `;

    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatUp {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const grid = container.querySelector('.whack-grid');
    for (let i = 0; i < CONFIG.gridSize * CONFIG.gridSize; i++) {
      const hole = createHole(i);
      grid.appendChild(hole);
      holes.push(hole);
    }

    // Setup particle canvas
    const canvas = document.getElementById('whack-particles');
    const gameDiv = document.getElementById('whack-game');
    canvas.width = gameDiv.offsetWidth;
    canvas.height = gameDiv.offsetHeight;

    document.getElementById('whack-start').addEventListener('click', startGame);
  }

  // Public API
  window.WhackGame = {
    init: initGame
  };
})();
