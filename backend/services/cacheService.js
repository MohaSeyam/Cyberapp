const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      // Create Redis client
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.log('Redis retry time exhausted');
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            console.log('Redis max retry attempts reached');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      // Handle connection events
      this.client.on('connect', () => {
        console.log('✅ Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();

    } catch (error) {
      console.error('❌ Redis initialization failed:', error);
      this.isConnected = false;
    }
  }

  // Set cache with expiration
  async set(key, value, expiration = 3600) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await this.client.setEx(key, expiration, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Get cache value
  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const value = await this.client.get(key);
      if (!value) return null;

      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache key
  async del(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Delete multiple keys
  async delMultiple(keys) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      await this.client.del(keys);
      return true;
    } catch (error) {
      console.error('Cache delete multiple error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Set cache with hash
  async hset(key, field, value, expiration = 3600) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await this.client.hSet(key, field, serializedValue);
      
      // Set expiration for the hash
      await this.client.expire(key, expiration);
      return true;
    } catch (error) {
      console.error('Cache hset error:', error);
      return false;
    }
  }

  // Get cache from hash
  async hget(key, field) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const value = await this.client.hGet(key, field);
      if (!value) return null;

      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Cache hget error:', error);
      return null;
    }
  }

  // Get all fields from hash
  async hgetall(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const hash = await this.client.hGetAll(key);
      if (!hash || Object.keys(hash).length === 0) return null;

      // Parse JSON values
      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }

      return result;
    } catch (error) {
      console.error('Cache hgetall error:', error);
      return null;
    }
  }

  // Increment counter
  async incr(key, expiration = 3600) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const result = await this.client.incr(key);
      await this.client.expire(key, expiration);
      return result;
    } catch (error) {
      console.error('Cache incr error:', error);
      return null;
    }
  }

  // Set cache with pattern matching
  async setPattern(pattern, value, expiration = 3600) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return false;

      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      const pipeline = this.client.multi();

      keys.forEach(key => {
        pipeline.setEx(key, expiration, serializedValue);
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache setPattern error:', error);
      return false;
    }
  }

  // Delete cache with pattern
  async delPattern(pattern) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return true;

      await this.client.del(keys);
      return true;
    } catch (error) {
      console.error('Cache delPattern error:', error);
      return false;
    }
  }

  // Cache middleware for Express
  cacheMiddleware(expiration = 300) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      
      try {
        const cachedData = await this.get(key);
        if (cachedData) {
          return res.json(cachedData);
        }

        // Store original send method
        const originalSend = res.json;
        
        // Override send method to cache response
        res.json = function(data) {
          this.set(key, data, expiration);
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // User-specific cache key
  getUserCacheKey(userId, type, identifier = '') {
    return `user:${userId}:${type}${identifier ? `:${identifier}` : ''}`;
  }

  // Cache user data
  async cacheUserData(userId, type, data, expiration = 1800) {
    const key = this.getUserCacheKey(userId, type);
    return await this.set(key, data, expiration);
  }

  // Get cached user data
  async getCachedUserData(userId, type) {
    const key = this.getUserCacheKey(userId, type);
    return await this.get(key);
  }

  // Invalidate user cache
  async invalidateUserCache(userId, type = null) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const pattern = type 
        ? `user:${userId}:${type}*`
        : `user:${userId}:*`;

      return await this.delPattern(pattern);
    } catch (error) {
      console.error('Invalidate user cache error:', error);
      return false;
    }
  }

  // Cache plan data
  async cachePlanData(weekId, data, expiration = 3600) {
    const key = `plan:week:${weekId}`;
    return await this.set(key, data, expiration);
  }

  // Get cached plan data
  async getCachedPlanData(weekId) {
    const key = `plan:week:${weekId}`;
    return await this.get(key);
  }

  // Cache analytics data
  async cacheAnalytics(type, data, expiration = 1800) {
    const key = `analytics:${type}`;
    return await this.set(key, data, expiration);
  }

  // Get cached analytics data
  async getCachedAnalytics(type) {
    const key = `analytics:${type}`;
    return await this.get(key);
  }

  // Flush all cache
  async flushAll() {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Flush all cache error:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const info = await this.client.info();
      const keys = await this.client.dbSize();
      
      return {
        connected: this.isConnected,
        keys,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Get cache stats error:', error);
      return null;
    }
  }

  // Close Redis connection
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
        console.log('✅ Redis connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    }
  }
}

module.exports = CacheService;