/**
 * AUDIO INTEGRATION HOOKS
 * Connects audio to UI interactions across the site
 */

const AudioHooks = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Wait for audio engine
    const waitForAudio = setInterval(() => {
      if (window.ImmersiveAudio?.ctx && window.AudioSynth) {
        clearInterval(waitForAudio);
        this.setupHooks();
      }
    }, 100);
  },

  setupHooks() {
    // Game cards hover
    this.hookGameCards();
    
    // Gallery items
    this.hookGalleryItems();
    
    // Navigation
    this.hookNavigation();
    
    // Buttons
    this.hookButtons();
    
    // Game events
    this.hookGameEvents();
    
    // Scroll reveals
    this.hookScrollReveals();
    
    // === NAROA-SPECIFIC HOOKS ===
    this.hookAboutSection();
    this.hookTissueCards();
    this.hookTournamentEvents();
    this.hookArtworkTear();
  },

  hookGameCards() {
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        if (window.AudioSynth && !ImmersiveAudio.isMuted) {
          AudioSynth.uiHover();
        }
        // Add visual pulse
        card.style.animation = 'card-pulse 0.3s ease';
        setTimeout(() => card.style.animation = '', 300);
      });

      card.addEventListener('click', () => {
        if (window.AudioSynth && !ImmersiveAudio.isMuted) {
          AudioSynth.uiClick();
        }
      });
    });
  },

  hookGalleryItems() {
    // Intersection observer for gallery reveals
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const rect = entry.target.getBoundingClientRect();
          const pan = (rect.left / window.innerWidth) * 2 - 1;
          
          if (window.AudioSynth && !ImmersiveAudio.isMuted) {
            // Spatial artwork reveal based on position
            const panner = ImmersiveAudio.create3DPanner(pan * 3, 0, -4);
            AudioSynth.artworkReveal(panner);
          }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.gallery-item, .artwork-card').forEach(item => {
      observer.observe(item);
    });
  },

  hookNavigation() {
    document.querySelectorAll('.nav__menu a, .nav__logo').forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (window.AudioSynth && !ImmersiveAudio.isMuted) {
          AudioSynth.uiHover();
        }
      });

      link.addEventListener('click', () => {
        if (window.AudioSynth && !ImmersiveAudio.isMuted) {
          AudioSynth.transition();
        }
      });
    });
  },

  hookButtons() {
    document.querySelectorAll('button, .btn, .cta-btn, [role="button"]').forEach(btn => {
      if (btn.classList.contains('audio-btn')) return; // Skip audio controls
      
      btn.addEventListener('mouseenter', () => {
        if (window.AudioSynth && !ImmersiveAudio.isMuted) {
          AudioSynth.uiHover();
        }
      });

      btn.addEventListener('click', () => {
        if (window.AudioSynth && !ImmersiveAudio.isMuted) {
          AudioSynth.uiClick();
        }
      });
    });
  },

  hookGameEvents() {
    // Listen for custom game events
    document.addEventListener('game:start', () => {
      if (window.AudioSynth && !ImmersiveAudio.isMuted) {
        AudioSynth.success();
      }
    });

    document.addEventListener('game:move', () => {
      if (window.AudioSynth && !ImmersiveAudio.isMuted) {
        AudioSynth.gameMove();
      }
    });

    document.addEventListener('game:win', () => {
      if (window.AudioSynth && !ImmersiveAudio.isMuted) {
        AudioSynth.gameWin();
      }
    });

    document.addEventListener('game:highscore', () => {
      if (window.AudioSynth && !ImmersiveAudio.isMuted) {
        AudioSynth.highScore();
      }
    });
  },

  hookScrollReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.classList.contains('reveal')) {
          // Subtle ambient swell on section reveals
          if (window.ImmersiveAudio?.ambientDrone && !ImmersiveAudio.isMuted) {
            const drone = ImmersiveAudio.ambientDrone;
            if (drone.setVolume) {
              drone.setVolume(0.04);
              setTimeout(() => drone.setVolume(0.02), 1000);
            }
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.reveal, section').forEach(el => {
      observer.observe(el);
    });
  },

  // Trigger MICA shimmer audio
  playMicaEffect() {
    if (window.AudioSynth && !ImmersiveAudio.isMuted) {
      const panner = ImmersiveAudio.create3DPanner(-2, 0, -4);
      AudioSynth.micaShimmer(panner);
      
      // Animate panner position
      ImmersiveAudio.animatePanner(panner, {
        duration: 3000,
        toX: 2, toY: 0, toZ: -4
      });
    }
  },

  // ==========================================
  // NAROA-SPECIFIC HOOKS (026 Premium)
  // ==========================================

  // Hook About section for heartbeat effect
  hookAboutSection() {
    const aboutSection = document.querySelector('#about, .about-section');
    if (!aboutSection) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && window.AudioSynth && !ImmersiveAudio?.isMuted) {
          // Subtle heartbeat as user enters emotional about section
          AudioSynth.heartbeat026();
        }
      });
    }, { threshold: 0.6 });
    
    observer.observe(aboutSection);
  },

  // Hook Tissukaldeko-style cards for paper sounds
  hookTissueCards() {
    document.querySelectorAll('.tissukaldeko-card, [data-material="paper"]').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        if (window.AudioSynth && !ImmersiveAudio?.isMuted) {
          const rect = card.getBoundingClientRect();
          const panner = ImmersiveAudio?.create3DPanner?.(
            (rect.left / window.innerWidth) * 4 - 2,
            0,
            -3
          );
          AudioSynth.paperCrumple(rect.x, rect.y, panner);
        }
      });
    });
  },

  // Hook tournament jackpot wins
  hookTournamentEvents() {
    document.addEventListener('tournament:jackpot', () => {
      if (window.AudioSynth && !ImmersiveAudio?.isMuted) {
        AudioSynth.jackpot();
      }
    });
    
    // Also trigger on arcade TOP 1 score
    document.addEventListener('score:top1', () => {
      if (window.AudioSynth && !ImmersiveAudio?.isMuted) {
        AudioSynth.jackpot();
      }
    });
  },

  // Start Sopela ambient wind (coastal Basque atmosphere)
  startSopelaAmbient() {
    if (window.AudioSynth && !ImmersiveAudio?.isMuted && !this.sopelaWind) {
      this.sopelaWind = AudioSynth.createSopelaWind();
      if (this.sopelaWind) {
        this.sopelaWind.start();
      }
    }
  },

  stopSopelaAmbient() {
    if (this.sopelaWind) {
      this.sopelaWind.stop();
      this.sopelaWind = null;
    }
  },

  // Hook tear sound for artwork interactions
  hookArtworkTear() {
    document.querySelectorAll('.artwork-frame, .gallery-tear-effect').forEach(el => {
      el.addEventListener('click', () => {
        if (window.AudioSynth && !ImmersiveAudio?.isMuted) {
          const panner = ImmersiveAudio?.create3DPanner?.(0, 0, -2);
          AudioSynth.tear(panner);
        }
      });
    });
  }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AudioHooks.init());
} else {
  AudioHooks.init();
}

// Re-hook after route changes (SPA)
window.addEventListener('hashchange', () => {
  setTimeout(() => AudioHooks.init(), 100);
});

window.AudioHooks = AudioHooks;
