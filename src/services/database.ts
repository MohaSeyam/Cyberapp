// Centralized database service
import Dexie from "dexie";
import type { Week, Note, JournalEntry, Resource, Progress, AppSettings } from "../types";

// Database definition
export const db = new Dexie("cyberPlanDB");
db.version(3).stores({
  plan: "++id, week, phase",
  notes: "++id, weekId, dayKey, taskId, title, tags, createdAt, updatedAt",
  journal: "++id, weekId, dayKey, title, content, tags, createdAt, updatedAt",
  resources: "++id, weekId, dayIndex, title, url, type, createdAt, updatedAt",
  settings: "key, value",
  progress: "++id, weekId, dayKey, taskId, done"
});

// Cache for frequently accessed data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache management
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearCache = () => {
  cache.clear();
};

// Plan operations - OPTIMIZED with caching
export const planService = {
  async getAll(): Promise<Week[]> {
    try {
      const cached = getCachedData('plan');
      if (cached) return cached;

      const data = await db.plan.toArray();
      setCachedData('plan', data);
      return data;
    } catch (error) {
      console.error("Error getting plan:", error);
      return [];
    }
  },

  async save(plan: Week[]): Promise<void> {
    try {
      await db.plan.clear();
      await db.plan.bulkAdd(plan);
      setCachedData('plan', plan); // Update cache
    } catch (error) {
      console.error("Error saving plan:", error);
      throw error;
    }
  },

  async importFromFile(): Promise<Week[]> {
    try {
      // Try to import from the data directory first
      const planData = await import('../data/PlanData.json');
      if (!Array.isArray(planData.default)) {
        throw new Error("Invalid plan data format");
      }
      
      // Save to IndexedDB
      await this.save(planData.default);
      console.log("Successfully imported plan data:", planData.default.length, "weeks");
      return planData.default;
    } catch (error) {
      console.error("Error importing plan from data directory:", error);
      
      // Fallback to fetch from public directory
      try {
        const response = await fetch("/PlanData.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch plan data: ${response.status}`);
        }
        const planData = await response.json();
        if (!Array.isArray(planData)) {
          throw new Error("Invalid plan data format");
        }
        await this.save(planData);
        console.log("Successfully imported plan data via fetch:", planData.length, "weeks");
        return planData;
      } catch (fetchError) {
        console.error("Error importing plan via fetch:", fetchError);
        throw fetchError;
      }
    }
  }
};

// Notes operations - OPTIMIZED with caching
export const notesService = {
  async getAll(): Promise<Note[]> {
    try {
      const cached = getCachedData('notes');
      if (cached) return cached;

      const data = await db.notes.orderBy('updatedAt').reverse().toArray();
      setCachedData('notes', data);
      return data;
    } catch (error) {
      console.error("Error getting notes:", error);
      return [];
    }
  },

  async getByTask(weekId: number, dayKey: string, taskId: string): Promise<Note[]> {
    try {
      const cacheKey = `notes_${weekId}_${dayKey}_${taskId}`;
      const cached = getCachedData(cacheKey);
      if (cached) return cached;

      const data = await db.notes.where({ weekId, dayKey, taskId }).toArray();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error getting notes by task:", error);
      return [];
    }
  },

  async add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const id = await db.notes.add({
        ...note,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      clearCache(); // Clear cache when data changes
      return id;
    } catch (error) {
      console.error("Error adding note:", error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Note>): Promise<void> {
    try {
      await db.notes.update(id, {
        ...updates,
        updatedAt: Date.now()
      });
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.notes.delete(id);
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }
};

// Journal operations - OPTIMIZED with caching
export const journalService = {
  async getAll(): Promise<JournalEntry[]> {
    try {
      const cached = getCachedData('journal');
      if (cached) return cached;

      const data = await db.journal.orderBy('updatedAt').reverse().toArray();
      setCachedData('journal', data);
      return data;
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  },

  async getByDay(weekId: number, dayKey: string): Promise<JournalEntry | null> {
    try {
      const cacheKey = `journal_${weekId}_${dayKey}`;
      const cached = getCachedData(cacheKey);
      if (cached) return cached;

      const data = await db.journal.where({ weekId, dayKey }).first();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error getting journal by day:", error);
      return null;
    }
  },

  async add(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const id = await db.journal.add({
        ...entry,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      clearCache(); // Clear cache when data changes
      return id;
    } catch (error) {
      console.error("Error adding journal entry:", error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<JournalEntry>): Promise<void> {
    try {
      await db.journal.update(id, {
        ...updates,
        updatedAt: Date.now()
      });
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.journal.delete(id);
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      throw error;
    }
  }
};

// Resources operations - OPTIMIZED with caching
export const resourcesService = {
  async getAll(): Promise<Resource[]> {
    try {
      const cached = getCachedData('resources');
      if (cached) return cached;

      const data = await db.resources.orderBy('createdAt').reverse().toArray();
      setCachedData('resources', data);
      return data;
    } catch (error) {
      console.error("Error getting resources:", error);
      return [];
    }
  },

  async getByDay(weekId: number, dayIndex: number): Promise<Resource[]> {
    try {
      const cacheKey = `resources_${weekId}_${dayIndex}`;
      const cached = getCachedData(cacheKey);
      if (cached) return cached;

      const data = await db.resources.where({ weekId, dayIndex }).toArray();
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error getting resources by day:", error);
      return [];
    }
  },

  async add(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const id = await db.resources.add({
        ...resource,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      clearCache(); // Clear cache when data changes
      return id;
    } catch (error) {
      console.error("Error adding resource:", error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Resource>): Promise<void> {
    try {
      await db.resources.update(id, {
        ...updates,
        updatedAt: Date.now()
      });
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error updating resource:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.resources.delete(id);
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  }
};

// Progress operations - OPTIMIZED with caching
export const progressService = {
  async getAll(): Promise<Progress[]> {
    try {
      const cached = getCachedData('progress');
      if (cached) return cached;

      const data = await db.progress.toArray();
      setCachedData('progress', data);
      return data;
    } catch (error) {
      console.error("Error getting progress:", error);
      return [];
    }
  },

  async setTaskProgress(weekId: number, dayKey: string, taskId: string, done: boolean): Promise<void> {
    try {
      const existing = await db.progress.where({ weekId, dayKey, taskId }).first();
      
      if (existing) {
        await db.progress.update(existing.id, { done });
      } else {
        await db.progress.add({
          weekId,
          dayKey,
          taskId,
          done,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error setting task progress:", error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await db.progress.clear();
      clearCache(); // Clear cache when data changes
    } catch (error) {
      console.error("Error clearing progress:", error);
      throw error;
    }
  }
};

// Settings operations - OPTIMIZED with caching
export const settingsService = {
  async get(key: string): Promise<any> {
    try {
      const cached = getCachedData(`settings_${key}`);
      if (cached) return cached;

      const setting = await db.settings.where('key').equals(key).first();
      const value = setting ? setting.value : null;
      setCachedData(`settings_${key}`, value);
      return value;
    } catch (error) {
      console.error("Error getting setting:", error);
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      await db.settings.put({ key, value });
      setCachedData(`settings_${key}`, value); // Update cache
    } catch (error) {
      console.error("Error setting setting:", error);
      throw error;
    }
  },

  async exportAll() {
    try {
      const [plan, notes, journal, resources, progress, settings] = await Promise.all([
        this.getAll(),
        notesService.getAll(),
        journalService.getAll(),
        resourcesService.getAll(),
        progressService.getAll(),
        db.settings.toArray()
      ]);

      return {
        plan,
        notes,
        journal,
        resources,
        progress,
        settings: settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {}),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  },

  async importAll(data: any) {
    try {
      await db.transaction('rw', [db.plan, db.notes, db.journal, db.resources, db.progress, db.settings], async () => {
        // Clear existing data
        await Promise.all([
          db.plan.clear(),
          db.notes.clear(),
          db.journal.clear(),
          db.resources.clear(),
          db.progress.clear(),
          db.settings.clear()
        ]);

        // Import new data
        if (data.plan) await db.plan.bulkAdd(data.plan);
        if (data.notes) await db.notes.bulkAdd(data.notes);
        if (data.journal) await db.journal.bulkAdd(data.journal);
        if (data.resources) await db.resources.bulkAdd(data.resources);
        if (data.progress) await db.progress.bulkAdd(data.progress);
        if (data.settings) {
          const settingsArray = Object.entries(data.settings).map(([key, value]) => ({ key, value }));
          await db.settings.bulkAdd(settingsArray);
        }
      });

      clearCache(); // Clear all cache after import
      console.log("Data imported successfully");
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  },

  async clearAll() {
    try {
      await Promise.all([
        db.plan.clear(),
        db.notes.clear(),
        db.journal.clear(),
        db.resources.clear(),
        db.progress.clear(),
        db.settings.clear()
      ]);
      clearCache(); // Clear all cache
      console.log("All data cleared successfully");
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }
};