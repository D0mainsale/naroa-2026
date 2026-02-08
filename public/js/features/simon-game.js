/* ═══════════════════════════════════════════════════════════════
   Simon — Premium with Artwork Button Textures
   Each colored button shows an artwork image as background
   ═══════════════════════════════════════════════════════════════ */
window.SimonGame = (() => {
  let container, pattern = [], userInput = [], level = 0, score = 0, playing = false;
  let artImgs = [];
  const COLORS = ['#ef4444','#3b82f6','#22c55e','#eab308'];
  const TONES = [261.6, 329.6, 392, 523.3];

  async function init() {
    container = document.getElementById('simon-container');
    if (!container) return;
    const loaded = await window.ArtworkLoader.getRandomArtworks(4);
    artImgs = loaded;
    buildUI();
    pattern = []; userInput = []; level = 0; score = 0; playing = false;
    nextRound();
  }

  function buildUI() {
    container.innerHTML = `
      <div style="text-align:center;font-family:Inter,sans-serif;padding:16px">
        <div style="color:#aaa;font-size:13px;margin-bottom:12px">
          Level: <span id="simon-level" style="color:#ff6ec7;font-weight:700">0</span>
          &nbsp;·&nbsp; Score: <span id="simon-score" style="color:#7b2ff7;font-weight:700">0</span>
        </div>
        <div class="simon-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:320px;margin:0 auto"></div>
      </div>
    `;
    const grid = container.querySelector('.simon-grid');
    COLORS.forEach((color, i) => {
      const btn = document.createElement('div');
      btn.className = 'simon-btn';
      btn.dataset.index = i;
      Object.assign(btn.style, {
        aspectRatio: '1', borderRadius: '16px', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        border: `3px solid ${color}`, opacity: '0.6',
        transition: 'all 0.2s', background: '#0a0a1a'
      });
      // Artwork background
      if (artImgs[i] && artImgs[i].img) {
        const img = document.createElement('img');
        img.src = artImgs[i].img.src;
        Object.assign(img.style, {
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          filter: 'brightness(0.3)', transition: 'filter 0.3s'
        });
        btn.appendChild(img);
      }
      // Color overlay
      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'absolute', inset: '0', background: color, opacity: '0.15',
        transition: 'opacity 0.3s', pointerEvents: 'none'
      });
      btn.appendChild(overlay);
      btn.addEventListener('click', () => { if (playing) handleInput(i, btn); });
      grid.appendChild(btn);
    });
  }

  function playTone(freq, dur = 200) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
      osc.connect(gain).connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur / 1000);
    } catch(e) {}
  }

  function flashButton(index, duration = 400) {
    const btns = container.querySelectorAll('.simon-btn');
    const btn = btns[index]; if (!btn) return;
    btn.style.opacity = '1';
    btn.style.boxShadow = `0 0 30px ${COLORS[index]}`;
    const img = btn.querySelector('img');
    if (img) img.style.filter = 'brightness(1)';
    const overlay = btn.querySelectorAll('div');
    if (overlay[0]) overlay[0].style.opacity = '0.5';
    playTone(TONES[index], duration);
    setTimeout(() => {
      btn.style.opacity = '0.6';
      btn.style.boxShadow = 'none';
      if (img) img.style.filter = 'brightness(0.3)';
      if (overlay[0]) overlay[0].style.opacity = '0.15';
    }, duration);
  }

  function nextRound() {
    level++;
    pattern.push(Math.floor(Math.random() * 4));
    updateInfo();
    playing = false;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= pattern.length) { clearInterval(interval); playing = true; userInput = []; return; }
      flashButton(pattern[i], 350);
      i++;
    }, 600);
  }

  function handleInput(index, btn) {
    flashButton(index, 200);
    userInput.push(index);
    const ci = userInput.length - 1;
    if (userInput[ci] !== pattern[ci]) { endGame(); return; }
    if (userInput.length === pattern.length) {
      playing = false;
      score += level * 10;
      updateInfo();
      setTimeout(nextRound, 800);
    }
  }

  function updateInfo() {
    const l = document.getElementById('simon-level');
    const s = document.getElementById('simon-score');
    if (l) l.textContent = level;
    if (s) s.textContent = score;
  }

  function endGame() {
    playing = false;
    const ov = document.createElement('div');
    Object.assign(ov.style,{position:'absolute',inset:'0',background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:'100',borderRadius:'16px'});
    ov.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🎵</div><h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">Game Over</h2><p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">Level: ${level} · Score: ${score}</p><button onclick="SimonGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">Play Again</button>`;
    container.style.position='relative';container.appendChild(ov);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('simon', score);
  }

  function destroy() { if (container) container.innerHTML = ''; }
  return { init, destroy };
})();
