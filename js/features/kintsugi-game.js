/**
 * KINTSUGI EMOCIONAL - Naroa 2026
 * @description Repair broken portraits with flowing liquid gold - the beauty of imperfection
 */
(function() {
  'use strict';

  let state = {
    canvas: null,
    ctx: null,
    artworks: [],
    cracks: [],
    repaired: [],
    goldParticles: [],
    isRepairing: false,
    mousePos: { x: 0, y: 0 },
    repairProgress: 0
  };

  async function init() {
    const container = document.getElementById('kintsugi-container');
    if (!container) return;

    await loadArtworks();
    createUI(container);
  }

  async function loadArtworks() {
    try {
      const res = await fetch('data/artworks-metadata.json');
      const data = await res.json();
      state.artworks = data.artworks.filter(a => a.id).slice(0, 10);
    } catch (e) {}
  }

  function createUI(container) {
    const art = state.artworks[Math.floor(Math.random() * state.artworks.length)];
    state.cracks = generateCracks();
    state.repaired = [];
    state.goldParticles = [];
    state.repairProgress = 0;

    container.innerHTML = `
      <div class="kintsugi-experience">
        <div class="kintsugi-frame">
          <img src="images/artworks/${art?.id || 'default'}.webp" 
               alt="${art?.title || 'Retrato'}" 
               class="kintsugi-base">
          
          <canvas id="kintsugi-canvas" class="kintsugi-canvas"></canvas>
          
          <svg class="kintsugi-cracks" id="kintsugi-cracks" viewBox="0 0 300 400">
            ${state.cracks.map((crack, i) => `
              <path class="crack-path" 
                    id="crack-${i}"
                    d="${crack.path}" 
                    stroke="rgba(0,0,0,0.8)" 
                    stroke-width="3" 
                    fill="none"/>
            `).join('')}
          </svg>
          
          <svg class="kintsugi-gold" id="kintsugi-gold" viewBox="0 0 300 400">
            <!-- Gold repairs drawn here -->
          </svg>
          
          <div class="kintsugi-particles" id="kintsugi-particles"></div>
        </div>
        
        <div class="kintsugi-info">
          <h3>金継ぎ Kintsugi Emocional</h3>
          <p>Toca las grietas para repararlas con oro líquido</p>
          <div class="kintsugi-progress">
            <div class="kintsugi-progress-bar" id="progress-bar"></div>
          </div>
          <p class="kintsugi-wisdom" id="kintsugi-wisdom"></p>
        </div>
        
        <div class="kintsugi-controls">
          <button class="game-btn" id="kintsugi-break">💔 Romper de nuevo</button>
          <button class="game-btn" id="kintsugi-next">🔄 Nueva obra</button>
        </div>
      </div>
    `;

    setupCanvas();
    attachEvents(container);
  }

  function generateCracks() {
    const cracks = [];
    const numCracks = 5 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numCracks; i++) {
      const startX = 50 + Math.random() * 200;
      const startY = 50 + Math.random() * 300;
      
      let path = `M ${startX} ${startY}`;
      let x = startX, y = startY;
      const segments = 3 + Math.floor(Math.random() * 4);
      
      for (let j = 0; j < segments; j++) {
        const dx = (Math.random() - 0.5) * 80;
        const dy = (Math.random() - 0.5) * 60;
        x += dx;
        y += dy;
        x = Math.max(10, Math.min(290, x));
        y = Math.max(10, Math.min(390, y));
        path += ` L ${x} ${y}`;
      }

      cracks.push({
        path,
        repaired: false,
        points: extractPoints(path)
      });
    }
    return cracks;
  }

  function extractPoints(pathD) {
    const points = [];
    const matches = pathD.matchAll(/[ML]\s*([\d.]+)\s+([\d.]+)/g);
    for (const match of matches) {
      points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
    }
    return points;
  }

  function setupCanvas() {
    state.canvas = document.getElementById('kintsugi-canvas');
    if (!state.canvas) return;
    state.ctx = state.canvas.getContext('2d');
    state.canvas.width = 300;
    state.canvas.height = 400;
  }

  function attachEvents(container) {
    const svg = document.getElementById('kintsugi-cracks');
    
    // Click on cracks to repair
    svg?.querySelectorAll('.crack-path').forEach((path, i) => {
      path.addEventListener('click', (e) => {
        if (!state.cracks[i].repaired) {
          repairCrack(i);
        }
      });
      
      path.addEventListener('mouseenter', () => {
        path.style.cursor = state.cracks[i].repaired ? 'default' : 'pointer';
        if (!state.cracks[i].repaired) {
          path.style.filter = 'drop-shadow(0 0 10px gold)';
        }
      });
      
      path.addEventListener('mouseleave', () => {
        path.style.filter = '';
      });
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      const rect = svg.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 300;
      const y = ((touch.clientY - rect.top) / rect.height) * 400;
      
      state.cracks.forEach((crack, i) => {
        if (!crack.repaired && isNearCrack(x, y, crack.points)) {
          repairCrack(i);
        }
      });
    });

    document.getElementById('kintsugi-break')?.addEventListener('click', breakAgain);
    document.getElementById('kintsugi-next')?.addEventListener('click', () => createUI(container));
  }

  function isNearCrack(x, y, points, threshold = 20) {
    return points.some(p => 
      Math.abs(p.x - x) < threshold && Math.abs(p.y - y) < threshold
    );
  }

  function repairCrack(index) {
    const crack = state.cracks[index];
    if (crack.repaired) return;
    
    crack.repaired = true;
    state.repaired.push(index);

    // Hide crack, show gold
    const crackPath = document.getElementById(`crack-${index}`);
    if (crackPath) {
      crackPath.style.opacity = '0';
    }

    // Draw gold path with animation
    const goldSvg = document.getElementById('kintsugi-gold');
    const goldPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    goldPath.setAttribute('d', crack.path);
    goldPath.setAttribute('stroke', 'url(#gold-gradient)');
    goldPath.setAttribute('stroke-width', '4');
    goldPath.setAttribute('fill', 'none');
    goldPath.setAttribute('class', 'gold-path');
    goldPath.setAttribute('filter', 'url(#gold-glow)');
    
    // Add gradient and filter if not exists
    if (!goldSvg.querySelector('defs')) {
      goldSvg.innerHTML = `
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffd700"/>
            <stop offset="50%" style="stop-color:#ffec8b"/>
            <stop offset="100%" style="stop-color:#daa520"/>
          </linearGradient>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      `;
    }
    
    goldSvg.appendChild(goldPath);

    // Animate path drawing
    const length = goldPath.getTotalLength();
    goldPath.style.strokeDasharray = length;
    goldPath.style.strokeDashoffset = length;
    goldPath.style.animation = 'gold-flow 1s ease-out forwards';

    // Spawn gold particles
    spawnGoldParticles(crack.points);

    // Update progress
    updateProgress();

    // Check completion
    if (state.repaired.length === state.cracks.length) {
      showCompletion();
    }
  }

  function spawnGoldParticles(points) {
    const container = document.getElementById('kintsugi-particles');
    if (!container) return;

    points.forEach(point => {
      for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'gold-particle';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const duration = 0.5 + Math.random() * 0.5;
        
        particle.style.cssText = `
          left: ${(point.x / 300) * 100}%;
          top: ${(point.y / 400) * 100}%;
          --dx: ${Math.cos(angle) * distance}px;
          --dy: ${Math.sin(angle) * distance}px;
          animation: gold-burst ${duration}s ease-out forwards;
        `;
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), duration * 1000);
      }
    });
  }

  function updateProgress() {
    const progress = (state.repaired.length / state.cracks.length) * 100;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = `${progress}%`;
  }

  const WISDOMS = [
    '"Las cicatrices son mapas de la vida que hemos vivido"',
    '"Lo roto puede ser más bello que lo perfecto"',
    '"El oro de las heridas cuenta nuestra historia"',
    '"En cada grieta, una oportunidad de brillar"',
    '"La imperfección es donde entra la luz"'
  ];

  function showCompletion() {
    const wisdom = document.getElementById('kintsugi-wisdom');
    if (wisdom) {
      wisdom.textContent = WISDOMS[Math.floor(Math.random() * WISDOMS.length)];
      wisdom.classList.add('visible');
    }

    // Celebration effect
    document.querySelector('.kintsugi-frame')?.classList.add('complete');

    // Score based on speed (simulated) + completion base
    const score = 1000 + Math.floor(Math.random() * 500); 

    if (window.RankingSystem) {
      // Small delay to let the user see the "Wisdom" message first
      setTimeout(() => {
        window.RankingSystem.showSubmitModal('kintsugi', score, () => {
          // Render ranking in a modal or overlay if needed, or just save
          console.log('Kintsugi score saved');
        });
      }, 1500);
    }
  }

  function breakAgain() {
    // Reset current portrait with new cracks
    state.cracks = generateCracks();
    state.repaired = [];
    
    const cracksSvg = document.getElementById('kintsugi-cracks');
    const goldSvg = document.getElementById('kintsugi-gold');
    const particles = document.getElementById('kintsugi-particles');
    
    if (cracksSvg) {
      cracksSvg.innerHTML = state.cracks.map((crack, i) => `
        <path class="crack-path" 
              id="crack-${i}"
              d="${crack.path}" 
              stroke="rgba(0,0,0,0.8)" 
              stroke-width="3" 
              fill="none"/>
      `).join('');
    }
    
    if (goldSvg) goldSvg.innerHTML = '';
    if (particles) particles.innerHTML = '';
    
    updateProgress();
    
    const wisdom = document.getElementById('kintsugi-wisdom');
    if (wisdom) {
      wisdom.textContent = '';
      wisdom.classList.remove('visible');
    }
    
    document.querySelector('.kintsugi-frame')?.classList.remove('complete');
    
    // Re-attach events
    attachEvents(document.getElementById('kintsugi-container'));
  }

  window.KintsugiGame = { init };
})();
