/**
 * 🌐 Naroa API Layer
 * 
 * Centralized data fetching with caching, deduplication, and retries
 * 
 * @example
 * import { artworksApi, useInfiniteArtworks } from './api/index.js';
 * 
 * // Fetch single artwork
 * const artwork = await artworksApi.getById('cantinflas-1');
 * 
 * // Infinite scroll gallery
 * const loader = useInfiniteArtworks('#gallery', { pageSize: 20 });
 * loader.subscribe(state => updateUI(state));
 */

// Core
export { api, default as apiClient } from './client.js';
export { ApiCache } from './cache.js';
export { retryWithBackoff, calculateBackoff } from './retry.js';

// API Modules
export { artworksApi } from './artworks.js';

// Hooks/Loaders
export { 
  InfiniteArtworksLoader, 
  createInfiniteArtworksLoader, 
  useInfiniteArtworks 
} from './useInfiniteArtworks.js';

// Re-export all as default
export { default } from './client.js';
