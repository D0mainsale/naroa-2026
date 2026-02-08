/* ═══════════════════════════════════════════════════════════════
   Memory Game — Premium with Real Artwork Images
   Now loads actual artwork images on card faces via ArtworkLoader
   ═══════════════════════════════════════════════════════════════ */
window.MemoryGame = (() => {
  let cards = [], flipped = [], matched = [], moves = 0, timer = 0, timerInterval = null;
  let container, infoBar, artworks = [];
  const PAIRS = 8;

  async function init() {
    container = document.getElementById('memory-container');
    if (!container) return;
    container.innerHTML = '<div class="memory-loading">Loading artworks…</div>';

    artworks = await window.ArtworkLoader.getRandomArtworks(PAIRS);
    if (artworks.length < PAIRS) {
      const more = await window.ArtworkLoader.getRandomArtworks(PAIRS - artworks.length);
      artworks = [...artworks, ...more.slice(0, PAIRS - artworks.length)];
    }

    buildUI();
    setupCards();
    startTimer();
  }

  function buildUI() {
    container.innerHTML = `
      <div class="memory-info">
        <span class="memory-moves">Moves: 0</span>
        <span class="memory-timer">⏱ 0s</span>
        <button class="memory-restart" onclick="MemoryGame.init()">↻ Restart</button>
      </div>
      <div class="memory-grid"></div>
    `;
    infoBar = container.querySelector('.memory-info');
    Object.assign(container.querySelector('.memory-grid').style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '10px',
      maxWidth: '500px',
      margin: '0 auto',
      padding: '10px'
    });
    Object.assign(container.querySelector('.memory-info').style, {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 20px', color: '#fff', fontFamily: 'Inter, sans-serif',
      fontSize: '14px', maxWidth: '500px', margin: '0 auto 10px'
    });
    const btn = container.querySelector('.memory-restart');
    Object.assign(btn.style, {
      background: 'linear-gradient(135deg, #ff6ec7, #7b2ff7)', border: 'none',
      color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
      fontSize: '13px', fontWeight: '600'
    });
  }

  function setupCards() {
    const grid = container.querySelector('.memory-grid');
    const paired = [...artworks.slice(0, PAIRS), ...artworks.slice(0, PAIRS)];
    cards = paired.sort(() => Math.random() - 0.5).map((art, i) => ({
      id: i, artworkId: art.id, img: art.img, title: art.title, flipped: false, matched: false
    }));
    flipped = []; matched = []; moves = 0;
    updateInfo();

    cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.dataset.index = i;
      Object.assign(el.style, {
        aspectRatio: '3/4', borderRadius: '12px', cursor: 'pointer',
        perspective: '600px', position: 'relative'
      });
      el.innerHTML = `
        <div class="memory-card-inner" style="width:100%;height:100%;position:relative;transition:transform 0.6s;transform-style:preserve-3d;">
          <div class="memory-card-back" style="position:absolute;inset:0;backface-visibility:hidden;border-radius:12px;
            background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid rgba(123,47,247,0.4);
            display:flex;align-items:center;justify-content:center;font-size:28px;">
            🎨
          </div>
          <div class="memory-card-face" style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);
            border-radius:12px;overflow:hidden;border:2px solid rgba(255,110,199,0.6);">
          </div>
        </div>
      `;
      // Draw artwork image on face
      const face = el.querySelector('.memory-card-face');
      if (card.img) {
        const imgEl = document.createElement('img');
        imgEl.src = card.img.src;
        imgEl.alt = card.title;
        Object.assign(imgEl.style, {
          width: '100%', height: '100%', objectFit: 'cover', display: 'block'
        });
        face.appendChild(imgEl);
        // Title overlay
        const label = document.createElement('div');
        label.textContent = card.title;
        Object.assign(label.style, {
          position: 'absolute', bottom: '0', left: '0', right: '0',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          color: '#fff', padding: '6px', fontSize: '10px', textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        });
        face.appendChild(label);
      }

      el.addEventListener('click', () => flipCard(i, el));
      grid.appendChild(el);
    });
  }

  function flipCard(index, el) {
    const card = cards[index];
    if (card.flipped || card.matched || flipped.length >= 2) return;
    card.flipped = true;
    flipped.push(index);
    el.querySelector('.memory-card-inner').style.transform = 'rotateY(180deg)';

    if (flipped.length === 2) {
      moves++;
      updateInfo();
      const [a, b] = flipped;
      if (cards[a].artworkId === cards[b].artworkId) {
        cards[a].matched = cards[b].matched = true;
        matched.push(a, b);
        flipped = [];
        // Glow effect
        [a, b].forEach(idx => {
          const c = container.querySelectorAll('.memory-card')[idx];
          c.style.boxShadow = '0 0 20px rgba(255,110,199,0.8), 0 0 40px rgba(123,47,247,0.4)';
        });
        if (typeof GameEffects !== 'undefined') GameEffects.confetti(container);
        if (matched.length === cards.length) gameWon();
      } else {
        setTimeout(() => {
          [a, b].forEach(idx => {
            cards[idx].flipped = false;
            container.querySelectorAll('.memory-card')[idx]
              .querySelector('.memory-card-inner').style.transform = '';
          });
          flipped = [];
        }, 1000);
      }
    }
  }

  function updateInfo() {
    const movesEl = container.querySelector('.memory-moves');
    if (movesEl) movesEl.textContent = `Moves: ${moves}`;
  }

  function startTimer() {
    timer = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer++;
      const t = container.querySelector('.memory-timer');
      if (t) t.textContent = `⏱ ${timer}s`;
    }, 1000);
  }

  function gameWon() {
    clearInterval(timerInterval);
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute', inset: '0', background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: '100', borderRadius: '16px'
    });
    overlay.innerHTML = `
      <div style="font-size:48px;margin-bottom:16px">🎉</div>
      <h2 style="color:#ff6ec7;font-family:Inter,sans-serif;margin:0 0 8px">¡Completado!</h2>
      <p style="color:#ccc;font-family:Inter,sans-serif;font-size:14px">${moves} moves · ${timer}s</p>
      <button onclick="MemoryGame.init()" style="margin-top:16px;background:linear-gradient(135deg,#ff6ec7,#7b2ff7);
        border:none;color:#fff;padding:10px 24px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:600">
        Play Again
      </button>
    `;
    container.style.position = 'relative';
    container.appendChild(overlay);
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('memory', moves * 100 + timer);
  }

  function destroy() {
    clearInterval(timerInterval);
    if (container) container.innerHTML = '';
  }

  return { init, destroy };
})();
