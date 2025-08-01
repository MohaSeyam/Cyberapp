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

// Plan operations
export const planService = {
  async getAll(): Promise<Week[]> {
    try {
      return await db.plan.toArray();
    } catch (error) {
      console.error("Error getting plan:", error);
      return [];
    }
  },

  async save(plan: Week[]): Promise<void> {
    try {
      await db.plan.clear();
      await db.plan.bulkAdd(plan);
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

// Notes operations
export const notesService = {
  async getAll(): Promise<Note[]> {
    try {
      return await db.notes.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error("Error getting notes:", error);
      return [];
    }
  },

  async getByTask(weekId: number, dayKey: string, taskId: string): Promise<Note[]> {
    try {
      return await db.notes.where({ weekId, dayKey, taskId }).toArray();
    } catch (error) {
      console.error("Error getting notes by task:", error);
      return [];
    }
  },

  async add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      return await db.notes.add({
        ...note,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
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
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.notes.delete(id);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }
};

// Journal operations
export const journalService = {
  async getAll(): Promise<JournalEntry[]> {
    try {
      return await db.journal.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  },

  async getByDay(weekId: number, dayKey: string): Promise<JournalEntry | null> {
    try {
      return await db.journal.where({ weekId, dayKey }).first();
    } catch (error) {
      console.error("Error getting journal by day:", error);
      return null;
    }
  },

  async add(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      return await db.journal.add({
        ...entry,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
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
    } catch (error) {
      console.error("Error updating journal entry:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.journal.delete(id);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      throw error;
    }
  }
};

// Resources operations
export const resourcesService = {
  async getAll(): Promise<Resource[]> {
    try {
      return await db.resources.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
      console.error("Error getting resources:", error);
      return [];
    }
  },

  async getByDay(weekId: number, dayIndex: number): Promise<Resource[]> {
    try {
      return await db.resources.where({ weekId, dayIndex }).toArray();
    } catch (error) {
      console.error("Error getting resources by day:", error);
      return [];
    }
  },

  async add(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      return await db.resources.add({
        ...resource,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error adding resource:", error);
      throw error;
    }
  },

  async update(id: number, updates: Partial<Resource>): Promise<void> {
    try {
      console.log("Attempting to update resource with ID:", id);
      console.log("Updates:", updates);
      
      // Check if resource exists
      const existingResource = await db.resources.get(id);
      if (!existingResource) {
        throw new Error(`Resource with ID ${id} not found`);
      }
      
      console.log("Existing resource:", existingResource);
      
      await db.resources.update(id, {
        ...updates,
        updatedAt: Date.now()
      });
      
      console.log("Resource updated successfully");
    } catch (error) {
      console.error("Error updating resource:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await db.resources.delete(id);
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  }
};

// Progress operations
export const progressService = {
  async getAll(): Promise<Progress[]> {
    try {
      return await db.progress.toArray();
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
        await db.progress.add({ weekId, dayKey, taskId, done });
      }
    } catch (error) {
      console.error("Error setting task progress:", error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await db.progress.clear();
    } catch (error) {
      console.error("Error clearing progress:", error);
      throw error;
    }
  }
};

// Settings operations
export const settingsService = {
  async get(key: string): Promise<any> {
    try {
      const setting = await db.settings.get(key);
      return setting?.value;
    } catch (error) {
      console.error("Error getting setting:", error);
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      await db.settings.put({ key, value });
    } catch (error) {
      console.error("Error setting setting:", error);
      throw error;
    }
  }
};

// Data export/import
export const dataService = {
  async exportAll() {
    try {
      const [plan, notes, journal, resources, settings] = await Promise.all([
        planService.getAll(),
        notesService.getAll(),
        journalService.getAll(),
        resourcesService.getAll(),
        db.settings.toArray()
      ]);
      return { plan, notes, journal, resources, settings };
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  },

  async importAll(data: any) {
    try {
      await db.transaction('rw', db.plan, db.notes, db.journal, db.resources, db.settings, async () => {
        await db.plan.clear();
        await db.notes.clear();
        await db.journal.clear();
        await db.resources.clear();
        await db.settings.clear();
        
        if (data.plan) await db.plan.bulkAdd(data.plan);
        if (data.notes) await db.notes.bulkAdd(data.notes);
        if (data.journal) await db.journal.bulkAdd(data.journal);
        if (data.resources) await db.resources.bulkAdd(data.resources);
        if (data.settings) await db.settings.bulkAdd(data.settings);
      });
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  },

  async clearAll() {
    try {
      await db.transaction('rw', db.plan, db.notes, db.journal, db.resources, db.settings, db.progress, async () => {
        await db.plan.clear();
        await db.notes.clear();
        await db.journal.clear();
        await db.resources.clear();
        await db.settings.clear();
        await db.progress.clear();
      });
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }
};