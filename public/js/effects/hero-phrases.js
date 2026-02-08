/**
 * Hero Phrase Rotator — Frases propias de Naroa + palíndromos artísticos
 * Rota al cargar + cada 8 segundos con transición suave
 */
(function() {
  'use strict';

  // Frases de Naroa (filosofía, obras, palíndromos)
  // Frases de Naroa (filosofía, obras, palíndromos)
  const PHRASES = [
    // === Manifestos ===
    { line1: 'Artivista',    line2: 'Del',     line3: 'Caos' },
    { line1: 'El Problema',  line2: 'Es',      line3: 'Trampolín' },
    { line1: 'Kintsugi',     line2: 'Del',     line3: 'Alma' },
    { line1: 'Cicatrices',   line2: 'De',      line3: 'Oro' },
    
    // === Palíndromos & Juegos de Palabras ===
    { line1: 'Amor',         line2: 'A',       line3: 'Roma' },
    { line1: 'Yo Hago',      line2: 'Yoga',    line3: 'Hoy' },
    { line1: 'Atar',         line2: 'A La',    line3: 'Rata' }, // Clásico palíndromo
    { line1: 'Luz',          line2: 'Azul',    line3: 'Luz' },
    { line1: 'Somos',        line2: 'O',       line3: 'No Somos' },
    
    // === Poética Naroa ===
    { line1: 'Mica',         line2: 'En La',   line3: 'Mirada' },
    { line1: 'Pintar',       line2: 'Para',    line3: 'Salar' },
    { line1: 'Ojos',         line2: 'Que',     line3: 'Hablan' },
    { line1: 'Pizarra',      line2: 'Viva',    line3: 'Eterna' },
    { line1: 'Arte',         line2: 'Sin',     line3: 'Miedo' }
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
