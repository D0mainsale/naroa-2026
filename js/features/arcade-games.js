/**
 * ARCADE GAMES: RUNNER, ROTATE, SCRATCH, TARGET
 */

window.initRunnerGame = function(container) {
    container.innerHTML = `
      <div class="arcade-game runner">
        <h3>🏃 MICA Runner</h3>
        <canvas id="runner-canvas" width="600" height="200" style="background: #222;"></canvas>
        <p>Pulsa ESPACIO para saltar</p>
      </div>
    `;
    const canvas = container.querySelector('#runner-canvas');
    const ctx = canvas.getContext('2d');
    let x = 0;
    function loop() {
        ctx.clearRect(0, 0, 600, 200);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(50, 150, 30, 30);
        ctx.fillStyle = '#f44336';
        ctx.fillRect(600 - (x % 700), 150, 20, 30);
        x += 5;
        requestAnimationFrame(loop);
    }
    loop();
};

window.initRotateGame = function(container) {
    container.innerHTML = `
      <div class="arcade-game rotate">
        <h3>🔄 Rotate Art</h3>
        <div class="rotator" style="width: 200px; height: 200px; background: gold; margin: 40px auto; transition: transform 0.5s;"></div>
        <button onclick="this.previousElementSibling.style.transform += 'rotate(90deg)'">ROTAR</button>
      </div>
    `;
};

window.initScratchGame = function(container) {
    container.innerHTML = `
      <div class="arcade-game scratch">
        <h3>🎰 Rasca MICA</h3>
        <div class="scratch-card" style="width: 300px; height: 150px; background: #888; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #fff; cursor: crosshair;">
            ✨ PREMIO ARTÍSTICO ✨
        </div>
        <p>Rasca para descubrir tu suerte (Simulado)</p>
      </div>
    `;
};

window.initTargetGame = function(container) {
    container.innerHTML = `
      <div class="arcade-game target">
        <h3>🎯 Target Hunter</h3>
        <div style="width: 600px; height: 400px; background: #333; position: relative;">
            <div id="target-dot" style="position: absolute; width: 40px; height: 40px; background: red; border-radius: 50%; cursor: pointer;"></div>
        </div>
      </div>
    `;
    const dot = container.querySelector('#target-dot');
    dot.onclick = () => {
        dot.style.left = Math.random() * 560 + 'px';
        dot.style.top = Math.random() * 360 + 'px';
    };
    dot.onclick();
};
