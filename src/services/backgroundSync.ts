// Background sync service for data synchronization
import { db, planService, progressService, notesService, journalService } from './database';
import toast from 'react-hot-toast';

interface SyncQueueItem {
  id: string;
  type: 'progress' | 'note' | 'journal' | 'resource';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

class BackgroundSyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private maxRetries: number = 3;
  private syncIntervalMs: number = 30000; // 30 seconds

  constructor() {
    this.initializeSync();
  }

  private initializeSync() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Start periodic sync
    this.startPeriodicSync();

    // Load existing queue from localStorage
    this.loadSyncQueue();
  }

  private loadSyncQueue() {
    try {
      const savedQueue = localStorage.getItem('syncQueue');
      if (savedQueue) {
        this.syncQueue = JSON.parse(savedQueue);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, this.syncIntervalMs);
  }

  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const itemsToProcess = [...this.syncQueue];
    const successfulItems: string[] = [];
    const failedItems: SyncQueueItem[] = [];

    for (const item of itemsToProcess) {
      try {
        await this.processSyncItem(item);
        successfulItems.push(item.id);
      } catch (error) {
        console.error('Sync item failed:', item, error);
        
        if (item.retries < this.maxRetries) {
          item.retries++;
          failedItems.push(item);
        } else {
          console.error('Max retries exceeded for sync item:', item);
          // Remove from queue after max retries
        }
      }
    }

    // Remove successful items from queue
    this.syncQueue = this.syncQueue.filter(item => !successfulItems.includes(item.id));
    
    // Update failed items with incremented retry count
    failedItems.forEach(failedItem => {
      const index = this.syncQueue.findIndex(item => item.id === failedItem.id);
      if (index !== -1) {
        this.syncQueue[index] = failedItem;
      }
    });

    this.saveSyncQueue();

    if (successfulItems.length > 0) {
      console.log(`Successfully synced ${successfulItems.length} items`);
    }

    if (failedItems.length > 0) {
      console.warn(`${failedItems.length} items failed to sync`);
    }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'progress':
        await this.syncProgress(item);
        break;
      case 'note':
        await this.syncNote(item);
        break;
      case 'journal':
        await this.syncJournal(item);
        break;
      case 'resource':
        await this.syncResource(item);
        break;
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  private async syncProgress(item: SyncQueueItem): Promise<void> {
    const { weekId, dayKey, taskId, done } = item.data;
    await progressService.setTaskProgress(weekId, dayKey, taskId, done);
  }

  private async syncNote(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'create':
        await notesService.add(item.data);
        break;
      case 'update':
        await notesService.update(item.data.id, item.data.updates);
        break;
      case 'delete':
        await notesService.delete(item.data.id);
        break;
    }
  }

  private async syncJournal(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'create':
        await journalService.add(item.data);
        break;
      case 'update':
        await journalService.update(item.data.id, item.data.updates);
        break;
      case 'delete':
        await journalService.delete(item.data.id);
        break;
    }
  }

  private async syncResource(item: SyncQueueItem): Promise<void> {
    // Implement resource sync logic
    console.log('Syncing resource:', item);
  }

  // Public methods
  public addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `${item.type}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.syncQueue.push(syncItem);
    this.saveSyncQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  public async forceSync(): Promise<void> {
    if (!this.isOnline) {
      toast.error('لا يوجد اتصال بالإنترنت');
      return;
    }

    toast.loading('جاري مزامنة البيانات...');
    
    try {
      await this.processSyncQueue();
      toast.success('تمت المزامنة بنجاح');
    } catch (error) {
      console.error('Force sync failed:', error);
      toast.error('فشلت المزامنة');
    }
  }

  public getQueueStatus() {
    return {
      queueLength: this.syncQueue.length,
      isOnline: this.isOnline,
      pendingItems: this.syncQueue.filter(item => item.retries === 0).length,
      retryItems: this.syncQueue.filter(item => item.retries > 0).length,
    };
  }

  public clearQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
    toast.success('تم مسح قائمة المزامنة');
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Create singleton instance
export const backgroundSync = new BackgroundSyncService();

// Export for use in components
export const useBackgroundSync = () => {
  return {
    addToSyncQueue: backgroundSync.addToSyncQueue.bind(backgroundSync),
    forceSync: backgroundSync.forceSync.bind(backgroundSync),
    getQueueStatus: backgroundSync.getQueueStatus.bind(backgroundSync),
    clearQueue: backgroundSync.clearQueue.bind(backgroundSync),
  };
};