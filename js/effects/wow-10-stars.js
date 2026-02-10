/**
 * ═══════════════════════════════════════════════════════════════
 * 10 WOW EFFECTS — DISRUPTIVOS HASTA 2029
 * Elegantes · Visuales · Con intención artística
 * Formas orgánicas · Petricor · Serendipia
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. BREATH SYNC — La web respira con el usuario
 * 2. CHROMATIC ABERRATION — Separación RGB en scroll
 * 3. AMBIENT LIGHT BLEED — Colores de la obra iluminan el entorno
 * 4. TEXT EROSION — Texto que se erosiona como piedra
 * 5. PERSISTENCE OF VISION — Fantasmas de lo que acabas de ver
 * 6. PETRICHOR MOOD — El clima real cambia la paleta (API pública)
 * 7. SERENDIPITY ENGINE — Encuentra arte que no buscabas (Art API)
 * 8. ORGANIC MORPHISM — Formas blob orgánicas que mutan
 * 9. DEPTH OF FIELD — Desenfoque selectivo tipo cámara
 * 10. TEMPORAL SHIFT — La hora del día cambia toda la estética
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════
  // WOW 1: BREATH SYNC — La web respira
  // La página pulsa suavemente, como si estuviera viva.
  // Cada sección "inhala" (escala sutil 1.002) y "exhala" (1.0).
  // Intención: crear conexión empática inconsciente.
  // ═══════════════════════════════════════════
  const BreathSync = {
    phase: 0,
    bpm: 12, // 12 respiraciones por minuto = meditativo
    
    init() {
      this.animate();
    },
    
    animate() {
      this.phase += (Math.PI * 2 * this.bpm) / (60 * 60); // 60fps
      const breath = 1 + Math.sin(this.phase) * 0.002;
      const opacity = 0.92 + Math.sin(this.phase) * 0.08;
      
      document.documentElement.style.setProperty('--breath-scale', breath);
      document.documentElement.style.setProperty('--breath-opacity', opacity);
      
      requestAnimationFrame(() => this.animate());
    }
  };

  // ═══════════════════════════════════════════
  // WOW 2: CHROMATIC ABERRATION — RGB split on fast scroll
  // Cuando el usuario hace scroll rápido, los canales RGB
  // se separan ligeramente. Scroll lento = imagen perfecta.
  // Intención: premiar la contemplación, penalizar la prisa.
  // ═══════════════════════════════════════════
  const ChromaticAberration = {
    lastScroll: 0,
    velocity: 0,
    
    init() {
      let lastY = window.scrollY;
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const currentY = window.scrollY;
            this.velocity = Math.abs(currentY - lastY);
            lastY = currentY;
            
            // Only activate on fast scroll (>30px/frame)
            const intensity = Math.min(this.velocity / 100, 1) * 3;
            const sections = document.querySelectorAll('.view, section');
            
            sections.forEach(el => {
              if (intensity > 0.1) {
                el.style.textShadow = `
                  ${intensity}px 0 rgba(255,0,60,0.15),
                  ${-intensity}px 0 rgba(0,180,255,0.15)
                `;
                el.style.filter = `blur(${intensity * 0.3}px)`;
              } else {
                el.style.textShadow = 'none';
                el.style.filter = 'none';
              }
            });
            
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  };

  // ═══════════════════════════════════════════
  // WOW 3: AMBIENT LIGHT BLEED — Artwork colors leak
  // Extrae el color dominante de la obra visible y lo
  // proyecta como luz ambiental en los bordes de la pantalla.
  // Intención: la obra "irradia" más allá de su marco.
  // ═══════════════════════════════════════════
  const AmbientLightBleed = {
    currentColor: { r: 0, g: 0, b: 0 },
    targetColor: { r: 0, g: 0, b: 0 },
    overlay: null,
    
    // Pre-defined palette per artwork (avoids canvas CORS)
    artworkPalettes: {
      james:   { r: 200, g: 50, b: 30 },   // Warm red-orange
      amy:     { r: 139, g: 92, b: 246 },   // Purple-violet
      johnny:  { r: 40, g: 120, b: 200 },   // Deep blue
      marilyn: { r: 220, g: 60, b: 100 },   // Hot pink
      default: { r: 180, g: 140, b: 80 }    // Gold
    },
    
    init() {
      // Create ambient overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'ambient-light-bleed';
      this.overlay.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        opacity: 0;
        transition: opacity 2s ease;
        mix-blend-mode: soft-light;
      `;
      document.body.appendChild(this.overlay);
      
      // Observe hero slide changes
      this.observeSlides();
      this.animate();
    },
    
    observeSlides() {
      const observer = new MutationObserver(() => {
        const activeSlide = document.querySelector('.hero__slide.active');
        if (activeSlide) {
          const artwork = activeSlide.dataset.artwork || 'default';
          this.targetColor = this.artworkPalettes[artwork] || this.artworkPalettes.default;
          this.overlay.style.opacity = '0.4';
        }
      });
      
      const slider = document.getElementById('hero-slider');
      if (slider) {
        observer.observe(slider, { subtree: true, attributes: true, attributeFilter: ['class'] });
        // Initial
        const active = slider.querySelector('.hero__slide.active');
        if (active) {
          const artwork = active.dataset.artwork || 'default';
          this.targetColor = this.artworkPalettes[artwork] || this.artworkPalettes.default;
          this.overlay.style.opacity = '0.4';
        }
      }
    },
    
    animate() {
      // Smooth lerp
      this.currentColor.r += (this.targetColor.r - this.currentColor.r) * 0.02;
      this.currentColor.g += (this.targetColor.g - this.currentColor.g) * 0.02;
      this.currentColor.b += (this.targetColor.b - this.currentColor.b) * 0.02;
      
      const r = Math.round(this.currentColor.r);
      const g = Math.round(this.currentColor.g);
      const b = Math.round(this.currentColor.b);
      
      if (this.overlay) {
        this.overlay.style.background = `
          radial-gradient(ellipse at 0% 50%, rgba(${r},${g},${b},0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 100% 50%, rgba(${r},${g},${b},0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 0%, rgba(${r},${g},${b},0.15) 0%, transparent 40%)
        `;
      }
      
      requestAnimationFrame(() => this.animate());
    }
  };

  // ═══════════════════════════════════════════
  // WOW 4: TEXT EROSION — Texto que se erosiona
  // Los títulos se "erosionan" con un clip-path animado,
  // como si fueran tallados en piedra y el viento los desgasta.
  // Intención: nada es permanente — kintsugi filosófico.
  // ═══════════════════════════════════════════
  const TextErosion = {
    init() {
      const style = document.createElement('style');
      style.textContent = `
        .text-erode {
          position: relative;
          display: inline-block;
        }
        .text-erode::after {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          mask-size: 300% 300%;
          animation: erode-drift 20s ease-in-out infinite alternate;
          mix-blend-mode: multiply;
          opacity: 0.15;
          pointer-events: none;
        }
        
        @keyframes erode-drift {
          0% { mask-position: 0% 0%; }
          100% { mask-position: 100% 100%; }
        }
        
        /* Erosion reveals on scroll */
        .text-erode-reveal {
          clip-path: inset(0 100% 0 0);
          transition: clip-path 1.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .text-erode-reveal.in-viewport {
          clip-path: inset(0 0% 0 0);
        }
      `;
      document.head.appendChild(style);
      
      // Apply to section titles
      document.querySelectorAll('h2, .section-title, .hero__title').forEach(el => {
        el.classList.add('text-erode');
      });
    }
  };

  // ═══════════════════════════════════════════
  // WOW 5: PERSISTENCE OF VISION — Afterimages
  // Cuando cambias de slide en el hero, un "fantasma" 
  // semi-transparente del anterior persiste 1.5s.
  // Intención: todo deja huella, como en la memoria.
  // ═══════════════════════════════════════════
  const PersistenceOfVision = {
    init() {
      const style = document.createElement('style');
      style.textContent = `
        .hero__slide {
          transition: opacity 0.8s ease;
        }
        .hero__slide.ghost {
          opacity: 0.25;
          filter: blur(4px) saturate(0.3);
          transition: opacity 1.5s ease, filter 1.5s ease;
          pointer-events: none;
        }
        .hero__slide.ghost-fade {
          opacity: 0;
          filter: blur(12px) saturate(0);
        }
      `;
      document.head.appendChild(style);
      
      // Observer for slide changes
      const slider = document.getElementById('hero-slider');
      if (!slider) return;
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          if (m.target.classList && m.target.classList.contains('hero__slide')) {
            if (m.oldValue && m.oldValue.includes('active') && !m.target.classList.contains('active')) {
              // This slide just lost "active"
              m.target.classList.add('ghost');
              setTimeout(() => {
                m.target.classList.add('ghost-fade');
                setTimeout(() => {
                  m.target.classList.remove('ghost', 'ghost-fade');
                }, 1500);
              }, 100);
            }
          }
        });
      });
      
      observer.observe(slider, { 
        subtree: true, 
        attributes: true, 
        attributeOldValue: true,
        attributeFilter: ['class'] 
      });
    }
  };

  // ═══════════════════════════════════════════
  // WOW 6: PETRICHOR MOOD — El clima real cambia la paleta
  // Usa wttr.in (API pública, sin key) para obtener el clima
  // actual y ajustar la paleta global de la web.
  // Intención: cada visita es irrepetible, como el petricor.
  // ═══════════════════════════════════════════
  const PetrichorMood = {
    moods: {
      sunny:    { hue: 35,  sat: '70%', bg: 'rgba(255,235,180,0.05)', label: '☀️' },
      cloudy:   { hue: 220, sat: '15%', bg: 'rgba(180,190,210,0.08)', label: '☁️' },
      rainy:    { hue: 210, sat: '40%', bg: 'rgba(100,140,200,0.1)',  label: '🌧️' },
      stormy:   { hue: 260, sat: '50%', bg: 'rgba(80,60,140,0.12)',   label: '⛈️' },
      snowy:    { hue: 200, sat: '10%', bg: 'rgba(230,240,255,0.1)',  label: '❄️' },
      night:    { hue: 240, sat: '30%', bg: 'rgba(20,20,60,0.15)',    label: '🌙' },
      default:  { hue: 0,   sat: '0%',  bg: 'transparent',            label: '🎨' }
    },
    
    async init() {
      try {
        // wttr.in — public API, no key needed, returns weather code
        const res = await fetch('https://wttr.in/?format=%C+%t', { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error('Weather API failed');
        const text = await res.text();
        
        const mood = this.parseMood(text.toLowerCase());
        this.applyMood(mood);
        
        console.log(`🌤️ Petrichor Mood: ${mood.label} → hue shift ${mood.hue}°`);
      } catch(e) {
        // Silent fail — use time-based fallback
        const hour = new Date().getHours();
        const mood = (hour >= 21 || hour < 6) ? this.moods.night : this.moods.default;
        this.applyMood(mood);
      }
    },
    
    parseMood(text) {
      if (text.includes('rain') || text.includes('drizzle') || text.includes('lluvia')) return this.moods.rainy;
      if (text.includes('thunder') || text.includes('storm'))  return this.moods.stormy;
      if (text.includes('snow') || text.includes('nieve'))     return this.moods.snowy;
      if (text.includes('cloud') || text.includes('overcast') || text.includes('nub')) return this.moods.cloudy;
      if (text.includes('sun') || text.includes('clear') || text.includes('sol'))      return this.moods.sunny;
      return this.moods.default;
    },
    
    applyMood(mood) {
      const root = document.documentElement;
      root.style.setProperty('--petrichor-hue', mood.hue);
      root.style.setProperty('--petrichor-sat', mood.sat);
      
      // Subtle background tint
      const tint = document.createElement('div');
      tint.style.cssText = `
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: ${mood.bg};
        transition: background 5s ease;
      `;
      document.body.prepend(tint);
    }
  };

  // ═══════════════════════════════════════════
  // WOW 7: SERENDIPITY ENGINE — Arte inesperado
  // Conecta con Art Institute of Chicago API (pública, sin key)
  // para mostrar una obra aleatoria que "dialoga" con Naroa.
  // Intención: la serendipia — encontrar lo que no buscabas.
  // ═══════════════════════════════════════════
  const SerendipityEngine = {
    async init() {
      try {
        // Art Institute of Chicago — public API, no key
        const page = Math.floor(Math.random() * 100) + 1;
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}&limit=1&fields=id,title,artist_title,image_id,date_display`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) throw new Error('Art API failed');
        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
          const artwork = data.data[0];
          const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`;
          
          // Store for MICA to use
          window.__serendipity = {
            title: artwork.title,
            artist: artwork.artist_title,
            date: artwork.date_display,
            image: imageUrl,
            museum: 'Art Institute of Chicago'
          };
          
          console.log(`✨ Serendipia: "${artwork.title}" by ${artwork.artist_title} (${artwork.date_display})`);
        }
      } catch(e) {
        // Silent fail — serendipity is never forced
      }
    }
  };

  // ═══════════════════════════════════════════
  // WOW 8: ORGANIC MORPHISM — Blob shapes that breathe
  // SVG blobs orgánicos que mutan lentamente en los bordes
  // de las secciones. No son círculos perfectos — son vivos.
  // Intención: la naturaleza no tiene líneas rectas.
  // ═══════════════════════════════════════════
  const OrganicMorphism = {
    init() {
      const style = document.createElement('style');
      style.textContent = `
        .organic-blob {
          position: absolute;
          width: 300px;
          height: 300px;
          opacity: 0.06;
          filter: blur(40px);
          pointer-events: none;
          z-index: -1;
          animation: blob-morph 15s ease-in-out infinite alternate;
        }
        
        .organic-blob--warm {
          background: radial-gradient(ellipse, 
            rgba(255, 100, 50, 0.6) 0%, 
            rgba(255, 180, 50, 0.3) 40%,
            transparent 70%);
        }
        
        .organic-blob--cool {
          background: radial-gradient(ellipse, 
            rgba(100, 150, 255, 0.5) 0%, 
            rgba(139, 92, 246, 0.3) 40%,
            transparent 70%);
        }
        
        .organic-blob--earth {
          background: radial-gradient(ellipse, 
            rgba(180, 140, 80, 0.5) 0%, 
            rgba(120, 90, 50, 0.3) 40%,
            transparent 70%);
        }
        
        @keyframes blob-morph {
          0%   { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); }
          33%  { border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%; transform: rotate(120deg) scale(1.1); }
          66%  { border-radius: 30% 70% 50% 50% / 70% 40% 60% 30%; transform: rotate(240deg) scale(0.9); }
          100% { border-radius: 50% 50% 40% 60% / 50% 60% 30% 70%; transform: rotate(360deg) scale(1); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .organic-blob { animation: none; }
        }
      `;
      document.head.appendChild(style);
      
      // Place blobs at section boundaries
      const sections = document.querySelectorAll('.view, section, .hero');
      const blobTypes = ['warm', 'cool', 'earth'];
      
      sections.forEach((section, i) => {
        if (i > 5) return; // Limit to 6 blobs max for performance
        
        const blob = document.createElement('div');
        blob.className = `organic-blob organic-blob--${blobTypes[i % 3]}`;
        blob.style.cssText = `
          top: ${Math.random() * 80}%;
          ${i % 2 === 0 ? 'left' : 'right'}: ${-50 + Math.random() * 100}px;
          width: ${200 + Math.random() * 200}px;
          height: ${200 + Math.random() * 200}px;
          animation-delay: ${-Math.random() * 15}s;
          animation-duration: ${12 + Math.random() * 8}s;
        `;
        
        section.style.position = section.style.position || 'relative';
        section.appendChild(blob);
      });
    }
  };

  // ═══════════════════════════════════════════
  // WOW 9: DEPTH OF FIELD — Desenfoque selectivo
  // Las secciones fuera del viewport se desenfoccan
  // progresivamente, como una cámara con poca profundidad.
  // Intención: el foco es un acto de voluntad.
  // ═══════════════════════════════════════════
  const DepthOfField = {
    init() {
      const style = document.createElement('style');
      style.textContent = `
        .dof-section {
          transition: filter 0.8s cubic-bezier(0.22, 1, 0.36, 1), 
                      opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .dof-section.dof-far {
          filter: blur(3px);
          opacity: 0.7;
        }
        .dof-section.dof-near {
          filter: blur(1px);
          opacity: 0.85;
        }
        .dof-section.dof-focus {
          filter: blur(0);
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
      
      const sections = document.querySelectorAll('.view, section');
      sections.forEach(s => s.classList.add('dof-section', 'dof-far'));
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const el = entry.target;
          el.classList.remove('dof-far', 'dof-near', 'dof-focus');
          
          if (entry.intersectionRatio > 0.5) {
            el.classList.add('dof-focus');
          } else if (entry.intersectionRatio > 0.1) {
            el.classList.add('dof-near');
          } else {
            el.classList.add('dof-far');
          }
        });
      }, { threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0] });
      
      sections.forEach(s => observer.observe(s));
    }
  };

  // ═══════════════════════════════════════════
  // WOW 10: TEMPORAL SHIFT — La hora cambia la estética
  // Amanecer = cálido dorado. Mediodía = vibrante. 
  // Atardecer = magenta. Noche = azul profundo.
  // Intención: la web es un organismo vivo que respira el tiempo.
  // ═══════════════════════════════════════════
  const TemporalShift = {
    palettes: {
      dawn:     { filter: 'sepia(0.08) hue-rotate(-10deg)',  accent: '#ff9f43', bg: '#1a1510' },
      morning:  { filter: 'saturate(1.05)',                   accent: '#feca57', bg: '#0f0f12' },
      noon:     { filter: 'saturate(1.1) contrast(1.02)',     accent: '#ff6348', bg: '#0a0a0f' },
      afternoon:{ filter: 'sepia(0.04) saturate(1.05)',       accent: '#e17055', bg: '#0d0a0f' },
      golden:   { filter: 'sepia(0.12) saturate(1.15)',       accent: '#f0932b', bg: '#120e08' },
      dusk:     { filter: 'hue-rotate(10deg) saturate(1.1)',  accent: '#e056a0', bg: '#0f0812' },
      night:    { filter: 'saturate(0.85) brightness(0.95)',  accent: '#7c5cbf', bg: '#06060c' },
      midnight: { filter: 'saturate(0.7) brightness(0.9)',    accent: '#3d5af1', bg: '#04040a' }
    },
    
    init() {
      const hour = new Date().getHours();
      let period;
      
      if (hour >= 5 && hour < 7)       period = 'dawn';
      else if (hour >= 7 && hour < 10) period = 'morning';
      else if (hour >= 10 && hour < 13) period = 'noon';
      else if (hour >= 13 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 19) period = 'golden';
      else if (hour >= 19 && hour < 21) period = 'dusk';
      else if (hour >= 21 || hour < 1)  period = 'night';
      else                               period = 'midnight';
      
      const palette = this.palettes[period];
      const root = document.documentElement;
      
      root.style.setProperty('--temporal-filter', palette.filter);
      root.style.setProperty('--temporal-accent', palette.accent);
      root.style.setProperty('--temporal-bg', palette.bg);
      
      // Apply subtle filter to non-interactive content
      document.body.style.filter = palette.filter;
      
      console.log(`⏰ Temporal Shift: ${period} (${hour}:00) → ${palette.accent}`);
    }
  };

  // ═══════════════════════════════════════════
  // INIT ALL — Lazy, respectful, progressive
  // ═══════════════════════════════════════════
  function initAll() {
    // Immediate (no DOM dependency)
    TemporalShift.init();
    BreathSync.init();
    
    // After first paint
    requestAnimationFrame(() => {
      TextErosion.init();
      ChromaticAberration.init();
      OrganicMorphism.init();
      DepthOfField.init();
      AmbientLightBleed.init();
      PersistenceOfVision.init();
    });
    
    // Async APIs (non-blocking)
    PetrichorMood.init();
    SerendipityEngine.init();
    
    console.log('✨ 10 WOW Effects activated — Disruptivos hasta 2029');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Export for MICA integration
  window.WOW10Stars = {
    BreathSync,
    ChromaticAberration,
    AmbientLightBleed,
    TextErosion,
    PersistenceOfVision,
    PetrichorMood,
    SerendipityEngine,
    OrganicMorphism,
    DepthOfField,
    TemporalShift
  };

})();
