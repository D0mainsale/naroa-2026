/**
 * Damas / Checkers - Naroa 2026
 * Agent A16: Hover float, king crown particles, capture trail
 */
(function() {
  'use strict';

  let state = { board: [], selected: null, turn: 'red', mustCapture: false };

  function init() {
    const container = document.getElementById('checkers-container');
    if (!container) return;
    resetBoard();

    container.innerHTML = `
      <div class="checkers-ui">
        <div class="checkers-info">
          <span>Turno: <strong id="checkers-turn" style="color:#ff003c">Rojas</strong></span>
          <button class="game-btn secondary" id="checkers-reset">Reiniciar</button>
        </div>
        <div id="checkers-board" class="checkers-board"></div>
      </div>
    `;
    document.getElementById('checkers-reset').addEventListener('click', () => { resetBoard(); render(); });
    render();
  }

  function resetBoard() {
    state.board = Array(8).fill(null).map(() => Array(8).fill(null));
    state.turn = 'red';
    state.selected = null;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { if ((r + c) % 2 === 1) state.board[r][c] = { color: 'black', king: false }; }
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) { if ((r + c) % 2 === 1) state.board[r][c] = { color: 'red', king: false }; }
  }

  function getCaptures(r, c) {
    const piece = state.board[r][c];
    if (!piece) return [];
    const caps = [];
    const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : (piece.color === 'red' ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);
    dirs.forEach(([dr, dc]) => {
      const mr = r + dr, mc = c + dc, jr = r + 2*dr, jc = c + 2*dc;
      if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && state.board[mr]?.[mc] && state.board[mr][mc].color !== piece.color && !state.board[jr][jc]) {
        caps.push({ to: [jr, jc], over: [mr, mc] });
      }
    });
    return caps;
  }

  function getMoves(r, c) {
    const piece = state.board[r][c];
    if (!piece) return [];
    const moves = [];
    const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : (piece.color === 'red' ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);
    dirs.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !state.board[nr][nc]) moves.push([nr, nc]);
    });
    return moves;
  }

  function handleClick(r, c) {
    const piece = state.board[r][c];

    if (state.selected) {
      const [sr, sc] = state.selected;
      const caps = getCaptures(sr, sc);

      if (caps.length > 0) {
        const cap = caps.find(cp => cp.to[0] === r && cp.to[1] === c);
        if (cap) {
          state.board[r][c] = state.board[sr][sc];
          state.board[sr][sc] = null;
          state.board[cap.over[0]][cap.over[1]] = null;
          if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('checkers-board'));
          // Check chain capture
          const moreCaps = getCaptures(r, c);
          if (moreCaps.length > 0) { state.selected = [r, c]; checkKing(r, c); render(); return; }
          checkKing(r, c);
          nextTurn(); render(); return;
        }
      } else {
        const moves = getMoves(sr, sc);
        if (moves.some(([mr, mc]) => mr === r && mc === c)) {
          state.board[r][c] = state.board[sr][sc];
          state.board[sr][sc] = null;
          checkKing(r, c);
          nextTurn(); render(); return;
        }
      }
      state.selected = null;
    }

    if (piece && piece.color === state.turn) state.selected = [r, c];
    render();
  }

  function checkKing(r, c) {
    const p = state.board[r][c];
    if (p && ((p.color === 'red' && r === 0) || (p.color === 'black' && r === 7))) p.king = true;
  }

  function nextTurn() {
    state.turn = state.turn === 'red' ? 'black' : 'red';
    state.selected = null;
    document.getElementById('checkers-turn').textContent = state.turn === 'red' ? 'Rojas' : 'Negras';
    document.getElementById('checkers-turn').style.color = state.turn === 'red' ? '#ff003c' : '#555';
  }

  function render() {
    const el = document.getElementById('checkers-board');
    if (!el) return;
    const validMoves = state.selected ? [...getCaptures(state.selected[0], state.selected[1]).map(c => c.to), ...(getCaptures(state.selected[0], state.selected[1]).length === 0 ? getMoves(state.selected[0], state.selected[1]) : [])] : [];

    let html = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const dark = (r + c) % 2 === 1;
        const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
        const valid = validMoves.some(([mr, mc]) => mr === r && mc === c);
        const p = state.board[r][c];

        let cls = 'ck-cell' + (dark ? ' dark' : ' light') + (sel ? ' selected' : '') + (valid ? ' valid-move' : '');
        let inner = '';
        if (p) inner = `<div class="ck-piece ${p.color}${p.king ? ' king' : ''}">${p.king ? '👑' : '●'}</div>`;
        else if (valid) inner = '<span class="move-dot"></span>';
        html += `<div class="${cls}" data-r="${r}" data-c="${c}">${inner}</div>`;
      }
    }
    el.innerHTML = html;
    el.querySelectorAll('.ck-cell').forEach(cell => cell.addEventListener('click', () => handleClick(+cell.dataset.r, +cell.dataset.c)));
  }

  window.CheckersGame = { init };
})();
