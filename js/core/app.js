/**
 * App - Main application bootstrap for Naroa 2026
 * @module core/app
 */

(function() {
  'use strict';

  // ===========================================
  // CONFIGURATION
  // ===========================================
  
  const CONFIG = {
    imagesPath: 'images/artworks/',
    thumbnailsPath: 'images/thumbnails/',
    lazyLoadMargin: '200px',
    animationDuration: 300
  };

  // ===========================================
  // ROUTE REGISTRATION
  // ===========================================

  function registerRoutes() {
    const router = window.Router;

    router
      .register('#/', () => {
        router.showView('view-home');
        // if (window.Swarm) window.Swarm.navigator.flyTo('view-home');
      })
      .register('#/galeria', () => {
        loadArchive();
        if (window.Swarm) {
          window.Swarm.curator.forceLoadGallery();
          // window.Swarm.navigator.flyTo('view-archivo');
        }
        router.showView('view-archivo');
      })
      .register('#/archivo', () => {
        loadArchive();
        if (window.Swarm) {
          window.Swarm.curator.forceLoadGallery();
          // window.Swarm.navigator.flyTo('view-archivo');
        }
        router.showView('view-archivo');
      })
      .register('#/about', () => {
        router.showView('view-about');
        // if (window.Swarm) window.Swarm.navigator.flyTo('view-about');
      })
      .register('#/contacto', () => {
        loadContactoPanel();
        router.showView('view-contacto');
        // if (window.Swarm) window.Swarm.navigator.flyTo('view-contacto');
      })
      .register('#/juego', () => {
        router.showView('view-juego');
        loadGame();
      })
      .register('#/tetris', () => {
        router.showView('view-tetris');
        loadTetris();
      })
      .register('#/juegos', () => {
        router.showView('view-juegos');
      })
      .register('#/memory', () => {
        router.showView('view-memory');
        if (window.MemoryGame) window.MemoryGame.init();
      })
      .register('#/puzzle', () => {
        router.showView('view-puzzle');
        if (window.PuzzleGame) window.PuzzleGame.init();
      })
      .register('#/snake', () => {
        router.showView('view-snake');
        if (window.SnakeGame) window.SnakeGame.init();
      })
      .register('#/breakout', () => {
        router.showView('view-breakout');
        if (window.BreakoutGame) window.BreakoutGame.init();
      })
      .register('#/whack', () => {
        router.showView('view-whack');
        if (window.WhackGame) window.WhackGame.init();
      })
      .register('#/simon', () => {
        router.showView('view-simon');
        if (window.SimonGame) window.SimonGame.init();
      })
      .register('#/quiz', () => {
        router.showView('view-quiz');
        if (window.QuizGame) window.QuizGame.init();
      })
      .register('#/catch', () => {
        router.showView('view-catch');
        if (window.CatchGame) window.CatchGame.init();
      })
      .register('#/collage', () => {
        router.showView('view-collage');
        if (window.CollageGame) window.CollageGame.init();
      })
      .register('#/reinas', () => {
        router.showView('view-reinas');
        if (window.ReinasGame) window.ReinasGame.init();
      })
      .register('#/mica', () => {
        router.showView('view-mica');
        if (window.MicaGame) window.MicaGame.init();
      })
      .register('#/kintsugi', () => {
        router.showView('view-kintsugi');
        if (window.KintsugiGame) window.KintsugiGame.init();
      })
      .register('#/pong', () => {
        router.showView('view-pong');
        if (window.PongGame) window.PongGame.init();
      })
      .register('#/reaction', () => {
        router.showView('view-reaction');
        if (window.ReactionGame) window.ReactionGame.init();
      })
      .register('#/typing', () => {
        router.showView('view-typing');
        if (window.TypingGame) window.TypingGame.init();
      })
      .register('#/chess', () => {
        router.showView('view-chess');
        const container = document.getElementById('chess-container');
        if (container && window.initChessGame) window.initChessGame(container);
      })
      .register('#/checkers', () => {
        router.showView('view-checkers');
        const container = document.getElementById('checkers-container');
        if (container && window.initCheckersGame) window.initCheckersGame(container);
      })
      .register('#/connect4', () => {
        router.showView('view-connect4');
        const container = document.getElementById('connect4-container');
        if (container && window.initConnect4Game) window.initConnect4Game(container);
      })
      .register('#/reversi', () => {
        router.showView('view-reversi');
        const container = document.getElementById('reversi-container');
        if (container && window.initReversiGame) window.initReversiGame(container);
      })
      .register('#/restaurador', () => {
        router.showView('view-restaurador');
        if (window.RestauradorGame) window.RestauradorGame.init();
      })
      .register('#/exposiciones', () => {
        router.showView('view-exposiciones');
        loadExposiciones();
      })
      .register('#/mica-dashboard', () => {
        router.showView('view-mica-dashboard');
        loadMicaDashboard();
      });

    // Dynamic route for artwork details: #/obra/:artworkId
    const originalHandleRoute = router.handleRoute.bind(router);
    router.handleRoute = function() {
      const path = this.getCurrentRoute();
      
      // Check for dynamic artwork route
      if (path.startsWith('#/obra/')) {
        const artworkId = path.replace('#/obra/', '');
        if (artworkId) {
          this.hideAllViews();
          this.showView('view-obra');
          loadArtworkDetail(artworkId);
          return;
        }
      }
      
      // Fall back to original handler
      originalHandleRoute();
    };

    // Lifecycle hooks
    // Lifecycle hooks — "Golden Curtain" (compatible with 360)
    router.beforeEach = (to, from) => {
      document.body.classList.add('navigating');
      const curtain = document.getElementById('page-curtain');
      if (curtain) curtain.classList.add('active');
    };

    router.afterEach = (to, from) => {
      const curtain = document.getElementById('page-curtain');
      
      setTimeout(() => {
        // 360 Mode: Do NOT reset scroll to top. Let Swarm Navigator handle position.
        if (curtain) curtain.classList.remove('active');
        
        setTimeout(() => {
          document.body.classList.remove('navigating');
        }, 600);
      }, 400);
    };

    router.init();
  }

  // ===========================================
  // MOBILE NAVIGATION
  // ===========================================

  // ===========================================
  // FLUID SYSTEMS: RED THREAD & MICA
  // ===========================================

  function initFluidSystems() {
    const scrollThread = document.getElementById('scroll-thread');
    
    // Smooth Scroll Progress (Hilo Rojo)
    window.addEventListener('scroll', () => {
      if (!scrollThread) return;
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollThread.style.width = scrolled + "%";
    }, { passive: true });

    // Force MICA presence
    if (window.micaInstance) {
      setTimeout(() => {
        if (!window.micaInstance.isOpen) {
        }
      }, 2000);
    }
  }

  // ===========================================
  // PLACEHOLDER LOADERS (to be expanded)
  // ===========================================

  function loadFeatured() {
    if (window.Gallery) {
      window.Gallery.loadFeatured();
    }
  }

  function loadArchive() {
    if (window.Gallery) {
      window.Gallery.loadArchive();
    }
  }

  function loadGalleryDisruptive() {
    // First load featured content
    if (window.Gallery) {
      window.Gallery.loadFeatured();
    }
    // Then initialize the disruptive engine for effects
    if (window.GalleryDisruptive) {
      // Reset and reinitialize to ensure lazy loading works
      window.GalleryDisruptive.initialized = false;
      window.GalleryDisruptive.init();
    }
  }

  function loadGame() {
    if (window.OcaGame) {
      window.OcaGame.init();
    }
  }

  function loadTetris() {
    if (window.TetrisGame) {
      window.TetrisGame.init();
    }
  }

  async function loadExposiciones() {
    // Dynamic import for module
    try {
      const module = await import('../features/exposiciones-timeline.js');
      if (module.exposicionesTimeline) {
        module.exposicionesTimeline.init('exposiciones-container');
      }
    } catch (e) {
      console.warn('[App] Exposiciones module not loaded:', e);
    }
  }

  async function loadArtworkDetail(artworkId) {
    try {
      const module = await import('../features/artwork-detail.js');
      if (module.artworkDetail) {
        module.artworkDetail.init(artworkId);
      }
    } catch (e) {
      console.warn('[App] Artwork Detail module not loaded:', e);
    }
  }

  async function loadContactoPanel() {
    try {
      const module = await import('../features/videocall-panel.js');
      if (module.videoCallPanel) {
        module.videoCallPanel.init('contacto-container');
        // Hide fallback content
        const fallback = document.getElementById('contact-fallback');
        if (fallback) fallback.style.display = 'none';
      }
    } catch (e) {
      console.warn('[App] VideoCall Panel not loaded:', e);
    }
  }

  async function loadMicaDashboard() {
    try {
      const module = await import('../features/mica-dashboard.js');
      if (module.micaDashboard) {
        module.micaDashboard.init('mica-dashboard-container');
      }
    } catch (e) {
      console.warn('[App] MICA Dashboard not loaded:', e);
    }
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  async function init() {
    
    // CRITICAL: Initialize Gallery BEFORE routes so data is ready
    if (window.Gallery) {
      await window.Gallery.init();
    }
    
    // Initialize Swarm Architecture
    // ----------------------------------------
    
    // Dynamic import to break dependency cycle if needed
    try {
      const { Swarm } = await import('./swarm-orchestrator.js');
      Swarm.init();
    } catch (e) {
      console.warn('Swarm initialization failed:', e);
    }

    registerRoutes();
    initFluidSystems();
    initUIControls();

    // Initialize premium effects
    if (window.initMagnet) window.initMagnet();

    // Initialize other modules when ready
    if (window.Lightbox) {
      window.Lightbox.init();
    }

  }

  function initUIControls() {
    const chaosBtn = document.getElementById('chaos-toggle');
    if (chaosBtn && window.ChaosEngine) {
      chaosBtn.addEventListener('click', () => {
        const isActive = window.ChaosEngine.toggle();
        if (isActive) {
          chaosBtn.classList.add('active');
          chaosBtn.textContent = '⚡ CAOS ACTIVO';
        } else {
          chaosBtn.classList.remove('active');
          chaosBtn.textContent = '⚡ MODO CAOS';
        }
      });
    }
  }

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
