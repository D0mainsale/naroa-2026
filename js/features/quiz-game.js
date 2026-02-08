// === FILE: js/features/quiz-game.js ===
// Premium Quiz Game - Artwork title/series knowledge test
// Features: Slide transitions, confetti/shake feedback, progress bar, timer, streak counter

(function() {
  'use strict';

  const CONFIG = {
    questionsPerGame: 10,
    questionTime: 15,
    colors: {
      primary: '#d4af37',
      danger: '#ff003c',
      info: '#3b82f6',
      gold: '#ffd700',
      success: '#10b981',
      bg: '#0d0d1a'
    }
  };

  let artworks = [];
  let questions = [];
  let currentQuestion = 0;
  let score = 0;
  let streak = 0;
  let maxStreak = 0;
  let timeLeft = CONFIG.questionTime;
  let timerInterval;
  let gameActive = false;
  let particles = [];

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10 - 5;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.color = color;
      this.size = Math.random() * 8 + 4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;
      this.life -= this.decay;
      this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  async function loadArtworks() {
    try {
      const response = await fetch('data/artworks-metadata.json');
      const data = await response.json();
      return data.artworks;
    } catch (error) {
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        title: `Artwork ${i + 1}`,
        series: `Series ${Math.floor(i / 3) + 1}`,
        technique: 'Mixed Media'
      }));
    }
  }

  function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function generateQuestions(artworksData) {
    const shuffled = shuffle(artworksData);
    return shuffled.slice(0, CONFIG.questionsPerGame).map(artwork => {
      const questionType = Math.random() < 0.5 ? 'title' : 'series';
      const wrongOptions = shuffle(artworksData.filter(a => a.id !== artwork.id))
        .slice(0, 3)
        .map(a => questionType === 'title' ? a.title : a.series);

      return {
        artwork,
        questionType,
        question: questionType === 'title' 
          ? `What is the title of this artwork?`
          : `Which series does this artwork belong to?`,
        correct: questionType === 'title' ? artwork.title : artwork.series,
        options: shuffle([questionType === 'title' ? artwork.title : artwork.series, ...wrongOptions])
      };
    });
  }

  function createParticles(x, y, color, count = 20) {
    const canvas = document.getElementById('quiz-particles');
    if (!canvas) return;
    
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animateParticles() {
    if (!gameActive && particles.length === 0) return;

    const canvas = document.getElementById('quiz-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    if (gameActive || particles.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  }

  function updateProgress() {
    const progress = (currentQuestion / CONFIG.questionsPerGame) * 100;
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressText = document.getElementById('quiz-progress-text');
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.style.background = `linear-gradient(90deg, ${CONFIG.colors.primary}, ${CONFIG.colors.gold})`;
    }
    if (progressText) {
      progressText.textContent = `${currentQuestion}/${CONFIG.questionsPerGame}`;
    }
  }

  function updateTimer() {
    timeLeft--;
    const timerEl = document.getElementById('quiz-timer');
    const timerBar = document.getElementById('question-timer-bar');
    
    if (timerEl) timerEl.textContent = timeLeft;
    
    if (timerBar) {
      const percent = (timeLeft / CONFIG.questionTime) * 100;
      timerBar.style.width = `${percent}%`;
      
      if (percent < 30) {
        timerBar.style.background = CONFIG.colors.danger;
        timerEl.style.color = CONFIG.colors.danger;
      } else if (percent < 60) {
        timerBar.style.background = CONFIG.colors.gold;
        timerEl.style.color = CONFIG.colors.gold;
      } else {
        timerBar.style.background = CONFIG.colors.success;
        timerEl.style.color = CONFIG.colors.success;
      }
    }

    if (timeLeft <= 0) {
      handleTimeout();
    }
  }

  function updateStreak() {
    const streakEl = document.getElementById('quiz-streak');
    const streakContainer = document.getElementById('quiz-streak-container');
    
    if (streakEl) streakEl.textContent = streak;
    
    if (streak >= 3) {
      streakContainer.style.opacity = '1';
      streakContainer.style.transform = 'scale(1)';
      
      // Fire animation
      streakContainer.animate([
        { boxShadow: `0 0 20px ${CONFIG.colors.gold}40` },
        { boxShadow: `0 0 40px ${CONFIG.colors.gold}80` },
        { boxShadow: `0 0 20px ${CONFIG.colors.gold}40` }
      ], { duration: 500 });
    } else {
      streakContainer.style.opacity = '0.6';
      streakContainer.style.transform = 'scale(0.95)';
    }
  }

  function showQuestion() {
    const q = questions[currentQuestion];
    const container = document.getElementById('quiz-question-container');
    
    // Slide out current
    if (container.innerHTML) {
      container.style.animation = 'slideOutLeft 0.3s ease forwards';
    }

    setTimeout(() => {
      container.innerHTML = `
        <div class="question-card" style="
          background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
          border: 2px solid ${CONFIG.colors.primary}40;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 0 40px rgba(212, 175, 55, 0.1);
        ">
          <div class="artwork-display" style="
            width: 150px;
            height: 150px;
            margin: 0 auto 25px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${CONFIG.colors.primary}30, ${CONFIG.colors.info}30);
            border: 3px solid ${CONFIG.colors.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 30px ${CONFIG.colors.primary}40;
          ">
            <span style="font-size: 60px; color: ${CONFIG.colors.gold}; text-shadow: 0 0 20px ${CONFIG.colors.gold};">${q.artwork.title.charAt(0)}</span>
          </div>
          
          <div class="question-text" style="
            font-size: 20px;
            color: #fff;
            margin-bottom: 25px;
            font-weight: 600;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          ">${q.question}</div>
          
          <div class="options-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            ${q.options.map((opt, i) => `
              <button class="quiz-option" data-index="${i}" style="
                background: linear-gradient(135deg, #252540, #1a1a2e);
                border: 2px solid ${CONFIG.colors.info}40;
                color: #fff;
                padding: 18px 20px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: Satoshi, sans-serif;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              " onmouseover="this.style.borderColor='${CONFIG.colors.primary}'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(204,255,0,0.2)'" 
              onmouseout="this.style.borderColor='${CONFIG.colors.info}40'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.3)'">${opt}</button>
            `).join('')}
          </div>
        </div>
      `;

      container.style.animation = 'slideInRight 0.3s ease forwards';

      // Add option handlers
      container.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(btn, q));
      });

      // Reset timer
      timeLeft = CONFIG.questionTime;
      document.getElementById('quiz-timer').textContent = timeLeft;
      document.getElementById('question-timer-bar').style.width = '100%';
      document.getElementById('question-timer-bar').style.background = CONFIG.colors.success;
      document.getElementById('quiz-timer').style.color = CONFIG.colors.success;
      
      clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
    }, 300);

    updateProgress();
  }

  function handleAnswer(btn, question) {
    if (!gameActive) return;
    clearInterval(timerInterval);

    const selected = btn.textContent;
    const isCorrect = selected === question.correct;
    const rect = btn.getBoundingClientRect();
    const container = document.getElementById('quiz-container');
    const containerRect = container.getBoundingClientRect();

    // Disable all options
    document.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      b.style.cursor = 'default';
    });

    if (isCorrect) {
      // Correct answer
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      
      const points = 100 + (timeLeft * 10) + (streak * 20);
      score += points;

      btn.style.background = `linear-gradient(135deg, ${CONFIG.colors.success}, #059669)`;
      btn.style.borderColor = CONFIG.colors.success;
      btn.style.boxShadow = `0 0 30px ${CONFIG.colors.success}60`;

      createParticles(rect.left - containerRect.left + rect.width / 2, 
                      rect.top - containerRect.top + rect.height / 2, 
                      CONFIG.colors.gold);

      if (window.GameEffects?.confettiBurst) {
        window.GameEffects.confettiBurst(btn);
      }
      if (window.GameEffects?.scorePopAnimation) {
        window.GameEffects.scorePopAnimation(btn, `+${points}`);
      }
      if (window.GameEffects?.hapticFeedback) {
        window.GameEffects.hapticFeedback();
      }
    } else {
      // Wrong answer
      streak = 0;
      
      btn.style.background = `linear-gradient(135deg, ${CONFIG.colors.danger}, #dc2626)`;
      btn.style.borderColor = CONFIG.colors.danger;
      btn.style.boxShadow = `0 0 30px ${CONFIG.colors.danger}60`;

      // Highlight correct answer
      document.querySelectorAll('.quiz-option').forEach(b => {
        if (b.textContent === question.correct) {
          b.style.background = `linear-gradient(135deg, ${CONFIG.colors.success}, #059669)`;
          b.style.borderColor = CONFIG.colors.success;
        }
      });

      // Shake effect
      const card = document.querySelector('.question-card');
      card.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(0)' }
      ], { duration: 400 });

      createParticles(rect.left - containerRect.left + rect.width / 2, 
                      rect.top - containerRect.top + rect.height / 2, 
                      CONFIG.colors.danger);

      if (window.GameEffects?.cameraShake) {
        window.GameEffects.cameraShake(document.querySelector('.question-card'), 0.5);
      }
    }

    updateStreak();
    document.getElementById('quiz-score').textContent = score;

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        showQuestion();
      } else {
        endGame();
      }
    }, 1500);
  }

  function handleTimeout() {
    clearInterval(timerInterval);
    streak = 0;
    updateStreak();

    // Highlight correct answer
    document.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (b.textContent === questions[currentQuestion].correct) {
        b.style.background = `linear-gradient(135deg, ${CONFIG.colors.success}, #059669)`;
        b.style.borderColor = CONFIG.colors.success;
      }
    });

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        showQuestion();
      } else {
        endGame();
      }
    }, 1500);
  }

  function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    if (window.GameEffects?.confettiBurst) {
      window.GameEffects.confettiBurst(document.getElementById('quiz-container'));
    }

    setTimeout(() => {
      if (window.RankingSystem?.showSubmitModal) {
        window.RankingSystem.showSubmitModal('quiz', score);
      }
    }, 500);
  }

  async function startGame() {
    artworks = await loadArtworks();
    questions = generateQuestions(artworks);
    currentQuestion = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    gameActive = true;
    particles = [];

    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-game').style.display = 'block';
    document.getElementById('quiz-score').textContent = '0';

    updateStreak();
    showQuestion();
    animateParticles();
  }

  async function initGame(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="quiz-container" class="quiz-game-wrapper" style="font-family: Satoshi, sans-serif; text-align: center; position: relative;">
        <div class="game-ui" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="score-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 10px 20px; border-radius: 12px; border: 1px solid ${CONFIG.colors.primary}; box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);">
            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Score</span>
            <div id="quiz-score" style="color: ${CONFIG.colors.primary}; font-size: 24px; font-weight: 700;">0</div>
          </div>
          <div class="timer-display" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 10px 20px; border-radius: 12px; border: 1px solid ${CONFIG.colors.success}; box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);">
            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Time</span>
            <div id="quiz-timer" style="color: ${CONFIG.colors.success}; font-size: 24px; font-weight: 700;">${CONFIG.questionTime}</div>
          </div>
          <div id="quiz-streak-container" style="background: linear-gradient(135deg, #1a1a2e, #0f0f1a); padding: 10px 20px; border-radius: 12px; border: 1px solid ${CONFIG.colors.gold}; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); opacity: 0.6; transform: scale(0.95); transition: all 0.3s ease;">
            <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Streak</span>
            <div id="quiz-streak" style="color: ${CONFIG.colors.gold}; font-size: 24px; font-weight: 700;">0</div>
          </div>
        </div>

        <div class="progress-container" style="width: 100%; max-width: 500px; margin: 0 auto 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #888; font-size: 12px;">Progress</span>
            <span id="quiz-progress-text" style="color: #888; font-size: 12px;">0/${CONFIG.questionsPerGame}</span>
          </div>
          <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
            <div id="quiz-progress-bar" style="width: 0%; height: 100%; background: ${CONFIG.colors.primary}; border-radius: 4px; transition: width 0.3s ease;"></div>
          </div>
        </div>

        <div class="timer-bar-container" style="width: 100%; max-width: 500px; margin: 0 auto 20px;">
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
            <div id="question-timer-bar" style="width: 100%; height: 100%; background: ${CONFIG.colors.success}; border-radius: 3px; transition: width 1s linear;"></div>
          </div>
        </div>

        <div id="quiz-game" style="display: none;">
          <div id="quiz-question-container" style="max-width: 500px; margin: 0 auto;"></div>
        </div>

        <button id="quiz-start" style="
          background: linear-gradient(135deg, ${CONFIG.colors.primary}, #88cc00);
          color: #000;
          border: none;
          padding: 18px 50px;
          font-size: 18px;
          font-weight: 700;
          border-radius: 30px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 0 30px ${CONFIG.colors.primary}60;
          transition: all 0.3s ease;
          font-family: Satoshi, sans-serif;
          margin-top: 20px;
        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 50px ${CONFIG.colors.primary}80'" 
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 30px ${CONFIG.colors.primary}60'">START QUIZ</button>

        <canvas id="quiz-particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"></canvas>
      </div>
    `;

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-50px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Setup particle canvas
    const canvas = document.getElementById('quiz-particles');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    document.getElementById('quiz-start').addEventListener('click', startGame);
  }

  // Public API
  window.QuizGame = {
    init: initGame
  };
})();
