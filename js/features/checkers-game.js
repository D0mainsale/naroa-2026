/**
 * DAMAS ARTÍSTICAS - Checkers con piezas de arte
 */
(function() {
  'use strict';

  let checkersState = {
    board: [],
    selected: null,
    turn: 'red',
    captureMode: false
  };

  function initBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Black pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color: 'black', king: false };
        }
      }
    }
    
    // Red pieces (bottom)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { color: 'red', king: false };
        }
      }
    }
    
    return board;
  }

  function initGame(container) {
    checkersState = {
      board: initBoard(),
      selected: null,
      turn: 'red',
      captureMode: false
    };

    container.innerHTML = `
      <div class="checkers-game">
        <div class="checkers-header">
          <span>Turno: <strong id="checkers-turn" style="color: #e74c3c;">Rojas</strong></span>
        </div>
        <div class="checkers-board" id="checkers-board"></div>
        <button class="game-btn" id="checkers-reset">Nueva Partida</button>
      </div>
      <style>
        .checkers-game { text-align: center; padding: 1rem; }
        .checkers-header { margin-bottom: 1rem; font-size: 1.2rem; }
        .checkers-board {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          max-width: 400px;
          margin: 0 auto;
          border: 3px solid #d4a574;
          border-radius: 8px;
          overflow: hidden;
        }
        .checkers-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .checkers-cell.light { background: #deb887; }
        .checkers-cell.dark { background: #654321; }
        .checkers-cell.selected { background: #7b61ff !important; }
        .checkers-cell.valid { background: rgba(76, 175, 80, 0.6) !important; }
        .checkers-piece {
          width: 80%;
          height: 80%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        }
        .checkers-piece:hover { transform: scale(1.1); }
        .checkers-piece.red { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .checkers-piece.black { background: linear-gradient(135deg, #2c3e50, #1a252f); }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
      </style>
    `;

    renderBoard();
    document.getElementById('checkers-reset').addEventListener('click', () => initGame(container));
  }

  function renderBoard() {
    const boardEl = document.getElementById('checkers-board');
    boardEl.innerHTML = '';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = document.createElement('div');
        const isLight = (row + col) % 2 === 0;
        cell.className = `checkers-cell ${isLight ? 'light' : 'dark'}`;
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (checkersState.selected?.row === row && checkersState.selected?.col === col) {
          cell.classList.add('selected');
        }

        const piece = checkersState.board[row][col];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `checkers-piece ${piece.color}`;
          if (piece.king) pieceEl.textContent = '👑';
          cell.appendChild(pieceEl);
        }

        cell.addEventListener('click', () => handleClick(row, col));
        boardEl.appendChild(cell);
      }
    }
  }

  function getValidMoves(row, col) {
    const piece = checkersState.board[row][col];
    if (!piece) return [];

    const moves = [];
    const captures = [];
    const dirs = piece.king ? [-1, 1] : (piece.color === 'red' ? [-1] : [1]);

    dirs.forEach(dr => {
      [-1, 1].forEach(dc => {
        const nr = row + dr;
        const nc = col + dc;
        
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (!checkersState.board[nr][nc]) {
            moves.push({ row: nr, col: nc });
          } else if (checkersState.board[nr][nc].color !== piece.color) {
            // Check for capture
            const jr = nr + dr;
            const jc = nc + dc;
            if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !checkersState.board[jr][jc]) {
              captures.push({ row: jr, col: jc, captured: { row: nr, col: nc } });
            }
          }
        }
      });
    });

    return captures.length > 0 ? captures : moves;
  }

  function handleClick(row, col) {
    const piece = checkersState.board[row][col];

    if (checkersState.selected) {
      const validMoves = getValidMoves(checkersState.selected.row, checkersState.selected.col);
      const move = validMoves.find(m => m.row === row && m.col === col);

      if (move) {
        // Move piece
        checkersState.board[row][col] = checkersState.board[checkersState.selected.row][checkersState.selected.col];
        checkersState.board[checkersState.selected.row][checkersState.selected.col] = null;

        // Capture
        if (move.captured) {
          checkersState.board[move.captured.row][move.captured.col] = null;
        }

        // King promotion
        if ((row === 0 && checkersState.board[row][col].color === 'red') ||
            (row === 7 && checkersState.board[row][col].color === 'black')) {
          checkersState.board[row][col].king = true;
        }

        checkersState.turn = checkersState.turn === 'red' ? 'black' : 'red';
        checkersState.selected = null;

        document.getElementById('checkers-turn').textContent = checkersState.turn === 'red' ? 'Rojas' : 'Negras';
        document.getElementById('checkers-turn').style.color = checkersState.turn === 'red' ? '#e74c3c' : '#2c3e50';

        checkWin();
        renderBoard();
        return;
      }
    }

    if (piece && piece.color === checkersState.turn) {
      checkersState.selected = { row, col };
      renderBoard();
      
      const validMoves = getValidMoves(row, col);
      validMoves.forEach(m => {
        const cell = document.querySelector(`[data-row="${m.row}"][data-col="${m.col}"]`);
        if (cell) cell.classList.add('valid');
      });
    } else {
      checkersState.selected = null;
      renderBoard();
    }
  }

  function checkWin() {
    let redCount = 0, blackCount = 0;
    
    checkersState.board.forEach(row => {
      row.forEach(cell => {
        if (cell?.color === 'red') redCount++;
        if (cell?.color === 'black') blackCount++;
      });
    });

    if (redCount === 0) {
      setTimeout(() => alert('⬛ ¡Negras ganan!'), 100);
    } else if (blackCount === 0) {
      setTimeout(() => {
        alert('🔴 ¡Rojas ganan!');
        if (window.RankingSystem) window.RankingSystem.submitScore('checkers', 1000);
      }, 100);
    }
  }

  window.initCheckersGame = function(container) {
    initGame(container);
  };
})();
