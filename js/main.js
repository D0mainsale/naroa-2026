// ===========================================
// NAROA 2026 - MAIN ENTRY POINT
// ===========================================

// 1. CSS IMPORTS (Styles Bundle)
import '../css/reset.css';
import '../css/variables.css';
import '../css/naroa-palette.css';
import '../css/typography-2026.css';
import '../css/base.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/gallery.css';
import '../css/animations.css';
import '../css/soty-effects.css';
import '../css/mica.css';
import '../css/wow-effects.css';
import '../css/oca-game.css';
import '../css/tetris-game.css';
import '../css/games-hub.css';
import '../css/arcade-leaderboard.css';
import '../css/about-contact.css';
import '../css/audio-controls.css';
import '../css/audio-reactive.css';
import '../css/gallery-disruptive.css';
import '../css/scroll-to-top.css';
import '../css/video-showcase.css';

// 2. JS IMPORTS (Core & Features)
// Note: Legacy scripts that attach to window are imported for side-effects
import { router } from './core/router.js';
import './core/ranking-system.js';
import './features/gallery.js';
import './features/lightbox.js';
import './core/soty-effects.js';
import './features/blog-engine.js';
import './features/mica.js';

// Effects
import './effects/kinetic-text.js';
import './effects/magnetic-button.js';
import './effects/reveal-observer.js';
import './effects/cursor-trail.js';
import './effects/eyes-follow.js';
import './effects/clima-palette.js';
import './effects/wave-background.js';
import './effects/organic-particles.js';

// Games
import './features/oca-game.js';
import './features/tetris-game.js';
import './features/memory-game.js';
import './features/puzzle-game.js';
import './features/snake-game.js';
import './features/breakout-game.js';
import './features/whack-game.js';
import './features/simon-game.js';
import './features/quiz-game.js';
import './features/catch-game.js';
import './features/collage-game.js';
import './features/reinas-game.js';
import './features/mica-game.js';
import './features/kintsugi-game.js';
import './features/pong-game.js';
import './features/reaction-game.js';
import './features/typing-game.js';
import './features/chess-game.js';
import './features/checkers-game.js';
import './features/connect4-game.js';
import './features/reversi-game.js';
import './features/intro.js';
import './core/arcade-leaderboard.js';

// Audio
import './audio/audio-synth.js';
import './audio/immersive-audio.js';
import './audio/audio-hooks.js';
import './audio/audio-visual-sync.js';

// Other Features
import './features/gallery-disruptive.js';
import './features/scroll-to-top.js';
import './features/video-showcase.js';


// ===========================================
// APP LOGIC
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
    .register('#/videos', () => {
      router.showView('view-videos');
    });

  // Lifecycle hooks
  router.beforeEach = (to, from) => {
    document.body.classList.add('navigating');
    const curtain = document.getElementById('page-curtain');
    if (curtain) curtain.classList.add('active');
  };

  router.afterEach = (to, from) => {
    const curtain = document.getElementById('page-curtain');
    
    setTimeout(() => {
      // Scroll to top while curtain is closed
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      if (curtain) curtain.classList.remove('active');
      
      setTimeout(() => {
        document.body.classList.remove('navigating');
      }, 600);
    }, 400);
  };

  router.init();
}

// ===========================================
// FLUID SYSTEMS
// ===========================================

function initFluidSystems() {
  const scrollThread = document.getElementById('scroll-thread');
  
  window.addEventListener('scroll', () => {
    if (!scrollThread) return;
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollThread.style.width = scrolled + "%";
  }, { passive: true });

  if (window.micaInstance) {
    setTimeout(() => {
      if (!window.micaInstance.isOpen) {
        console.log('[App] MICA invited to lead the conversation');
      }
    }, 2000);
  }
}

// ===========================================
// LOADERS
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
  console.log('[Naroa 2026] Initializing with HMR...');
  
  if (window.Gallery) {
    await window.Gallery.init();
    console.log('[Naroa 2026] Gallery initialized');
  }
  
  registerRoutes();
  initFluidSystems();

  if (window.Lightbox) {
    window.Lightbox.init();
  }

  console.log('[Naroa 2026] Ready ✨');
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
