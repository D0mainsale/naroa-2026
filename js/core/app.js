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
      })
      .register('#/destacada', () => {
        router.showView('view-destacada');
        loadFeatured();
      })
      .register('#/archivo', () => {
        router.showView('view-archivo');
        loadArchive();
      })
      .register('#/about', () => {
        router.showView('view-about');
      })
      .register('#/contacto', () => {
        router.showView('view-contacto');
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
      });

    // Lifecycle hooks
    router.beforeEach = (to, from) => {
      document.body.classList.add('navigating');
    };

    router.afterEach = (to, from) => {
      setTimeout(() => {
        document.body.classList.remove('navigating');
      }, CONFIG.animationDuration);
      
      // Scroll to top on route change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    router.init();
  }

  // ===========================================
  // MOBILE NAVIGATION
  // ===========================================

  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.querySelector('.nav__menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      }
    });
  }

  // ===========================================
  // PLACEHOLDER LOADERS (to be expanded)
  // ===========================================

  function loadFeatured() {
    console.log('[App] Loading Obra Destacada...');
    if (window.Gallery) {
      window.Gallery.loadFeatured();
    }
  }

  function loadArchive() {
    console.log('[App] Loading Archivo...');
    if (window.Gallery) {
      window.Gallery.loadArchive();
    }
  }

  function loadGame() {
    console.log('[App] Loading Juego de la Oca...');
    if (window.OcaGame) {
      window.OcaGame.init();
    }
  }

  function loadTetris() {
    console.log('[App] Loading Tetris Artístico...');
    if (window.TetrisGame) {
      window.TetrisGame.init();
    }
  }

  // ===========================================
  // INITIALIZATION
  // ===========================================

  async function init() {
    console.log('[Naroa 2026] Initializing...');
    
    // CRITICAL: Initialize Gallery BEFORE routes so data is ready
    if (window.Gallery) {
      await window.Gallery.init();
      console.log('[Naroa 2026] Gallery initialized with artwork data');
    }
    
    registerRoutes();
    initMobileNav();

    // Initialize other modules when ready
    if (window.Lightbox) {
      window.Lightbox.init();
    }

    console.log('[Naroa 2026] Ready ✨');
  }

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
