/**
 * 🗄️ ApiCache - LRU Cache with TTL support
 * 
 * Enhanced cache layer for API responses with:
 *   - LRU eviction policy
 *   - TTL-based expiration
 *   - Pattern-based invalidation
 *   - Size limits
 * 
 * @version 1.0.0
 */

export class ApiCache {
  constructor(options = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100;
    this.cache = new Map();
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/missing
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU - least recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} customTtl - Optional custom TTL in ms
   */
  set(key, data, customTtl = null) {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (customTtl || this.ttl)
    });
  }

  /**
   * Delete single cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Delete cache entries matching pattern
   * @param {string|RegExp} pattern - Pattern to match
   */
  deletePattern(pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      size: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize,
      defaultTtl: this.ttl
    };
  }
}

export default ApiCache;
