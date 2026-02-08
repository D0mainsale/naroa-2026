/**
 * Connect 4 - Naroa 2026
 * Agent A21: Drop animation with bounce, win line laser glow
 */
(function() {
  'use strict';

  const ROWS = 6, COLS = 7;
  let state = { board: [], turn: 1, winner: null, winCells: [] };

  function init() {
    const container = document.getElementById('connect4-container');
    if (!container) return;
    reset();

    container.innerHTML = `
      <div class="c4-ui">
        <div class="c4-info">
          <span>Turno: <strong id="c4-turn" style="color:#ff003c">🔴 Rojo</strong></span>
          <button class="game-btn secondary" id="c4-reset">Reiniciar</button>
        </div>
        <div id="c4-board" class="c4-board"></div>
      </div>
    `;
    document.getElementById('c4-reset').addEventListener('click', () => { reset(); render(); });
    render();
  }

  function reset() {
    state.board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    state.turn = 1;
    state.winner = null;
    state.winCells = [];
  }

  function dropPiece(col) {
    if (state.winner) return;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (state.board[r][col] === 0) {
        state.board[r][col] = state.turn;
        const win = checkWin(r, col);
        if (win) {
          state.winner = state.turn;
          state.winCells = win;
          if (window.GameEffects) GameEffects.confettiBurst(document.getElementById('c4-board'));
        } else {
          state.turn = state.turn === 1 ? 2 : 1;
          const turnEl = document.getElementById('c4-turn');
          if (turnEl) {
            turnEl.textContent = state.turn === 1 ? '🔴 Rojo' : '🟡 Amarillo';
            turnEl.style.color = state.turn === 1 ? '#ff003c' : '#ffd700';
          }
        }
        if (window.GameEffects) GameEffects.hapticFeedback();
        render();
        return;
      }
    }
  }

  function checkWin(r, c) {
    const p = state.board[r][c];
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of dirs) {
      const cells = [[r, c]];
      for (let i = 1; i < 4; i++) { const nr = r+dr*i, nc = c+dc*i; if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&state.board[nr][nc]===p) cells.push([nr,nc]); else break; }
      for (let i = 1; i < 4; i++) { const nr = r-dr*i, nc = c-dc*i; if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&state.board[nr][nc]===p) cells.push([nr,nc]); else break; }
      if (cells.length >= 4) return cells;
    }
    return null;
  }

  function render() {
    const el = document.getElementById('c4-board');
    if (!el) return;
    let html = '';

    // Column headers for hover
    html += '<div class="c4-cols">';
    for (let c = 0; c < COLS; c++) {
      html += `<div class="c4-col-header" data-col="${c}">▼</div>`;
    }
    html += '</div>';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = state.board[r][c];
        const isWin = state.winCells.some(([wr, wc]) => wr === r && wc === c);
        let cls = 'c4-cell';
        if (v === 1) cls += ' red';
        else if (v === 2) cls += ' yellow';
        if (isWin) cls += ' win-glow';
        html += `<div class="${cls}" data-col="${c}"></div>`;
      }
    }
    el.innerHTML = html;
    el.querySelectorAll('.c4-col-header, .c4-cell').forEach(cell => {
      cell.addEventListener('click', () => dropPiece(+cell.dataset.col));
    });
  }

  window.Connect4Game = { init };
})();
