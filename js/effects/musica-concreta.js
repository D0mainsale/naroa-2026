/**
 * MUSICA CONCRETA GENERATIVA — 24/7 Ambient Engine
 * 
 * Genera paisajes sonoros abstractos en tiempo real usando Web Audio API.
 * Inspirado en Pierre Schaeffer, Éliane Radigue, y Steve Reich.
 * 
 * Técnicas:
 * - Drones evolutivos con osciladores desafinados
 * - Texturas granulares (clicks, pops, grains)
 * - Filtros resonantes que mutan lentamente
 * - Reverb convolutivo sintético
 * - Capas de ruido filtrado (pink/brown noise)
 */

class MusicaConcreta {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.layers = [];
    this.schedulerId = null;
    this.volume = 0.12; // Subtle background level
  }

  async init() {
    if (this.ctx) return;
    
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master chain: Gain → Compressor → Destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.ratio.value = 4;
    compressor.knee.value = 10;
    
    // Convolution reverb (synthetic impulse)
    this.reverb = await this.createSyntheticReverb(3.5);
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.3;
    
    // Dry + Wet paths
    this.masterGain.connect(compressor);
    this.masterGain.connect(this.reverb);
    this.reverb.connect(reverbGain);
    reverbGain.connect(compressor);
    compressor.connect(this.ctx.destination);
  }

  // ═══ SYNTHETIC REVERB ═══
  async createSyntheticReverb(duration) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        // Exponential decay with diffusion
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    
    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  // ═══ LAYER 1: DEEP DRONES ═══
  createDroneLayer() {
    const frequencies = [55, 82.41, 110, 146.83]; // A1, E2, A2, D3
    const baseFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    // 3 slightly detuned oscillators for richness
    const oscs = [];
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.06;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 2;
    
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = baseFreq * (1 + (Math.random() - 0.5) * 0.008); // Microdetuning
      osc.connect(filter);
      osc.start();
      oscs.push(osc);
    }
    
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Slowly evolve filter frequency
    const evolve = () => {
      if (!this.isPlaying) return;
      const t = this.ctx.currentTime;
      filter.frequency.exponentialRampToValueAtTime(
        200 + Math.random() * 600, t + 8 + Math.random() * 12
      );
      setTimeout(evolve, 10000 + Math.random() * 15000);
    };
    evolve();
    
    return { oscs, gainNode, filter, type: 'drone' };
  }

  // ═══ LAYER 2: GRANULAR TEXTURE ═══
  createGranularLayer() {
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.04;
    gainNode.connect(this.masterGain);
    
    const scheduleGrain = () => {
      if (!this.isPlaying) return;
      
      const t = this.ctx.currentTime;
      const duration = 0.01 + Math.random() * 0.08;
      
      // Random short burst — the "concrete" element
      const osc = this.ctx.createOscillator();
      const grainGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = ['sine', 'square', 'triangle'][Math.floor(Math.random() * 3)];
      osc.frequency.value = 200 + Math.random() * 4000;
      
      filter.type = Math.random() > 0.5 ? 'bandpass' : 'highpass';
      filter.frequency.value = 500 + Math.random() * 3000;
      filter.Q.value = 5 + Math.random() * 15;
      
      // Envelope: sharp attack, quick decay
      grainGain.gain.setValueAtTime(0, t);
      grainGain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.4, t + 0.002);
      grainGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      
      osc.connect(filter);
      filter.connect(grainGain);
      grainGain.connect(gainNode);
      
      osc.start(t);
      osc.stop(t + duration + 0.01);
      
      // Schedule next grain — irregular rhythm
      const nextIn = 100 + Math.random() * 2000;
      setTimeout(scheduleGrain, nextIn);
    };
    
    scheduleGrain();
    return { gainNode, type: 'granular' };
  }

  // ═══ LAYER 3: FILTERED NOISE (WIND/BREATH) ═══
  createNoiseLayer() {
    // Pink noise via white noise + lowpass cascade
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Brown noise algorithm (more natural)
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.8;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.08;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
    
    // Breathing effect — slow LFO on filter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05 + Math.random() * 0.1; // Very slow
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    
    return { source, filter, gainNode, lfo, type: 'noise' };
  }

  // ═══ LAYER 4: BELL/HARMONIC PINGS ═══
  createBellLayer() {
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.03;
    gainNode.connect(this.masterGain);
    
    // Pentatonic scale for pleasant random melodies
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    
    const scheduleBell = () => {
      if (!this.isPlaying) return;
      
      const t = this.ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)];
      const octave = Math.random() > 0.5 ? 1 : 0.5;
      
      // FM synthesis for bell-like timbre
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const carrier = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      
      modulator.frequency.value = freq * octave * 2.76; // Inharmonic ratio
      modGain.gain.value = freq * octave * 0.5;
      carrier.frequency.value = freq * octave;
      
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      
      bellGain.gain.setValueAtTime(0, t);
      bellGain.gain.linearRampToValueAtTime(0.15, t + 0.005);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + 2 + Math.random() * 3);
      
      carrier.connect(bellGain);
      bellGain.connect(gainNode);
      
      modulator.start(t);
      carrier.start(t);
      modulator.stop(t + 5);
      carrier.stop(t + 5);
      
      // Next bell — sparse and meditative
      const nextIn = 3000 + Math.random() * 12000;
      setTimeout(scheduleBell, nextIn);
    };
    
    // Start after a delay
    setTimeout(scheduleBell, 2000 + Math.random() * 5000);
    return { gainNode, type: 'bell' };
  }

  // ═══ CONTROL ═══
  async start() {
    await this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Fade in
    const t = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(0, t);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, t + 4);
    
    // Create all layers
    this.layers.push(this.createDroneLayer());
    this.layers.push(this.createNoiseLayer());
    this.layers.push(this.createGranularLayer());
    this.layers.push(this.createBellLayer());
    
    console.log('[MusicaConcreta] 🎵 Generative ambient started — 4 layers active');
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    // Fade out
    const t = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0, t + 2);
    
    // Cleanup after fade
    setTimeout(() => {
      this.layers.forEach(layer => {
        if (layer.oscs) layer.oscs.forEach(o => { try { o.stop(); } catch(e) {} });
        if (layer.source) try { layer.source.stop(); } catch(e) {}
        if (layer.lfo) try { layer.lfo.stop(); } catch(e) {}
      });
      this.layers = [];
    }, 2500);
    
    console.log('[MusicaConcreta] 🔇 Ambient stopped');
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.isPlaying && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.5);
    }
  }
}

// Export as global
window.MusicaConcreta = new MusicaConcreta();
