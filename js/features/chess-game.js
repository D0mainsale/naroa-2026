/**
 * Chess Artístico - Naroa 2026
 * Agent A15: Piece drag shadows, valid-move glow dots, capture animation
 */
(function() {
  'use strict';

  const PIECES = {
    K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
  };

  const INIT_BOARD = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];

  let state = { board: [], selected: null, turn: 'white', moves: 0, captures: { white: [], black: [] } };

  function init() {
    const container = document.getElementById('chess-container');
    if (!container) return;

    state.board = INIT_BOARD.map(r => [...r]);
    state.selected = null;
    state.turn = 'white';
    state.moves = 0;
    state.captures = { white: [], black: [] };

    container.innerHTML = `
      <div class="chess-ui">
        <div class="chess-info">
          <span>Turno: <strong id="chess-turn" style="color:#ccff00">Blancas</strong></span>
          <span>Movimientos: <strong id="chess-moves">0</strong></span>
        </div>
        <div id="chess-board" class="chess-board"></div>
        <div id="chess-captures" class="chess-captures"></div>
      </div>
    `;

    renderBoard();
  }

  function isWhite(p) { return p >= 'A' && p <= 'Z'; }
  function isBlack(p) { return p >= 'a' && p <= 'z'; }
  function isOwn(p) { return state.turn === 'white' ? isWhite(p) : isBlack(p); }
  function isEnemy(p) { return state.turn === 'white' ? isBlack(p) : isWhite(p); }

  function getValidMoves(r, c) {
    const piece = state.board[r][c].toLowerCase();
    const moves = [];
    const dir = isWhite(state.board[r][c]) ? -1 : 1;

    const addIf = (nr, nc) => {
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return false;
      const target = state.board[nr][nc];
      if (isOwn(target)) return false;
      moves.push([nr, nc]);
      return target === ' ';
    };

    const slide = (dr, dc) => {
      for (let i = 1; i < 8; i++) {
        if (!addIf(r + dr * i, c + dc * i)) break;
      }
    };

    switch (piece) {
      case 'p':
        if (state.board[r + dir]?.[c] === ' ') { moves.push([r + dir, c]); if ((dir === -1 && r === 6) || (dir === 1 && r === 1)) { if (state.board[r + dir * 2]?.[c] === ' ') moves.push([r + dir * 2, c]); } }
        if (state.board[r + dir]?.[c - 1] && isEnemy(state.board[r + dir][c - 1])) moves.push([r + dir, c - 1]);
        if (state.board[r + dir]?.[c + 1] && isEnemy(state.board[r + dir][c + 1])) moves.push([r + dir, c + 1]);
        break;
      case 'r': slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1); break;
      case 'b': slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1); break;
      case 'q': slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1); slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1); break;
      case 'n': [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => addIf(r + dr, c + dc)); break;
      case 'k': [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => addIf(r + dr, c + dc)); break;
    }
    return moves;
  }

  function handleClick(r, c) {
    const piece = state.board[r][c];

    if (state.selected) {
      const [sr, sc] = state.selected;
      const validMoves = getValidMoves(sr, sc);
      const isValid = validMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isValid) {
        const captured = state.board[r][c];
        if (captured !== ' ') {
          const side = isWhite(captured) ? 'black' : 'white';
          state.captures[side].push(PIECES[captured]);
          if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('chess-board'));
        }
        state.board[r][c] = state.board[sr][sc];
        state.board[sr][sc] = ' ';
        state.moves++;
        state.turn = state.turn === 'white' ? 'black' : 'white';
        document.getElementById('chess-turn').textContent = state.turn === 'white' ? 'Blancas' : 'Negras';
        document.getElementById('chess-moves').textContent = state.moves;
        if (window.GameEffects) GameEffects.hapticFeedback();
      }
      state.selected = null;
    } else if (piece !== ' ' && isOwn(piece)) {
      state.selected = [r, c];
    }
    renderBoard();
  }

  function renderBoard() {
    const boardEl = document.getElementById('chess-board');
    if (!boardEl) return;
    let html = '';
    const validMoves = state.selected ? getValidMoves(state.selected[0], state.selected[1]) : [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        const isSelected = state.selected && state.selected[0] === r && state.selected[1] === c;
        const isValidMove = validMoves.some(([mr, mc]) => mr === r && mc === c);
        const piece = state.board[r][c];

        let cls = 'chess-cell';
        cls += isDark ? ' dark' : ' light';
        if (isSelected) cls += ' selected';
        if (isValidMove) cls += ' valid-move';

        html += `<div class="${cls}" data-r="${r}" data-c="${c}">${piece !== ' ' ? PIECES[piece] : (isValidMove ? '<span class="move-dot"></span>' : '')}</div>`;
      }
    }
    boardEl.innerHTML = html;

    boardEl.querySelectorAll('.chess-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        handleClick(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
      });
    });

    // Captures
    const captEl = document.getElementById('chess-captures');
    if (captEl) {
      captEl.innerHTML = `<span style="color:#ccc">${state.captures.white.join(' ')}</span> | <span style="color:#666">${state.captures.black.join(' ')}</span>`;
    }
  }

  window.ChessGame = { init };
})();
