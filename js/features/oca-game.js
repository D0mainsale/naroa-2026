/**
 * Juego de la Oca Artístico - Naroa 2026
 * @module features/oca-game
 * @description Interactive board game to explore Naroa's artwork collection
 */

(function() {
  'use strict';

  // ===========================================
  // GAME CONFIGURATION
  // ===========================================
  
  const SPECIAL_TILES = {
    OCA: [6, 12, 18, 26, 32, 40, 48],      // "De oca a oca" - jump tiles
    PUENTE: [13, 27],                       // Bridge - +3 tiles
    CALAVERA: [21, 38],                     // Skull - -2 tiles
    FEATURED: [1, 10, 25, 35, 45, 52]       // Featured works - show details
  };

  const SERIES_ICONS = {
    'rocks': '🎸',
    'tributos-musicales': '🎵',
    'espejos-del-alma': '🪞',
    'en-lata-das': '🥫',
    'golden': '✨',
    'amor': '❤️',
    'retratos': '👤',
    'naturaleza': '🌿',
    'walking-gallery': '🚶',
    'bodas': '💒'
  };

  let gameState = {
    artworks: [],
    currentPosition: 0,
    isRolling: false,
    gameStarted: false,
    visitedTiles: new Set(),
    totalMoves: 0
  };

  // === SOUND EFFECTS ===
  let audioContext = null;
  
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  
  function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.08;
    
    switch(type) {
      case 'roll':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        break;
      case 'step':
        oscillator.type = 'sine';
        oscillator.frequency.value = 300 + Math.random() * 100;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        break;
      case 'special':
        oscillator.type = 'triangle';
        oscillator.frequency.value = 500;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        break;
      case 'victory':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.6);
  }

  // ===========================================
  // BOARD GENERATION
  // ===========================================

  /**
   * Generate spiral board layout positions
   * @param {number} totalTiles - Number of tiles
   * @returns {Array} Array of {x, y, rotation} positions
   */
  function generateSpiralPositions(totalTiles) {
    const positions = [];
    const centerX = 50;
    const centerY = 50;
    let angle = 0;
    let radius = 8;
    const radiusIncrement = 1.5;
    const angleIncrement = 0.5;

    for (let i = 0; i < totalTiles; i++) {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const rotation = (angle * 180 / Math.PI) + 90;
      
      positions.push({ x, y, rotation, index: i });
      
      angle += angleIncrement;
      radius += radiusIncrement / (totalTiles / 10);
    }

    return positions.reverse(); // Start from outside, spiral in
  }

  /**
   * Get special tile type
   * @param {number} index - Tile index (1-based)
   * @returns {string|null} Special type or null
   */
  function getSpecialType(index) {
    if (SPECIAL_TILES.OCA.includes(index)) return 'oca';
    if (SPECIAL_TILES.PUENTE.includes(index)) return 'puente';
    if (SPECIAL_TILES.CALAVERA.includes(index)) return 'calavera';
    if (SPECIAL_TILES.FEATURED.includes(index)) return 'featured';
    return null;
  }

  /**
   * Initialize the game board
   */
  async function initBoard() {
    const container = document.getElementById('oca-board');
    if (!container) return;

    // Load artworks data
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      
      // Filter to only include artworks with images (same logic as gallery)
      const allArtworks = data.artworks || [];
      gameState.artworks = await filterArtworksWithImages(allArtworks);
      
      console.log(`[OCA] Loaded ${gameState.artworks.length} artworks for the board`);
      
      renderBoard(container);
      renderDice();
      renderPlayerToken();
      
    } catch (error) {
      console.error('[OCA] Error loading artworks:', error);
      container.innerHTML = '<p class="oca-error">Error cargando el tablero</p>';
    }
  }

  /**
   * Filter artworks that have available images
   */
  async function filterArtworksWithImages(artworks) {
    const validArtworks = [];
    
    for (const artwork of artworks) {
      const imagePath = `images/artworks/${artwork.id}.webp`;
      try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        if (response.ok) {
          validArtworks.push(artwork);
        }
      } catch (e) {
        // Image not available, skip
      }
      
      // Limit to 52 for the board
      if (validArtworks.length >= 52) break;
    }
    
    return validArtworks;
  }

  /**
   * Render the spiral game board
   */
  function renderBoard(container) {
    const totalTiles = Math.min(gameState.artworks.length, 52);
    const positions = generateSpiralPositions(totalTiles);
    
    let boardHTML = '<div class="oca-spiral">';
    
    // Center goal tile
    boardHTML += `
      <div class="oca-tile oca-tile--goal" style="left: 50%; top: 50%;">
        <span class="oca-tile__icon">🏆</span>
        <span class="oca-tile__label">META</span>
      </div>
    `;

    positions.forEach((pos, i) => {
      const artwork = gameState.artworks[i];
      const tileNumber = i + 1;
      const specialType = getSpecialType(tileNumber);
      const seriesIcon = SERIES_ICONS[artwork?.series] || '🎨';
      
      const specialClass = specialType ? `oca-tile--${specialType}` : '';
      const visitedClass = gameState.visitedTiles.has(i) ? 'oca-tile--visited' : '';
      
      boardHTML += `
        <div class="oca-tile ${specialClass} ${visitedClass}" 
             data-index="${i}" 
             data-artwork-id="${artwork?.id || ''}"
             style="left: ${pos.x}%; top: ${pos.y}%;">
          <img src="images/artworks/${artwork?.id}.webp" 
               alt="${artwork?.title || 'Obra'}" 
               class="oca-tile__img"
               loading="lazy"
               onerror="this.style.display='none'">
          <span class="oca-tile__number">${tileNumber}</span>
          ${specialType ? `<span class="oca-tile__special">${getSpecialIcon(specialType)}</span>` : ''}
          <span class="oca-tile__series">${seriesIcon}</span>
        </div>
      `;
    });

    boardHTML += '</div>';
    
    // Game controls
    boardHTML += `
      <div class="oca-controls">
        <div class="oca-dice" id="oca-dice">
          <div class="oca-dice__cube">
            <div class="oca-dice__face oca-dice__face--1">⚀</div>
            <div class="oca-dice__face oca-dice__face--2">⚁</div>
            <div class="oca-dice__face oca-dice__face--3">⚂</div>
            <div class="oca-dice__face oca-dice__face--4">⚃</div>
            <div class="oca-dice__face oca-dice__face--5">⚄</div>
            <div class="oca-dice__face oca-dice__face--6">⚅</div>
          </div>
        </div>
        <button class="oca-roll-btn magnetic-btn" id="oca-roll">
          🎲 Tirar Dado
        </button>
        <div class="oca-status" id="oca-status">
          Casilla: <span id="oca-position">0</span> / ${totalTiles}
        </div>
      </div>
    `;

    // Player token
    boardHTML += '<div class="oca-player" id="oca-player">🎨</div>';
    boardHTML += '<div id="oca-ranking" class="game-ranking-container"></div>';

    container.innerHTML = boardHTML;
    
    // Attach event listeners
    attachBoardEvents();
  }

  function getSpecialIcon(type) {
    switch(type) {
      case 'oca': return '🦆';
      case 'puente': return '🌀';
      case 'calavera': return '💀';
      case 'featured': return '⭐';
      default: return '';
    }
  }

  function renderDice() {
    // Dice is rendered in renderBoard
  }

  function renderPlayerToken() {
    updatePlayerPosition(0);
  }

  // ===========================================
  // GAME MECHANICS
  // ===========================================

  /**
   * Roll the dice
   * @returns {number} Dice result 1-6
   */
  function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }

  /**
   * Animate dice roll
   */
  async function animateDiceRoll(result) {
    const dice = document.getElementById('oca-dice');
    if (!dice) return;

    dice.classList.add('oca-dice--rolling');
    playSound('roll');
    
    // Random rotations during roll
    for (let i = 0; i < 10; i++) {
      await sleep(100);
      dice.dataset.face = Math.floor(Math.random() * 6) + 1;
    }
    
    dice.dataset.face = result;
    dice.classList.remove('oca-dice--rolling');
  }

  /**
   * Move player token
   */
  async function movePlayer(steps) {
    const totalTiles = Math.min(gameState.artworks.length, 52);
    let newPosition = gameState.currentPosition + steps;
    
    // Animate step by step
    for (let i = gameState.currentPosition + 1; i <= Math.min(newPosition, totalTiles); i++) {
      await sleep(300);
      updatePlayerPosition(i);
      playSound('step');
      gameState.visitedTiles.add(i - 1);
      gameState.totalMoves++;
      
      // Mark tile as visited
      const tile = document.querySelector(`[data-index="${i - 1}"]`);
      if (tile) tile.classList.add('oca-tile--visited');
    }
    
    gameState.currentPosition = Math.min(newPosition, totalTiles);
    
    // Check for special tiles
    await handleSpecialTile(gameState.currentPosition);
    
    // Check win condition
    if (gameState.currentPosition >= totalTiles) {
      celebrateWin();
    }
  }

  /**
   * Handle special tile effects
   */
  async function handleSpecialTile(position) {
    const specialType = getSpecialType(position);
    const statusEl = document.getElementById('oca-status');
    
    if (!specialType) return;
    
    switch(specialType) {
      case 'oca':
        // Find next oca tile
        const nextOca = SPECIAL_TILES.OCA.find(t => t > position);
        if (nextOca) {
          statusEl.innerHTML = `🦆 ¡De oca a oca! Saltando a casilla ${nextOca}...`;
          await sleep(1000);
          await movePlayer(nextOca - position);
        }
        break;
        
      case 'puente':
        statusEl.innerHTML = '🌀 ¡Puente! +3 casillas';
        await sleep(1000);
        await movePlayer(3);
        break;
        
      case 'calavera':
        statusEl.innerHTML = '💀 ¡Calavera! -2 casillas';
        await sleep(1000);
        gameState.currentPosition = Math.max(0, gameState.currentPosition - 2);
        updatePlayerPosition(gameState.currentPosition);
        break;
        
      case 'featured':
        // Open lightbox with artwork details
        const artwork = gameState.artworks[position - 1];
        if (artwork) {
          statusEl.innerHTML = `⭐ Obra Destacada: ${artwork.title}`;
          playSound('special');
          openArtworkLightbox(artwork);
        }
        break;
    }
  }

  /**
   * Update player token position on board
   */
  function updatePlayerPosition(position) {
    const player = document.getElementById('oca-player');
    const statusPosition = document.getElementById('oca-position');
    
    if (position === 0) {
      // Start position (outside board)
      if (player) {
        player.style.left = '90%';
        player.style.top = '90%';
      }
    } else {
      const tile = document.querySelector(`[data-index="${position - 1}"]`);
      if (tile && player) {
        const rect = tile.getBoundingClientRect();
        const boardRect = document.getElementById('oca-board').getBoundingClientRect();
        
        player.style.left = `${((rect.left - boardRect.left) / boardRect.width) * 100 + 2}%`;
        player.style.top = `${((rect.top - boardRect.top) / boardRect.height) * 100 + 2}%`;
      }
    }
    
    if (statusPosition) {
      statusPosition.textContent = position;
    }
  }

  /**
   * Open lightbox for artwork
   */
  function openArtworkLightbox(artwork) {
    // Use existing lightbox system if available
    if (window.Lightbox && typeof window.Lightbox.open === 'function') {
      window.Lightbox.open(`images/artworks/${artwork.id}.webp`, artwork.title);
    } else {
      // Fallback: show in a simple modal
      const lightbox = document.getElementById('lightbox');
      const img = document.getElementById('lightbox-img');
      const caption = document.getElementById('lightbox-caption');
      
      if (lightbox && img) {
        img.src = `images/artworks/${artwork.id}.webp`;
        img.alt = artwork.title;
        if (caption) {
          caption.textContent = `${artwork.title} (${artwork.year}) - Serie: ${artwork.series}`;
        }
        lightbox.hidden = false;
      }
    }
  }

  /**
   * Celebrate game win with confetti
   */
  function celebrateWin() {
    const statusEl = document.getElementById('oca-status');
    if (statusEl) {
      statusEl.innerHTML = `🏆 ¡VICTORIA! Has descubierto las ${gameState.visitedTiles.size} obras en ${gameState.totalMoves} movimientos.`;
    }
    
    playSound('victory');
    
    // Add confetti effect
    const board = document.getElementById('oca-board');
    if (board) {
      board.classList.add('oca-board--victory');
      createConfetti(board);
    }
    
    // Disable dice
    const rollBtn = document.getElementById('oca-roll');
    if (rollBtn) {
      rollBtn.disabled = true;
      rollBtn.textContent = '🎉 ¡Victoria!';
    }

    if (window.RankingSystem) {
      // Score based on turns (fewer is better) - maybe 1000 - (moves * 10)
      const score = Math.max(0, 1000 - (gameState.totalMoves * 10));
      window.RankingSystem.showSubmitModal('oca', score, () => {
        window.RankingSystem.renderLeaderboard('oca', 'oca-ranking');
      });
    }
  }

  /**
   * Create confetti particles
   */
  function createConfetti(container) {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#22c55e', '#3b82f6'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'oca-confetti';
      confetti.style.cssText = `
        position: absolute;
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
        animation-delay: ${Math.random() * 0.5}s;
        z-index: 1000;
      `;
      container.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => confetti.remove(), 4500);
    }
  }

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  function attachBoardEvents() {
    // Dice roll button
    const rollBtn = document.getElementById('oca-roll');
    if (rollBtn) {
      rollBtn.addEventListener('click', async () => {
        if (gameState.isRolling) return;
        
        initAudio(); // Initialize on first interaction
        gameState.isRolling = true;
        rollBtn.disabled = true;
        
        const result = rollDice();
        await animateDiceRoll(result);
        
        const statusEl = document.getElementById('oca-status');
        if (statusEl) {
          statusEl.innerHTML = `🎲 Has sacado un <strong>${result}</strong>`;
        }
        
        await sleep(500);
        await movePlayer(result);
        
        gameState.isRolling = false;
        rollBtn.disabled = false;
      });
    }

    // Tile clicks - show artwork info
    document.querySelectorAll('.oca-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const index = parseInt(tile.dataset.index);
        const artwork = gameState.artworks[index];
        if (artwork) {
          openArtworkLightbox(artwork);
        }
      });
    });
  }

  // ===========================================
  // UTILITIES
  // ===========================================

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.OcaGame = {
    init: initBoard,
    reset: function() {
      gameState.currentPosition = 0;
      gameState.visitedTiles.clear();
      gameState.isRolling = false;
      gameState.totalMoves = 0;
      initBoard();
    }
  };

  // Auto-init when view becomes active
  document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the game route
    if (window.location.hash === '#/juego') {
      initBoard();
    }
  });

})();
