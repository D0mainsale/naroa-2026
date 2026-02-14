/**
 * NAROA 2026 — Vite Module Entry Point
 * 
 * This file serves as the CSS bundling entry for Vite.
 * All JavaScript is loaded via traditional <script> tags in index.html
 * for progressive enhancement — the site works even if this module fails.
 * 
 * CSS imports are processed by Vite's CSS pipeline:
 * - Development: injected as <style> tags with HMR
 * - Production: extracted, minified, and fingerprinted into /assets/
 * 
 * @module main
 * @see vite.config.js for build configuration
 */

// ═══════════════════════════════════════════
// Design Tokens & Variables
// ═══════════════════════════════════════════
import './css/variables.css';
import './css/naroa-palette.css';

// ═══════════════════════════════════════════
// Foundation
// ═══════════════════════════════════════════
import './css/typography-2026.css';
import './css/base.css';
import './css/layout.css';

// ═══════════════════════════════════════════
// Components
// ═══════════════════════════════════════════
import './css/components.css';
import './css/components/notch.css';
import './css/components/bento-grid.css';
import './css/lightbox-premium.css';
import './css/scroll-to-top.css';

// ═══════════════════════════════════════════
// Features
// ═══════════════════════════════════════════
import './css/gallery.css';
import './css/gallery-disruptive.css';
import './css/about-contact.css';
import './css/footer.css';

// ═══════════════════════════════════════════
// Effects & Animations
// ═══════════════════════════════════════════
import './css/animations.css';
import './css/soty-effects.css';
import './css/wow-effects.css';
import './css/wow-effects-2026.css';
import './css/hero-immersive.css';
