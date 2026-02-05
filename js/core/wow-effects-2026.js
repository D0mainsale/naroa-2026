/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WOW EFFECTS 2026 - Premium Visual Library
 * Efectos de vanguardia SOTY (Site of the Year) 2026
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const WOWEffects2026 = {
  isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // ════════════════════════════════════════════
  // 1. LIQUID GLASS EFFECT
  // ════════════════════════════════════════════
  initLiquidGlass(selector = '.liquid-glass') {
    if (this.isReducedMotion) return;

    document.querySelectorAll(selector).forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        element.style.setProperty('--glass-x', `${x * 100}%`);
        element.style.setProperty('--glass-y', `${y * 100}%`);
        element.style.setProperty('--glass-opacity', '1');
      });

      element.addEventListener('mouseleave', () => {
        element.style.setProperty('--glass-opacity', '0');
      });
    });
  },

  // ════════════════════════════════════════════
  // 2. AURORA BOREALIS GRADIENT
  // ════════════════════════════════════════════
  initAuroraGradient(selector = '.aurora-bg') {
    if (this.isReducedMotion) return;

    document.querySelectorAll(selector).forEach(element => {
      let hue = 0;
      const animate = () => {
        hue = (hue + 0.5) % 360;
        element.style.setProperty('--aurora-hue', hue);
        requestAnimationFrame(animate);
      };
      animate();
    });
  },

  // ════════════════════════════════════════════
  // 3. PARALLAX DEPTH LAYERS
  // ════════════════════════════════════════════
  initParallaxDepth(containerSelector = '.parallax-container') {
    if (this.isReducedMotion) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const layers = container.querySelectorAll('[data-depth]');

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left - centerX;
      const mouseY = e.clientY - rect.top - centerY;

      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth) || 0.1;
        const moveX = mouseX * depth * 0.05;
        const moveY = mouseY * depth * 0.05;
        layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    });

    container.addEventListener('mouseleave', () => {
      layers.forEach(layer => {
        layer.style.transform = '';
      });
    });
  },

  // ════════════════════════════════════════════
  // 4. GLITCH TEXT EFFECT
  // ════════════════════════════════════════════
  initGlitchText(selector = '.glitch-text') {
    if (this.isReducedMotion) return;

    document.querySelectorAll(selector).forEach(element => {
      const text = element.textContent;
      element.dataset.text = text;
      element.innerHTML = `
        <span class="glitch-layer glitch-layer-1">${text}</span>
        <span class="glitch-layer glitch-layer-2">${text}</span>
        ${text}
      `;
    });
  },

  // ════════════════════════════════════════════
  // 5. SMOOTH SCROLL MOMENTUM
  // ════════════════════════════════════════════
  initSmoothMomentum() {
    if (this.isReducedMotion) return;

    let scrollY = window.scrollY;
    let targetY = scrollY;
    let velocity = 0;
    const friction = 0.85;
    const attraction = 0.08;

    document.body.style.height = document.documentElement.scrollHeight + 'px';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetY = Math.max(0, Math.min(
        targetY + e.deltaY,
        document.body.scrollHeight - window.innerHeight
      ));
    }, { passive: false });

    const animate = () => {
      velocity += (targetY - scrollY) * attraction;
      velocity *= friction;
      scrollY += velocity;

      document.documentElement.style.transform = `translateY(${-scrollY}px)`;
      requestAnimationFrame(animate);
    };
    animate();
  },

  // ════════════════════════════════════════════
  // 6. MORPHING BLOB CURSOR
  // ════════════════════════════════════════════
  initMorphingCursor() {
    if (this.isReducedMotion) return;

    const cursor = document.createElement('div');
    cursor.className = 'morphing-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(animate);
    };
    animate();

    // Grow and Glow on link hover
    document.querySelectorAll('a, button, .interactive').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('expanded');
        cursor.classList.add('glow-active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('expanded');
        cursor.classList.remove('glow-active');
      });
    });
  },

  // ════════════════════════════════════════════
  // 7. STAGGER REVEAL ANIMATION
  // ════════════════════════════════════════════
  initStaggerReveal(selector = '.stagger-reveal') {
    if (this.isReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.animationDelay = `${i * 0.1}s`;
            child.classList.add('reveal-active');
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  },

  // ════════════════════════════════════════════
  // 8. NOISE TEXTURE OVERLAY
  // ════════════════════════════════════════════
  initNoiseOverlay() {
    const canvas = document.createElement('canvas');
    canvas.className = 'noise-overlay';
    canvas.width = 200;
    canvas.height = 200;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(200, 200);
    const data = imageData.data;

    const generateNoise = () => {
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 15; // Very subtle
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(generateNoise);
    };

    if (!this.isReducedMotion) {
      generateNoise();
    } else {
      // Static noise for reduced motion
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 10;
      }
      ctx.putImageData(imageData, 0, 0);
    }
  },

  // ════════════════════════════════════════════
  // 9. SPLIT TEXT REVEAL
  // ════════════════════════════════════════════
  initSplitTextReveal(selector = '.split-reveal') {
    document.querySelectorAll(selector).forEach(element => {
      const text = element.textContent;
      element.innerHTML = '';
      element.setAttribute('aria-label', text);

      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-index', i);
        span.className = 'split-char';
        element.appendChild(span);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  },

  // ════════════════════════════════════════════
  // 10. CHROMATIC ABERRATION HOVER
  // ════════════════════════════════════════════
  initChromaticHover(selector = '.chromatic-hover') {
    if (this.isReducedMotion) return;

    document.querySelectorAll(selector).forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.filter = 'url(#chromatic-aberration)';
      });
      element.addEventListener('mouseleave', () => {
        element.style.filter = '';
      });
    });
  },

  // ════════════════════════════════════════════
  // INIT ALL
  // ════════════════════════════════════════════
  initAll() {
    console.log('✨ WOW Effects 2026 initializing... MODO A POR TODO');

    // Core effects (always on)
    this.initLiquidGlass();
    this.initGlitchText();
    this.initStaggerReveal();
    this.initSplitTextReveal();
    this.initNoiseOverlay();
    this.initChromaticHover();
    this.initParallaxDepth();
    
    // Premium effects (activated for maximum impact)
    this.initMorphingCursor();
    this.initAuroraGradient();
    // this.initSmoothMomentum(); // Disabled - conflicts with MICA scroll

    console.log('✨ WOW Effects 2026 ready! Premium mode activated 🚀');
  },
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WOWEffects2026.initAll());
} else {
  WOWEffects2026.initAll();
}

window.WOWEffects2026 = WOWEffects2026;
