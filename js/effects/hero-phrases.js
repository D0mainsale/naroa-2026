/**
 * Hero Phrase Rotator — Frases propias de Naroa + palíndromos artísticos
 * Rota al cargar + cada 8 segundos con transición suave
 */
(function() {
  'use strict';

  // Frases de Naroa (filosofía, obras, palíndromos)
  const PHRASES = [
    // === Frases propias de Naroa ===
    { line1: 'Artivista',   line2: 'Del',  line3: 'Caos' },
    { line1: 'El Problema', line2: 'Es',   line3: 'Trampolín' },
    { line1: 'Las Grietas', line2: 'Se',   line3: 'Doran' },
    { line1: 'El Error',    line2: 'Crea', line3: 'Belleza' },
    { line1: 'Vuelve A',    line2: 'Elegirte', line3: 'ReCreo' },
    { line1: 'Resignificar', line2: 'El Bien', line3: 'Mirar' },

    // === Palíndromos artísticos ===
    { line1: 'Ama',     line2: 'La',    line3: 'Trama' },
    { line1: 'Arte',    line2: 'Cada',  line3: 'Letra' },
    { line1: 'Oro',     line2: 'No',    line3: 'Lloro' },
    { line1: 'Yo Dono', line2: 'Color', line3: 'A Naroa' },

    // === Nombres de series/obras ===
    { line1: 'Espejos',  line2: 'Del',  line3: 'Alma' },
    { line1: 'Amor',     line2: 'En',   line3: 'Conserva' },
    { line1: 'Kintsugi', line2: 'Del',  line3: 'Color' },
    { line1: 'Salvaje',  line2: 'Y',    line3: 'Libre' },
  ];

  const CYCLE_MS = 8000;
  let currentIndex = 0;
  let interval = null;

  function getLines() {
    const h1 = document.querySelector('.hero__title-mega');
    if (!h1) return null;
    const spans = h1.querySelectorAll('.hero__line');
    if (spans.length < 3) return null;
    return spans;
  }

  function setPhrase(index, animate = true) {
    const spans = getLines();
    if (!spans) return;

    const phrase = PHRASES[index % PHRASES.length];
    currentIndex = index % PHRASES.length;

    if (!animate) {
      spans[0].textContent = phrase.line1;
      spans[1].textContent = phrase.line2;
      spans[2].textContent = phrase.line3;
      return;
    }

    // Fade out with slight upward drift
    spans.forEach(s => {
      s.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      s.style.opacity = '0';
      s.style.transform = 'translateY(-15px)';
    });

    setTimeout(() => {
      spans[0].textContent = phrase.line1;
      spans[1].textContent = phrase.line2;
      spans[2].textContent = phrase.line3;

      // Reset position below
      spans.forEach(s => {
        s.style.transition = 'none';
        s.style.transform = 'translateY(20px)';
      });

      // Force reflow
      spans[0].offsetHeight;

      // Staggered fade in from below
      spans.forEach((s, i) => {
        setTimeout(() => {
          s.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        }, i * 150);
      });
    }, 550);
  }

  function init() {
    // Pick random starting phrase (different each visit)
    const startIndex = Math.floor(Math.random() * PHRASES.length);
    setPhrase(startIndex, false);

    // Auto-cycle
    interval = setInterval(() => {
      setPhrase(currentIndex + 1, true);
    }, CYCLE_MS);

    // Pause on hover for readability
    const hero = document.querySelector('.view--home, .hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(interval));
      hero.addEventListener('mouseleave', () => {
        interval = setInterval(() => {
          setPhrase(currentIndex + 1, true);
        }, CYCLE_MS);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to let other scripts initialize first
    setTimeout(init, 500);
  }

  window.HeroPhrases = { setPhrase, PHRASES };
})();
