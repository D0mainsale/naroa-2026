/**
 * ARCADE LEADERBOARD SYSTEM
 * Top 10 persistent rankings for Naroa Games Hub
 * Like classic arcade machines - enter 3 initials!
 */

const ArcadeLeaderboard = {
  STORAGE_KEY: 'naroa_arcade_rankings',
  MAX_ENTRIES: 10,

  // Initialize leaderboard storage
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
    }
    return this;
  },

  // Get rankings for a specific game
  getRankings(gameId) {
    const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return all[gameId] || [];
  },

  // Check if score qualifies for leaderboard
  isHighScore(gameId, score) {
    const rankings = this.getRankings(gameId);
    if (rankings.length < this.MAX_ENTRIES) return true;
    return score > rankings[rankings.length - 1].score;
  },

  // Add a new score (returns position or -1 if didn't qualify)
  addScore(gameId, initials, score) {
    const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    if (!all[gameId]) all[gameId] = [];
    
    const entry = {
      initials: initials.toUpperCase().slice(0, 3).padEnd(3, '_'),
      score: score,
      date: new Date().toISOString().split('T')[0]
    };

    all[gameId].push(entry);
    all[gameId].sort((a, b) => b.score - a.score);
    all[gameId] = all[gameId].slice(0, this.MAX_ENTRIES);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    
    const position = all[gameId].findIndex(e => 
      e.initials === entry.initials && 
      e.score === entry.score && 
      e.date === entry.date
    );
    
    return position !== -1 ? position + 1 : -1;
  },

  // Clear rankings for a game
  clearGame(gameId) {
    const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    delete all[gameId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  },

  // Render leaderboard HTML
  renderHTML(gameId, currentScore = null) {
    const rankings = this.getRankings(gameId);
    const isHighScore = currentScore !== null && this.isHighScore(gameId, currentScore);
    
    let html = `
      <div class="arcade-leaderboard">
        <div class="arcade-leaderboard__header">
          <span class="arcade-leaderboard__title">🏆 TOP 10</span>
          <span class="arcade-leaderboard__game">${this.getGameName(gameId)}</span>
        </div>
        <div class="arcade-leaderboard__list">
    `;

    if (rankings.length === 0) {
      html += `<div class="arcade-leaderboard__empty">NO HAY RECORDS</div>`;
    } else {
      rankings.forEach((entry, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        html += `
          <div class="arcade-leaderboard__entry ${i < 3 ? 'arcade-leaderboard__entry--top' : ''}">
            <span class="arcade-leaderboard__rank">${medal}</span>
            <span class="arcade-leaderboard__initials">${entry.initials}</span>
            <span class="arcade-leaderboard__score">${this.formatScore(entry.score)}</span>
          </div>
        `;
      });
    }

    html += `</div>`;
    
    if (isHighScore) {
      html += `
        <div class="arcade-leaderboard__new-highscore">
          <span>¡NUEVO RÉCORD!</span>
          <input type="text" class="arcade-leaderboard__input" maxlength="3" placeholder="___" 
                 onkeyup="this.value = this.value.toUpperCase()">
          <button class="arcade-leaderboard__submit" onclick="ArcadeLeaderboard.submitFromUI('${gameId}', ${currentScore})">
            GUARDAR
          </button>
        </div>
      `;
    }

    html += `</div>`;
    return html;
  },

  // Submit score from UI
  submitFromUI(gameId, score) {
    const input = document.querySelector('.arcade-leaderboard__input');
    if (input && input.value.length > 0) {
      const position = this.addScore(gameId, input.value, score);
      
      // Update display
      const container = document.querySelector('.arcade-leaderboard').parentElement;
      if (container) {
        container.innerHTML = this.renderHTML(gameId);
      }
      
      // Play sound effect
      this.playSound('highscore');
      
      return position;
    }
    return -1;
  },

  // Format score with commas
  formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Get human-readable game name
  getGameName(gameId) {
    const names = {
      'memory': 'MEMORY',
      'puzzle': 'PUZZLE',
      'snake': 'SNAKE',
      'breakout': 'BREAKOUT',
      'whack': 'GOLPEA',
      'simon': 'SIMÓN',
      'quiz': 'QUIZ',
      'catch': 'CATCH',
      'collage': 'COLLAGE',
      'reinas': 'REINAS',
      'mica': 'MICA',
      'kintsugi': 'KINTSUGI',
      'pong': 'PONG',
      'reaction': 'REACCIÓN',
      'typing': 'TYPING',
      'chess': 'AJEDREZ',
      'checkers': 'DAMAS',
      'connect4': 'CONECTA4',
      'reversi': 'REVERSI'
    };
    return names[gameId] || gameId.toUpperCase();
  },

  // Play arcade sound
  playSound(type) {
    // Could be expanded with actual audio
    if (type === 'highscore') {
    }
  },

  // Show leaderboard modal
  showModal(gameId, currentScore = null) {
    const overlay = document.createElement('div');
    overlay.className = 'arcade-modal-overlay';
    overlay.innerHTML = `
      <div class="arcade-modal">
        ${this.renderTournamentInfo()}
        ${this.renderHTML(gameId, currentScore)}
        <button class="arcade-modal__close" onclick="this.closest('.arcade-modal-overlay').remove()">
          CONTINUAR
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  // TOURNAMENT SYSTEM
  tournaments: {
    // Special dates with prizes
    calendar: [
      { date: '02-14', name: '💝 San Valentín', prize: 'Arte exclusivo firmado' },
      { date: '03-08', name: '💜 Día de la Mujer', prize: 'Print edición limitada' },
      { date: '04-23', name: '📚 Día del Libro', prize: 'Catálogo firmado' },
      { date: '05-15', name: '🎨 Día del Artista', prize: 'Sesión con Naroa' },
      { date: '10-31', name: '🎃 Halloween Art', prize: 'Obra temática' },
      { date: '12-25', name: '🎄 Navidad', prize: 'Pack coleccionista' }
    ],

    // Weekly challenge (every Sunday)
    weeklyReset: 0, // Sunday

    // Monthly challenge (1st of each month)
    monthlyReset: 1
  },

  // Check if today is a tournament day
  getActiveTournament() {
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Check special dates
    const special = this.tournaments.calendar.find(t => t.date === monthDay);
    if (special) {
      return {
        type: 'special',
        name: special.name,
        prize: special.prize,
        endsIn: this.getTimeUntilMidnight()
      };
    }

    // Check if it's Sunday (weekly tournament ends)
    if (today.getDay() === 0) {
      return {
        type: 'weekly',
        name: '🏆 Torneo Semanal',
        prize: 'Mención en redes',
        endsIn: this.getTimeUntilMidnight()
      };
    }

    // Check if it's 1st of month
    if (today.getDate() === 1) {
      return {
        type: 'monthly',
        name: '👑 Torneo Mensual',
        prize: 'Postal firmada',
        endsIn: this.getTimeUntilMidnight()
      };
    }

    // Regular day - show time until next tournament
    return {
      type: 'countdown',
      name: 'Próximo torneo',
      nextDate: this.getNextTournamentDate(),
      endsIn: null
    };
  },

  getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  getNextTournamentDate() {
    const today = new Date();
    // Find next Sunday
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  },

  renderTournamentInfo() {
    const tournament = this.getActiveTournament();
    
    if (tournament.type === 'countdown') {
      return `
        <div class="arcade-tournament-timer">
          <div class="arcade-tournament-timer__label">${tournament.name}</div>
          <div class="arcade-tournament-timer__time">${tournament.nextDate}</div>
        </div>
      `;
    }

    return `
      <div class="arcade-tournament-timer" style="border-color: #ffd700;">
        <div class="arcade-tournament-badge">¡ACTIVO!</div>
        <div class="arcade-tournament-timer__label">${tournament.name}</div>
        <div class="arcade-tournament-timer__time" id="tournament-countdown">${tournament.endsIn}</div>
        <div class="arcade-tournament-timer__prize">🎁 Premio: ${tournament.prize}</div>
      </div>
    `;
  },

  // Start countdown timer
  startCountdown() {
    setInterval(() => {
      const el = document.getElementById('tournament-countdown');
      if (el) {
        el.textContent = this.getTimeUntilMidnight();
      }
    }, 1000);
  }
};

// Auto-initialize
ArcadeLeaderboard.init();
ArcadeLeaderboard.startCountdown();

// Expose globally
window.ArcadeLeaderboard = ArcadeLeaderboard;
