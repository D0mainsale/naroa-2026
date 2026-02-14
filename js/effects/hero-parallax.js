/**
 * Hero Parallax + Scroll Effects
 * Adds parallax movement to hero image, fade-out on scroll,
 * and notch shrink behavior
 * 
 * @module effects/hero-parallax
 * @version 1.0.0
 */
(function () {
  'use strict';

  const PARALLAX_SPEED = 0.35;
  const FADE_START = 100;
  const FADE_END = 600;
  const NOTCH_THRESHOLD = 80;

  let hero, heroImage, heroContent, notch, scrollIndicator;
  let ticking = false;

  function init() {
    hero = document.getElementById('hero-immersive');
    heroImage = document.querySelector('.hero-immersive__image');
    heroContent = document.querySelector('.hero-immersive__content');
    notch = document.querySelector('.notch');
    scrollIndicator = document.querySelector('.hero-immersive__scroll');

    if (!hero) return;

    // Use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial call
    requestAnimationFrame(update);
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    ticking = false;
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;

    // ── Hero parallax: image moves slower than scroll ──
    if (heroImage && scrollY < viewportH) {
      const translateY = scrollY * PARALLAX_SPEED;
      heroImage.style.transform = `scale(1.05) translateY(${translateY}px)`;
    }

    // ── Hero content fade-out on scroll ──
    if (heroContent && scrollY < FADE_END) {
      const opacity = Math.max(0, 1 - (scrollY - FADE_START) / (FADE_END - FADE_START));
      const translateY = scrollY * 0.15;
      heroContent.style.opacity = opacity;
      heroContent.style.transform = `translateY(${translateY}px)`;
    }

    // ── Scroll indicator hide ──
    if (scrollIndicator) {
      scrollIndicator.style.opacity = scrollY > 50 ? '0' : '1';
    }

    // ── Notch shrink on scroll ──
    if (notch) {
      if (scrollY > NOTCH_THRESHOLD) {
        notch.classList.add('scrolled');
      } else {
        notch.classList.remove('scrolled');
      }
    }
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
