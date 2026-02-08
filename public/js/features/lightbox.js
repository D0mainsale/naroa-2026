/**
 * Lightbox Premium — Fullscreen image viewer for Naroa 2026
 * Features: zoom/pan, info panel, counter, transitions, swipe, preload
 * @module features/lightbox
 */

(function() {
  'use strict';

  let currentIndex = 0;
  let artworks = [];
  let isOpen = false;
  let taxonomy = null;

  // Zoom/Pan state
  const zoom = {
    scale: 1,
    minScale: 1,
    maxScale: 4,
    panning: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0
  };

  // Touch state
  const touch = {
    startX: 0,
    startY: 0,
    startTime: 0,
    lastPinchDist: 0
  };

  const elements = {
    lightbox: null,
    img: null,
    caption: null,
    closeBtn: null,
    prevBtn: null,
    nextBtn: null,
    counter: null,
    infoPanel: null,
    zoomIndicator: null
  };

  // Preload cache
  const preloadCache = new Map();

  // ===========================================
  // TAXONOMY LOADER
  // ===========================================

  async function loadTaxonomy() {
    if (taxonomy) return taxonomy;
    try {
      const res = await fetch('data/artworks-taxonomy.json');
      taxonomy = await res.json();
      return taxonomy;
    } catch (e) {
      console.warn('[Lightbox] Could not load taxonomy:', e);
      return null;
    }
  }

  function getSeriesInfo(seriesId) {
    if (!taxonomy || !taxonomy.series || !taxonomy.series[seriesId]) return null;
    return taxonomy.series[seriesId];
  }

  // ===========================================
  // IMAGE TRANSITIONS
  // ===========================================

  function showImage(index, direction = 0) {
    if (index < 0) index = artworks.length - 1;
    if (index >= artworks.length) index = 0;

    currentIndex = index;
    const artwork = artworks[currentIndex];
    if (!artwork) return;

    // Reset zoom
    resetZoom();

    // Animate transition
    if (elements.img && direction !== 0) {
      elements.img.style.transition = 'opacity 0.25s ease, transform 0.3s ease';
      elements.img.style.opacity = '0';
      elements.img.style.transform = direction > 0
        ? 'translateX(-40px) scale(0.96)'
        : 'translateX(40px) scale(0.96)';

      setTimeout(() => {
        setImageSrc(artwork);
        elements.img.style.transform = direction > 0
          ? 'translateX(40px) scale(0.96)'
          : 'translateX(-40px) scale(0.96)';

        requestAnimationFrame(() => {
          elements.img.style.opacity = '1';
          elements.img.style.transform = 'translateX(0) scale(1)';
        });
      }, 200);
    } else {
      setImageSrc(artwork);
    }

    // Update UI
    updateCounter();
    updateInfoPanel(artwork);

    // Preload neighbors
    preloadNeighbors();
  }

  function setImageSrc(artwork) {
    if (!elements.img) return;
    const file = artwork.file || `${artwork.id}.webp`;
    elements.img.src = `images/artworks/${file}`;
    elements.img.alt = artwork.title || '';
  }

  function preloadNeighbors() {
    [-1, 1, 2].forEach(offset => {
      const idx = (currentIndex + offset + artworks.length) % artworks.length;
      const art = artworks[idx];
      if (!art) return;
      const file = art.file || `${art.id}.webp`;
      const key = `images/artworks/${file}`;
      if (!preloadCache.has(key)) {
        const img = new Image();
        img.src = key;
        preloadCache.set(key, img);
      }
    });
  }

  // ===========================================
  // COUNTER
  // ===========================================

  function updateCounter() {
    if (!elements.counter) return;
    elements.counter.textContent = `${currentIndex + 1} / ${artworks.length}`;
    elements.counter.style.animation = 'none';
    elements.counter.offsetHeight; // reflow
    elements.counter.style.animation = 'lightbox-counter-pop 0.3s ease';
  }

  // ===========================================
  // INFO PANEL
  // ===========================================

  function updateInfoPanel(artwork) {
    if (!elements.infoPanel) return;

    const seriesInfo = getSeriesInfo(artwork.series);
    const seriesColor = seriesInfo ? seriesInfo.color : 'var(--gold-metallic, #d4af37)';
    const seriesName = seriesInfo ? seriesInfo.displayNameEs : artwork.series || '';
    const technique = artwork.technique || (seriesInfo ? seriesInfo.technique : '');

    elements.infoPanel.innerHTML = `
      <h3 class="lightbox__title">${artwork.title || 'Sin título'}</h3>
      <div class="lightbox__meta">
        ${seriesName ? `<span class="lightbox__series" style="--series-color: ${seriesColor}">${seriesInfo?.emoji || '🎨'} ${seriesName}</span>` : ''}
        ${technique ? `<span class="lightbox__technique">${technique}</span>` : ''}
        ${artwork.year ? `<span class="lightbox__year">${artwork.year}</span>` : ''}
      </div>
    `;
    elements.infoPanel.style.setProperty('--series-color', seriesColor);
  }

  // ===========================================
  // ZOOM / PAN
  // ===========================================

  function resetZoom() {
    zoom.scale = 1;
    zoom.offsetX = 0;
    zoom.offsetY = 0;
    zoom.lastOffsetX = 0;
    zoom.lastOffsetY = 0;
    zoom.panning = false;
    applyZoomTransform();
    updateZoomIndicator();
    if (elements.img) elements.img.style.cursor = 'default';
  }

  function setZoom(newScale, cx, cy) {
    const prev = zoom.scale;
    zoom.scale = Math.max(zoom.minScale, Math.min(zoom.maxScale, newScale));

    if (zoom.scale === 1) {
      zoom.offsetX = 0;
      zoom.offsetY = 0;
    } else if (cx !== undefined && cy !== undefined) {
      // Zoom toward cursor position
      const ratio = zoom.scale / prev;
      zoom.offsetX = cx - (cx - zoom.offsetX) * ratio;
      zoom.offsetY = cy - (cy - zoom.offsetY) * ratio;
    }

    zoom.lastOffsetX = zoom.offsetX;
    zoom.lastOffsetY = zoom.offsetY;
    applyZoomTransform();
    updateZoomIndicator();
    if (elements.img) {
      elements.img.style.cursor = zoom.scale > 1 ? 'grab' : 'default';
    }
  }

  function applyZoomTransform() {
    if (!elements.img) return;
    elements.img.style.transform = `translate(${zoom.offsetX}px, ${zoom.offsetY}px) scale(${zoom.scale})`;
    elements.img.style.transition = zoom.panning ? 'none' : 'transform 0.3s ease';
  }

  function updateZoomIndicator() {
    if (!elements.zoomIndicator) return;
    if (zoom.scale > 1) {
      elements.zoomIndicator.textContent = `${Math.round(zoom.scale * 100)}%`;
      elements.zoomIndicator.style.opacity = '1';
    } else {
      elements.zoomIndicator.style.opacity = '0';
    }
  }

  // ===========================================
  // NAVIGATION
  // ===========================================

  function next() { showImage(currentIndex + 1, 1); }
  function prev() { showImage(currentIndex - 1, -1); }

  function close() {
    if (elements.lightbox) {
      elements.lightbox.classList.add('lightbox--closing');
      setTimeout(() => {
        elements.lightbox.hidden = true;
        elements.lightbox.classList.remove('lightbox--closing');
        isOpen = false;
        document.body.style.overflow = '';
        resetZoom();
      }, 250);
    }
  }

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  function handleKeydown(e) {
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowRight': next(); break;
      case 'ArrowLeft': prev(); break;
      case 'Escape': close(); break;
      case '+': case '=': setZoom(zoom.scale + 0.5); break;
      case '-': setZoom(zoom.scale - 0.5); break;
      case '0': resetZoom(); break;
      case 'i':
        if (elements.infoPanel) {
          elements.infoPanel.classList.toggle('lightbox__info--hidden');
        }
        break;
    }
  }

  function handleDoubleClick(e) {
    if (!isOpen) return;
    e.preventDefault();
    if (zoom.scale > 1) {
      resetZoom();
    } else {
      const rect = elements.img.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      setZoom(2.5, cx, cy);
    }
  }

  function handleWheel(e) {
    if (!isOpen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    const rect = elements.img.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    setZoom(zoom.scale + delta, cx, cy);
  }

  // Mouse pan
  function handleMouseDown(e) {
    if (!isOpen || zoom.scale <= 1) return;
    zoom.panning = true;
    zoom.startX = e.clientX - zoom.offsetX;
    zoom.startY = e.clientY - zoom.offsetY;
    elements.img.style.cursor = 'grabbing';
  }

  function handleMouseMove(e) {
    if (!zoom.panning) return;
    zoom.offsetX = e.clientX - zoom.startX;
    zoom.offsetY = e.clientY - zoom.startY;
    applyZoomTransform();
  }

  function handleMouseUp() {
    zoom.panning = false;
    zoom.lastOffsetX = zoom.offsetX;
    zoom.lastOffsetY = zoom.offsetY;
    if (elements.img && zoom.scale > 1) {
      elements.img.style.cursor = 'grab';
    }
  }

  // Touch gestures
  function handleTouchStart(e) {
    if (!isOpen) return;
    if (e.touches.length === 1 && zoom.scale <= 1) {
      touch.startX = e.touches[0].clientX;
      touch.startY = e.touches[0].clientY;
      touch.startTime = Date.now();
    } else if (e.touches.length === 2) {
      touch.lastPinchDist = getPinchDist(e.touches);
    }
    if (zoom.scale > 1 && e.touches.length === 1) {
      zoom.panning = true;
      zoom.startX = e.touches[0].clientX - zoom.offsetX;
      zoom.startY = e.touches[0].clientY - zoom.offsetY;
    }
  }

  function handleTouchMove(e) {
    if (!isOpen) return;
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch zoom
      const dist = getPinchDist(e.touches);
      const delta = (dist - touch.lastPinchDist) * 0.01;
      touch.lastPinchDist = dist;
      setZoom(zoom.scale + delta);
    } else if (zoom.panning && e.touches.length === 1) {
      zoom.offsetX = e.touches[0].clientX - zoom.startX;
      zoom.offsetY = e.touches[0].clientY - zoom.startY;
      applyZoomTransform();
    }
  }

  function handleTouchEnd(e) {
    if (!isOpen) return;

    if (zoom.scale <= 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touch.startX;
      const dy = e.changedTouches[0].clientY - touch.startY;
      const dt = Date.now() - touch.startTime;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (dt < 400 && absDx > 60 && absDx > absDy * 1.5) {
        // Horizontal swipe → navigate
        dx > 0 ? prev() : next();
      } else if (dt < 400 && absDy > 80 && absDy > absDx * 1.5 && dy > 0) {
        // Swipe down → close
        close();
      }
    }

    zoom.panning = false;
    zoom.lastOffsetX = zoom.offsetX;
    zoom.lastOffsetY = zoom.offsetY;
  }

  function getPinchDist(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  function handleClick(e) {
    // Close on background click (not on img, buttons, or info)
    if (e.target === elements.lightbox || e.target.classList.contains('lightbox__backdrop')) {
      close();
    }
  }

  // ===========================================
  // DOM CREATION
  // ===========================================

  function createLightboxDOM() {
    const existing = document.getElementById('lightbox');
    if (existing) existing.remove();

    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.innerHTML = `
      <div class="lightbox__backdrop"></div>
      <button class="lightbox__close" aria-label="Cerrar">✕</button>
      <button class="lightbox__prev" aria-label="Anterior">‹</button>
      <button class="lightbox__next" aria-label="Siguiente">›</button>
      <div class="lightbox__stage">
        <img id="lightbox-img" class="lightbox__img" src="" alt="" draggable="false" />
      </div>
      <div class="lightbox__counter"></div>
      <div class="lightbox__zoom-indicator"></div>
      <div class="lightbox__info">
        <h3 class="lightbox__title"></h3>
        <div class="lightbox__meta"></div>
      </div>
    `;
    document.body.appendChild(lb);
    return lb;
  }

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.Lightbox = {
    async init() {
      const lb = createLightboxDOM();

      elements.lightbox = lb;
      elements.img = lb.querySelector('.lightbox__img');
      elements.caption = null;
      elements.closeBtn = lb.querySelector('.lightbox__close');
      elements.prevBtn = lb.querySelector('.lightbox__prev');
      elements.nextBtn = lb.querySelector('.lightbox__next');
      elements.counter = lb.querySelector('.lightbox__counter');
      elements.infoPanel = lb.querySelector('.lightbox__info');
      elements.zoomIndicator = lb.querySelector('.lightbox__zoom-indicator');

      // Button events
      elements.closeBtn.addEventListener('click', close);
      elements.prevBtn.addEventListener('click', prev);
      elements.nextBtn.addEventListener('click', next);
      lb.addEventListener('click', handleClick);

      // Keyboard
      document.addEventListener('keydown', handleKeydown);

      // Zoom events on image
      elements.img.addEventListener('dblclick', handleDoubleClick);
      elements.img.addEventListener('wheel', handleWheel, { passive: false });
      elements.img.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Touch events
      elements.img.addEventListener('touchstart', handleTouchStart, { passive: false });
      elements.img.addEventListener('touchmove', handleTouchMove, { passive: false });
      elements.img.addEventListener('touchend', handleTouchEnd);

      // Load taxonomy for info panel
      await loadTaxonomy();

    },

    open(artwork, allArtworks) {
      artworks = allArtworks || [artwork];
      currentIndex = artworks.findIndex(a => a.id === artwork.id);
      if (currentIndex === -1) currentIndex = 0;

      if (elements.lightbox) {
        elements.lightbox.hidden = false;
        elements.lightbox.classList.remove('lightbox--closing');
        isOpen = true;
        document.body.style.overflow = 'hidden';
        showImage(currentIndex, 0);
      }
    },

    close,
    next,
    prev
  };

})();
