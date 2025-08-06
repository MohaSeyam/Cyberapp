// Enhanced Database Service with Performance Optimizations
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Week, Note, JournalEntry, Resource, Progress, AppSettings } from '../types';
import planData from '../data/PlanData.json';

// Performance optimization: Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface Cache {
  [key: string]: CacheEntry<any>;
}

// Performance optimization: Connection pool
class ConnectionPool {
  private connections: IDBPDatabase<AppDatabase>[] = [];
  private maxConnections = 3;
  private currentConnections = 0;

  async getConnection(): Promise<IDBPDatabase<AppDatabase>> {
    if (this.connections.length > 0) {
      return this.connections.pop()!;
    }
    
    if (this.currentConnections < this.maxConnections) {
      this.currentConnections++;
      return openDB<AppDatabase>('cyberplan-db', 1, {
        upgrade(db) {
          // Create object stores with optimized indexes
          if (!db.objectStoreNames.contains('plan')) {
            const planStore = db.createObjectStore('plan', { keyPath: 'id' });
            planStore.createIndex('week', 'week', { unique: false });
            planStore.createIndex('phase', 'phase', { unique: false });
          }
          
          if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
            notesStore.createIndex('weekId', 'weekId', { unique: false });
            notesStore.createIndex('dayKey', 'dayKey', { unique: false });
            notesStore.createIndex('weekId-dayKey', ['weekId', 'dayKey'], { unique: false });
          }
          
          if (!db.objectStoreNames.contains('journal')) {
            const journalStore = db.createObjectStore('journal', { keyPath: 'id', autoIncrement: true });
            journalStore.createIndex('weekId', 'weekId', { unique: false });
            journalStore.createIndex('dayKey', 'dayKey', { unique: false });
            journalStore.createIndex('weekId-dayKey', ['weekId', 'dayKey'], { unique: false });
          }
          
          if (!db.objectStoreNames.contains('resources')) {
            const resourcesStore = db.createObjectStore('resources', { keyPath: 'id', autoIncrement: true });
            resourcesStore.createIndex('weekId', 'weekId', { unique: false });
            resourcesStore.createIndex('dayKey', 'dayKey', { unique: false });
            resourcesStore.createIndex('weekId-dayKey', ['weekId', 'dayKey'], { unique: false });
          }
          
          if (!db.objectStoreNames.contains('progress')) {
            const progressStore = db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
            progressStore.createIndex('weekId', 'weekId', { unique: false });
            progressStore.createIndex('taskId', 'taskId', { unique: false });
            progressStore.createIndex('weekId-taskId', ['weekId', 'taskId'], { unique: false });
          }
          
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'id' });
          }
        }
      });
    }
    
    throw new Error('Connection pool exhausted');
  }

  releaseConnection(connection: IDBPDatabase<AppDatabase>) {
    if (this.connections.length < this.maxConnections) {
      this.connections.push(connection);
    } else {
      this.currentConnections--;
    }
  }
}

// Performance optimization: Advanced cache with TTL
class AdvancedCache {
  private cache: Cache = {};
  private maxSize = 100;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (Object.keys(this.cache).length >= this.maxSize) {
      this.evictOldest();
    }

    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    };
  }

  get<T>(key: string): T | null {
    const entry = this.cache[key];
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.cache[key];
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache = {};
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      const entry = this.cache[key];
      if (now - entry.timestamp > entry.ttl) {
        delete this.cache[key];
      }
    });
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].timestamp < oldestTime) {
        oldestTime = this.cache[key].timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      delete this.cache[oldestKey];
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Performance optimization: Database interface with caching
interface AppDatabase extends DBSchema {
  plan: {
    key: number;
    value: Week;
    indexes: { 'week': number; 'phase': number };
  };
  notes: {
    key: number;
    value: Note;
    indexes: { 'weekId': number; 'dayKey': string; 'weekId-dayKey': [number, string] };
  };
  journal: {
    key: number;
    value: JournalEntry;
    indexes: { 'weekId': number; 'dayKey': string; 'weekId-dayKey': [number, string] };
  };
  resources: {
    key: number;
    value: Resource;
    indexes: { 'weekId': number; 'dayKey': string; 'weekId-dayKey': [number, string] };
  };
  progress: {
    key: number;
    value: Progress;
    indexes: { 'weekId': number; 'taskId': string; 'weekId-taskId': [number, string] };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

// Performance optimization: Singleton instances
const connectionPool = new ConnectionPool();
const cache = new AdvancedCache();

// Performance optimization: Batch operations
class BatchProcessor {
  private batchSize = 50;
  private batches: Map<string, any[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  addToBatch(storeName: string, operation: 'add' | 'put' | 'delete', data: any): void {
    if (!this.batches.has(storeName)) {
      this.batches.set(storeName, []);
    }

    this.batches.get(storeName)!.push({ operation, data });

    // Schedule batch processing
    if (!this.timers.has(storeName)) {
      this.timers.set(storeName, setTimeout(() => {
        this.processBatch(storeName);
      }, 100));
    }
  }

  private async processBatch(storeName: string): Promise<void> {
    const batch = this.batches.get(storeName) || [];
    if (batch.length === 0) return;

    const connection = await connectionPool.getConnection();
    const tx = connection.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    try {
      for (const { operation, data } of batch) {
        switch (operation) {
          case 'add':
            await store.add(data);
            break;
          case 'put':
            await store.put(data);
            break;
          case 'delete':
            await store.delete(data);
            break;
        }
      }
      await tx.done;
    } catch (error) {
      console.error('Batch operation failed:', error);
    } finally {
      connectionPool.releaseConnection(connection);
      this.batches.delete(storeName);
      this.timers.delete(storeName);
    }
  }
}

const batchProcessor = new BatchProcessor();

// Optimized service implementations
export const planService = {
  async getAll(): Promise<Week[]> {
    const cacheKey = 'plan_all';
    const cached = cache.get<Week[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('plan', 'readonly');
      const store = tx.objectStore('plan');
      const data = await store.getAll();
      connectionPool.releaseConnection(connection);

      // If we have data in the database, return it
      if (data && data.length > 0) {
        cache.set(cacheKey, data);
        return data;
      }

      // If no data in database, try to import from file
      console.log('No plan data in database, importing from file...');
      try {
        const planModule = await import('../data/PlanData.json');
        const planData = planModule.default as Week[];
        
        if (Array.isArray(planData) && planData.length > 0) {
          // Save to database for future use
          await this.save(planData);
          cache.set(cacheKey, planData);
          return planData;
        }
      } catch (importError) {
        console.error('Error importing plan data:', importError);
      }

      // Final fallback - return empty array
      console.warn('No plan data available');
      return [];
    } catch (error) {
      console.error('Error getting plan from database:', error);
      
      // Try to import from file as fallback
      try {
        const planModule = await import('../data/PlanData.json');
        const planData = planModule.default as Week[];
        
        if (Array.isArray(planData) && planData.length > 0) {
          console.log('Loaded plan from file as fallback:', planData.length, 'weeks');
          cache.set(cacheKey, planData);
          return planData;
        }
      } catch (importError) {
        console.error('Error importing plan data as fallback:', importError);
      }
      
      return [];
    }
  },

  async save(plan: Week[]): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('plan', 'readwrite');
      const store = tx.objectStore('plan');
      
      await store.clear();
      for (const item of plan) {
        await store.add(item);
      }
      
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.set('plan_all', plan);
      console.log('Plan data saved to database:', plan.length, 'weeks');
    } catch (error) {
      console.error('Error saving plan:', error);
      throw error;
    }
  }
};

export const notesService = {
  async getAll(): Promise<Note[]> {
    const cacheKey = 'notes_all';
    const cached = cache.get<Note[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const data = await store.getAll();
      connectionPool.releaseConnection(connection);

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async getByTask(weekId: number, dayKey: string, taskId: string): Promise<Note[]> {
    const cacheKey = `notes_${weekId}_${dayKey}_${taskId}`;
    const cached = cache.get<Note[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const index = store.index('weekId-dayKey');
      const data = await index.getAll([weekId, dayKey]);
      connectionPool.releaseConnection(connection);

      const filtered = data.filter(note => note.taskId === taskId);
      cache.set(cacheKey, filtered);
      return filtered;
    } catch (error) {
      console.error('Error getting notes by task:', error);
      return [];
    }
  },

  async add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      
      const newNote = {
        ...note,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await store.add(newNote);
      await tx.done;
      connectionPool.releaseConnection(connection);
      
      cache.clear(); // Clear cache when data changes
      return id as number;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Note>): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      
      const existing = await store.get(id);
      if (!existing) throw new Error('Note not found');
      
      await store.put({
        ...existing,
        ...updates,
        updatedAt: Date.now()
      });
      
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('notes', 'readwrite');
      const store = tx.objectStore('notes');
      
      await store.delete(id);
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

export const journalService = {
  async getAll(): Promise<JournalEntry[]> {
    const cacheKey = 'journal_all';
    const cached = cache.get<JournalEntry[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('journal', 'readonly');
      const store = tx.objectStore('journal');
      const data = await store.getAll();
      connectionPool.releaseConnection(connection);

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  },

  async getByDay(weekId: number, dayKey: string): Promise<JournalEntry | null> {
    const cacheKey = `journal_${weekId}_${dayKey}`;
    const cached = cache.get<JournalEntry>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('journal', 'readonly');
      const store = tx.objectStore('journal');
      const index = store.index('weekId-dayKey');
      const data = await index.get([weekId, dayKey]);
      connectionPool.releaseConnection(connection);

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting journal by day:', error);
      return null;
    }
  },

  async add(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('journal', 'readwrite');
      const store = tx.objectStore('journal');
      
      const newEntry = {
        ...entry,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await store.add(newEntry);
      await tx.done;
      connectionPool.releaseConnection(connection);
      
      cache.clear();
      return id as number;
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('journal', 'readwrite');
      const store = tx.objectStore('journal');
      
      const existing = await store.get(id);
      if (!existing) throw new Error('Journal entry not found');
      
      await store.put({
        ...existing,
        ...updates,
        updatedAt: Date.now()
      });
      
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('journal', 'readwrite');
      const store = tx.objectStore('journal');
      
      await store.delete(id);
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }
};

export const resourcesService = {
  async getAll(): Promise<Resource[]> {
    const cacheKey = 'resources_all';
    const cached = cache.get<Resource[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('resources', 'readonly');
      const store = tx.objectStore('resources');
      const data = await store.getAll();
      connectionPool.releaseConnection(connection);

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting resources:', error);
      return [];
    }
  },

  async getByDay(weekId: number, dayKey: string): Promise<Resource[]> {
    const cacheKey = `resources_${weekId}_${dayKey}`;
    const cached = cache.get<Resource[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('resources', 'readonly');
      const store = tx.objectStore('resources');
      const index = store.index('weekId-dayKey');
      const data = await index.getAll([weekId, dayKey]);
      connectionPool.releaseConnection(connection);

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting resources by day:', error);
      return [];
    }
  },

  async add(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('resources', 'readwrite');
      const store = tx.objectStore('resources');
      
      const newResource = {
        ...resource,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const id = await store.add(newResource);
      await tx.done;
      connectionPool.releaseConnection(connection);
      
      cache.clear();
      return id as number;
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Resource>): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('resources', 'readwrite');
      const store = tx.objectStore('resources');
      
      const existing = await store.get(id);
      if (!existing) throw new Error('Resource not found');
      
      await store.put({
        ...existing,
        ...updates,
        updatedAt: Date.now()
      });
      
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('resources', 'readwrite');
      const store = tx.objectStore('resources');
      
      await store.delete(id);
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
};

export const progressService = {
  async getAll(): Promise<Progress[]> {
    const cacheKey = 'progress_all';
    const cached = cache.get<Progress[]>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('progress', 'readonly');
      const store = tx.objectStore('progress');
      const data = await store.getAll();
      connectionPool.releaseConnection(connection);

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting progress:', error);
      return [];
    }
  },

  async setTaskProgress(weekId: number, dayKey: string, taskId: string, done: boolean): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('progress', 'readwrite');
      const store = tx.objectStore('progress');
      const index = store.index('weekId-taskId');
      
      const existing = await index.get([weekId, taskId]);
      
      if (existing) {
        await store.put({
          ...existing,
          done,
          updatedAt: Date.now()
        });
      } else {
        await store.add({
          weekId,
          dayKey,
          taskId,
          done,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error setting task progress:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('progress', 'readwrite');
      const store = tx.objectStore('progress');
      
      await store.clear();
      await tx.done;
      connectionPool.releaseConnection(connection);
      cache.clear();
    } catch (error) {
      console.error('Error clearing progress:', error);
      throw error;
    }
  }
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    const cacheKey = 'settings';
    const cached = cache.get<AppSettings>(cacheKey);
    if (cached) return cached;

    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const data = await store.get('settings');
      connectionPool.releaseConnection(connection);

      const settings = data || { language: 'ar', theme: 'light' };
      cache.set(cacheKey, settings);
      return settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return { language: 'ar', theme: 'light' };
    }
  },

  async set(settings: AppSettings): Promise<void> {
    try {
      const connection = await connectionPool.getConnection();
      const tx = connection.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      
      await store.put({ id: 'settings', ...settings });
      await tx.done;
      connectionPool.releaseConnection(connection);
      
      cache.set('settings', settings);
    } catch (error) {
      console.error('Error setting settings:', error);
      throw error;
    }
  }
};

// Cleanup function for performance
export const cleanupDatabase = () => {
  cache.destroy();
};

// Clear cache function
export const clearCache = () => {
  cache.clear();
};

// Initialize database with plan data
export const initializeDatabase = async () => {
  try {
    // Check if plan data exists in database
    const planData = await planService.getAll();
    
    if (!planData || planData.length === 0) {
      console.log('No plan data in database, importing from file...');
      
      // Import plan data from file
      const planModule = await import('../data/PlanData.json');
      const importedPlan = planModule.default as Week[];
      
      if (Array.isArray(importedPlan) && importedPlan.length > 0) {
        // Save to database
        await planService.save(importedPlan);
        console.log('Initialized database with plan data:', importedPlan.length, 'weeks');
        return true;
      } else {
        console.error('Invalid plan data format');
        return false;
      }
    } else {
      console.log('Database already contains plan data:', planData.length, 'weeks');
      return true;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};