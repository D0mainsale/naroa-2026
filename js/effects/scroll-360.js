/**
 * 360° Scroll Navigation Controller
 * Awwwards-level scroll experience:
 * - IntersectionObserver syncs URL hash with scroll position
 * - Dot indicator on right side
 * - Scroll-driven reveal animations
 * - Replaces show/hide with continuous scroll
 */

(function() {
  'use strict';

  const SECTIONS = [
    { id: 'view-home',         hash: '#/',            label: 'Inicio' },
    { id: 'view-galeria',      hash: '#/galeria',     label: 'Galería' },
    { id: 'view-archivo',      hash: '#/archivo',     label: 'Archivo' },
    { id: 'view-destacada',    hash: '#/destacada',   label: 'Destacada' },
    { id: 'view-exposiciones', hash: '#/exposiciones', label: 'Expos' },
    { id: 'view-sobre-mi',    hash: '#/sobre-mi',    label: 'Sobre Mí' },
    { id: 'view-contacto',    hash: '#/contacto',    label: 'Contacto' },
    { id: 'view-juegos',      hash: '#/juegos',      label: 'Juegos' }
  ];

  let isScrollingProgrammatically = false;
  let scrollTimeout = null;

  // ==========================================
  // 1. BUILD DOT INDICATOR
  // ==========================================
  function buildIndicator() {
    const nav = document.createElement('nav');
    nav.className = 'scroll-indicator';
    nav.setAttribute('aria-label', 'Navegación por secciones');

    SECTIONS.forEach(section => {
      const el = document.getElementById(section.id);
      if (!el) return; // Skip sections not in DOM

      const dot = document.createElement('button');
      dot.className = 'scroll-indicator__dot';
      dot.dataset.target = section.id;
      dot.dataset.hash = section.hash;
      dot.dataset.label = section.label;
      dot.setAttribute('aria-label', `Ir a ${section.label}`);
      
      dot.addEventListener('click', () => {
        isScrollingProgrammatically = true;
        const target = document.getElementById(section.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update hash without triggering router
          history.replaceState(null, '', section.hash);
          updateActiveDot(section.id);
        }
        // Reset flag after scroll completes
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrollingProgrammatically = false;
        }, 1200);
      });

      nav.appendChild(dot);
    });

    document.body.appendChild(nav);
    return nav;
  }

  // ==========================================
  // 2. UPDATE ACTIVE DOT
  // ==========================================
  function updateActiveDot(activeId) {
    document.querySelectorAll('.scroll-indicator__dot').forEach(dot => {
      dot.classList.toggle('scroll-indicator__dot--active', dot.dataset.target === activeId);
    });
  }

  // ==========================================
  // 3. INTERSECTION OBSERVER — Hash Sync
  // ==========================================
  function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      if (isScrollingProgrammatically) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const section = SECTIONS.find(s => s.id === entry.target.id);
          if (section) {
            // Update hash silently (no router re-trigger)
            history.replaceState(null, '', section.hash);
            updateActiveDot(section.id);
            
            // Update nav active state
            updateNavActive(section.hash);
          }
        }
      });
    }, {
      threshold: [0.3, 0.6],
      rootMargin: '-10% 0px -40% 0px'
    });

    SECTIONS.forEach(section => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return observer;
  }

  // ==========================================
  // 4. REVEAL ON SCROLL (in-viewport class)
  // ==========================================
  function initRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.view').forEach(view => {
      observer.observe(view);
    });
  }

  // ==========================================
  // 5. UPDATE NAV LINK ACTIVE STATE
  // ==========================================
  function updateNavActive(hash) {
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('nav__link--active', href === hash);
    });
  }

  // ==========================================
  // 6. INTERCEPT NAV CLICKS → Smooth Scroll
  // ==========================================
  function interceptNavClicks() {
    document.querySelectorAll('.nav__link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = link.getAttribute('href');
        const section = SECTIONS.find(s => s.hash === hash);
        
        if (section) {
          isScrollingProgrammatically = true;
          const target = document.getElementById(section.id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', hash);
            updateActiveDot(section.id);
            updateNavActive(hash);
          }
          
          // Close mobile menu if open
          const navLinks = document.querySelector('.nav__links');
          const navToggle = document.querySelector('.nav__toggle');
          if (navLinks) navLinks.classList.remove('nav__links--open');
          if (navToggle) navToggle.classList.remove('nav__toggle--active');

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrollingProgrammatically = false;
          }, 1200);
        }
      });
    });
  }

  // ==========================================
  // 7. INITIAL SCROLL TO HASH ON LOAD
  // ==========================================
  function scrollToInitialHash() {
    const hash = window.location.hash || '#/';
    const section = SECTIONS.find(s => s.hash === hash);
    
    if (section) {
      const target = document.getElementById(section.id);
      if (target) {
        // Use a small delay to ensure layout is stable
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          updateActiveDot(section.id);
          updateNavActive(hash);
          // Mark all views above as in-viewport
          let found = false;
          SECTIONS.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) {
              if (!found) el.classList.add('in-viewport');
              if (s.id === section.id) found = true;
            }
          });
        }, 200);
      }
    }
  }

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    // Force all views visible
    document.querySelectorAll('.view').forEach(v => {
      v.classList.add('active'); // Ensure CSS treats them as visible
    });

    buildIndicator();
    initScrollObserver();
    initRevealObserver();
    interceptNavClicks();
    scrollToInitialHash();

  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for external use
  window.Scroll360 = { init, scrollToInitialHash };

})();
