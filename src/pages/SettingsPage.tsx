// Settings Page - Unified Design
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Sun, Moon, Globe, Save, RotateCcw, 
  Download, Upload, Trash2, Database, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, lang, toggleTheme, setLang, settings, updateSettings, forceReloadData, fixMissingWeeks } = useApp();
  const { t } = useLocalization();
  
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleResetSettings = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleExportData = () => {
    const data = {
      settings: localSettings,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-security-journey-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.settings) {
            setLocalSettings(data.settings);
            setHasChanges(true);
          }
        } catch (error) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm(t('confirmClearData'))) {
      // Clear all data from IndexedDB
      localStorage.clear();
      indexedDB.deleteDatabase('CyberPlanDB');
      indexedDB.deleteDatabase('CyberPlanOffline');
      
      // Show success message
      toast.success('تم مسح جميع البيانات بنجاح');
      
      // Refresh the page to reload data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleForceReloadData = async () => {
    try {
      // Clear plan data from IndexedDB
      indexedDB.deleteDatabase('CyberPlanDB');
      
      // Refresh data
      await refreshData();
      
      toast.success('تم إعادة تحميل البيانات بنجاح');
    } catch (error) {
      console.error('Error forcing data reload:', error);
      toast.error('فشل في إعادة تحميل البيانات');
    }
  };

  const handleClearAndReload = async () => {
    if (window.confirm('هل أنت متأكد من إصلاح الأسابيع المفقودة؟')) {
      try {
        // Use the new fixMissingWeeks function
        await fixMissingWeeks();
        toast.success('تم إصلاح الأسابيع المفقودة بنجاح');
      } catch (error) {
        console.error('Error fixing missing weeks:', error);
        toast.error('فشل في إصلاح الأسابيع المفقودة');
      }
    }
  };

  const settingSections = [
    {
      title: t('appearance'),
      icon: theme === 'dark' ? Moon : Sun,
      settings: [
        {
          key: 'fontSize',
          label: t('fontSize'),
          type: 'select',
          options: [
            { value: 'small', label: t('small') },
            { value: 'medium', label: t('medium') },
            { value: 'large', label: t('large') }
          ],
          value: localSettings.fontSize,
          onChange: (value: string) => handleSettingChange('fontSize', value)
        },
        {
          key: 'compactMode',
          label: t('compactMode'),
          type: 'toggle',
          value: localSettings.compactMode,
          onChange: (value: boolean) => handleSettingChange('compactMode', value)
        }
      ]
    },
    {
      title: t('notifications'),
      icon: Settings, // Changed from Bell to Settings for consistency
      settings: [
        {
          key: 'notifications',
          label: t('enableNotifications'),
          type: 'toggle',
          value: localSettings.notifications,
          onChange: (value: boolean) => handleSettingChange('notifications', value)
        },
        {
          key: 'sound',
          label: t('soundEffects'),
          type: 'toggle',
          value: localSettings.sound,
          onChange: (value: boolean) => handleSettingChange('sound', value)
        }
      ]
    },
    {
      title: t('data'),
      icon: Database, // Changed from Save to Database for consistency
      settings: [
        {
          key: 'autoSave',
          label: t('autoSave'),
          type: 'toggle',
          value: localSettings.autoSave,
          onChange: (value: boolean) => handleSettingChange('autoSave', value)
        }
      ]
    }
  ];

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  return (
    <PageLayout 
      title={safeT('settings')}
      subtitle={safeT('customizeYourExperience')}
      showBottomBar={true}
    >
      {/* Save/Reset Buttons */}
      {hasChanges && (
        <motion.div
          {...animations.fadeIn}
          className="mb-6 flex justify-end space-x-2"
        >
          <Button
            variant="outline"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleResetSettings}
          >
            {t('reset')}
          </Button>
          <Button
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSaveSettings}
          >
            {t('save')}
          </Button>
        </motion.div>
      )}

      {/* Language and Theme Quick Settings */}
      <motion.div
        {...animations.fadeIn}
        className="mb-8"
      >
        <Card
          title={t('quickSettings')}
          subtitle={t('mostUsedSettings')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('language')}
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={lang === 'ar' ? 'primary' : 'outline'}
                  onClick={() => setLang('ar')}
                  className="flex-1"
                >
                  العربية
                </Button>
                <Button
                  variant={lang === 'en' ? 'primary' : 'outline'}
                  onClick={() => setLang('en')}
                  className="flex-1"
                >
                  English
                </Button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('theme')}
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  icon={<Sun className="w-4 h-4" />}
                  onClick={() => toggleTheme()}
                  className="flex-1"
                >
                  {t('light')}
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  icon={<Moon className="w-4 h-4" />}
                  onClick={() => toggleTheme()}
                  className="flex-1"
                >
                  {t('dark')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            {...animations.fadeIn}
            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
          >
            <Card
              title={section.title}
              subtitle={t(`${section.title.toLowerCase()}Settings`)}
            >
              <div className="space-y-6">
                {section.settings.map((setting, settingIndex) => (
                  <motion.div
                    key={setting.key}
                    {...animations.stagger(settingIndex * 0.05)}
                    className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {setting.type === 'toggle' && (setting.value ? 
                          <Settings className="w-4 h-4 text-green-600" /> : 
                          <Settings className="w-4 h-4 text-gray-400" />
                        )}
                        {setting.type === 'select' && <Globe className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          {setting.label}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t(`${setting.key}Description`)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => setting.onChange(!setting.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}

                      {setting.type === 'select' && (
                        <select
                          value={setting.value}
                          onChange={(e) => setting.onChange(e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          {setting.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* About Section */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <Card
          title={t('about')}
          subtitle={t('appInformation')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('appName')}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Cyber Security Journey
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('version')}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('lastUpdated')}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Data Management Section */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <Card
          title="إدارة البيانات"
          subtitle="حل مشاكل تحميل البيانات"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                مشكلة الأسبوع 3 و 4
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                إذا كنت تواجه مشكلة في عدم ظهور الأسبوع 3 و 4، اضغط على الزر أدناه لحل المشكلة.
              </p>
              <Button
                variant="primary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={handleClearAndReload}
                className="w-full"
              >
                حل مشكلة الأسبوع 3 و 4
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}