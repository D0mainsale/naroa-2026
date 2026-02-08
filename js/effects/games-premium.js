/**
 * Games Premium Effects — Awwwards Edition
 * Particle trails, score animations, camera shake, sound FX polish
 */
(function() {
  'use strict';

  // ==========================================
  // 1. PARTICLE TRAIL on game cards
  // ==========================================
  function initCardParticles() {
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create glow dot
        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.6);
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
          left: ${x}px;
          top: ${y}px;
          pointer-events: none;
          z-index: 10;
          transition: all 0.6s ease-out;
        `;
        card.appendChild(dot);

        requestAnimationFrame(() => {
          dot.style.opacity = '0';
          dot.style.transform = 'scale(3)';
        });

        setTimeout(() => dot.remove(), 600);
      });
    });
  }

  // ==========================================
  // 2. SCORE POP ANIMATION
  // ==========================================
  window.GameEffects = window.GameEffects || {};
  
  window.GameEffects.scorePopUp = function(element, value, color = '#d4af37') {
    if (!element) return;
    
    const pop = document.createElement('span');
    pop.textContent = `+${value}`;
    pop.style.cssText = `
      position: absolute;
      color: ${color};
      font-family: var(--font-family-display, 'Space Grotesk', sans-serif);
      font-size: 1.5rem;
      font-weight: 800;
      pointer-events: none;
      z-index: 100;
      animation: scoreFloat 1s ease-out forwards;
      text-shadow: 0 0 20px ${color}80;
    `;
    
    element.style.position = 'relative';
    element.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
  };

  // ==========================================
  // 3. CAMERA SHAKE
  // ==========================================
  window.GameEffects.cameraShake = function(element, intensity = 5, duration = 300) {
    if (!element) return;
    
    const startTime = Date.now();
    const originalTransform = element.style.transform;
    
    function shake() {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        element.style.transform = originalTransform;
        return;
      }
      
      const progress = elapsed / duration;
      const decay = 1 - progress;
      const x = (Math.random() - 0.5) * intensity * decay;
      const y = (Math.random() - 0.5) * intensity * decay;
      
      element.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    }
    
    shake();
  };

  // ==========================================
  // 4. CONFETTI BURST (reusable)
  // ==========================================
  window.GameEffects.confettiBurst = function(container, count = 30) {
    if (!container) return;
    
    const colors = ['#d4af37', '#ff003c', '#a855f7', '#ffd700', '#3b82f6', '#fff'];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 4 + Math.random() * 8;
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 3 + Math.random() * 5;
      const spin = (Math.random() - 0.5) * 720;
      
      let borderRadius = '50%';
      let clip = '';
      if (shape === 'square') borderRadius = '2px';
      if (shape === 'triangle') clip = 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%);';

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${borderRadius};
        ${clip}
        left: 50%;
        top: 50%;
        pointer-events: none;
        z-index: 1000;
        opacity: 1;
        transition: none;
      `;
      
      container.style.position = 'relative';
      container.style.overflow = 'visible';
      container.appendChild(particle);

      // Physics animation
      let px = 0, py = 0;
      let vx = Math.cos(angle) * velocity;
      let vy = Math.sin(angle) * velocity - 3;
      let rotation = 0;
      let opacity = 1;
      
      function animate() {
        vy += 0.15; // gravity
        px += vx;
        py += vy;
        rotation += spin * 0.01;
        opacity -= 0.015;
        
        if (opacity <= 0) {
          particle.remove();
          return;
        }
        
        particle.style.transform = `translate(${px}px, ${py}px) rotate(${rotation}deg)`;
        particle.style.opacity = opacity;
        requestAnimationFrame(animate);
      }
      
      requestAnimationFrame(animate);
    }
  };

  // ==========================================
  // 5. HAPTIC FEEDBACK (vibration on mobile)
  // ==========================================
  window.GameEffects.haptic = function(ms = 15) {
    if (navigator.vibrate) navigator.vibrate(ms);
  };

  // ==========================================
  // 6. LEVEL UP FLASH
  // ==========================================
  window.GameEffects.levelUpFlash = function(container) {
    if (!container) return;
    
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.3), transparent);
      pointer-events: none;
      z-index: 50;
      animation: flashPulse 0.5s ease-out forwards;
    `;
    container.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  };

  // ==========================================
  // 7. COMBO COUNTER
  // ==========================================
  window.GameEffects.showCombo = function(container, combo) {
    if (!container || combo < 2) return;
    
    const el = document.createElement('div');
    const colors = ['', '', '#d4af37', '#ffd700', '#ff003c', '#a855f7'];
    const color = colors[Math.min(combo, 5)];
    
    el.textContent = `${combo}x COMBO!`;
    el.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      color: ${color};
      font-family: var(--font-family-display, 'Space Grotesk', sans-serif);
      font-size: ${1.5 + combo * 0.2}rem;
      font-weight: 900;
      text-transform: uppercase;
      text-shadow: 0 0 30px ${color}80;
      pointer-events: none;
      z-index: 100;
      animation: comboAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;
    
    container.style.position = 'relative';
    container.appendChild(el);
    setTimeout(() => el.remove(), 800);
  };

  // ==========================================
  // GLOBAL ANIMATION KEYFRAMES
  // ==========================================
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scoreFloat {
      0% { transform: translateY(0) scale(0.5); opacity: 1; }
      100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
    }
    @keyframes flashPulse {
      0% { opacity: 0; }
      30% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes comboAppear {
      0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
      40% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    initCardParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
