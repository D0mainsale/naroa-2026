/**
 * NAROA 2026 — Sovereign Orchestration Layer (v∞)
 * 
 * This module manages the lifecycle of all core systems.
 * It ensures technical sovereignty and aesthetic divinity.
 * 
 * @module main
 */

// CSS Pipeline
import './css/variables.css';
import './css/naroa-palette.css';
import './css/typography-2026.css';
import './css/base.css';
import './css/layout.css';
import './css/components.css';
import './css/components/notch.css';
import './css/components/bento-grid.css';
import './css/lightbox-premium.css';
import './css/scroll-to-top.css';
import './css/gallery.css';
import './css/gallery-disruptive.css';
import './css/about-contact.css';
import './css/footer.css';
import './css/animations.css';
import './css/soty-effects.css';
import './css/wow-effects.css';
import './css/wow-effects-2026.css';
import './css/hero-immersive.css';
import './css/nav.css';
import './css/divinity-awards.css';
import './css/mica-dust.css';

// Feature Orchestrator
class NaroaApp {
  constructor() {
    this.systems = {};
    this.init();
  }

  async init() {
    console.groupCollapsed('🌀 [NEXUS-V∞] Establishing Sovereignty');
    
    try {
      // 1. Core Systems
      await this.launch('Scroll', () => import('./js/core/scroll.js'));
      await this.launch('Cursor', () => import('./js/core/cursor.js'));
      
      // 2. Structural Integrity
      this.ensurePremiumStructuralHarmony();
      
      console.log('✅ [APOTHEOSIS] System Soul active.');
    } catch (error) {
      console.error('❌ [VOID] Critical system failure:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Launch a system with lifecycle management.
   */
  async launch(name, importFn) {
    try {
      const module = await importFn();
      this.systems[name] = module.default || module;
      console.log(`📡 [${name}] Active.`);
    } catch (e) {
      console.warn(`⚠️ [${name}] Launch inhibited:`, e);
    }
  }

  /**
   * Align with user's latest structural changes (Premium Notch).
   */
  ensurePremiumStructuralHarmony() {
    const navInner = document.querySelector('.nav__inner');
    if (navInner) {
      navInner.classList.add('divinity-active');
    }
  }
}

// Global Manifestation
window.Naroa = new NaroaApp();


