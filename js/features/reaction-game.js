// === FILE: js/features/reaction-game.js ===
// Premium Reaction Time Test
// Features: Zone color pulse, countdown tension, hit feedback flash, leaderboard, visual ms counter

(function() {
  'use strict';

  const CONFIG = {
    minDelay: 1500,
    maxDelay: 4000,
    timeout: 3000,
    colors: {
      primary: '#ccff00',
      danger: '#ff003c',
      info: '#3b82f6',
      gold: '#ffd700',
      warning: '#f59e0b',
      success: '#10b981',
      bg: '#0d0d1a'
    }
  };

  let gameState = 'idle'; // idle, waiting, ready, result
  let startTime = 0;
  let reactionTime = 0;
  let attempts = [];
  let bestTime = localStorage.getItem('reactionBest') ? parseInt(localStorage.getItem('reactionBest')) : null;
  let countdownInterval;
  let timeoutId;
  let particles = [];

  class Particle {
    constructor(x, y, color, velocity = 8) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * velocity * 2;
      this.vy = (Math.random() - 0.5) * velocity * 2;
      this.life = 1;
      this.decay = Math.random() * 0.03 + 0.02;
      this.color = color;
      this.size = Math.random() * 10 + 5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.size *= 0.98;
    }

    draw(ctx) {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function getRating(ms) {
    if (ms < 200) return { text: 'GODLIKE!', color: CONFIG.colors.gold, emoji: '⚡' };
    if (ms < 250) return { text: 'AMAZING!', color: CONFIG.colors.success, emoji: '🚀' };
    if (ms < 300) return { text: 'GREAT!', color: CONFIG.colors.primary, emoji: '👍' };
    if (ms < 400) return { text: 'GOOD', color: CONFIG.colors.info, emoji: '✓' };
    if (ms < 500) return { text: 'OKAY', color: CONFIG.colors.warning, emoji: '😐' };
    return { text: 'TOO SLOW', color: CONFIG.colors.danger, emoji: '🐌' };
  }

  function createParticles(x, y, color) {
    const canvas = document.getElementById('reaction-particles');
    if (!canvas) return;
    
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animateParticles() {
    if (particles.length === 0) return;

    const canvas = document.getElementById('reaction-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  }

  function updateZoneColor(state) {
    const zone = document.getElementById('reaction-zone');
    if (!zone) return;

    const colorMap = {
      idle: { border: CONFIG.colors.info + '40', bg: CONFIG.colors.info + '05', glow: 'transparent' },
      waiting: { border: CONFIG.colors.warning + '60', bg: CONFIG.colors.warning + '10', glow: CONFIG.colors.warning + '20' },
      ready: { border: CONFIG.colors.success, bg: CONFIG.colors.success + '20', glow: CONFIG.colors.success + '60' },
      result: { border: CONFIG.colors.primary, bg: CONFIG.colors.primary + '10', glow: CONFIG.colors.primary + '40' }
    };

    const colors = colorMap[state];
    zone.style.borderColor = colors.border;
    zone.style.background = colors.bg;
    zone.style.boxShadow = `0 0 ${state === 'ready' ? '60px' : '30px'} ${colors.glow}, inset 0 0 ${state === 'ready' ? '40px' : '20px'} ${colors.glow}`;
  }

  function pulseZone() {
    const zone = document.getElementById('reaction-zone');
    if (!zone || gameState !== 'waiting') return;

    zone.animate([
      { transform: 'scale(1)', boxShadow: `0 0 30px ${CONFIG.colors.warning}20` },
      { transform: 'scale(1.02)', boxShadow: `0 0 50px ${CONFIG.colors.warning}40` },
      { transform: 'scale(1)', boxShadow: `0 0 30px ${CONFIG.colors.warning}20` }
    ], { duration: 800 });
  }

  function startCountdown() {
    gameState = 'waiting';
    updateZoneColor('waiting');

    const countdownEl = document.getElementById('countdown-text');
    const instructionEl = document.getElementById('instruction-text');
    const msDisplay = document.getElementById('ms-counter');
    
    countdownEl.style.display = 'block';
    instructionEl.textContent = 'Wait for green...';
    instructionEl.style.color = CONFIG.colors.warning;
    msDisplay.style.display = 'none';

    // Pulse animation while waiting
    const pulseInterval = setInterval(pulseZone, 800);

    const delay = Math.random() * (CONFIG.maxDelay - CONFIG.minDelay) + CONFIG.minDelay;

    timeoutId = setTimeout(() => {
      clearInterval(pulseInterval);
      gameState = 'ready';
      startTime = performance.now();
      updateZoneColor('ready');

      countdownEl.style.display = 'none';
      instructionEl.textContent = 'CLICK NOW!';
      instructionEl.style.color = CONFIG.colors.success;
      
      // Flash effect
      const zone = document.getElementById('reaction-zone');
      zone.style.animation = 'flash 0.2s ease';
      setTimeout(() => zone.style.animation = '', 200);

      // Start ms counter
      msDisplay.style.display = 'block';
      updateMsCounter();

      // Timeout for too slow
      timeoutId = setTimeout(() => {
        if (gameState === 'ready') {
          handleTooSlow();
        }
      }, CONFIG.timeout);
    }, delay);
  }

  function updateMsCounter() {
    if (gameState !== 'ready') return;
    
    const msDisplay = document.getElementById('ms-counter');
    const elapsed = Math.floor(performance.now() - startTime);
    msDisplay.textContent = `${elapsed}ms`;
    
    // Color based on time
    if (elapsed < 200) msDisplay.style.color = CONFIG.colors.gold;
    else if (elapsed < 300) msDisplay.style.color = CONFIG.colors.success;
    else if (elapsed < 400) msDisplay.style.color = CONFIG.colors.primary;
    else msDisplay.style.color = CONFIG.colors.warning;
    
    requestAnimationFrame(updateMsCounter);
  }

  function handleClick(e) {
    if (gameState === 'idle' || gameState === 'result') {
      startGame();
    } else if (gameState === 'waiting') {
      // Too early!
      clearTimeout(timeoutId);
      handleTooEarly();
    } else if (gameState === 'ready') {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      reactionTime = Math.floor(endTime - startTime);
      handleResult(reactionTime, e);
    }
  }

  function handleTooEarly() {
    gameState = 'result';
    updateZoneColor('result');

    const instructionEl = document.getElementById('instruction-text');
    const resultEl = document.getElementById('result-display');
    
    instructionEl.textContent = 'Too early!';
    instructionEl.style.color = CONFIG.colors.danger;
    
    resultEl.innerHTML = `
      <div style="color: ${CONFIG.colors.danger}; font-size: 48px; font-weight: 700; text-shadow: 0 0 20px ${CONFIG.colors.danger};">❌</div>
      <div style="color: #888; font-size: 16px; margin-top: 10px;">Wait for green!</div>
    `;
    resultEl.style.display = 'block';
    document.getElementById('ms-counter').style.display = 'none';

    if (window.GameEffects?.cameraShake) {
      window.GameEffects.cameraShake(document.getElementById('reaction-zone'), 0.5);
    }

    gameState = 'idle';
    setTimeout(() => {
      resultEl.style.display = 'none';
      resetDisplay();
    }, 1500);
  }

  function handleTooSlow() {
    gameState = 'result';
    updateZoneColor('result');

    const instructionEl = document.getElementById('instruction-text');
    const resultEl = document.getElementById('result-display');
    
    instructionEl.textContent = 'Too slow!';
    instructionEl.style.color = CONFIG.colors.danger;
    
    resultEl.innerHTML = `
      <div style="color: ${CONFIG.colors.danger}; font-size: 48px; font-weight: 700; text-shadow: 0 0 20px ${CONFIG.colors.danger};">🐌</div>
      <div style="color: #888; font-size: 16px; margin-top: 10px;">${CONFIG.timeout}ms+</div>
    `;
    resultEl.style.display = 'block';
    document.getElementById('ms-counter').style.display = 'none';

    if (window.GameEffects?.cameraShake) {
      window.GameEffects.cameraShake(document.getElementById('reaction-zone'), 0.5);
    }

    attempts.push(CONFIG.timeout);
    updateStats();

    gameState = 'idle';
    setTimeout(() => {
      resultEl.style.display = 'none';
      resetDisplay();
    }, 2000);
  }

  function handleResult(time, e) {
    gameState = 'result';
    updateZoneColor('result');

    attempts.push(time);
    
    // Check best
    if (!bestTime || time < bestTime) {
      bestTime = time;
      localStorage.setItem('reactionBest', bestTime);
      updateBestDisplay();
    }

    const rating = getRating(time);
    const instructionEl = document.getElementById('instruction-text');
    const resultEl = document.getElementById('result-display');
    
    instructionEl.textContent = rating.text;
    instructionEl.style.color = rating.color;
    
    resultEl.innerHTML = `
      <div style="color: ${rating.color}; font-size: 64px; font-weight: 700; text-shadow: 0 0 30px ${rating.color}80; animation: popIn 0.3s ease;">${time}<span style="font-size: 24px;">ms</span></div>
      <div style="color: ${rating.color}; font-size: 32px; margin-top: 5px;">${rating.emoji}</div>
    `;
    resultEl.style.display = 'block';
    document.getElementById('ms-counter').style.display = 'none';

    // Particles at click position
    const rect = e.target.getBoundingClientRect();
    const container = document.getElementById('reaction-container');
    const containerRect = container.getBoundingClientRect();
    createParticles(e.clientX - containerRect.left, e.clientY - containerRect.top, rating.color);
    animateParticles();

    // Effects
    if (time < 250 && window.GameEffects?.confettiBurst) {
      window.GameEffects.confettiBurst(document.getElementById('reaction-zone'));
    }
    if (window.GameEffects?.scorePopAnimation) {
      window.GameEffects.scorePopAnimation(resultEl, rating.text);
    }
    if (window.GameEffects?.hapticFeedback) {
      window.GameEffects.hapticFeedback();
    }

    updateStats();

    gameState = 'idle';
    setTimeout(() => {
      resultEl.style.display = 'none';
      resetDisplay();
    }, 2500);
  }

  function resetDisplay() {
    const instructionEl = document.getElementById('instruction-text');
    instructionEl.textContent = 'Click to start';
    instructionEl.style.color = '#888';
    updateZoneColor('idle');
  }

  function updateStats() {
    const avgEl = document.getElementById('avg-time');
    const attemptsEl = document.getElementById('attempts-count');
    
    if (attempts.length > 0) {
      const avg = Math.floor(attempts.reduce((a, b) => a + b, 0) / attempts.length);
      avgEl.textContent = `${avg}ms`;
      avgEl.style.color = getRating(avg).color;
    }
    attemptsEl.textContent = attempts.length;
  }

  function updateBestDisplay() {
    const bestEl = document.getElementById('best-time');
    if (bestTime) {
      bestEl.textContent = `${bestTime}ms`;
      bestEl.style.color = getRating(bestTime).color;
    }
  }

  function startGame() {
    if (gameState !== 'idle') return;
    startCountdown();
  }

  function showLeaderboard() {
    if (window.RankingSystem?.renderLeaderboard) {
      window.RankingSystem.renderLeaderboard('reaction', 'leaderboard-modal');
    }
  }

  function initGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="reaction-container" class="reaction-game-wrapper" style="font-family: Satoshi, sans-serif; text-align: center; position: relative;">
        <div class="game-ui" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
          <div class="stat-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 20px; border-radius: 12px; border: 1px solid ${CONFIG.colors.gold}; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);">
            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Best</span>
            <div id="best-time" style="color: ${CONFIG.colors.gold}; font-size: 22px; font-weight: 700;">--</div>
          </div>
          <div class="stat-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 20px; border-radius: 12px; border: 1px solid ${CONFIG.colors.info}; box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);">
            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Average</span>
            <div id="avg-time" style="color: ${CONFIG.colors.info}; font-size: 22px; font-weight: 700;">--</div>
          </div>
          <div class="stat-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 20px; border-radius: 12px; border: 1px solid ${CONFIG.colors.primary}; box-shadow: 0 0 15px rgba(204, 255, 0, 0.2);">
            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Attempts</span>
            <div id="attempts-count" style="color: ${CONFIG.colors.primary}; font-size: 22px; font-weight: 700;">0</div>
          </div>
        </div>

        <div id="reaction-zone" style="
          width: 300px;
          height: 300px;
          margin: 0 auto 25px;
          border-radius: 50%;
          border: 4px solid ${CONFIG.colors.info}40;
          background: ${CONFIG.colors.info}05;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          user-select: none;
        " onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'" onmouseleave="this.style.transform='scale(1)'">
          
          <div id="countdown-text" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 72px; font-weight: 700; color: ${CONFIG.colors.warning}; text-shadow: 0 0 30px ${CONFIG.colors.warning}60;">...</div>
          
          <div id="result-display" style="display: none; text-align: center;"></div>
          
          <div id="instruction-text" style="font-size: 18px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; transition: color 0.3s ease;">Click to start</div>
          
          <div id="ms-counter" style="display: none; position: absolute; bottom: 80px; font-size: 36px; font-weight: 700; font-family: monospace; text-shadow: 0 0 20px currentColor;">0ms</div>
        </div>

        <div class="reaction-guide" style="color: #666; font-size: 13px; margin-bottom: 20px; line-height: 1.6;">
          <div style="margin-bottom: 5px;"><span style="color: ${CONFIG.colors.gold};">⚡ <200ms</span> Godlike • <span style="color: ${CONFIG.colors.success};"><250ms</span> Amazing • <span style="color: ${CONFIG.colors.primary};"><300ms</span> Great</div>
          <div><span style="color: ${CONFIG.colors.info};"><400ms</span> Good • <span style="color: ${CONFIG.colors.warning};"><500ms</span> Okay • <span style="color: ${CONFIG.colors.danger};">500ms+</span> Slow</div>
        </div>

        <button id="leaderboard-btn" style="
          background: transparent;
          color: ${CONFIG.colors.info};
          border: 2px solid ${CONFIG.colors.info}60;
          padding: 12px 30px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 25px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          font-family: Satoshi, sans-serif;
        " onmouseover="this.style.background='${CONFIG.colors.info}20'; this.style.borderColor='${CONFIG.colors.info}'; this.style.boxShadow='0 0 20px ${CONFIG.colors.info}40'" 
        onmouseout="this.style.background='transparent'; this.style.borderColor='${CONFIG.colors.info}60'; this.style.boxShadow='none'">View Leaderboard</button>

        <canvas id="reaction-particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"></canvas>
      </div>
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.5); }
      }
      @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        70% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Setup particle canvas
    const canvas = document.getElementById('reaction-particles');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Event listeners
    const zone = document.getElementById('reaction-zone');
    zone.addEventListener('click', handleClick);
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleClick(e);
    });

    document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);

    // Load best time
    updateBestDisplay();
  }

  // Public API
  window.ReactionGame = {
    init: initGame
  };
})();
