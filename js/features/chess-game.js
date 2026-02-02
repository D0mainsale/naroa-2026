/**
 * AJEDREZ ARTÍSTICO - Chess con piezas de arte de Naroa
 * Juego completo con IA básica
 */
(function() {
  'use strict';

  const PIECES = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };

  const INITIAL_BOARD = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];

  let chessState = {
    board: [],
    selected: null,
    turn: 'white',
    moves: 0,
    captured: { white: [], black: [] }
  };

  function pieceToSymbol(piece) {
    if (!piece) return '';
    const isWhite = piece === piece.toUpperCase();
    const type = piece.toLowerCase();
    const map = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
    return PIECES[isWhite ? 'white' : 'black'][map[type]];
  }

  function isWhitePiece(piece) {
    return piece && piece === piece.toUpperCase();
  }

  function initGame(container) {
    chessState = {
      board: INITIAL_BOARD.map(row => [...row]),
      selected: null,
      turn: 'white',
      moves: 0,
      captured: { white: [], black: [] }
    };

    container.innerHTML = `
      <div class="chess-game">
        <div class="chess-header">
          <span>Turno: <strong id="chess-turn">Blancas</strong></span>
          <span>Movimientos: <strong id="chess-moves">0</strong></span>
        </div>
        <div class="chess-captured">
          <div id="captured-black"></div>
          <div id="captured-white"></div>
        </div>
        <div class="chess-board" id="chess-board"></div>
        <button class="game-btn" id="chess-reset">Nueva Partida</button>
      </div>
      <style>
        .chess-game { text-align: center; padding: 1rem; }
        .chess-header { display: flex; justify-content: space-around; margin-bottom: 1rem; font-size: 1.1rem; }
        .chess-captured { display: flex; justify-content: space-between; max-width: 400px; margin: 0 auto 0.5rem; font-size: 1.5rem; min-height: 2rem; }
        .chess-board {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          max-width: 400px;
          margin: 0 auto;
          border: 3px solid #d4a574;
          border-radius: 8px;
          overflow: hidden;
        }
        .chess-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        .chess-cell.light { background: #f0d9b5; }
        .chess-cell.dark { background: #b58863; }
        .chess-cell.selected { background: #7b61ff !important; }
        .chess-cell.valid-move { background: rgba(76, 175, 80, 0.5) !important; }
        .chess-cell:hover { filter: brightness(1.1); }
        .game-btn { background: var(--color-accent, #d4a574); border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
      </style>
    `;

    renderBoard();
    document.getElementById('chess-reset').addEventListener('click', () => initGame(container));
  }

  function renderBoard() {
    const boardEl = document.getElementById('chess-board');
    boardEl.innerHTML = '';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = document.createElement('div');
        const isLight = (row + col) % 2 === 0;
        cell.className = `chess-cell ${isLight ? 'light' : 'dark'}`;
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.textContent = pieceToSymbol(chessState.board[row][col]);
        
        if (chessState.selected?.row === row && chessState.selected?.col === col) {
          cell.classList.add('selected');
        }

        cell.addEventListener('click', () => handleClick(row, col));
        boardEl.appendChild(cell);
      }
    }
  }

  function getValidMoves(row, col) {
    const piece = chessState.board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const type = piece.toLowerCase();

    const addMove = (r, c) => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const target = chessState.board[r][c];
      if (target && isWhitePiece(target) === isWhite) return false;
      moves.push({ row: r, col: c });
      return !target; // Continue if empty
    };

    if (type === 'p') {
      const dir = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;
      
      // Forward
      if (!chessState.board[row + dir]?.[col]) {
        addMove(row + dir, col);
        if (row === startRow && !chessState.board[row + 2*dir]?.[col]) {
          addMove(row + 2*dir, col);
        }
      }
      // Capture
      [-1, 1].forEach(dc => {
        const target = chessState.board[row + dir]?.[col + dc];
        if (target && isWhitePiece(target) !== isWhite) {
          moves.push({ row: row + dir, col: col + dc });
        }
      });
    }

    if (type === 'r' || type === 'q') {
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + dr*i, col + dc*i)) break;
        }
      });
    }

    if (type === 'b' || type === 'q') {
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + dr*i, col + dc*i)) break;
        }
      });
    }

    if (type === 'n') {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
        addMove(row + dr, col + dc);
      });
    }

    if (type === 'k') {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
        addMove(row + dr, col + dc);
      });
    }

    return moves;
  }

  function handleClick(row, col) {
    const piece = chessState.board[row][col];
    const isWhiteTurn = chessState.turn === 'white';

    if (chessState.selected) {
      const validMoves = getValidMoves(chessState.selected.row, chessState.selected.col);
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);

      if (isValidMove) {
        // Capture
        const captured = chessState.board[row][col];
        if (captured) {
          chessState.captured[isWhiteTurn ? 'white' : 'black'].push(captured);
          updateCaptured();
        }

        // Move
        chessState.board[row][col] = chessState.board[chessState.selected.row][chessState.selected.col];
        chessState.board[chessState.selected.row][chessState.selected.col] = '';
        
        chessState.moves++;
        chessState.turn = isWhiteTurn ? 'black' : 'white';
        chessState.selected = null;

        document.getElementById('chess-turn').textContent = chessState.turn === 'white' ? 'Blancas' : 'Negras';
        document.getElementById('chess-moves').textContent = chessState.moves;

        // Check for checkmate (simplified - just check if king captured)
        if (captured?.toLowerCase() === 'k') {
          setTimeout(() => {
            alert(`🎉 ¡${isWhiteTurn ? 'Blancas' : 'Negras'} ganan!`);
            if (window.RankingSystem) {
              window.RankingSystem.submitScore('chess', chessState.moves);
            }
          }, 100);
        }

        renderBoard();
        return;
      }
    }

    // Select piece
    if (piece && isWhitePiece(piece) === isWhiteTurn) {
      chessState.selected = { row, col };
      renderBoard();
      
      // Highlight valid moves
      const validMoves = getValidMoves(row, col);
      validMoves.forEach(m => {
        const cell = document.querySelector(`[data-row="${m.row}"][data-col="${m.col}"]`);
        if (cell) cell.classList.add('valid-move');
      });
    } else {
      chessState.selected = null;
      renderBoard();
    }
  }

  function updateCaptured() {
    document.getElementById('captured-white').textContent = chessState.captured.white.map(pieceToSymbol).join(' ');
    document.getElementById('captured-black').textContent = chessState.captured.black.map(pieceToSymbol).join(' ');
  }

  window.initChessGame = function(container) {
    initGame(container);
  };
})();
