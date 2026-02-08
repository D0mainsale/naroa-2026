/**
 * VISUAL-AUDIO SYNC ENGINE
 * Synchronizes visual effects with audio for immersive experience
 */

const AudioVisualSync = {
  analyser: null,
  dataArray: null,
  isActive: false,

  init() {
    if (!window.ImmersiveAudio?.ctx) {
      setTimeout(() => this.init(), 500);
      return;
    }

    // Create analyser node
    this.analyser = ImmersiveAudio.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Connect master gain to analyser
    ImmersiveAudio.masterGain.connect(this.analyser);

    this.isActive = true;
    console.log('🎨 Visual-Audio Sync active');
  },

  // Get current audio level (0-1)
  getLevel() {
    if (!this.analyser || !this.isActive) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    return sum / (this.dataArray.length * 255);
  },

  // Get bass level
  getBass() {
    if (!this.analyser || !this.isActive) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    // First 10 bins are bass frequencies
    const bassSum = this.dataArray.slice(0, 10).reduce((a, b) => a + b, 0);
    return bassSum / (10 * 255);
  },

  // Get high frequencies
  getHighs() {
    if (!this.analyser || !this.isActive) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const highSum = this.dataArray.slice(-20).reduce((a, b) => a + b, 0);
    return highSum / (20 * 255);
  },

  // Apply reactive effects to elements
  applyReactiveEffects() {
    if (!this.isActive || ImmersiveAudio.isMuted) return;

    const level = this.getLevel();
    const bass = this.getBass();
    
    // Subtle glow on hero based on audio
    const hero = document.querySelector('.hero');
    if (hero) {
      const glowIntensity = 0.1 + bass * 0.3;
      hero.style.setProperty('--audio-glow', glowIntensity);
    }

    // Pulse game cards on beat
    if (bass > 0.6) {
      document.querySelectorAll('.game-card').forEach(card => {
        card.style.transform = `scale(${1 + bass * 0.02})`;
        setTimeout(() => card.style.transform = '', 100);
      });
    }

    requestAnimationFrame(() => this.applyReactiveEffects());
  },

  // Start reactive mode
  startReactive() {
    if (!this.isActive) this.init();
    this.applyReactiveEffects();
  }
};

// Auto-init after audio ready
document.addEventListener('click', () => {
  setTimeout(() => {
    AudioVisualSync.init();
    AudioVisualSync.startReactive();
  }, 1000);
}, { once: true });

window.AudioVisualSync = AudioVisualSync;
