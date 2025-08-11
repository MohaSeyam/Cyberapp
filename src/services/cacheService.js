/**
 * Cache Service for data caching and optimization
 * Provides in-memory caching, optimistic updates, and batch operations
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.pendingUpdates = new Map();
    this.batchQueue = [];
    this.batchTimeout = null;
    this.maxCacheSize = 100; // Maximum number of cached items
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes default expiry
  }

  /**
   * Set a value in cache with optional expiry
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} expiry - Expiry time in milliseconds
   */
  set(key, value, expiry = this.cacheExpiry) {
    // Clean up expired items first
    this.cleanup();
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      expiry: expiry
    });
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Remove a specific key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clean up expired items
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      pendingUpdates: this.pendingUpdates.size,
      batchQueueSize: this.batchQueue.length
    };
  }

  /**
   * Optimistic update - update cache immediately, queue actual update
   * @param {string} key - Cache key
   * @param {Function} updateFn - Function to update the value
   * @param {Function} actualUpdateFn - Function to perform actual update
   */
  optimisticUpdate(key, updateFn, actualUpdateFn) {
    const currentValue = this.get(key);
    if (currentValue === undefined) return;

    // Apply optimistic update immediately
    const optimisticValue = updateFn(currentValue);
    this.set(key, optimisticValue, 0); // No expiry for optimistic updates

    // Queue actual update
    this.pendingUpdates.set(key, {
      updateFn: actualUpdateFn,
      originalValue: currentValue,
      timestamp: Date.now()
    });

    // Process pending updates after a short delay
    setTimeout(() => this.processPendingUpdates(), 100);
  }

  /**
   * Process pending updates
   */
  async processPendingUpdates() {
    for (const [key, update] of this.pendingUpdates.entries()) {
      try {
        await update.updateFn();
        this.pendingUpdates.delete(key);
      } catch (error) {
        console.error(`Failed to process update for key ${key}:`, error);
        // Revert optimistic update on failure
        this.set(key, update.originalValue);
        this.pendingUpdates.delete(key);
      }
    }
  }

  /**
   * Batch multiple operations
   * @param {Function} operation - Operation to batch
   * @param {number} delay - Delay before executing batch
   */
  batch(operation, delay = 50) {
    this.batchQueue.push(operation);
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.executeBatch();
    }, delay);
  }

  /**
   * Execute batched operations
   */
  executeBatch() {
    if (this.batchQueue.length === 0) return;
    
    const operations = [...this.batchQueue];
    this.batchQueue = [];
    
    // Execute all operations
    operations.forEach(operation => {
      try {
        operation();
      } catch (error) {
        console.error('Batch operation failed:', error);
      }
    });
  }

  /**
   * Prefetch data for better perceived performance
   * @param {Array} keys - Array of keys to prefetch
   * @param {Function} fetchFn - Function to fetch data
   */
  async prefetch(keys, fetchFn) {
    const prefetchPromises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const data = await fetchFn(key);
          this.set(key, data);
        } catch (error) {
          console.warn(`Failed to prefetch key ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Invalidate cache by pattern
   * @param {string} pattern - Pattern to match keys (supports wildcards)
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;