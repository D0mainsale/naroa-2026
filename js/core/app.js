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

  // ===========================================
  // INITIALIZATION
  // ===========================================

  function init() {
    console.log('[Naroa 2026] Initializing...');
    
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
