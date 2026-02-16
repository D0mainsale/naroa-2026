/**
 * STRATEGY GAMES: CHESS, CHECKERS, CONNECT4, REVERSI
 */

window.initChessGame = function(container) {
    container.innerHTML = `
      <div class="strategy-game chess">
        <h3>♟️ Ajedrez MICA</h3>
        <div class="board" style="width: 400px; height: 400px; background: #eee; display: grid; grid-template: repeat(8, 1fr) / repeat(8, 1fr);">
          ${Array(64).fill(0).map((_, i) => `<div style="background: ${(Math.floor(i/8)+i)%2===0 ? '#fff':'#ccc'}"></div>`).join('')}
        </div>
        <p>Ajedrez simplificado en desarrollo...</p>
      </div>
    `;
};

window.initCheckersGame = function(container) {
    container.innerHTML = `
      <div class="strategy-game checkers">
        <h3>🔴 Damas ART</h3>
        <div class="board" style="width: 400px; height: 400px; background: #444; display: grid; grid-template: repeat(8, 1fr) / repeat(8, 1fr);">
           ${Array(64).fill(0).map((_, i) => `<div style="background: ${(Math.floor(i/8)+i)%2===0 ? '#555':'#111'}"></div>`).join('')}
        </div>
      </div>
    `;
};

window.initConnect4Game = function(container) {
    container.innerHTML = `
      <div class="strategy-game connect4">
        <h3>🔵 Conecta 4</h3>
        <div class="board" style="width: 400px; height: 350px; background: blue; display: grid; grid-template: repeat(6, 1fr) / repeat(7, 1fr); gap: 5px; padding: 10px;">
           ${Array(42).fill(0).map(() => `<div style="background: #fff; border-radius: 50%;"></div>`).join('')}
        </div>
      </div>
    `;
};

window.initReversiGame = function(container) {
    container.innerHTML = `
      <div class="strategy-game reversi">
        <h3>⚫ Reversi</h3>
        <div class="board" style="width: 400px; height: 400px; background: green; display: grid; grid-template: repeat(8, 1fr) / repeat(8, 1fr); gap: 2px; padding: 2px;">
           ${Array(64).fill(0).map(() => `<div style="background: rgba(0,0,0,0.1); border-radius: 50%;"></div>`).join('')}
        </div>
      </div>
    `;
};
