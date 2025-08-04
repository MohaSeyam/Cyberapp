import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Download, Upload, RefreshCw, Clock, Database,
  Shield, Cloud, HardDrive, Wifi, WifiOff, Settings,
  CheckCircle, AlertCircle, Info, Trash2, Archive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { animations } from '../../constants/theme';
import toast from 'react-hot-toast';

interface BackupItem {
  id: string;
  timestamp: Date;
  size: number;
  type: 'auto' | 'manual' | 'cloud';
  status: 'success' | 'error' | 'in_progress';
  description: string;
  data: any;
  version: string;
}

interface BackupSettings {
  enabled: boolean;
  autoBackup: boolean;
  backupInterval: number; // minutes
  maxBackups: number;
  cloudBackup: boolean;
  includeNotes: boolean;
  includeProgress: boolean;
  includeSettings: boolean;
  compression: boolean;
  encryption: boolean;
  lastBackup?: Date;
  nextBackup?: Date;
}

export default function AutoBackup() {
  const { plan, progress, appState, settings } = useApp();
  const { t, language } = useLocalization();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    enabled: true,
    autoBackup: true,
    backupInterval: 60, // كل ساعة
    maxBackups: 10,
    cloudBackup: false,
    includeNotes: true,
    includeProgress: true,
    includeSettings: true,
    compression: true,
    encryption: false
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // تحميل النسخ الاحتياطية المحفوظة
  useEffect(() => {
    const savedBackups = localStorage.getItem('backups');
    if (savedBackups) {
      setBackups(JSON.parse(savedBackups));
    }
  }, []);

  // حفظ النسخ الاحتياطية
  useEffect(() => {
    localStorage.setItem('backups', JSON.stringify(backups));
  }, [backups]);

  // تحميل الإعدادات
  useEffect(() => {
    const savedSettings = localStorage.getItem('backupSettings');
    if (savedSettings) {
      setBackupSettings(JSON.parse(savedSettings));
    }
  }, []);

  // حفظ الإعدادات
  useEffect(() => {
    localStorage.setItem('backupSettings', JSON.stringify(backupSettings));
  }, [backupSettings]);

  // النسخ الاحتياطي التلقائي
  useEffect(() => {
    if (!backupSettings.enabled || !backupSettings.autoBackup) return;

    const interval = setInterval(() => {
      createBackup('auto');
    }, backupSettings.backupInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [backupSettings]);

  // إنشاء نسخة احتياطية
  const createBackup = useCallback(async (type: 'auto' | 'manual' | 'cloud' = 'manual') => {
    if (isBackingUp) return;

    setIsBackingUp(true);
    
    try {
      const backupData: any = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        appState: backupSettings.includeSettings ? appState : null,
        plan: backupSettings.includeProgress ? plan : null,
        progress: backupSettings.includeProgress ? progress : null,
        settings: backupSettings.includeSettings ? settings : null
      };

      // إضافة الملاحظات إذا كانت مفعلة
      if (backupSettings.includeNotes) {
        const notes = localStorage.getItem('notes');
        if (notes) {
          backupData.notes = JSON.parse(notes);
        }
      }

      // ضغط البيانات إذا كانت مفعلة
      let processedData = backupData;
      if (backupSettings.compression) {
        processedData = await compressData(backupData);
      }

      // تشفير البيانات إذا كانت مفعلة
      if (backupSettings.encryption) {
        processedData = await encryptData(processedData);
      }

      const backupItem: BackupItem = {
        id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        size: JSON.stringify(processedData).length,
        type,
        status: 'success',
        description: type === 'auto' 
          ? (language === 'ar' ? 'نسخة احتياطية تلقائية' : 'Automatic backup')
          : type === 'cloud'
          ? (language === 'ar' ? 'نسخة احتياطية سحابية' : 'Cloud backup')
          : (language === 'ar' ? 'نسخة احتياطية يدوية' : 'Manual backup'),
        data: processedData,
        version: '1.0.0'
      };

      setBackups(prev => {
        const newBackups = [backupItem, ...prev];
        
        // حذف النسخ القديمة إذا تجاوز العدد المسموح
        if (newBackups.length > backupSettings.maxBackups) {
          return newBackups.slice(0, backupSettings.maxBackups);
        }
        
        return newBackups;
      });

      // تحديث وقت آخر نسخة احتياطية
      setBackupSettings(prev => ({
        ...prev,
        lastBackup: new Date(),
        nextBackup: new Date(Date.now() + backupSettings.backupInterval * 60 * 1000)
      }));

      toast.success(
        language === 'ar' 
          ? 'تم إنشاء النسخة الاحتياطية بنجاح' 
          : 'Backup created successfully'
      );

      // رفع إلى السحابة إذا كانت مفعلة
      if (backupSettings.cloudBackup && online) {
        await uploadToCloud(backupItem);
      }

    } catch (error) {
      console.error('Backup error:', error);
      toast.error(
        language === 'ar' 
          ? 'خطأ في إنشاء النسخة الاحتياطية' 
          : 'Error creating backup'
      );
    } finally {
      setIsBackingUp(false);
    }
  }, [backupSettings, plan, progress, appState, settings, language, online]);

  // ضغط البيانات
  const compressData = async (data: any): Promise<any> => {
    // محاكاة ضغط البيانات
    return {
      compressed: true,
      originalSize: JSON.stringify(data).length,
      data: btoa(JSON.stringify(data)) // ترميز base64 بسيط
    };
  };

  // تشفير البيانات
  const encryptData = async (data: any): Promise<any> => {
    // محاكاة تشفير البيانات
    return {
      encrypted: true,
      data: btoa(JSON.stringify(data)) // ترميز base64 بسيط
    };
  };

  // رفع إلى السحابة
  const uploadToCloud = async (backup: BackupItem) => {
    try {
      // محاكاة رفع إلى السحابة
      console.log('Uploading to cloud:', backup.id);
      toast.success(
        language === 'ar' 
          ? 'تم رفع النسخة الاحتياطية إلى السحابة' 
          : 'Backup uploaded to cloud'
      );
    } catch (error) {
      console.error('Cloud upload error:', error);
      toast.error(
        language === 'ar' 
          ? 'خطأ في رفع النسخة الاحتياطية' 
          : 'Error uploading backup'
      );
    }
  };

  // استعادة نسخة احتياطية
  const restoreBackup = async (backup: BackupItem) => {
    try {
      let data = backup.data;

      // فك التشفير إذا كان مشفراً
      if (data.encrypted) {
        data = JSON.parse(atob(data.data));
      }

      // فك الضغط إذا كان مضغوطاً
      if (data.compressed) {
        data = JSON.parse(atob(data.data));
      }

      // استعادة البيانات
      if (data.appState) {
        localStorage.setItem('appState', JSON.stringify(data.appState));
      }
      if (data.plan) {
        localStorage.setItem('plan', JSON.stringify(data.plan));
      }
      if (data.progress) {
        localStorage.setItem('progress', JSON.stringify(data.progress));
      }
      if (data.settings) {
        localStorage.setItem('settings', JSON.stringify(data.settings));
      }
      if (data.notes) {
        localStorage.setItem('notes', JSON.stringify(data.notes));
      }

      toast.success(
        language === 'ar' 
          ? 'تم استعادة النسخة الاحتياطية بنجاح' 
          : 'Backup restored successfully'
      );

      // إعادة تحميل الصفحة لتطبيق التغييرات
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Restore error:', error);
      toast.error(
        language === 'ar' 
          ? 'خطأ في استعادة النسخة الاحتياطية' 
          : 'Error restoring backup'
      );
    }
  };

  // حذف نسخة احتياطية
  const deleteBackup = (id: string) => {
    setBackups(prev => prev.filter(backup => backup.id !== id));
    toast.success(
      language === 'ar' 
        ? 'تم حذف النسخة الاحتياطية' 
        : 'Backup deleted'
    );
  };

  // تصدير نسخة احتياطية
  const exportBackup = (backup: BackupItem) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberplan-backup-${backup.timestamp.toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(
      language === 'ar' 
        ? 'تم تصدير النسخة الاحتياطية' 
        : 'Backup exported'
    );
  };

  // استيراد نسخة احتياطية
  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          setBackups(prev => [backupData, ...prev]);
          toast.success(
            language === 'ar' 
              ? 'تم استيراد النسخة الاحتياطية' 
              : 'Backup imported'
          );
        } catch (error) {
          console.error('Import error:', error);
          toast.error(
            language === 'ar' 
              ? 'خطأ في استيراد النسخة الاحتياطية' 
              : 'Error importing backup'
          );
        }
      };
      reader.readAsText(file);
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // الحصول على أيقونة النوع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auto': return RefreshCw;
      case 'manual': return Save;
      case 'cloud': return Cloud;
      default: return Database;
    }
  };

  return (
    <div className="space-y-6">
      {/* عنوان القسم */}
      <motion.div
        {...animations.fadeIn}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Auto Backup'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar' 
            ? 'حماية بياناتك مع النسخ الاحتياطي التلقائي والمتقدم'
            : 'Protect your data with automatic and advanced backup'
          }
        </p>
      </motion.div>

      {/* حالة الاتصال */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <Card className={`p-4 ${online ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {online ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
            <span className={`font-medium ${online ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {online 
                ? (language === 'ar' ? 'متصل بالإنترنت' : 'Online')
                : (language === 'ar' ? 'غير متصل' : 'Offline')
              }
            </span>
          </div>
        </Card>
      </motion.div>

      {/* إحصائيات سريعة */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">
            {backups.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'النسخ الاحتياطية' : 'Backups'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {backups.filter(b => b.status === 'success').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'ناجحة' : 'Successful'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {formatFileSize(backups.reduce((total, b) => total + b.size, 0))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'إجمالي الحجم' : 'Total Size'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            {backupSettings.lastBackup 
              ? backupSettings.lastBackup.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
              : '-'
            }
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'آخر نسخة' : 'Last Backup'}
          </div>
        </Card>
      </motion.div>

      {/* أزرار الإجراءات */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <Button
          variant="primary"
          onClick={() => createBackup('manual')}
          disabled={isBackingUp}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Save className="w-5 h-5" />
          <span>
            {isBackingUp 
              ? (language === 'ar' ? 'جاري النسخ...' : 'Backing up...')
              : (language === 'ar' ? 'إنشاء نسخة احتياطية' : 'Create Backup')
            }
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Settings className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowRestore(true)}
          disabled={backups.length === 0}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Upload className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'استعادة' : 'Restore'}
          </span>
        </Button>
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={importBackup}
            className="hidden"
          />
          <Button
            variant="outline"
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Download className="w-5 h-5" />
            <span>
              {language === 'ar' ? 'استيراد' : 'Import'}
            </span>
          </Button>
        </label>
      </motion.div>

      {/* قائمة النسخ الاحتياطية */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {language === 'ar' ? 'النسخ الاحتياطية' : 'Backups'}
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {backups.map((backup, index) => (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`p-2 rounded-full ${getStatusColor(backup.status)}`}>
                      {React.createElement(getTypeIcon(backup.type), { className: "w-5 h-5" })}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {backup.description}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {backup.timestamp.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} - {formatFileSize(backup.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      backup.type === 'auto' ? 'bg-blue-100 text-blue-800' :
                      backup.type === 'manual' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {language === 'ar' 
                        ? backup.type === 'auto' ? 'تلقائي' : backup.type === 'manual' ? 'يدوي' : 'سحابي'
                        : backup.type
                      }
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportBackup(backup)}
                    >
                      {language === 'ar' ? 'تصدير' : 'Export'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreBackup(backup)}
                    >
                      {language === 'ar' ? 'استعادة' : 'Restore'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackup(backup.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          {backups.length === 0 && (
            <motion.div
              {...animations.fadeIn}
              className="text-center py-12"
            >
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد نسخ احتياطية' : 'No backups'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'قم بإنشاء نسخة احتياطية لحماية بياناتك'
                  : 'Create a backup to protect your data'
                }
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Modal الإعدادات */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={language === 'ar' ? 'إعدادات النسخ الاحتياطي' : 'Backup Settings'}
      >
        <div className="space-y-6">
          {/* الإعدادات العامة */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.enabled}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تفعيل النسخ الاحتياطي' : 'Enable backup'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.autoBackup}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Auto backup'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.cloudBackup}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, cloudBackup: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'النسخ الاحتياطي السحابي' : 'Cloud backup'}
                </span>
              </label>
            </div>
          </div>

          {/* إعدادات التكرار */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'إعدادات التكرار' : 'Schedule Settings'}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'فترة النسخ الاحتياطي (دقائق)' : 'Backup interval (minutes)'}
                </label>
                <input
                  type="number"
                  min="15"
                  max="1440"
                  value={backupSettings.backupInterval}
                  onChange={(e) => setBackupSettings(prev => ({ 
                    ...prev, 
                    backupInterval: parseInt(e.target.value) || 60 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'الحد الأقصى للنسخ' : 'Max backups'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={backupSettings.maxBackups}
                  onChange={(e) => setBackupSettings(prev => ({ 
                    ...prev, 
                    maxBackups: parseInt(e.target.value) || 10 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* إعدادات المحتوى */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'محتوى النسخ الاحتياطي' : 'Backup Content'}
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.includeNotes}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, includeNotes: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تضمين الملاحظات' : 'Include notes'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.includeProgress}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, includeProgress: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تضمين التقدم' : 'Include progress'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.includeSettings}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, includeSettings: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تضمين الإعدادات' : 'Include settings'}
                </span>
              </label>
            </div>
          </div>

          {/* إعدادات الأمان */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.compression}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, compression: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'ضغط البيانات' : 'Compress data'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={backupSettings.encryption}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, encryption: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تشفير البيانات' : 'Encrypt data'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal الاستعادة */}
      <Modal
        isOpen={showRestore}
        onClose={() => setShowRestore(false)}
        title={language === 'ar' ? 'استعادة النسخة الاحتياطية' : 'Restore Backup'}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' 
              ? 'اختر النسخة الاحتياطية التي تريد استعادتها. تحذير: سيتم استبدال البيانات الحالية.'
              : 'Select the backup you want to restore. Warning: Current data will be replaced.'
            }
          </p>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  setSelectedBackup(backup);
                  setShowRestore(false);
                  restoreBackup(backup);
                }}
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {backup.description}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {backup.timestamp.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                >
                  {language === 'ar' ? 'استعادة' : 'Restore'}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowRestore(false)}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}