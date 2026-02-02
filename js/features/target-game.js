/**
 * TIRO AL BLANCO - Dispara a las obras que aparecen
 * Haz clic en los targets antes de que desaparezcan
 */
(function() {
  'use strict';

  const TARGET_CONFIG = {
    spawnInterval: 1200,
    targetLifetime: 2000,
    artworks: []
  };

  let targetState = {
    targets: [],
    score: 0,
    misses: 0,
    maxMisses: 5,
    timer: 60,
    interval: null,
    spawnInterval: null,
    gameOver: false
  };

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      TARGET_CONFIG.artworks = (data.artworks || data).map(a => a.image || a.src);
    } catch(e) {
      TARGET_CONFIG.artworks = [
        'images/optimized/amy-rocks.webp',
        'images/optimized/marilyn-rocks.webp'
      ];
    }
  }

  function initGame(container) {
    targetState = {
      targets: [],
      score: 0,
      misses: 0,
      maxMisses: 5,
      timer: 60,
      interval: null,
      spawnInterval: null,
      gameOver: false
    };

    container.innerHTML = `
      <div class="target-game">
        <div class="target-header">
          <span>Puntos: <strong id="target-score">0</strong></span>
          <span>❌ Fallos: <strong id="target-misses">0</strong>/${targetState.maxMisses}</span>
          <span>⏱️ <strong id="target-time">60</strong>s</span>
        </div>
        <div class="target-arena" id="target-arena"></div>
        <p class="target-hint">🎯 ¡Haz clic en las obras antes de que desaparezcan!</p>
      </div>
      <style>
        .target-game { text-align: center; padding: 1rem; }
        .target-header { display: flex; justify-content: space-around; margin-bottom: 1rem; font-size: 1.1rem; }
        .target-arena {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          overflow: hidden;
          cursor: crosshair;
        }
        .target-item {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #ffd700;
          background-size: cover;
          background-position: center;
          cursor: pointer;
          animation: targetPop 0.3s ease-out, targetPulse 0.5s ease-in-out infinite alternate;
          transition: transform 0.1s;
        }
        .target-item:hover { transform: scale(1.1); }
        .target-item.hit {
          animation: targetHit 0.3s ease-out forwards;
          pointer-events: none;
        }
        @keyframes targetPop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes targetPulse {
          from { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
          to { box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0); }
        }
        @keyframes targetHit {
          to { transform: scale(1.5); opacity: 0; }
        }
        .target-hint { color: rgba(255,255,255,0.6); margin: 1rem 0; }
      </style>
    `;

    const arena = document.getElementById('target-arena');
    
    // Spawn targets
    targetState.spawnInterval = setInterval(() => {
      if (!targetState.gameOver) spawnTarget(arena);
    }, TARGET_CONFIG.spawnInterval);

    // Timer
    targetState.interval = setInterval(() => {
      targetState.timer--;
      document.getElementById('target-time').textContent = targetState.timer;
      
      if (targetState.timer <= 0) {
        endGame();
      }
    }, 1000);

    // Initial spawn
    spawnTarget(arena);
  }

  function spawnTarget(arena) {
    const art = TARGET_CONFIG.artworks[Math.floor(Math.random() * TARGET_CONFIG.artworks.length)];
    
    const target = document.createElement('div');
    target.className = 'target-item';
    target.style.backgroundImage = `url(${art})`;
    target.style.left = (Math.random() * (arena.offsetWidth - 80)) + 'px';
    target.style.top = (Math.random() * (arena.offsetHeight - 80)) + 'px';

    target.addEventListener('click', () => hitTarget(target));
    
    arena.appendChild(target);
    targetState.targets.push(target);

    // Auto-remove after lifetime
    setTimeout(() => {
      if (target.parentNode && !target.classList.contains('hit')) {
        target.remove();
        targetState.misses++;
        document.getElementById('target-misses').textContent = targetState.misses;
        
        if (targetState.misses >= targetState.maxMisses) {
          endGame();
        }
      }
    }, TARGET_CONFIG.targetLifetime);
  }

  function hitTarget(target) {
    if (target.classList.contains('hit')) return;
    
    target.classList.add('hit');
    targetState.score += 100;
    document.getElementById('target-score').textContent = targetState.score;
    
    // Bonus for quick hits (under 1 second)
    const bonusPoints = Math.floor(Math.random() * 50);
    targetState.score += bonusPoints;
    
    setTimeout(() => target.remove(), 300);
  }

  function endGame() {
    targetState.gameOver = true;
    clearInterval(targetState.interval);
    clearInterval(targetState.spawnInterval);
    
    // Clear remaining targets
    document.querySelectorAll('.target-item').forEach(t => t.remove());
    
    setTimeout(() => {
      alert(`🎯 ¡Fin del juego!\nPuntuación: ${targetState.score}`);
      
      if (window.RankingSystem) {
        window.RankingSystem.submitScore('target', targetState.score);
      }
    }, 100);
  }

  window.initTargetGame = async function(container) {
    await loadArtworks();
    initGame(container);
  };
})();
