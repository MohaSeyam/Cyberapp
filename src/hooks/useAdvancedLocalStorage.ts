import { useState, useEffect, useCallback, useRef } from 'react';

interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;

  backupInterval?: number; // in minutes
  maxBackups?: number;
}

interface BackupData {
  timestamp: number;
  data: any;
  version: string;
}

class AdvancedLocalStorage {
  private static instance: AdvancedLocalStorage;
  private encryptionKey: string = 'cyber-learning-app-2024';
  private backupPrefix = 'cyber_learning_backup_';
  private version = '1.0.0';

  static getInstance(): AdvancedLocalStorage {
    if (!AdvancedLocalStorage.instance) {
      AdvancedLocalStorage.instance = new AdvancedLocalStorage();
    }
    return AdvancedLocalStorage.instance;
  }

  // Simple encryption (for demo purposes - use proper encryption in production)
  private encrypt(data: string): string {
    if (typeof window === 'undefined') return data;
    
    try {
      // Simple XOR encryption (replace with proper encryption in production)
      const key = this.encryptionKey;
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(encrypted);
    } catch (error) {
      console.warn('Encryption failed, storing as plain text:', error);
      return data;
    }
  }

  private decrypt(encryptedData: string): string {
    if (typeof window === 'undefined') return encryptedData;
    
    try {
      const key = this.encryptionKey;
      const decoded = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.warn('Decryption failed, returning as is:', error);
      return encryptedData;
    }
  }

  // Simple compression (for demo purposes)
  private compress(data: string): string {
    try {
      // Simple compression by removing extra spaces and newlines
      return data.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.warn('Compression failed:', error);
      return data;
    }
  }

  private decompress(data: string): string {
    // For this simple compression, decompression is the same
    return data;
  }

  setItem(key: string, value: any, options: StorageOptions = {}): void {
    if (typeof window === 'undefined') return;

    try {
      let dataToStore = JSON.stringify(value);
      
      if (options.compress) {
        dataToStore = this.compress(dataToStore);
      }
      
      if (options.encrypt) {
        dataToStore = this.encrypt(dataToStore);
      }

      localStorage.setItem(key, dataToStore);

      // Auto backup
      if (false) { // autoBackup removed
        this.createBackup(key, value, options);
      }
    } catch (error) {
      console.error('Failed to store data:', error);
      throw error;
    }
  }

  getItem(key: string, options: StorageOptions = {}): any {
    if (typeof window === 'undefined') return null;

    try {
      let data = localStorage.getItem(key);
      if (data === null) return null;

      if (options.encrypt) {
        data = this.decrypt(data);
      }

      if (options.compress) {
        data = this.decompress(data);
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }

  private createBackup(key: string, data: any, options: StorageOptions): void {
    const backupKey = `${this.backupPrefix}${key}`;
    const backupData: BackupData = {
      timestamp: Date.now(),
      data,
      version: this.version
    };

    // Get existing backups
    const existingBackups = this.getItem(backupKey) || [];
    const newBackups = [backupData, ...existingBackups];

    // Limit number of backups
    const maxBackups = options.maxBackups || 10;
    if (newBackups.length > maxBackups) {
      newBackups.splice(maxBackups);
    }

    // Store backups
    this.setItem(backupKey, newBackups, { encrypt: true });
  }

  getBackups(key: string): BackupData[] {
    const backupKey = `${this.backupPrefix}${key}`;
    return this.getItem(backupKey, { encrypt: true }) || [];
  }

  restoreFromBackup(key: string, timestamp: number): boolean {
    try {
      const backups = this.getBackups(key);
      const backup = backups.find(b => b.timestamp === timestamp);
      
      if (backup) {
        this.setItem(key, backup.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  exportData(keys: string[]): string {
    const exportData: Record<string, any> = {};
    
    keys.forEach(key => {
      const data = this.getItem(key);
      if (data !== null) {
        exportData[key] = data;
      }
    });

    return JSON.stringify({
      version: this.version,
      timestamp: Date.now(),
      data: exportData
    });
  }

  importData(jsonData: string): { success: string[], failed: string[] } {
    const result = { success: [] as string[], failed: [] as string[] };

    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.data && typeof importData.data === 'object') {
        Object.keys(importData.data).forEach(key => {
          try {
            this.setItem(key, importData.data[key]);
            result.success.push(key);
          } catch (error) {
            console.error(`Failed to import key ${key}:`, error);
            result.failed.push(key);
          }
        });
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      result.failed.push('parse_error');
    }

    return result;
  }

  getStorageInfo(): { used: number; available: number; total: number } {
    if (typeof window === 'undefined') {
      return { used: 0, available: 0, total: 0 };
    }

    let used = 0;
    let total = 0;

    try {
      // Calculate used space
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate total available space (5MB is typical)
      total = 5 * 1024 * 1024; // 5MB in bytes
    } catch (error) {
      console.warn('Could not calculate storage info:', error);
    }

    return {
      used,
      available: total - used,
      total
    };
  }
}

export function useAdvancedLocalStorage<T>(
  key: string,
  initialValue: T,
  options: StorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storage = AdvancedLocalStorage.getInstance();
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem(key, options);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.setItem(key, valueToStore, options);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, options]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Auto-backup effect
  useEffect(() => {
    if (false && options.backupInterval) { // autoBackup removed
      const interval = setInterval(() => {
        storage.setItem(key, storedValue, { ...options, autoBackup: false });
      }, options.backupInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [key, storedValue, options]);

  return [storedValue, setValue, removeValue];
}

export function useStorageManager() {
  const storage = AdvancedLocalStorage.getInstance();

  const exportAllData = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => 
      !key.startsWith('cyber_learning_backup_')
    );
    return storage.exportData(keys);
  }, []);

  const importAllData = useCallback((jsonData: string) => {
    return storage.importData(jsonData);
  }, []);

  const getStorageInfo = useCallback(() => {
    return storage.getStorageInfo();
  }, []);

  const clearAllData = useCallback(() => {
    storage.clear();
  }, []);

  const getBackups = useCallback((key: string) => {
    return storage.getBackups(key);
  }, []);

  const restoreFromBackup = useCallback((key: string, timestamp: number) => {
    return storage.restoreFromBackup(key, timestamp);
  }, []);

  return {
    exportAllData,
    importAllData,
    getStorageInfo,
    clearAllData,
    getBackups,
    restoreFromBackup
  };
}

export default AdvancedLocalStorage;