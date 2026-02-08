// === FILE: js/features/simon-game.js ===
// Premium Simon Game - Pattern memory with artwork buttons
// Features: Neon button flash, Web Audio API, pattern visualizer, level counter

(function() {
  'use strict';

  const CONFIG = {
    colors: {
      primary: '#ccff00',
      danger: '#ff003c',
      info: '#3b82f6',
      gold: '#ffd700',
      purple: '#a855f7',
      bg: '#0d0d1a'
    },
    baseDelay: 800,
    minDelay: 300,
    frequencies: [329.63, 440, 554.37, 659.25] // E4, A4, C#5, E5
  };

  let audioContext;
  let pattern = [];
  let playerPattern = [];
  let level = 0;
  let gameActive = false;
  let acceptingInput = false;
  let buttons = [];
  let patternVisualizer = [];

  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playTone(frequency, duration = 300) {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }

  function playErrorSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 150;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  function createButton(index, color, frequency) {
    const button = document.createElement('div');
    button.className = 'simon-button';
    button.dataset.index = index;
    
    const colorMap = {
      [CONFIG.colors.primary]: 'primary',
      [CONFIG.colors.danger]: 'danger',
      [CONFIG.colors.info]: 'info',
      [CONFIG.colors.gold]: 'gold'
    };

    button.innerHTML = `
      <div class="button-inner" style="
        width: 100%;
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(145deg, ${color}20, ${color}10);
        border: 3px solid ${color}40;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        position: relative;
        overflow: hidden;
      ">
        <div class="button-icon" style="
          font-size: 40px;
          color: ${color};
          text-shadow: 0 0 20px ${color}80;
          transition: all 0.15s ease;
        ">${['▲', '▼', '◀', '▶'][index]}</div>
        <div class="button-label" style="
          font-size: 12px;
          color: ${color}80;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">${['Up', 'Down', 'Left', 'Right'][index]}</div>
        <div class="button-glow" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: ${color};
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
          filter: blur(30px);
        "></div>
      </div>
    `;

    button.style.cssText = `
      width: 140px;
      height: 140px;
      cursor: pointer;
      position: relative;
    `;

    function activate() {
      const inner = button.querySelector('.button-inner');
      const icon = button.querySelector('.button-icon');
      const glow = button.querySelector('.button-glow');
      
      inner.style.borderColor = color;
      inner.style.background = `linear-gradient(145deg, ${color}60, ${color}30)`;
      inner.style.boxShadow = `0 0 40px ${color}60, inset 0 0 40px ${color}30`;
      icon.style.transform = 'scale(1.2)';
      icon.style.textShadow = `0 0 40px ${color}`;
      glow.style.width = '150px';
      glow.style.height = '150px';
      glow.style.opacity = '0.6';
      
      playTone(frequency, 300);
      
      if (window.GameEffects?.hapticFeedback) {
        window.GameEffects.hapticFeedback();
      }
    }

    function deactivate() {
      const inner = button.querySelector('.button-inner');
      const icon = button.querySelector('.button-icon');
      const glow = button.querySelector('.button-glow');
      
      inner.style.borderColor = `${color}40`;
      inner.style.background = `linear-gradient(145deg, ${color}20, ${color}10)`;
      inner.style.boxShadow = 'none';
      icon.style.transform = 'scale(1)';
      icon.style.textShadow = `0 0 20px ${color}80`;
      glow.style.width = '0';
      glow.style.height = '0';
      glow.style.opacity = '0';
    }

    button.activate = activate;
    button.deactivate = deactivate;
    button.frequency = frequency;

    button.addEventListener('mousedown', () => {
      if (!acceptingInput) return;
      activate();
    });

    button.addEventListener('mouseup', () => {
      if (!acceptingInput) return;
      deactivate();
      handlePlayerInput(index);
    });

    button.addEventListener('mouseleave', () => {
      if (acceptingInput) deactivate();
    });

    // Touch support
    button.addEventListener('touchstart', (e) => {
      if (!acceptingInput) return;
      e.preventDefault();
      activate();
    });

    button.addEventListener('touchend', (e) => {
      if (!acceptingInput) return;
      e.preventDefault();
      deactivate();
      handlePlayerInput(index);
    });

    return button;
  }

  function handlePlayerInput(index) {
    if (!acceptingInput) return;

    playerPattern.push(index);
    const currentIndex = playerPattern.length - 1;

    if (playerPattern[currentIndex] !== pattern[currentIndex]) {
      gameOver();
      return;
    }

    // Correct input feedback
    updatePatternVisualizer(currentIndex, true);

    if (playerPattern.length === pattern.length) {
      acceptingInput = false;
      
      if (window.GameEffects?.scorePopAnimation) {
        const levelEl = document.getElementById('simon-level');
        window.GameEffects.scorePopAnimation(levelEl, 'GOOD!');
      }
      if (window.GameEffects?.confettiBurst) {
        window.GameEffects.confettiBurst(document.querySelector('.simon-controls'));
      }

      setTimeout(() => {
        nextLevel();
      }, 1000);
    }
  }

  function updatePatternVisualizer(index, isPlayer = false) {
    const dots = document.querySelectorAll('.pattern-dot');
    if (dots[index]) {
      dots[index].style.background = isPlayer ? CONFIG.colors.gold : CONFIG.colors.primary;
      dots[index].style.boxShadow = `0 0 15px ${isPlayer ? CONFIG.colors.gold : CONFIG.colors.primary}`;
      dots[index].animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' }
      ], { duration: 300 });
    }
  }

  function renderPatternVisualizer() {
    const container = document.getElementById('pattern-visualizer');
    if (!container) return;

    container.innerHTML = pattern.map((_, i) => `
      <div class="pattern-dot" style="
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${CONFIG.colors.info}40;
        border: 2px solid ${CONFIG.colors.info}60;
        transition: all 0.3s ease;
      "></div>
    `).join('');
  }

  async function playPattern() {
    acceptingInput = false;
    document.querySelector('.simon-status').textContent = 'Watch the pattern...';
    document.querySelector('.simon-status').style.color = CONFIG.colors.info;

    const delay = Math.max(CONFIG.minDelay, CONFIG.baseDelay - level * 30);

    for (let i = 0; i < pattern.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay / 2));
      
      const buttonIndex = pattern[i];
      buttons[buttonIndex].activate();
      updatePatternVisualizer(i);
      
      await new Promise(resolve => setTimeout(resolve, delay / 2));
      buttons[buttonIndex].deactivate();
    }

    // Reset visualizer
    document.querySelectorAll('.pattern-dot').forEach(dot => {
      dot.style.background = `${CONFIG.colors.info}40`;
      dot.style.boxShadow = 'none';
    });

    acceptingInput = true;
    playerPattern = [];
    document.querySelector('.simon-status').textContent = 'Your turn! Repeat the pattern';
    document.querySelector('.simon-status').style.color = CONFIG.colors.primary;
  }

  function nextLevel() {
    level++;
    document.getElementById('simon-level').textContent = level;
    
    // Add new step
    pattern.push(Math.floor(Math.random() * 4));
    renderPatternVisualizer();
    
    // Animate level up
    const levelDisplay = document.querySelector('.level-display');
    levelDisplay.animate([
      { transform: 'scale(1)', boxShadow: `0 0 20px ${CONFIG.colors.gold}40` },
      { transform: 'scale(1.1)', boxShadow: `0 0 40px ${CONFIG.colors.gold}80` },
      { transform: 'scale(1)', boxShadow: `0 0 20px ${CONFIG.colors.gold}40` }
    ], { duration: 400 });

    setTimeout(playPattern, 800);
  }

  function startGame() {
    initAudio();
    pattern = [];
    playerPattern = [];
    level = 0;
    gameActive = true;
    
    document.getElementById('simon-start').style.display = 'none';
    document.querySelector('.simon-status').style.display = 'block';
    
    nextLevel();
  }

  function gameOver() {
    gameActive = false;
    acceptingInput = false;
    playErrorSound();

    // Flash all buttons red
    buttons.forEach(btn => {
      btn.querySelector('.button-inner').style.borderColor = CONFIG.colors.danger;
      btn.querySelector('.button-inner').style.boxShadow = `0 0 40px ${CONFIG.colors.danger}`;
    });

    if (window.GameEffects?.cameraShake) {
      window.GameEffects.cameraShake(document.querySelector('.simon-grid'), 1);
    }

    document.querySelector('.simon-status').textContent = 'Game Over!';
    document.querySelector('.simon-status').style.color = CONFIG.colors.danger;

    setTimeout(() => {
      buttons.forEach(btn => btn.deactivate());
      
      const finalScore = level * 100;
      if (window.RankingSystem?.showSubmitModal) {
        window.RankingSystem.showSubmitModal('simon', finalScore, () => {
          document.getElementById('simon-start').style.display = 'inline-block';
          document.querySelector('.simon-status').style.display = 'none';
        });
      }
    }, 1000);
  }

  function initGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="simon-game-wrapper" style="font-family: Satoshi, sans-serif; text-align: center;">
        <div class="game-ui" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; flex-wrap: wrap;">
          <div class="level-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 30px; border-radius: 12px; border: 1px solid ${CONFIG.colors.gold}; box-shadow: 0 0 20px ${CONFIG.colors.gold}40;">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Level</span>
            <div id="simon-level" style="color: ${CONFIG.colors.gold}; font-size: 32px; font-weight: 700; text-shadow: 0 0 15px ${CONFIG.colors.gold}60;">0</div>
          </div>
        </div>
        
        <div class="simon-grid" style="display: grid; grid-template-columns: repeat(2, 140px); gap: 20px; justify-content: center; margin-bottom: 25px;"></div>
        
        <div id="pattern-visualizer" style="display: flex; justify-content: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; max-width: 300px; margin-left: auto; margin-right: auto;"></div>
        
        <div class="simon-status" style="color: ${CONFIG.colors.info}; font-size: 16px; font-weight: 600; margin-bottom: 20px; min-height: 24px; display: none;">Watch the pattern...</div>
        
        <button id="simon-start" style="
          background: linear-gradient(135deg, ${CONFIG.colors.primary}, #88cc00);
          color: #000;
          border: none;
          padding: 15px 40px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 30px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 0 30px ${CONFIG.colors.primary}60;
          transition: all 0.3s ease;
          font-family: Satoshi, sans-serif;
        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 40px ${CONFIG.colors.primary}80'" 
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 30px ${CONFIG.colors.primary}60'">Start Game</button>
      </div>
    `;

    const grid = container.querySelector('.simon-grid');
    const colors = [CONFIG.colors.primary, CONFIG.colors.danger, CONFIG.colors.info, CONFIG.colors.gold];
    
    colors.forEach((color, index) => {
      const button = createButton(index, color, CONFIG.frequencies[index]);
      grid.appendChild(button);
      buttons.push(button);
    });

    document.getElementById('simon-start').addEventListener('click', startGame);
  }

  // Public API
  window.SimonGame = {
    init: initGame
  };
})();
