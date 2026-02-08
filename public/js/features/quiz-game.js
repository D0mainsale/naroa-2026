/* ═══════════════════════════════════════════════════════════════
   Quiz Game — Premium with Real Artwork Images
   Shows actual artwork image instead of initial-letter circle
   ═══════════════════════════════════════════════════════════════ */
window.QuizGame = (() => {
  let container, artworks = [], currentQ = 0, score = 0, streak = 0, questions = [];
  const TOTAL_QUESTIONS = 10;

  async function init() {
    container = document.getElementById('quiz-container');
    if (!container) return;
    container.innerHTML = '<div style="color:#aaa;text-align:center;padding:40px">Loading artworks…</div>';

    artworks = await window.ArtworkLoader.getRandomArtworks(TOTAL_QUESTIONS + 10);
    if (artworks.length < 4) {
      container.innerHTML = '<div style="color:#f66;text-align:center;padding:40px">Not enough artworks loaded</div>';
      return;
    }
    generateQuestions();
    currentQ = 0; score = 0; streak = 0;
    showQuestion();
  }

  function generateQuestions() {
    questions = [];
    const pool = [...artworks].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(TOTAL_QUESTIONS, pool.length); i++) {
      const correct = pool[i];
      const type = Math.random() > 0.5 ? 'title' : 'series';
      const wrongPool = pool.filter(a => a.id !== correct.id);
      const wrongs = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [
        type === 'title' ? correct.title : correct.series,
        ...wrongs.map(w => type === 'title' ? w.title : w.series)
      ].sort(() => Math.random() - 0.5);
      questions.push({ artwork: correct, type, correctAnswer: type === 'title' ? correct.title : correct.series, options });
    }
  }

  function showQuestion() {
    if (currentQ >= questions.length) { endGame(); return; }
    const q = questions[currentQ];
    const prompt = q.type === 'title' ? '¿Cuál es el título de esta obra?' : '¿A qué serie pertenece?';

    container.innerHTML = `
      <div style="max-width:500px;margin:0 auto;padding:16px;font-family:Inter,sans-serif">
        <div style="display:flex;justify-content:space-between;color:#aaa;font-size:13px;margin-bottom:12px">
          <span>${currentQ + 1}/${questions.length}</span>
          <span style="color:#ff6ec7">Score: ${score}</span>
          <span>🔥 ${streak}</span>
        </div>
        <div style="width:100%;border-radius:8px;height:4px;background:rgba(255,255,255,0.1);margin-bottom:16px">
          <div style="height:100%;border-radius:8px;width:${((currentQ) / questions.length) * 100}%;
            background:linear-gradient(90deg,#ff6ec7,#7b2ff7);transition:width 0.3s"></div>
        </div>
        <div class="quiz-artwork-display" style="width:100%;aspect-ratio:4/3;border-radius:16px;overflow:hidden;
          margin-bottom:16px;border:2px solid rgba(123,47,247,0.4);position:relative;background:#0a0a1a"></div>
        <p style="color:#fff;text-align:center;margin:0 0 16px;font-size:15px">${prompt}</p>
        <div class="quiz-options" style="display:grid;gap:10px"></div>
      </div>
    `;

    // Draw artwork image
    const display = container.querySelector('.quiz-artwork-display');
    if (q.artwork.img) {
      const imgEl = document.createElement('img');
      imgEl.src = q.artwork.img.src;
      imgEl.alt = 'Artwork';
      Object.assign(imgEl.style, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      display.appendChild(imgEl);
    }

    // Options
    const optGrid = container.querySelector('.quiz-options');
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      Object.assign(btn.style, {
        padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,110,199,0.3)',
        background: 'rgba(26,26,46,0.8)', color: '#fff', fontSize: '14px',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
        textAlign: 'left'
      });
      btn.addEventListener('mouseenter', () => btn.style.borderColor = 'rgba(255,110,199,0.7)');
      btn.addEventListener('mouseleave', () => btn.style.borderColor = 'rgba(255,110,199,0.3)');
      btn.addEventListener('click', () => handleAnswer(opt, q, btn, optGrid));
      optGrid.appendChild(btn);
    });
  }

  function handleAnswer(answer, q, btn, optGrid) {
    const correct = answer === q.correctAnswer;
    const buttons = optGrid.querySelectorAll('button');
    buttons.forEach(b => {
      b.style.pointerEvents = 'none';
      if (b.textContent === q.correctAnswer) {
        b.style.background = 'rgba(0,200,100,0.3)';
        b.style.borderColor = '#00c864';
      }
    });
    if (correct) {
      streak++;
      score += 10 * streak;
      btn.style.background = 'rgba(0,200,100,0.3)';
      if (typeof GameEffects !== 'undefined') GameEffects.confetti(container);
    } else {
      streak = 0;
      btn.style.background = 'rgba(255,50,50,0.3)';
      btn.style.borderColor = '#ff3232';
      // Shake
      container.style.animation = 'shake 0.4s ease';
      setTimeout(() => container.style.animation = '', 400);
    }
    setTimeout(() => { currentQ++; showQuestion(); }, 1500);
  }

  function endGame() {
    container.innerHTML = `
      <div style="max-width:400px;margin:0 auto;padding:40px;text-align:center;font-family:Inter,sans-serif">
        <div style="font-size:56px;margin-bottom:16px">🏆</div>
        <h2 style="color:#ff6ec7;margin:0 0 8px">Quiz Complete!</h2>
        <p style="color:#ccc;font-size:16px;margin:0 0 4px">Score: ${score}</p>
        <p style="color:#aaa;font-size:13px;margin:0 0 24px">Best Streak: 🔥 ${streak}</p>
        <button onclick="QuizGame.init()" style="background:linear-gradient(135deg,#ff6ec7,#7b2ff7);
          border:none;color:#fff;padding:12px 32px;border-radius:24px;cursor:pointer;font-size:15px;font-weight:600">
          Play Again
        </button>
      </div>
    `;
    if (typeof RankingSystem !== 'undefined') RankingSystem.submit('quiz', score);
  }

  function destroy() { if (container) container.innerHTML = ''; }

  return { init, destroy };
})();
