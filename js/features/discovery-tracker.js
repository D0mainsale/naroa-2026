/**
 * Discovery Tracker
 * Replaces right menu with a % indicator of "World Discovered"
 * Based on scroll depth + sections visited
 */
class DiscoveryTracker {
  constructor() {
    this.visitedSections = new Set();
    this.maxScroll = 0;
    this.totalHeight = 0;
    this.scrolledPercent = 0;
    
    this.createWidget();
    this.init();
  }

  createWidget() {
    const el = document.createElement('div');
    el.id = 'discovery-widget';
    el.innerHTML = `
      <div class="discovery-label">DESCUBIERTO</div>
      <div class="discovery-val">0%</div>
      <div class="discovery-bar">
        <div class="discovery-progress"></div>
      </div>
    `;
    
    // Inject styles explicitly
    el.style.cssText = `
      position: fixed;
      right: var(--φ-lg, 34px);
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      z-index: 999;
      mix-blend-mode: difference;
      font-family: var(--font-family-mono, monospace);
      pointer-events: none;
    `;
    
    const val = el.querySelector('.discovery-val');
    val.style.cssText = `
      font-size: var(--φ-text-lg, 34px);
      font-weight: 700;
      color: var(--white);
    `;

    const label = el.querySelector('.discovery-label');
    label.style.cssText = `
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 10px;
      letter-spacing: 0.2em;
      opacity: 0.7;
      margin-bottom: 10px;
      color: var(--gold-metallic, #d4af37);
    `;

    document.body.appendChild(el);
    this.el = el;
    this.valEl = val;
  }

  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }

  update() {
    const winBuffer = 50;
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return;

    // Calculate Scroll %
    let pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    
    // Bonus for visiting sections
    document.querySelectorAll('section').forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        this.visitedSections.add(sec.id);
      }
    });

    const uniqueSections = document.querySelectorAll('section').length || 1;
    const visitedPct = (this.visitedSections.size / uniqueSections) * 10; // 10% bonus max
    
    // Weighted Total: 90% scroll, 10% sections
    const total = Math.min(100, Math.round(pct));

    // Update UI
    this.valEl.textContent = `${total}%`;
    
    // Animate golden glow if 100%
    if (total === 100) {
      this.valEl.style.textShadow = "0 0 20px var(--gold-metallic)";
      this.valEl.style.color = "var(--gold-metallic)";
    }
  }
}

// Init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.Discovery = new DiscoveryTracker());
} else {
  window.Discovery = new DiscoveryTracker();
}
