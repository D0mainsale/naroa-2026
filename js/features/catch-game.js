// === FILE: js/features/catch-game.js ===
// Premium Catch Game - Collect falling diamonds, avoid bombs
// Features: Neon glow effects, particle trails, combo system, screen shake, mobile touch

(function() {
  'use strict';

  const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    basketWidth: 100,
    basketHeight: 20,
    gravity: 0.15,
    spawnRate: 60,
    colors: {
      primary: '#ccff00',
      danger: '#ff003c',
      info: '#3b82f6',
      gold: '#ffd700',
      bgGradientStart: '#0d0d1a',
      bgGradientEnd: '#050510'
    }
  };

  let canvas, ctx, animationId;
  let basket, items, particles, stars;
  let score, lives, combo, gameActive;
  let frameCount, comboTimer;
  let shakeFrames, shakeIntensity;

  class Star {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      this.twinklePhase = Math.random() * Math.PI * 2;
    }

    draw() {
      const alpha = this.alpha + Math.sin(Date.now() * this.twinkleSpeed + this.twinklePhase) * 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Basket {
    constructor() {
      this.width = CONFIG.basketWidth;
      this.height = CONFIG.basketHeight;
      this.x = canvas.width / 2 - this.width / 2;
      this.y = canvas.height - 60;
      this.targetX = this.x;
      this.trail = [];
    }

    update() {
      // Smooth movement
      this.x += (this.targetX - this.x) * 0.15;
      
      // Keep in bounds
      this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

      // Trail effect
      this.trail.push({ x: this.x + this.width / 2, y: this.y + this.height / 2 });
      if (this.trail.length > 8) this.trail.shift();
    }

    draw() {
      // Draw trail
      this.trail.forEach((pos, i) => {
        const alpha = (i / this.trail.length) * 0.4;
        ctx.fillStyle = `rgba(204, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3 + i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw basket with gradient
      const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      gradient.addColorStop(0, CONFIG.colors.primary);
      gradient.addColorStop(1, '#88cc00');

      ctx.shadowColor = CONFIG.colors.primary;
      ctx.shadowBlur = 20;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.roundRect(this.x + 3, this.y + 3, this.width - 6, 4, 4);
      ctx.fill();
    }
  }

  class Item {
    constructor() {
      this.size = 30;
      this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
      this.y = -this.size;
      this.speed = Math.random() * 2 + 2 + (score / 500);
      this.type = Math.random() < 0.85 ? 'diamond' : 'bomb';
      this.rotation = 0;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      this.trail = [];
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;

      // Trail effect
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 5) this.trail.shift();
    }

    draw() {
      // Draw trail
      const trailColor = this.type === 'diamond' ? CONFIG.colors.gold : CONFIG.colors.danger;
      this.trail.forEach((pos, i) => {
        const alpha = (i / this.trail.length) * 0.5;
        ctx.fillStyle = trailColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        if (!trailColor.includes('rgb')) {
          ctx.fillStyle = trailColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        }
        ctx.fillStyle = this.type === 'diamond' ? 
          `rgba(255, 215, 0, ${alpha})` : `rgba(255, 0, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size * 0.3 * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      if (this.type === 'diamond') {
        // Diamond with glow
        ctx.shadowColor = CONFIG.colors.gold;
        ctx.shadowBlur = 20;
        ctx.fillStyle = CONFIG.colors.gold;
        
        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, 0);
        ctx.lineTo(0, this.size / 2);
        ctx.lineTo(-this.size / 2, 0);
        ctx.closePath();
        ctx.fill();

        // Inner shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 4);
        ctx.lineTo(this.size / 6, 0);
        ctx.lineTo(0, this.size / 4);
        ctx.lineTo(-this.size / 6, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Bomb with glow
        ctx.shadowColor = CONFIG.colors.danger;
        ctx.shadowBlur = 25;
        ctx.fillStyle = CONFIG.colors.danger;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Fuse
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.quadraticCurveTo(5, -this.size / 2 - 8, 8, -this.size / 2 - 5);
        ctx.stroke();

        // Spark
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(8, -this.size / 2 - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  class Particle {
    constructor(x, y, color, speed = 5) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * speed * 2;
      this.vy = (Math.random() - 0.5) * speed * 2;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.01;
      this.color = color;
      this.size = Math.random() * 6 + 3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // gravity
      this.life -= this.decay;
    }

    draw() {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear and setup container
    container.innerHTML = `
      <div class="catch-game-wrapper" style="font-family: Satoshi, sans-serif; text-align: center;">
        <div class="game-ui" style="display: flex; justify-content: center; gap: 30px; margin-bottom: 15px; flex-wrap: wrap;">
          <div class="score-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid #ccff00; box-shadow: 0 0 15px rgba(204, 255, 0, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Score</span>
            <div id="catch-score" style="color: #ccff00; font-size: 28px; font-weight: 700; text-shadow: 0 0 10px rgba(204, 255, 0, 0.5);">0</div>
          </div>
          <div class="lives-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid #ff003c; box-shadow: 0 0 15px rgba(255, 0, 60, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Lives</span>
            <div id="catch-lives" style="color: #ff003c; font-size: 28px; font-weight: 700; text-shadow: 0 0 10px rgba(255, 0, 60, 0.5);">❤️❤️❤️</div>
          </div>
          <div class="combo-display" id="catch-combo-container" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); opacity: 0; transform: scale(0.8); transition: all 0.3s ease;">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Combo</span>
            <div id="catch-combo" style="color: #ffd700; font-size: 28px; font-weight: 700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">x1</div>
          </div>
        </div>
        <canvas id="catch-canvas" style="border-radius: 16px; box-shadow: 0 0 40px rgba(204, 255, 0, 0.15); max-width: 100%; cursor: none;"></canvas>
        <div class="game-controls" style="margin-top: 15px; color: #666; font-size: 14px;">
          Use ← → arrows or touch/drag to move • Catch diamonds • Avoid bombs!
        </div>
      </div>
    `;

    canvas = document.getElementById('catch-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvasWidth;
    canvas.height = CONFIG.canvasHeight;

    // Initialize game state
    basket = new Basket();
    items = [];
    particles = [];
    stars = Array.from({ length: 50 }, () => new Star());
    score = 0;
    lives = 3;
    combo = 0;
    comboTimer = 0;
    gameActive = true;
    frameCount = 0;
    shakeFrames = 0;
    shakeIntensity = 0;

    // Input handlers
    setupInput();

    // Start game loop
    gameLoop();
  }

  function setupInput() {
    // Keyboard
    let keys = {};
    document.addEventListener('keydown', (e) => {
      if (!gameActive) return;
      keys[e.key] = true;
      if (e.key === 'ArrowLeft') basket.targetX = Math.max(0, basket.targetX - 50);
      if (e.key === 'ArrowRight') basket.targetX = Math.min(canvas.width - basket.width, basket.targetX + 50);
    });

    // Touch/Mouse
    let isDragging = false;
    
    function handleMove(clientX) {
      if (!gameActive) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      basket.targetX = x - basket.width / 2;
    }

    canvas.addEventListener('mousedown', () => isDragging = true);
    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mousemove', (e) => isDragging && handleMove(e.clientX));
    
    canvas.addEventListener('touchstart', (e) => {
      isDragging = true;
      handleMove(e.touches[0].clientX);
      e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      if (isDragging) handleMove(e.touches[0].clientX);
      e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', () => isDragging = false);
  }

  function spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function triggerShake(intensity = 10, frames = 5) {
    shakeFrames = frames;
    shakeIntensity = intensity;
    if (window.GameEffects?.cameraShake) {
      window.GameEffects.cameraShake(canvas, intensity / 10);
    }
  }

  function updateComboDisplay() {
    const comboEl = document.getElementById('catch-combo-container');
    const comboText = document.getElementById('catch-combo');
    
    if (combo >= 3) {
      comboEl.style.opacity = '1';
      comboEl.style.transform = 'scale(1)';
      comboText.textContent = `x${combo}`;
      
      // Pulse animation
      comboEl.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ], { duration: 300 });
    } else {
      comboEl.style.opacity = '0';
      comboEl.style.transform = 'scale(0.8)';
    }
  }

  function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);

    const finalScore = score;
    if (window.RankingSystem?.showSubmitModal) {
      window.RankingSystem.showSubmitModal('catch', finalScore, () => {
        // Restart option
        location.reload();
      });
    }

    if (window.GameEffects?.confettiBurst) {
      window.GameEffects.confettiBurst(canvas);
    }
  }

  function gameLoop() {
    if (!gameActive) return;

    // Clear with gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.height
    );
    gradient.addColorStop(0, CONFIG.colors.bgGradientStart);
    gradient.addColorStop(1, CONFIG.colors.bgGradientEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply screen shake
    ctx.save();
    if (shakeFrames > 0) {
      const dx = (Math.random() - 0.5) * shakeIntensity;
      const dy = (Math.random() - 0.5) * shakeIntensity;
      ctx.translate(dx, dy);
      shakeFrames--;
    }

    // Draw stars
    stars.forEach(star => star.draw());

    // Spawn items
    frameCount++;
    if (frameCount % CONFIG.spawnRate === 0) {
      items.push(new Item());
      // Increase difficulty
      if (CONFIG.spawnRate > 20) CONFIG.spawnRate -= 0.5;
    }

    // Update and draw items
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.update();
      item.draw();

      // Check collision with basket
      const dx = item.x - (basket.x + basket.width / 2);
      const dy = item.y - (basket.y + basket.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < item.size / 2 + basket.width / 2 && item.y < basket.y + basket.height) {
        // Caught!
        if (item.type === 'diamond') {
          combo++;
          comboTimer = 120;
          const points = 10 * Math.max(1, Math.floor(combo / 3));
          score += points;
          
          spawnParticles(item.x, item.y, CONFIG.colors.gold, 15);
          
          if (window.GameEffects?.scorePopAnimation) {
            window.GameEffects.scorePopAnimation(canvas, `+${points}`);
          }
          if (window.GameEffects?.hapticFeedback) {
            window.GameEffects.hapticFeedback();
          }
        } else {
          // Bomb hit!
          lives--;
          combo = 0;
          triggerShake(15, 8);
          spawnParticles(item.x, item.y, CONFIG.colors.danger, 20);
          
          if (window.GameEffects?.cameraShake) {
            window.GameEffects.cameraShake(canvas, 1.5);
          }
        }
        
        items.splice(i, 1);
        updateUI();
        updateComboDisplay();
        continue;
      }

      // Missed item
      if (item.y > canvas.height + item.size) {
        if (item.type === 'diamond') {
          combo = 0;
          updateComboDisplay();
        }
        items.splice(i, 1);
      }
    }

    // Update combo timer
    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer === 0 && combo > 0) {
        combo = Math.max(0, combo - 1);
        updateComboDisplay();
      }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Update and draw basket
    basket.update();
    basket.draw();

    ctx.restore();

    // Check game over
    if (lives <= 0) {
      gameOver();
      return;
    }

    animationId = requestAnimationFrame(gameLoop);
  }

  function updateUI() {
    const scoreEl = document.getElementById('catch-score');
    const livesEl = document.getElementById('catch-lives');
    
    if (scoreEl) scoreEl.textContent = score;
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
  }

  // Public API
  window.CatchGame = {
    init: initGame
  };
})();
