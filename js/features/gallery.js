/**
 * Gallery - Image grid with lazy loading for Naroa 2026
 * @module features/gallery
 * @version 2.0.0 - IA Alliance Protocol Integration
 */

(function() {
  'use strict';

  // ===========================================
  // DYNAMIC ARTWORK DATA LOADING
  // ===========================================
  
  let ARTWORKS = [];
  let TAXONOMY = null;
  
  // Series-based categories from NotebookLM taxonomy
  const SERIES_LABELS = {
    'todos': 'Todas 🎨',
    'rocks': 'Rocks 🤟',
    'tributos-musicales': 'Tributos 🎤',
    'espejos-del-alma': 'Espejos 🪞',
    'enlatas': 'En.lata.das 🥫',
    'walking-gallery': 'Walking Gallery 🚶',
    'facefood': 'Facefood 👨‍🍳',
    'bodas': 'Bodas 💒',
    'golden': 'Golden ✨',
    'amor': 'Amor 💕',
    'retratos': 'Retratos 👤',
    'naturaleza': 'Naturaleza 🦜'
  };
  
  const CATEGORIES = Object.keys(SERIES_LABELS);

  /**
   * Load artwork metadata from JSON
   */
  async function loadArtworkData() {
    try {
      const [metadataRes, taxonomyRes] = await Promise.all([
        fetch('./data/artworks-metadata.json'),
        fetch('./data/artworks-taxonomy.json')
      ]);
      
      if (metadataRes.ok) {
        const data = await metadataRes.json();
        ARTWORKS = data.artworks.map((art, index) => ({
          id: index + 1,
          title: art.title,
          file: `${art.id}.webp`,
          category: art.series,
          technique: art.technique,
          year: art.year
        }));
        console.log(`[Gallery] Loaded ${ARTWORKS.length} artworks from metadata`);
      }
      
      if (taxonomyRes.ok) {
        TAXONOMY = await taxonomyRes.json();
        console.log(`[Gallery] Loaded taxonomy with ${Object.keys(TAXONOMY.series).length} series`);
      }
      
      return true;
    } catch (err) {
      console.warn('[Gallery] Using fallback data:', err);
      return false;
    }
  }

  // Fallback data if JSON fails to load
  const FALLBACK_ARTWORKS = [
    { id: 1, title: 'Amy Rocks', file: 'amy-rocks.webp', category: 'divinos' },
    { id: 2, title: 'James Dean', file: 'james-dean.webp', category: 'iconos' },
    { id: 3, title: 'Johnny Depp', file: 'johnny-depp.webp', category: 'iconos' },
    { id: 4, title: 'Marilyn Monroe', file: 'marilyn-monroe.webp', category: 'iconos' },
    { id: 5, title: 'Audrey Hepburn', file: 'audrey-hepburn.webp', category: 'iconos' },
    { id: 6, title: 'Mr. Fahrenheit', file: 'mr-fahrenheit.webp', category: 'iconos' },
    { id: 7, title: 'Espejos del Alma', file: 'espejos-del-alma.webp', category: 'espejos' },
    { id: 8, title: 'La Llorona', file: 'la-llorona.webp', category: 'mitologia' },
    { id: 9, title: 'Amor en Conserva', file: 'amor-en-conserva.webp', category: 'enlatas' },
    { id: 10, title: 'The Golden Couple', file: 'the-golden-couple.webp', category: 'golden' }
  ];

  // ===========================================
  // LAZY LOADING
  // ===========================================

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
        }
        lazyObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px'
  });

  // ===========================================
  // RENDER FUNCTIONS
  // ===========================================

  function renderGalleryItem(artwork) {
    const item = document.createElement('div');
    item.className = 'gallery__item';
    item.dataset.category = artwork.category;
    item.dataset.id = artwork.id;

    item.innerHTML = `
      <img 
        data-src="images/artworks/${artwork.file}" 
        alt="${artwork.title}"
        loading="lazy"
      >
      <span class="gallery__caption">${artwork.title}</span>
    `;

    // Setup lazy loading
    const img = item.querySelector('img');
    lazyObserver.observe(img);

    // Click handler for lightbox
    item.addEventListener('click', () => {
      if (window.Lightbox) {
        window.Lightbox.open(artwork, ARTWORKS);
      }
    });

    return item;
  }

  function renderFilters(container) {
    container.innerHTML = '';
    
    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'gallery__filter';
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.dataset.category = cat;
      
      if (cat === 'todos') {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => filterGallery(cat));
      container.appendChild(btn);
    });
  }

  function filterGallery(category) {
    // Update active filter button
    document.querySelectorAll('.gallery__filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Filter items
    document.querySelectorAll('.gallery__item').forEach(item => {
      if (category === 'todos' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // ===========================================
  // FEATURED ARTWORKS (Curated selection)
  // ===========================================
  
  // IDs of the 15 most impactful pieces for "Obra Destacada"
  const FEATURED_IDS = [1, 2, 4, 5, 7, 11, 12, 15, 21, 25, 31, 32, 36, 42, 44];

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.Gallery = {
    loadFeatured() {
      const container = document.getElementById('featured-gallery');
      if (!container) return;

      container.innerHTML = '';
      
      // Show curated featured items (15 masterpieces)
      const featured = ARTWORKS.filter(a => FEATURED_IDS.includes(a.id));
      featured.forEach(artwork => {
        container.appendChild(renderGalleryItem(artwork));
      });
    },

    loadArchive() {
      const container = document.getElementById('archivo-grid');
      const filtersContainer = document.getElementById('gallery-filters');
      
      if (!container) return;

      // Render filters
      if (filtersContainer) {
        renderFilters(filtersContainer);
      }

      // Render all artworks
      container.innerHTML = '';
      ARTWORKS.forEach(artwork => {
        container.appendChild(renderGalleryItem(artwork));
      });
    },

    // Legacy aliases for compatibility
    loadPortfolio() { this.loadFeatured(); },
    loadGallery() { this.loadArchive(); },

    // Allow external data injection
    setArtworks(artworks) {
      ARTWORKS.length = 0;
      ARTWORKS.push(...artworks);
    },

    // Async initialization - loads data from JSON
    async init() {
      const loaded = await loadArtworkData();
      if (!loaded || ARTWORKS.length === 0) {
        console.log('[Gallery] Using fallback artworks');
        ARTWORKS = FALLBACK_ARTWORKS.slice();
      }
      console.log(`[Gallery] Initialized with ${ARTWORKS.length} artworks`);
    },

    // Get series labels for UI
    getSeriesLabels() {
      return SERIES_LABELS;
    }
  };

})();

