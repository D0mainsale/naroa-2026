import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Naroa 2026 - Sovereign Scroll System (v∞)
 */
export class SmoothScrollSystem {
  constructor() {
    this.lenis = null;
    this.init();
  }

  init() {
    this.lenis = new Lenis({
      duration: 1.5, // Even smoother for v∞
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1, // Slight boost
      touchMultiplier: 2,
      infinite: false,
    });

    // Neural Sync with ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Global Sovereignty
    window.NaroaScroll = this.lenis;
  }

  scrollTo(target, options = {}) {
    this.lenis.scrollTo(target, options);
  }
}

// Auto-manifest if loaded directly
if (!window.Naroa) {
  new SmoothScrollSystem();
}

