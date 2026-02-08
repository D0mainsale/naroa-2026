// === FILE: js/features/memory-game.js ===
// Premium Memory Game - Match artwork pairs
// Features: 3D flip animations, match glow burst, timer urgency, move counter, particle effects

(function() {
  'use strict';

  const CONFIG = {
    colors: {
      primary: '#ccff00',
      danger: '#ff003c',
      info: '#3b82f6',
      gold: '#ffd700',
      bg: '#0d0d1a',
      cardBg: '#1a1a2e',
      cardBack: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)'
    },
    flipDuration: 600,
    matchDelay: 500,
    gridCols: 4
  };

  let artworks = [];
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let timer = 0;
  let timerInterval;
  let gameActive = false;
  let particles = [];

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10 - 5;
      this.life = 1;
      this.decay = 0.02;
      this.color = color;
      this.size = Math.random() * 8 + 4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  async function loadArtworks() {
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      return data.artworks.slice(0, 8); // Get 8 artworks for 16 cards
    } catch (error) {
      console.error('Failed to load artworks:', error);
      return generateFallbackArtworks();
    }
  }

  function generateFallbackArtworks() {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      title: `Artwork ${i + 1}`,
      series: 'Series',
      technique: 'Mixed Media'
    }));
  }

  function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function createCard(artwork, index) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = index;
    card.dataset.artworkId = artwork.id;
    
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <div class="card-artwork">
            <div class="artwork-placeholder" style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: linear-gradient(135deg, ${CONFIG.colors.primary}, ${CONFIG.colors.info});
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: 700;
              color: #000;
              box-shadow: 0 0 20px rgba(204, 255, 0, 0.4);
            ">${artwork.title.charAt(0)}</div>
          </div>
          <div class="artwork-info" style="text-align: center; margin-top: 10px;">
            <div class="artwork-title" style="font-size: 12px; font-weight: 600; color: #fff; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${artwork.title}</div>
            <div class="artwork-series" style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">${artwork.series}</div>
          </div>
        </div>
        <div class="card-back">
          <div class="card-logo" style="font-size: 48px; color: ${CONFIG.colors.primary}; text-shadow: 0 0 20px ${CONFIG.colors.primary};">?</div>
          <div class="card-hint" style="font-size: 10px; color: #666; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px;">Click to Flip</div>
        </div>
      </div>
    `;

    // Add styles
    card.style.cssText = `
      width: 140px;
      height: 180px;
      perspective: 1000px;
      cursor: pointer;
      position: relative;
    `;

    const cardInner = card.querySelector('.card-inner');
    cardInner.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform ${CONFIG.flipDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1);
    `;

    const cardFront = card.querySelector('.card-front');
    cardFront.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #1a1a2e 0%, #252540 100%);
      border-radius: 16px;
      border: 2px solid ${CONFIG.colors.gold};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
    `;

    const cardBack = card.querySelector('.card-back');
    cardBack.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
      border-radius: 16px;
      border: 2px solid ${CONFIG.colors.primary};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(204, 255, 0, 0.1);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    `;

    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('flipped')) {
        cardBack.style.boxShadow = `0 0 30px ${CONFIG.colors.primary}40`;
        cardBack.style.borderColor = CONFIG.colors.gold;
      }
    });

    card.addEventListener('mouseleave', () => {
      cardBack.style.boxShadow = '0 0 20px rgba(204, 255, 0, 0.1)';
      cardBack.style.borderColor = CONFIG.colors.primary;
    });

    card.addEventListener('click', () => handleCardClick(card));

    return card;
  }

  function handleCardClick(card) {
    if (!gameActive || card.classList.contains('flipped') || 
        card.classList.contains('matched') || flippedCards.length >= 2) {
      return;
    }

    // Flip animation
    card.classList.add('flipped');
    const inner = card.querySelector('.card-inner');
    inner.style.transform = 'rotateY(180deg)';
    
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      updateUI();
      checkMatch();
    }
  }

  function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.artworkId === card2.dataset.artworkId;

    if (match) {
      matchedPairs++;
      
      // Match effects
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        // Glow burst effect
        [card1, card2].forEach(card => {
          const rect = card.getBoundingClientRect();
          const container = document.getElementById('memory-container');
          const containerRect = container.getBoundingClientRect();
          
          // Create particle burst
          createParticleBurst(
            rect.left - containerRect.left + rect.width / 2,
            rect.top - containerRect.top + rect.height / 2,
            CONFIG.colors.gold
          );

          // Glow animation
          const inner = card.querySelector('.card-inner');
          inner.animate([
            { boxShadow: `0 0 30px ${CONFIG.colors.gold}40` },
            { boxShadow: `0 0 60px ${CONFIG.colors.gold}80` },
            { boxShadow: `0 0 30px ${CONFIG.colors.gold}40` }
          ], { duration: 600 });
        });

        if (window.GameEffects?.confettiBurst) {
          window.GameEffects.confettiBurst(card1);
        }
        if (window.GameEffects?.scorePopAnimation) {
          window.GameEffects.scorePopAnimation(card1, 'MATCH!');
        }
        if (window.GameEffects?.hapticFeedback) {
          window.GameEffects.hapticFeedback();
        }

        flippedCards = [];

        if (matchedPairs === artworks.length) {
          endGame();
        }
      }, CONFIG.matchDelay);
    } else {
      // No match - shake and flip back
      setTimeout(() => {
        flippedCards.forEach(card => {
          const inner = card.querySelector('.card-inner');
          inner.animate([
            { transform: 'rotateY(180deg) translateX(0)' },
            { transform: 'rotateY(180deg) translateX(-10px)' },
            { transform: 'rotateY(180deg) translateX(10px)' },
            { transform: 'rotateY(180deg) translateX(-10px)' },
            { transform: 'rotateY(180deg) translateX(0)' }
          ], { duration: 400 });
        });

        if (window.GameEffects?.cameraShake) {
          window.GameEffects.cameraShake(document.querySelector('.memory-grid'), 0.3);
        }
      }, CONFIG.matchDelay);

      setTimeout(() => {
        flippedCards.forEach(card => {
          card.classList.remove('flipped');
          const inner = card.querySelector('.card-inner');
          inner.style.transform = 'rotateY(0deg)';
        });
        flippedCards = [];
      }, CONFIG.matchDelay + 400);
    }
  }

  function createParticleBurst(x, y, color) {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    for (let i = 0; i < 20; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function updateTimer() {
    timer++;
    const timerEl = document.getElementById('memory-timer');
    if (timerEl) {
      const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
      const seconds = (timer % 60).toString().padStart(2, '0');
      timerEl.textContent = `${minutes}:${seconds}`;
      
      // Urgency effect
      if (timer > 60) {
        timerEl.style.color = CONFIG.colors.danger;
        timerEl.style.animation = 'pulse 1s infinite';
        document.querySelector('.timer-display')?.classList.add('urgent');
      }
    }
  }

  function updateUI() {
    const movesEl = document.getElementById('memory-moves');
    const pairsEl = document.getElementById('memory-pairs');
    
    if (movesEl) movesEl.textContent = moves;
    if (pairsEl) pairsEl.textContent = `${matchedPairs}/${artworks.length}`;
  }

  function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    const finalScore = Math.max(1000 - moves * 10 - timer * 2, 100);

    if (window.GameEffects?.confettiBurst) {
      window.GameEffects.confettiBurst(document.querySelector('.memory-grid'));
    }

    setTimeout(() => {
      if (window.RankingSystem?.showSubmitModal) {
        window.RankingSystem.showSubmitModal('memory', finalScore);
      }
    }, 1000);
  }

  async function initGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    artworks = await loadArtworks();
    const cardData = shuffle([...artworks, ...artworks]);

    container.innerHTML = `
      <div class="memory-game-wrapper" style="font-family: Satoshi, sans-serif; text-align: center; position: relative;">
        <div class="game-ui" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="timer-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid ${CONFIG.colors.info}; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</span>
            <div id="memory-timer" style="color: ${CONFIG.colors.info}; font-size: 28px; font-weight: 700; font-family: monospace;">00:00</div>
          </div>
          <div class="moves-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid ${CONFIG.colors.primary}; box-shadow: 0 0 15px rgba(204, 255, 0, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Moves</span>
            <div id="memory-moves" style="color: ${CONFIG.colors.primary}; font-size: 28px; font-weight: 700;">0</div>
          </div>
          <div class="pairs-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 12px 25px; border-radius: 12px; border: 1px solid ${CONFIG.colors.gold}; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);">
            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Pairs</span>
            <div id="memory-pairs" style="color: ${CONFIG.colors.gold}; font-size: 28px; font-weight: 700;">0/${artworks.length}</div>
          </div>
        </div>
        <div class="memory-grid" style="display: grid; grid-template-columns: repeat(${CONFIG.gridCols}, 140px); gap: 15px; justify-content: center; perspective: 1000px;"></div>
        <canvas id="particle-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"></canvas>
      </div>
    `;

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .urgent {
        animation: pulse 0.5s infinite;
        border-color: ${CONFIG.colors.danger} !important;
        box-shadow: 0 0 20px ${CONFIG.colors.danger}60 !important;
      }
    `;
    document.head.appendChild(style);

    const grid = container.querySelector('.memory-grid');
    cardData.forEach((artwork, index) => {
      const card = createCard(artwork, index);
      grid.appendChild(card);
      cards.push(card);
    });

    // Setup particle canvas
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(i, 1);
      }
      
      if (gameActive || particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    }
    animateParticles();

    gameActive = true;
    timerInterval = setInterval(updateTimer, 1000);
  }

  // Public API
  window.MemoryGame = {
    init: initGame
  };
})();
