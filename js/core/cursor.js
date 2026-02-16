/**
 * Core Cursor System (v∞)
 * Implements "Stone Glow" + "Magnetic Attraction" for Premium Notch.
 */
import { gsap } from 'gsap';

export class CursorSystem {
  constructor() {
    this.cursor = document.querySelector('.cursor-stone-glow');
    this.mouse = { x: 0, y: 0 };
    this.pos = { x: 0, y: 0 };
    this.isActive = false;
    this.isMagnetic = false;
    
    if (window.matchMedia('(pointer: coarse)').matches) return; 

    this.init();
  }

  init() {
    if (!this.cursor) {
      this.cursor = document.createElement('div');
      this.cursor.className = 'cursor-stone-glow';
      document.body.appendChild(this.cursor);
    }

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (!this.isActive) {
        this.cursor.style.opacity = '1';
        this.isActive = true;
      }
    });

    this.scanForInteractives();

    // v∞ Animation Loop with Magnetic Damping
    gsap.ticker.add(() => {
      if (this.isMagnetic) return; // Let magnetic events handle position

      const dt = 1.0 - Math.pow(1.0 - 0.2, gsap.ticker.deltaRatio());
      this.pos.x += (this.mouse.x - this.pos.x) * dt;
      this.pos.y += (this.mouse.y - this.pos.y) * dt;
      
      this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
    });

    document.addEventListener('mouseleave', () => {
      gsap.to(this.cursor, { opacity: 0, duration: 0.5 });
      this.isActive = false;
    });

    document.addEventListener('mouseenter', () => {
      gsap.to(this.cursor, { opacity: 1, duration: 0.5 });
      this.isActive = true;
    });
  }

  scanForInteractives() {
    const hoverSelectors = ['a', 'button', '.nav__link', '.gallery-item'];
    
    document.querySelectorAll(hoverSelectors.join(',')).forEach(el => {
      this.attachEvents(el);
    });

    // Live monitoring (Sentience mode)
    const observer = new MutationObserver((m) => {
      m.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches(hoverSelectors.join(','))) this.attachEvents(node);
            node.querySelectorAll(hoverSelectors.join(',')).forEach(c => this.attachEvents(c));
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  attachEvents(el) {
    el.addEventListener('mouseenter', () => {
      this.cursor.classList.add('cursor-stone-glow--active');
      gsap.to(this.cursor, { scale: 1.8, duration: 0.4, ease: 'power3.out' });
      
      // Magnetic Attraction for Nav
      if (el.classList.contains('nav__link') || el.classList.contains('nav__brand')) {
        this.isMagnetic = true;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        gsap.to(this.pos, {
          x: centerX,
          y: centerY,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          onUpdate: () => {
            this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
          }
        });
      }
    });
    
    el.addEventListener('mouseleave', () => {
      this.cursor.classList.remove('cursor-stone-glow--active');
      gsap.to(this.cursor, { scale: 1, duration: 0.4, ease: 'power2.out' });
      this.isMagnetic = false;
    });
  }
}

// Auto-manifest
if (!window.Naroa) {
  new CursorSystem();
}

