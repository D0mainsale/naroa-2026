/**
 * Progressive Hero Loader
 * Shows blur placeholder instantly, then fades in the web-optimized image.
 * Keeps super-hq available for zoom/detail on demand.
 */
(function() {
  'use strict';

  const HERO_IMAGES = [
    { blur: 'images/artworks/blur-amy.webp',      web: 'images/artworks/web-amy.webp',      hq: 'images/artworks/super-hq-amy.webp' },
    { blur: 'images/artworks/blur-james.webp',     web: 'images/artworks/web-james.webp',     hq: 'images/artworks/super-hq-james.webp' },
    { blur: 'images/artworks/blur-johnny.webp',    web: 'images/artworks/web-johnny.webp',    hq: 'images/artworks/super-hq-johnny.webp' },
    { blur: 'images/artworks/blur-marilyn.webp',   web: 'images/artworks/web-marilyn.webp',   hq: 'images/artworks/super-hq-marilyn.webp' },
    { blur: 'images/artworks/blur-portrait-1.webp', web: 'images/artworks/web-portrait-1.webp', hq: 'images/artworks/super-hq-portrait-1.webp' },
    { blur: 'images/artworks/blur-portrait-2.webp', web: 'images/artworks/web-portrait-2.webp', hq: 'images/artworks/super-hq-portrait-2.webp' }
  ];

  function init() {
    const slides = document.querySelectorAll('.hero__slide');
    if (!slides.length) return;

    slides.forEach((slide, i) => {
      if (i >= HERO_IMAGES.length) return;
      const tier = HERO_IMAGES[i];

      // Step 1: Set blur placeholder immediately (< 1KB, instant)
      slide.style.backgroundImage = `url('${tier.blur}')`;
      slide.style.backgroundSize = 'cover';
      slide.style.backgroundPosition = 'center';
      slide.style.filter = 'blur(20px)';
      slide.style.transform = 'scale(1.1)'; // Hide blur edges
      slide.style.transition = 'filter 0.8s ease-out, transform 0.8s ease-out';

      // Step 2: Load web image (only load first slide immediately, lazy-load rest)
      if (i === 0) {
        loadWebImage(slide, tier);
      } else {
        // Lazy load: load when slide becomes active or after 3s
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(m => {
            if (slide.classList.contains('active') && !slide.dataset.loaded) {
              loadWebImage(slide, tier);
              observer.disconnect();
            }
          });
        });
        observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
        
        // Fallback: preload after 3 seconds anyway
        setTimeout(() => {
          if (!slide.dataset.loaded) {
            loadWebImage(slide, tier);
            observer.disconnect();
          }
        }, 3000 + (i * 1000));
      }
    });
  }

  function loadWebImage(slide, tier) {
    const img = new Image();
    img.onload = () => {
      slide.style.backgroundImage = `url('${tier.web}')`;
      slide.style.filter = 'none';
      slide.style.transform = 'scale(1)';
      slide.dataset.loaded = 'true';
    };
    img.onerror = () => {
      // Fallback: try hq version if web version fails
      const fallback = new Image();
      fallback.onload = () => {
        slide.style.backgroundImage = `url('${tier.hq}')`;
        slide.style.filter = 'none';
        slide.style.transform = 'scale(1)';
        slide.dataset.loaded = 'true';
      };
      fallback.src = tier.hq;
    };
    img.src = tier.web;
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
