/**
 * PUZZLE GIRATORIO - Gira las piezas para completar la imagen
 * Cada pieza puede girar 90° hasta coincidir
 */
(function() {
  'use strict';

  const ROTATE_CONFIG = {
    gridSize: 3,
    artworks: []
  };

  let rotateState = {
    pieces: [],
    moves: 0,
    solved: false,
    startTime: null
  };

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      ROTATE_CONFIG.artworks = data.artworks || data;
    } catch(e) {
      ROTATE_CONFIG.artworks = [
        { image: 'images/optimized/johnny-rocks.webp', title: 'Johnny Rocks' }
      ];
    }
  }

  function getRandomArtwork() {
    const arts = ROTATE_CONFIG.artworks;
    return arts[Math.floor(Math.random() * arts.length)];
  }

  function initGame(container) {
    const art = getRandomArtwork();
    const { gridSize } = ROTATE_CONFIG;
    
    rotateState = { pieces: [], moves: 0, solved: false, startTime: Date.now() };
    
    // Create pieces with random rotations
    for (let i = 0; i < gridSize * gridSize; i++) {
      rotateState.pieces.push({
        index: i,
        rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)]
      });
    }

    container.innerHTML = `
      <div class="rotate-game">
        <div class="rotate-header">
          <span>Movimientos: <strong id="rotate-moves">0</strong></span>
          <span>⏱️ <strong id="rotate-time">0</strong>s</span>
        </div>
        <div class="rotate-grid" id="rotate-grid" style="--grid-size: ${gridSize}"></div>
        <p class="rotate-hint">👆 Haz clic en cada pieza para girarla 90°</p>
        <button class="game-btn" id="rotate-new">Nueva Imagen</button>
      </div>
      <style>
        .rotate-game { text-align: center; padding: 1rem; }
        .rotate-header { display: flex; justify-content: space-around; margin-bottom: 1rem; font-size: 1.1rem; }
        .rotate-grid {
          display: grid;
          grid-template-columns: repeat(var(--grid-size), 1fr);
          gap: 4px;
          max-width: 400px;
          margin: 0 auto;
          background: #333;
          padding: 4px;
          border-radius: 12px;
        }
        .rotate-piece {
          aspect-ratio: 1;
          background-size: ${gridSize * 100}% ${gridSize * 100}%;
          cursor: pointer;
          transition: transform 0.3s ease;
          border-radius: 4px;
        }
        .rotate-piece:hover { filter: brightness(1.1); }
        .rotate-piece.correct { box-shadow: 0 0 10px #4ade80; }
        .rotate-hint { color: rgba(255,255,255,0.6); margin: 1rem 0; }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
      </style>
    `;

    const grid = document.getElementById('rotate-grid');
    
    rotateState.pieces.forEach((piece, i) => {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const el = document.createElement('div');
      el.className = 'rotate-piece';
      el.dataset.index = i;
      el.style.backgroundImage = `url(${art.image})`;
      el.style.backgroundPosition = `${col * (100 / (gridSize - 1))}% ${row * (100 / (gridSize - 1))}%`;
      el.style.transform = `rotate(${piece.rotation}deg)`;
      
      el.addEventListener('click', () => rotatePiece(i, el));
      grid.appendChild(el);
    });

    document.getElementById('rotate-new').addEventListener('click', () => initGame(container));
    
    // Timer
    setInterval(() => {
      if (!rotateState.solved) {
        const elapsed = Math.floor((Date.now() - rotateState.startTime) / 1000);
        document.getElementById('rotate-time').textContent = elapsed;
      }
    }, 1000);
  }

  function rotatePiece(index, el) {
    if (rotateState.solved) return;
    
    const piece = rotateState.pieces[index];
    piece.rotation = (piece.rotation + 90) % 360;
    el.style.transform = `rotate(${piece.rotation}deg)`;
    
    rotateState.moves++;
    document.getElementById('rotate-moves').textContent = rotateState.moves;
    
    // Check if correct (0 rotation)
    if (piece.rotation === 0) {
      el.classList.add('correct');
    } else {
      el.classList.remove('correct');
    }
    
    checkWin();
  }

  function checkWin() {
    const allCorrect = rotateState.pieces.every(p => p.rotation === 0);
    
    if (allCorrect) {
      rotateState.solved = true;
      const time = Math.floor((Date.now() - rotateState.startTime) / 1000);
      const score = Math.max(1000 - rotateState.moves * 10 - time * 5, 100);
      
      setTimeout(() => {
        alert(`🎉 ¡Completado!\nMovimientos: ${rotateState.moves}\nTiempo: ${time}s\nPuntuación: ${score}`);
        
        if (window.RankingSystem) {
          window.RankingSystem.submitScore('rotate', score);
        }
      }, 300);
    }
  }

  window.initRotateGame = async function(container) {
    await loadArtworks();
    initGame(container);
  };
})();
