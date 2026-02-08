/**
 * Reversi / Othello - Naroa 2026
 * Agent A19: Piece flip animation, valid-move glow, score bar
 */
(function() {
  'use strict';

  const SIZE = 8;
  let state = { board: [], turn: 1, scores: { 1: 2, 2: 2 } };

  function init() {
    const container = document.getElementById('reversi-container');
    if (!container) return;
    reset();

    container.innerHTML = `
      <div class="reversi-ui">
        <div class="reversi-info">
          <span>⚫ <strong id="reversi-b">2</strong></span>
          <span>Turno: <strong id="reversi-turn">⚫ Negro</strong></span>
          <span>⚪ <strong id="reversi-w">2</strong></span>
          <button class="game-btn secondary" id="reversi-reset">↻</button>
        </div>
        <div id="reversi-board" class="reversi-board"></div>
      </div>
    `;
    document.getElementById('reversi-reset').addEventListener('click', () => { reset(); render(); });
    render();
  }

  function reset() {
    state.board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    state.board[3][3] = 2; state.board[3][4] = 1;
    state.board[4][3] = 1; state.board[4][4] = 2;
    state.turn = 1;
    state.scores = { 1: 2, 2: 2 };
  }

  function getFlips(r, c, player) {
    if (state.board[r][c] !== 0) return [];
    const opp = player === 1 ? 2 : 1;
    const allFlips = [];
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    
    for (const [dr, dc] of dirs) {
      const flips = [];
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && state.board[nr][nc] === opp) {
        flips.push([nr, nc]);
        nr += dr; nc += dc;
      }
      if (flips.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && state.board[nr][nc] === player) {
        allFlips.push(...flips);
      }
    }
    return allFlips;
  }

  function getValidMoves(player) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (getFlips(r, c, player).length > 0) moves.push([r, c]);
      }
    }
    return moves;
  }

  function placePiece(r, c) {
    const flips = getFlips(r, c, state.turn);
    if (flips.length === 0) return;

    state.board[r][c] = state.turn;
    flips.forEach(([fr, fc]) => { state.board[fr][fc] = state.turn; });

    if (window.GameEffects) GameEffects.hapticFeedback();

    // Count scores
    let b = 0, w = 0;
    state.board.forEach(row => row.forEach(v => { if (v === 1) b++; if (v === 2) w++; }));
    state.scores = { 1: b, 2: w };

    // Switch turn
    const next = state.turn === 1 ? 2 : 1;
    if (getValidMoves(next).length > 0) {
      state.turn = next;
    } else if (getValidMoves(state.turn).length === 0) {
      // Game over
      render();
      setTimeout(() => {
        const winner = b > w ? '⚫ Negro' : w > b ? '⚪ Blanco' : 'Empate';
        alert(`¡Fin! ${winner} gana! (${b}-${w})`);
        if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('reversi-board'));
      }, 100);
      return;
    }
    // else: keep current turn (opponent has no moves)

    updateInfo();
    render();
  }

  function updateInfo() {
    const turnEl = document.getElementById('reversi-turn');
    const bEl = document.getElementById('reversi-b');
    const wEl = document.getElementById('reversi-w');
    if (turnEl) turnEl.textContent = state.turn === 1 ? '⚫ Negro' : '⚪ Blanco';
    if (bEl) bEl.textContent = state.scores[1];
    if (wEl) wEl.textContent = state.scores[2];
  }

  function render() {
    const el = document.getElementById('reversi-board');
    if (!el) return;
    const valid = getValidMoves(state.turn);

    let html = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = state.board[r][c];
        const isValid = valid.some(([mr, mc]) => mr === r && mc === c);
        let cls = 'rev-cell' + (isValid ? ' valid-move' : '');
        let inner = '';
        if (v === 1) inner = '<div class="rev-piece black">⚫</div>';
        else if (v === 2) inner = '<div class="rev-piece white">⚪</div>';
        else if (isValid) inner = '<span class="move-dot"></span>';
        html += `<div class="${cls}" data-r="${r}" data-c="${c}">${inner}</div>`;
      }
    }
    el.innerHTML = html;
    el.querySelectorAll('.rev-cell').forEach(cell => {
      cell.addEventListener('click', () => placePiece(+cell.dataset.r, +cell.dataset.c));
    });
    updateInfo();
  }

  window.ReversiGame = { init };
})();
