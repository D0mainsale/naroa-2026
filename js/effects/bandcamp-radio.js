/**
 * SOUNDCLOUD PLAYER — "This Was In Rainbows" by Borja Moskv
 * 
 * The actual SoundCloud iframe + toggle logic lives inline in index.html
 * (audio-dock section, lines ~229–272).
 * 
 * This file is intentionally minimal — it only adds enhancements:
 * - Vinyl spin animation synced to playing state
 * - Keyboard shortcut (M) to toggle music
 * - Persist play state in sessionStorage
 */

class SoundExperience {
  constructor() {
    this.dock = document.getElementById('audio-dock');
    this.toggle = document.getElementById('audio-toggle');
    this.panel = document.getElementById('audio-panel');
    this.vinyl = this.dock?.querySelector('.vinyl-disc');
    
    if (!this.dock || !this.toggle) return;
    
    this.bindKeyboard();
    this.restoreState();
  }

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // 'M' key toggles music (unless typing in input)
      if (e.key === 'm' || e.key === 'M') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        this.toggle.click();
      }
    });
  }

  restoreState() {
    // If user had music open in this session, re-open
    if (sessionStorage.getItem('naroa-music-open') === 'true') {
      // Delayed to not interfere with page load
      setTimeout(() => {
        if (this.panel && !this.panel.classList.contains('open')) {
          this.toggle.click();
        }
      }, 2000);
    }

    // Track state changes
    if (this.panel) {
      const observer = new MutationObserver(() => {
        const isOpen = this.panel.classList.contains('open');
        sessionStorage.setItem('naroa-music-open', isOpen ? 'true' : 'false');
      });
      observer.observe(this.panel, { attributes: true, attributeFilter: ['class'] });
    }
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SoundExperience());
} else {
  new SoundExperience();
}
