// Cloud Sync Service
import { openDB } from 'idb';

export interface CloudProvider {
  name: string;
  icon: string;
  authUrl: string;
  upload: (data: any) => Promise<string>;
  download: (fileId: string) => Promise<any>;
  list: () => Promise<Array<{ id: string; name: string; date: Date }>>;
}

export interface SyncStatus {
  lastSync: Date | null;
  status: 'idle' | 'syncing' | 'error';
  error?: string;
  provider?: string;
}

class CloudSyncService {
  private providers: Map<string, CloudProvider> = new Map();
  private syncStatus: SyncStatus = {
    lastSync: null,
    status: 'idle'
  };

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Google Drive Provider
    this.providers.set('google-drive', {
      name: 'Google Drive',
      icon: '📁',
      authUrl: 'https://accounts.google.com/oauth/authorize',
      upload: this.uploadToGoogleDrive.bind(this),
      download: this.downloadFromGoogleDrive.bind(this),
      list: this.listGoogleDriveFiles.bind(this)
    });

    // Dropbox Provider
    this.providers.set('dropbox', {
      name: 'Dropbox',
      icon: '📦',
      authUrl: 'https://www.dropbox.com/oauth2/authorize',
      upload: this.uploadToDropbox.bind(this),
      download: this.downloadFromDropbox.bind(this),
      list: this.listDropboxFiles.bind(this)
    });

    // Local Storage Provider (Backup)
    this.providers.set('local-backup', {
      name: 'Local Backup',
      icon: '💾',
      authUrl: '',
      upload: this.uploadToLocal.bind(this),
      download: this.downloadFromLocal.bind(this),
      list: this.listLocalFiles.bind(this)
    });
  }

  // Google Drive Methods
  private async uploadToGoogleDrive(data: any): Promise<string> {
    try {
      // محاكاة رفع إلى Google Drive
      console.log('Uploading to Google Drive:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileId = `gdrive_${Date.now()}`;
      localStorage.setItem(`gdrive_${fileId}`, JSON.stringify(data));
      
      return fileId;
    } catch (error) {
      console.error('Google Drive upload failed:', error);
      throw new Error('Failed to upload to Google Drive');
    }
  }

  private async downloadFromGoogleDrive(fileId: string): Promise<any> {
    try {
      const data = localStorage.getItem(`gdrive_${fileId}`);
      if (!data) throw new Error('File not found');
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Google Drive download failed:', error);
      throw new Error('Failed to download from Google Drive');
    }
  }

  private async listGoogleDriveFiles(): Promise<Array<{ id: string; name: string; date: Date }>> {
    try {
      const files: Array<{ id: string; name: string; date: Date }> = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('gdrive_')) {
          const fileId = key.replace('gdrive_', '');
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          files.push({
            id: fileId,
            name: data.name || `Backup ${fileId}`,
            date: new Date(data.timestamp || Date.now())
          });
        }
      }
      
      return files.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Failed to list Google Drive files:', error);
      return [];
    }
  }

  // Dropbox Methods
  private async uploadToDropbox(data: any): Promise<string> {
    try {
      // محاكاة رفع إلى Dropbox
      console.log('Uploading to Dropbox:', data);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileId = `dropbox_${Date.now()}`;
      localStorage.setItem(`dropbox_${fileId}`, JSON.stringify(data));
      
      return fileId;
    } catch (error) {
      console.error('Dropbox upload failed:', error);
      throw new Error('Failed to upload to Dropbox');
    }
  }

  private async downloadFromDropbox(fileId: string): Promise<any> {
    try {
      const data = localStorage.getItem(`dropbox_${fileId}`);
      if (!data) throw new Error('File not found');
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Dropbox download failed:', error);
      throw new Error('Failed to download from Dropbox');
    }
  }

  private async listDropboxFiles(): Promise<Array<{ id: string; name: string; date: Date }>> {
    try {
      const files: Array<{ id: string; name: string; date: Date }> = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('dropbox_')) {
          const fileId = key.replace('dropbox_', '');
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          files.push({
            id: fileId,
            name: data.name || `Backup ${fileId}`,
            date: new Date(data.timestamp || Date.now())
          });
        }
      }
      
      return files.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Failed to list Dropbox files:', error);
      return [];
    }
  }

  // Local Backup Methods
  private async uploadToLocal(data: any): Promise<string> {
    try {
      const fileId = `local_${Date.now()}`;
      localStorage.setItem(`local_${fileId}`, JSON.stringify(data));
      
      return fileId;
    } catch (error) {
      console.error('Local upload failed:', error);
      throw new Error('Failed to upload locally');
    }
  }

  private async downloadFromLocal(fileId: string): Promise<any> {
    try {
      const data = localStorage.getItem(`local_${fileId}`);
      if (!data) throw new Error('File not found');
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Local download failed:', error);
      throw new Error('Failed to download locally');
    }
  }

  private async listLocalFiles(): Promise<Array<{ id: string; name: string; date: Date }>> {
    try {
      const files: Array<{ id: string; name: string; date: Date }> = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('local_')) {
          const fileId = key.replace('local_', '');
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          files.push({
            id: fileId,
            name: data.name || `Local Backup ${fileId}`,
            date: new Date(data.timestamp || Date.now())
          });
        }
      }
      
      return files.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Failed to list local files:', error);
      return [];
    }
  }

  // Public Methods
  async getAllProviders(): Promise<CloudProvider[]> {
    return Array.from(this.providers.values());
  }

  async getProvider(name: string): Promise<CloudProvider | null> {
    return this.providers.get(name) || null;
  }

  async syncData(providerName: string, data: any): Promise<string> {
    try {
      this.syncStatus.status = 'syncing';
      this.syncStatus.provider = providerName;
      
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const fileId = await provider.upload({
        ...data,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });

      this.syncStatus.lastSync = new Date();
      this.syncStatus.status = 'idle';
      
      return fileId;
    } catch (error) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async restoreData(providerName: string, fileId: string): Promise<any> {
    try {
      this.syncStatus.status = 'syncing';
      this.syncStatus.provider = providerName;
      
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const data = await provider.download(fileId);
      
      this.syncStatus.lastSync = new Date();
      this.syncStatus.status = 'idle';
      
      return data;
    } catch (error) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async listFiles(providerName: string): Promise<Array<{ id: string; name: string; date: Date }>> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    return await provider.list();
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async exportAllData(): Promise<any> {
    try {
      const db = await openDB('cyberplan', 1);
      
      const notes = await db.getAll('notes');
      const journal = await db.getAll('journal');
      const progress = await db.getAll('progress');
      const settings = await db.getAll('settings');
      
      return {
        notes,
        journal,
        progress,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  async importAllData(data: any): Promise<void> {
    try {
      const db = await openDB('cyberplan', 1);
      
      // Clear existing data
      await db.clear('notes');
      await db.clear('journal');
      await db.clear('progress');
      await db.clear('settings');
      
      // Import new data
      if (data.notes) {
        for (const note of data.notes) {
          await db.add('notes', note);
        }
      }
      
      if (data.journal) {
        for (const entry of data.journal) {
          await db.add('journal', entry);
        }
      }
      
      if (data.progress) {
        for (const prog of data.progress) {
          await db.add('progress', prog);
        }
      }
      
      if (data.settings) {
        for (const setting of data.settings) {
          await db.add('settings', setting);
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data');
    }
  }
}

export const cloudSyncService = new CloudSyncService();