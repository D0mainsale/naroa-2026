/**
 * Parallax Hero — "Capas Vivas"
 * ⭐⭐⭐⭐⭐⭐ Effect: Mouse/Gyroscope-tracked depth parallax
 * 
 * Layers:
 *   - depth-bg: Background artwork moves SLOW (creates depth)
 *   - depth-fg: Foreground decorative overlay (optional, moves FAST)
 *   - content-layer: Text elements move at data-depth rates
 *
 * Rocks Series: James Dean, Amy Winehouse, Johnny Depp, Marilyn Monroe
 */
(function() {
  'use strict';

  const HERO_IMAGES = [
    { name: 'james',   blur: 'images/artworks/web-james.webp',   web: 'images/artworks/web-james.webp' },
    { name: 'amy',     blur: 'images/artworks/web-amy.webp',     web: 'images/artworks/web-amy.webp' },
    { name: 'johnny',  blur: 'images/artworks/web-johnny.webp',  web: 'images/artworks/web-johnny.webp' },
    { name: 'marilyn', blur: 'images/artworks/web-marilyn.webp', web: 'images/artworks/web-marilyn.webp' }
  ];

  const PARALLAX_INTENSITY = 25; // pixels max shift
  const SLIDE_INTERVAL = 6000;   // ms between auto-transitions
  const BG_DEPTH = 0.03;         // background moves subtly

  let mouseX = 0.5, mouseY = 0.5; // normalized 0-1
  let targetX = 0.5, targetY = 0.5;
  let currentSlide = 0;
  let slideTimer = null;
  let heroEl = null;

  function init() {
    heroEl = document.getElementById('hero-parallax');
    if (!heroEl) return;

    // Progressive image loading
    loadImages();

    // Mouse tracking
    heroEl.addEventListener('mousemove', onMouseMove, { passive: true });
    heroEl.addEventListener('mouseleave', onMouseLeave);

    // Gyroscope for mobile
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onGyroscope, { passive: true });
    }

    // Dot navigation
    const dots = document.querySelectorAll('.hero__dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.slide);
        goToSlide(idx);
      });
    });

    // Start parallax animation loop
    requestAnimationFrame(animateParallax);

    // Auto-rotate slides
    startAutoSlide();
  }

  // ═══════════════════════════════════════
  // PROGRESSIVE IMAGE LOADING
  // ═══════════════════════════════════════

  function loadImages() {
    const slides = document.querySelectorAll('.hero__slide');
    
    slides.forEach((slide, i) => {
      if (i >= HERO_IMAGES.length) return;
      const tier = HERO_IMAGES[i];
      const bg = slide.querySelector('.hero__depth-bg');
      
      // Set blur with artistic initial state
      bg.style.backgroundImage = `url('${tier.blur}')`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
      bg.style.filter = 'blur(20px) saturate(1.2)';
      bg.style.transform = 'scale(1.15)';
      bg.style.transition = 'filter 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      // Load web-optimized version
      if (i === 0) {
        loadWebImage(bg, tier);
      } else {
        setTimeout(() => loadWebImage(bg, tier), 1500 + (i * 1000));
      }
    });
  }

  function loadWebImage(bgEl, tier) {
    const img = new Image();
    img.onload = () => {
      bgEl.style.backgroundImage = `url('${tier.web}')`;
      bgEl.style.filter = 'saturate(1.1)';
      bgEl.style.transform = 'scale(1.05)';
      bgEl.dataset.loaded = 'true';
    };
    img.src = tier.web;
  }

  // ═══════════════════════════════════════
  // PARALLAX ENGINE
  // ═══════════════════════════════════════

  function onMouseMove(e) {
    const rect = heroEl.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width;
    targetY = (e.clientY - rect.top) / rect.height;
  }

  function onMouseLeave() {
    // Smoothly return to center
    targetX = 0.5;
    targetY = 0.5;
  }

  function onGyroscope(e) {
    if (e.gamma === null) return;
    // Map gamma (-90 to 90) and beta (0-180) to 0-1
    targetX = Math.max(0, Math.min(1, (e.gamma + 45) / 90));
    targetY = Math.max(0, Math.min(1, (e.beta - 30) / 90));
  }

  function animateParallax() {
    // Smooth lerp towards target
    mouseX += (targetX - mouseX) * 0.06;
    mouseY += (targetY - mouseY) * 0.06;

    const offsetX = (mouseX - 0.5) * PARALLAX_INTENSITY;
    const offsetY = (mouseY - 0.5) * PARALLAX_INTENSITY;

    // Move background layer (SLOW — creates depth illusion)
    const activeBg = document.querySelector('.hero__slide.active .hero__depth-bg');
    if (activeBg) {
      const bgX = offsetX * BG_DEPTH * -1;
      const bgY = offsetY * BG_DEPTH * -1;
      activeBg.style.transform = `scale(1.05) translate3d(${bgX}px, ${bgY}px, 0)`;
    }

    // Move content elements (FASTER — different rates per data-depth)
    const depthElements = heroEl.querySelectorAll('[data-depth]');
    depthElements.forEach(el => {
      const depth = parseFloat(el.dataset.depth);
      const dx = offsetX * depth * -1;
      const dy = offsetY * depth * -0.5;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });

    requestAnimationFrame(animateParallax);
  }

  // ═══════════════════════════════════════
  // SLIDE TRANSITIONS 
  // ═══════════════════════════════════════

  function goToSlide(idx) {
    if (idx === currentSlide) return;
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.hero__dot');
    
    // Deactivate current
    slides[currentSlide]?.classList.remove('active');
    dots[currentSlide]?.classList.remove('active');
    
    // Activate new
    currentSlide = idx % slides.length;
    slides[currentSlide]?.classList.add('active');
    dots[currentSlide]?.classList.add('active');
    
    // Reset auto-timer
    startAutoSlide();
  }

  function nextSlide() {
    const slides = document.querySelectorAll('.hero__slide');
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startAutoSlide() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
  }

  // ═══════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
