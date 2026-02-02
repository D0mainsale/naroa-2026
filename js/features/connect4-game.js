/**
 * CUATRO EN RAYA - Connect Four con piezas artísticas
 */
(function() {
  'use strict';

  const ROWS = 6;
  const COLS = 7;

  let connect4State = {
    board: [],
    turn: 'yellow',
    winner: null
  };

  function initGame(container) {
    connect4State = {
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
      turn: 'yellow',
      winner: null
    };

    container.innerHTML = `
      <div class="connect4-game">
        <div class="connect4-header">
          <span>Turno: <span id="c4-turn" class="c4-indicator yellow"></span></span>
        </div>
        <div class="connect4-board" id="connect4-board"></div>
        <button class="game-btn" id="connect4-reset">Nueva Partida</button>
      </div>
      <style>
        .connect4-game { text-align: center; padding: 1rem; }
        .connect4-header { display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-size: 1.2rem; }
        .c4-indicator { width: 30px; height: 30px; border-radius: 50%; display: inline-block; }
        .c4-indicator.yellow { background: linear-gradient(135deg, #f1c40f, #f39c12); }
        .c4-indicator.red { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .connect4-board {
          display: inline-grid;
          grid-template-columns: repeat(${COLS}, 1fr);
          gap: 8px;
          background: linear-gradient(135deg, #2980b9, #3498db);
          padding: 15px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .c4-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .c4-column:hover { transform: translateY(-5px); }
        .c4-cell {
          width: 50px;
          height: 50px;
          background: #1a1a2e;
          border-radius: 50%;
          transition: all 0.3s;
        }
        .c4-cell.yellow { background: linear-gradient(135deg, #f1c40f, #f39c12); box-shadow: 0 0 15px rgba(241, 196, 15, 0.5); }
        .c4-cell.red { background: linear-gradient(135deg, #e74c3c, #c0392b); box-shadow: 0 0 15px rgba(231, 76, 60, 0.5); }
        .c4-cell.winning { animation: winPulse 0.5s ease infinite alternate; }
        @keyframes winPulse {
          to { transform: scale(1.15); }
        }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
      </style>
    `;

    renderBoard();
    document.getElementById('connect4-reset').addEventListener('click', () => initGame(container));
  }

  function renderBoard() {
    const boardEl = document.getElementById('connect4-board');
    boardEl.innerHTML = '';

    for (let col = 0; col < COLS; col++) {
      const column = document.createElement('div');
      column.className = 'c4-column';
      column.dataset.col = col;

      for (let row = 0; row < ROWS; row++) {
        const cell = document.createElement('div');
        cell.className = 'c4-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        const piece = connect4State.board[row][col];
        if (piece) cell.classList.add(piece);
        
        column.appendChild(cell);
      }

      column.addEventListener('click', () => dropPiece(col));
      boardEl.appendChild(column);
    }
  }

  function dropPiece(col) {
    if (connect4State.winner) return;

    // Find lowest empty row
    let targetRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!connect4State.board[row][col]) {
        targetRow = row;
        break;
      }
    }

    if (targetRow === -1) return; // Column full

    connect4State.board[targetRow][col] = connect4State.turn;

    const winner = checkWin(targetRow, col);
    if (winner) {
      connect4State.winner = winner.color;
      renderBoard();
      highlightWin(winner.cells);
      
      setTimeout(() => {
        alert(`🎉 ¡${winner.color === 'yellow' ? 'Amarillo' : 'Rojo'} gana!`);
        if (window.RankingSystem) window.RankingSystem.submitScore('connect4', 1000);
      }, 500);
      return;
    }

    connect4State.turn = connect4State.turn === 'yellow' ? 'red' : 'yellow';
    document.getElementById('c4-turn').className = `c4-indicator ${connect4State.turn}`;
    
    renderBoard();
  }

  function checkWin(row, col) {
    const color = connect4State.board[row][col];
    const directions = [
      [[0, 1], [0, -1]], // Horizontal
      [[1, 0], [-1, 0]], // Vertical
      [[1, 1], [-1, -1]], // Diagonal \
      [[1, -1], [-1, 1]]  // Diagonal /
    ];

    for (const [[dr1, dc1], [dr2, dc2]] of directions) {
      const cells = [[row, col]];
      
      // Check direction 1
      let r = row + dr1, c = col + dc1;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && connect4State.board[r][c] === color) {
        cells.push([r, c]);
        r += dr1; c += dc1;
      }
      
      // Check direction 2
      r = row + dr2; c = col + dc2;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && connect4State.board[r][c] === color) {
        cells.push([r, c]);
        r += dr2; c += dc2;
      }

      if (cells.length >= 4) {
        return { color, cells };
      }
    }
    
    return null;
  }

  function highlightWin(cells) {
    cells.forEach(([row, col]) => {
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (cell) cell.classList.add('winning');
    });
  }

  window.initConnect4Game = function(container) {
    initGame(container);
  };
})();
