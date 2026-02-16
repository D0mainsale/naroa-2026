/**
 * Progressive Enhancements v∞
 * Logic migrated from index.html for better orchestration.
 */

export function initEnhancements() {
  // ══ Lazy Images: Progressive blur-up ══
  document.querySelectorAll('.gallery-lazy img, .gallery-massive__img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    }
  });

  // ══ View Header Reveal ══
  const headerRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.view__header, .gallery-section-header').forEach(el => {
    headerRevealObserver.observe(el);
  });

  // ══ Scroll Progress Indicator ══
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    let ticking = false;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
      scrollProgress.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollProgress.classList.remove('scrolling');
      }, 150);

      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? scrollTop / docHeight : 0;
          scrollProgress.style.transform = `scaleX(${progress})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}
