/**
 * REVERSI / OTHELLO - Juego de estrategia clásico
 * Voltea las piezas del oponente para ganar territorioS
 */
(function() {
  'use strict';

  const SIZE = 8;

  let reversiState = {
    board: [],
    turn: 'black',
    validMoves: []
  };

  function initGame(container) {
    // Initialize empty board with center pieces
    const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';

    reversiState = {
      board,
      turn: 'black',
      validMoves: []
    };

    container.innerHTML = `
      <div class="reversi-game">
        <div class="reversi-header">
          <span class="reversi-score">
            <span class="reversi-piece black"></span> <strong id="reversi-black">2</strong>
          </span>
          <span>Turno: <span id="reversi-turn" class="reversi-piece black"></span></span>
          <span class="reversi-score">
            <span class="reversi-piece white"></span> <strong id="reversi-white">2</strong>
          </span>
        </div>
        <div class="reversi-board" id="reversi-board"></div>
        <button class="game-btn" id="reversi-reset">Nueva Partida</button>
      </div>
      <style>
        .reversi-game { text-align: center; padding: 1rem; }
        .reversi-header { display: flex; justify-content: space-around; align-items: center; margin-bottom: 1rem; font-size: 1.2rem; }
        .reversi-score { display: flex; align-items: center; gap: 0.5rem; }
        .reversi-piece {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .reversi-piece.black { background: linear-gradient(135deg, #2c3e50, #1a252f); }
        .reversi-piece.white { background: linear-gradient(135deg, #ecf0f1, #bdc3c7); }
        .reversi-board {
          display: grid;
          grid-template-columns: repeat(${SIZE}, 1fr);
          max-width: 400px;
          margin: 0 auto;
          background: #27ae60;
          padding: 4px;
          gap: 2px;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .reversi-cell {
          aspect-ratio: 1;
          background: #2ecc71;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reversi-cell:hover { background: #27ae60; }
        .reversi-cell.valid { background: rgba(46, 204, 113, 0.5); box-shadow: inset 0 0 10px rgba(0,0,0,0.2); }
        .reversi-cell .reversi-piece { width: 80%; height: 80%; transition: transform 0.3s; }
        .reversi-cell .reversi-piece.flip { animation: flipPiece 0.4s ease; }
        @keyframes flipPiece {
          50% { transform: scaleX(0); }
        }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
      </style>
    `;

    updateValidMoves();
    renderBoard();
    document.getElementById('reversi-reset').addEventListener('click', () => initGame(container));
  }

  function findFlips(row, col, color) {
    if (reversiState.board[row][col]) return [];

    const opposite = color === 'black' ? 'white' : 'black';
    const allFlips = [];
    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    directions.forEach(([dr, dc]) => {
      const flips = [];
      let r = row + dr, c = col + dc;

      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && reversiState.board[r][c] === opposite) {
        flips.push([r, c]);
        r += dr; c += dc;
      }

      if (flips.length > 0 && r >= 0 && r < SIZE && c >= 0 && c < SIZE && reversiState.board[r][c] === color) {
        allFlips.push(...flips);
      }
    });

    return allFlips;
  }

  function updateValidMoves() {
    reversiState.validMoves = [];
    
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (findFlips(row, col, reversiState.turn).length > 0) {
          reversiState.validMoves.push([row, col]);
        }
      }
    }
  }

  function renderBoard() {
    const boardEl = document.getElementById('reversi-board');
    boardEl.innerHTML = '';

    let blackCount = 0, whiteCount = 0;

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const cell = document.createElement('div');
        cell.className = 'reversi-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        const piece = reversiState.board[row][col];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `reversi-piece ${piece}`;
          cell.appendChild(pieceEl);
          
          if (piece === 'black') blackCount++;
          else whiteCount++;
        }

        if (reversiState.validMoves.some(([r, c]) => r === row && c === col)) {
          cell.classList.add('valid');
        }

        cell.addEventListener('click', () => handleClick(row, col));
        boardEl.appendChild(cell);
      }
    }

    document.getElementById('reversi-black').textContent = blackCount;
    document.getElementById('reversi-white').textContent = whiteCount;
  }

  function handleClick(row, col) {
    if (!reversiState.validMoves.some(([r, c]) => r === row && c === col)) return;

    const flips = findFlips(row, col, reversiState.turn);
    
    // Place piece
    reversiState.board[row][col] = reversiState.turn;
    
    // Flip pieces
    flips.forEach(([r, c]) => {
      reversiState.board[r][c] = reversiState.turn;
    });

    // Switch turn
    reversiState.turn = reversiState.turn === 'black' ? 'white' : 'black';
    document.getElementById('reversi-turn').className = `reversi-piece ${reversiState.turn}`;

    updateValidMoves();

    // If no valid moves, switch back
    if (reversiState.validMoves.length === 0) {
      reversiState.turn = reversiState.turn === 'black' ? 'white' : 'black';
      updateValidMoves();

      if (reversiState.validMoves.length === 0) {
        // Game over
        endGame();
      }
    }

    renderBoard();
  }

  function endGame() {
    let black = 0, white = 0;
    reversiState.board.forEach(row => {
      row.forEach(cell => {
        if (cell === 'black') black++;
        if (cell === 'white') white++;
      });
    });

    const winner = black > white ? 'Negro' : white > black ? 'Blanco' : 'Empate';
    
    setTimeout(() => {
      alert(`🎯 ¡Fin del juego!\nNegro: ${black} | Blanco: ${white}\n${winner === 'Empate' ? '¡Empate!' : `¡${winner} gana!`}`);
      if (window.RankingSystem && black > white) {
        window.RankingSystem.submitScore('reversi', black * 10);
      }
    }, 300);
  }

  window.initReversiGame = function(container) {
    initGame(container);
  };
})();
