/**
 * 🎨 Artwork Gallery (API-Enabled)
 * 
 * Web component using the new API layer with infinite scroll
 * @version 2.0.0
 */

import { useInfiniteArtworks, artworksApi } from '../api/index.js';

class ArtworkGalleryAPI extends HTMLElement {
  constructor() {
    super();
    this.loader = null;
    this.unsubscribe = null;
  }

  static get observedAttributes() {
    return ['series', 'category', 'featured', 'page-size'];
  }

  connectedCallback() {
    this.render();
    this.initLoader();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this.loader) {
      this.destroyLoader();
      this.initLoader();
    }
  }

  render() {
    this.innerHTML = \`
      <div class="gallery-api">
        <div class="gallery-grid" role="list"></div>
        <div class="gallery-status">
          <div class="gallery-loading" hidden>
            <span class="spinner"></span>
            <span>Cargando obras...</span>
          </div>
          <div class="gallery-error" hidden>
            <p class="error-message"></p>
            <button class="retry-btn">Reintentar</button>
          </div>
          <div class="gallery-empty" hidden><p>No se encontraron obras</p></div>
          <div class="gallery-complete" hidden><p>Has visto todas las obras</p></div>
        </div>
        <div class="scroll-sentinel"></div>
      </div>
    \`;

    this.querySelector('.retry-btn')?.addEventListener('click', () => {
      this.loader?.loadMore();
    });
  }

  initLoader() {
    this.loader = useInfiniteArtworks(this, {
      pageSize: parseInt(this.getAttribute('page-size')) || 20,
      filters: {
        series: this.getAttribute('series') || undefined,
        category: this.getAttribute('category') || undefined,
        featured: this.hasAttribute('featured') || undefined
      },
      rootMargin: '300px',
      autoStart: false
    });

    this.unsubscribe = this.loader.subscribe((state) => {
      this.updateUI(state);
    });

    this.loader.loadMore();
  }

  updateUI(state) {
    const grid = this.querySelector('.gallery-grid');
    const loadingEl = this.querySelector('.gallery-loading');
    const errorEl = this.querySelector('.gallery-error');
    const emptyEl = this.querySelector('.gallery-empty');
    const completeEl = this.querySelector('.gallery-complete');
    const sentinel = this.querySelector('.scroll-sentinel');

    if (state.items.length > 0) {
      const existingIds = new Set(
        Array.from(grid.children).map(el => el.dataset.id)
      );
      state.items.forEach((artwork) => {
        if (!existingIds.has(artwork.id)) {
          grid.appendChild(this.createArtworkCard(artwork));
        }
      });
    }

    loadingEl.hidden = !state.isLoading || state.items.length === 0;
    errorEl.hidden = !state.error;
    if (state.error) errorEl.querySelector('.error-message').textContent = state.error;
    emptyEl.hidden = state.items.length > 0 || state.isLoading || state.error;
    completeEl.hidden = state.hasMore || state.items.length === 0 || state.isLoading;
    sentinel.style.display = !state.hasMore ? 'none' : 'block';
  }

  createArtworkCard(artwork) {
    const card = document.createElement('article');
    card.className = 'artwork-card';
    card.dataset.id = artwork.id;
    const imgSrc = artwork.thumbnail || artwork.image;
    
    card.innerHTML = \`
      <a href="#/obra/\${artwork.id}" class="artwork-link">
        <div class="artwork-image-wrapper">
          <img src="\${imgSrc}" alt="\${artwork.altText || artwork.title}" loading="lazy" width="400" height="300">
          \${artwork.featured ? '<span class="featured-badge">Destacado</span>' : ''}
        </div>
        <div class="artwork-info">
          <h3 class="artwork-title">\${artwork.title}</h3>
          <p class="artwork-meta"><span>\${artwork.series}</span> • <span>\${artwork.year}</span></p>
        </div>
      </a>
    \`;

    card.querySelector('.artwork-link').addEventListener('mouseenter', () => {
      artworksApi.getById(artwork.id).catch(() => {});
    });
    
    return card;
  }

  destroyLoader() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.loader) {
      this.loader.destroy();
      this.loader = null;
    }
    this.querySelector('.gallery-grid').innerHTML = '';
  }

  disconnectedCallback() {
    this.destroyLoader();
  }
}

customElements.define('artwork-gallery-api', ArtworkGalleryAPI);
export default ArtworkGalleryAPI;
