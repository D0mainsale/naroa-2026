/**
 * 🎨 Artworks API
 * 
 * RESTful API endpoints for artwork management with:
 *   - Cursor-based pagination
 *   - Smart caching strategies
 *   - Cache invalidation on mutations
 * 
 * @version 1.0.0
 */

import api from './client.js';

/**
 * Artworks API endpoints
 */
export const artworksApi = {
  /**
   * List artworks with cursor pagination
   * 
   * @param {Object} params - Query parameters
   * @param {string} params.cursor - Pagination cursor
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.series - Filter by series slug
   * @param {string} params.category - Filter by category
   * @param {string} params.technique - Filter by technique
   * @param {number} params.year - Filter by year
   * @param {boolean} params.featured - Filter featured artworks
   * @param {string} params.sort - Sort field (year, title, created)
   * @param {string} params.order - Sort order (asc, desc)
   * 
   * @returns {Promise<{items: Array, nextCursor: string|null, hasMore: boolean}>}
   * 
   * @example
   * const { items, hasMore } = await artworksApi.list({ series: 'cantinflas', limit: 10 });
   */
  async list(params = {}) {
    const { cursor, limit = 20, ...filters } = params;
    
    const queryParams = {
      limit,
      ...(cursor && { cursor }),
      ...filters
    };

    // Generate cache key based on filters
    const cacheKey = `artworks:list:${JSON.stringify(queryParams)}`;
    
    const response = await api.get('/api/artworks', {
      params: queryParams
    }, {
      cacheKey,
      cacheTtl: 60 * 1000 // 1 minute for lists (frequently change)
    });

    return response.data;
  },

  /**
   * Get single artwork by ID
   * 
   * @param {string} id - Artwork ID (e.g., 'cantinflas-1')
   * @returns {Promise<Object>} Artwork data
   * 
   * @example
   * const artwork = await artworksApi.getById('cantinflas-1');
   */
  async getById(id) {
    const cacheKey = `artworks:${id}`;
    const response = await api.get(`/api/artworks/${id}`, {}, {
      cacheKey,
      cacheTtl: 5 * 60 * 1000 // 5 minutes for single items
    });
    return response.data;
  },

  /**
   * Create new artwork (admin only)
   * 
   * @param {Object} data - Artwork data
   * @param {string} data.title - Artwork title
   * @param {string} data.series - Series name
   * @param {string} data.technique - Technique used
   * @param {number} data.year - Year created
   * @param {string} data.image - Image path/URL
   * 
   * @returns {Promise<Object>} Created artwork
   */
  async create(data) {
    const response = await api.post('/api/artworks', data, {}, { dedupe: false });
    
    // Invalidate list caches on mutation
    api.invalidateCachePattern(/^artworks:list:/);
    
    return response.data;
  },

  /**
   * Update artwork (admin only)
   * 
   * @param {string} id - Artwork ID
   * @param {Object} data - Partial artwork data
   * @returns {Promise<Object>} Updated artwork
   */
  async update(id, data) {
    const response = await api.put(`/api/artworks/${id}`, data, {}, { dedupe: false });
    
    // Invalidate specific item and list caches
    api.invalidateCache(`artworks:${id}`);
    api.invalidateCachePattern(/^artworks:list:/);
    
    return response.data;
  },

  /**
   * Delete artwork (admin only)
   * 
   * @param {string} id - Artwork ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await api.delete(`/api/artworks/${id}`, {}, { dedupe: false });
    
    // Invalidate caches
    api.invalidateCache(`artworks:${id}`);
    api.invalidateCachePattern(/^artworks:list:/);
  },

  /**
   * Get related artworks
   * 
   * @param {string} id - Artwork ID
   * @param {Object} options
   * @param {number} options.limit - Max related items (default: 6)
   * @returns {Promise<Array>} Related artworks
   */
  async getRelated(id, options = {}) {
    const { limit = 6 } = options;
    const cacheKey = `artworks:${id}:related`;
    
    const response = await api.get(`/api/artworks/${id}/related`, {
      params: { limit }
    }, {
      cacheKey,
      cacheTtl: 10 * 60 * 1000 // 10 minutes (rarely change)
    });
    
    return response.data;
  },

  /**
   * Search artworks
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Results per page
   * @param {string} options.cursor - Pagination cursor
   * @returns {Promise<{items: Array, nextCursor: string|null, hasMore: boolean}>}
   */
  async search(query, options = {}) {
    const { limit = 20, cursor } = options;
    
    const response = await api.get('/api/artworks/search', {
      params: { q: query, limit, cursor }
    }, {
      cacheKey: `artworks:search:${query}:${cursor || ''}`,
      cacheTtl: 30 * 1000 // 30 seconds for search (frequently change)
    });
    
    return response.data;
  },

  /**
   * Get all series
   * @returns {Promise<Array>} List of series with metadata
   */
  async getSeries() {
    const response = await api.get('/api/series', {}, {
      cacheKey: 'artworks:series',
      cacheTtl: 10 * 60 * 1000 // 10 minutes
    });
    return response.data;
  },

  /**
   * Get artworks by series
   * @param {string} seriesSlug - Series slug
   * @param {Object} options
   * @returns {Promise<Array>} Artworks in series
   */
  async getBySeries(seriesSlug, options = {}) {
    return this.list({ series: seriesSlug, ...options });
  },

  /**
   * Toggle like on artwork
   * @param {string} id - Artwork ID
   * @returns {Promise<{liked: boolean, likes: number}>}
   */
  async toggleLike(id) {
    const response = await api.post(`/api/artworks/${id}/like`, {}, {}, { dedupe: false });
    
    // Invalidate artwork cache to reflect new like count
    api.invalidateCache(`artworks:${id}`);
    
    return response.data;
  }
};

export default artworksApi;
