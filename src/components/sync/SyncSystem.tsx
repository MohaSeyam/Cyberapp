import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, CloudOff, Download, Upload, RefreshCw, CheckCircle, AlertCircle, 
  Clock, Database, Wifi, WifiOff, Settings, Trash2, FileText, Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useStorageManager } from '../../hooks/useAdvancedLocalStorage';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { animations } from '../../constants/theme';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  error: string | null;
  pendingChanges: number;
}

interface BackupInfo {
  id: string;
  timestamp: number;
  size: number;
  description: string;
  type: 'auto' | 'manual';
}

export default function SyncSystem() {
  const { t } = useLocalization();
  const { plan, progress, lang, theme } = useApp();
  const storageManager = useStorageManager();
  
  // State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    syncInProgress: false,
    error: null,
    pendingChanges: 0
  });
  
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 5, // minutes
    backupBeforeSync: true,
    encryptBackups: true
  });

  // Check online status
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load backups
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = useCallback(() => {
    try {
      const storageInfo = storageManager.getStorageInfo();
      const mockBackups: BackupInfo[] = [
        {
          id: '1',
          timestamp: Date.now() - 3600000, // 1 hour ago
          size: 1024 * 50, // 50KB
          description: 'Backup before major changes',
          type: 'manual'
        },
        {
          id: '2',
          timestamp: Date.now() - 86400000, // 1 day ago
          size: 1024 * 45, // 45KB
          description: 'Auto backup',
          type: 'auto'
        }
      ];
      setBackups(mockBackups);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  }, [storageManager]);

  // Sync functions
  const performSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      setSyncStatus(prev => ({ ...prev, error: 'No internet connection' }));
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));

    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create backup before sync if enabled
      if (syncSettings.backupBeforeSync) {
        await createBackup('Pre-sync backup');
      }

      // Simulate data sync
      const exportData = storageManager.exportAllData();
      console.log('Syncing data:', exportData);

      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingChanges: 0
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  }, [syncStatus.isOnline, syncSettings.backupBeforeSync, storageManager]);

  const createBackup = useCallback(async (description: string) => {
    try {
      const exportData = storageManager.exportAllData();
      const backup: BackupInfo = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        size: new Blob([exportData]).size,
        description,
        type: 'manual'
      };
      
      setBackups(prev => [backup, ...prev]);
      return backup;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }, [storageManager]);

  const restoreBackup = useCallback(async (backup: BackupInfo) => {
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, you would restore from the backup data
      console.log('Restoring from backup:', backup);
      
      setShowRestoreModal(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }, []);

  const exportData = useCallback(() => {
    try {
      const data = storageManager.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyber-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  }, [storageManager]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = storageManager.importAllData(e.target?.result as string);
        console.log('Import result:', result);
        // Refresh the app data
        window.location.reload();
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    reader.readAsText(file);
  }, [storageManager]);

  const shareProgress = useCallback(() => {
    if (navigator.share) {
      const progressData = {
        title: 'My Cybersecurity Learning Progress',
        text: `I've completed ${progress?.length || 0} tasks in my cybersecurity learning journey!`,
        url: window.location.href
      };
      navigator.share(progressData);
    } else {
      // Fallback: copy to clipboard
      const progressText = `My Cybersecurity Learning Progress: ${progress?.length || 0} tasks completed`;
      navigator.clipboard.writeText(progressText);
    }
  }, [progress]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('syncAndBackup')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('manageYourDataAndSync')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
            syncStatus.isOnline 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {syncStatus.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{syncStatus.isOnline ? t('online') : t('offline')}</span>
          </div>
        </div>
      </div>

      {/* Sync Status Card */}
      <motion.div {...animations.fadeIn}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${syncStatus.isOnline ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {syncStatus.isOnline ? <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <CloudOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('syncStatus')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {syncStatus.lastSync 
                    ? `${t('lastSync')}: ${syncStatus.lastSync.toLocaleString()}`
                    : t('neverSynced')
                  }
                </p>
              </div>
            </div>
            <Button
              icon={syncStatus.syncInProgress ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              onClick={performSync}
              disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
              loading={syncStatus.syncInProgress}
            >
              {syncStatus.syncInProgress ? t('syncing') : t('syncNow')}
            </Button>
          </div>

          {syncStatus.error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">{syncStatus.error}</span>
            </div>
          )}

          {syncStatus.pendingChanges > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                {t('pendingChanges', { count: syncStatus.pendingChanges })}
              </span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
        <Card title={t('quickActions')} subtitle={t('manageYourData')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              icon={<Database className="w-4 h-4" />}
              onClick={() => setShowBackupModal(true)}
              className="h-20 flex-col space-y-2"
            >
              <span>{t('createBackup')}</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={() => setShowRestoreModal(true)}
              className="h-20 flex-col space-y-2"
            >
              <span>{t('restoreBackup')}</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => setShowExportModal(true)}
              className="h-20 flex-col space-y-2"
            >
              <span>{t('exportData')}</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Share2 className="w-4 h-4" />}
              onClick={shareProgress}
              className="h-20 flex-col space-y-2"
            >
              <span>{t('shareProgress')}</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Backups List */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
        <Card title={t('backups')} subtitle={t('yourBackupHistory')}>
          <div className="space-y-3">
            {backups.length > 0 ? (
              backups.map(backup => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${backup.type === 'auto' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                      <Database className={`w-4 h-4 ${backup.type === 'auto' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{backup.description}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(backup.timestamp).toLocaleString()} • {(backup.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup);
                        setShowRestoreModal(true);
                      }}
                    >
                      {t('restore')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => {
                        setBackups(prev => prev.filter(b => b.id !== backup.id));
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noBackupsYet')}</p>
                <p className="text-sm">{t('createYourFirstBackup')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }}>
        <Card title={t('syncSettings')} subtitle={t('configureSyncBehavior')}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{t('autoSync')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('automaticallySyncData')}</p>
              </div>
              <input
                type="checkbox"
                checked={syncSettings.autoSync}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{t('backupBeforeSync')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('createBackupBeforeSyncing')}</p>
              </div>
              <input
                type="checkbox"
                checked={syncSettings.backupBeforeSync}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, backupBeforeSync: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{t('encryptBackups')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('encryptBackupData')}</p>
              </div>
              <input
                type="checkbox"
                checked={syncSettings.encryptBackups}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, encryptBackups: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      
      {/* Create Backup Modal */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title={t('createBackup')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('createBackupDescription')}</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowBackupModal(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={async () => {
              await createBackup('Manual backup');
              setShowBackupModal(false);
            }}>
              {t('createBackup')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore Backup Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title={t('restoreBackup')}
      >
        <div className="space-y-4">
          {selectedBackup ? (
            <>
              <p className="text-gray-600 dark:text-gray-400">
                {t('restoreBackupWarning', { description: selectedBackup.description })}
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRestoreModal(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={() => restoreBackup(selectedBackup)}>
                  {t('restore')}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">{t('selectBackupToRestore')}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={t('exportData')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{t('exportDataDescription')}</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => {
              exportData();
              setShowExportModal(false);
            }}>
              {t('export')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}