import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Globe, Moon, Sun, Palette, Bell, Shield, Database, 
  Download, Upload, Trash2, User, Info, HelpCircle, ExternalLink,
  Zap, HardDrive, Cpu, Wifi, WifiOff
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import { useTheme } from '../context/ThemeContext';
import { usePerformanceMonitor } from '../hooks/usePerformance';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  
  const { language, setLanguage } = useSimpleLocalization();
  const { theme, setTheme, exportData, importData, clearAllData } = useSimpleApp();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const performanceStats = usePerformanceMonitor();
  
  const safeLanguage = language || 'ar';
  const isRTL = safeLanguage === 'ar';
  const currentTheme = appTheme || theme || 'light';

  // Ensure data is available
  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'md');
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme) => {
    if (setAppTheme) {
      setAppTheme(newTheme);
    } else {
      setTheme(newTheme);
    }
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      await importData(importFile);
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    localStorage.setItem('fontSize', value);
  };

  const handleClearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    localStorage.removeItem('app-cache');
    window.location.reload();
  };

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    }
  };

  const SettingSection = ({ title, icon, children }) => (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </Card>
  );

  const SettingItem = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {label}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <PageLayout
      title={safeLanguage === 'ar' ? 'الإعدادات' : 'Settings'}
      subtitle={safeLanguage === 'ar' ? 'تخصيص تجربتك' : 'Customize your experience'}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Appearance */}
        <SettingSection
          title={safeLanguage === 'ar' ? 'المظهر' : 'Appearance'}
          icon={<Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        >
          <SettingItem
            label={safeLanguage === 'ar' ? 'اللغة' : 'Language'}
            description={safeLanguage === 'ar' ? 'اختر لغة التطبيق' : 'Choose application language'}
          >
            <select
              value={safeLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'المظهر' : 'Theme'}
            description={safeLanguage === 'ar' ? 'اختر مظهر التطبيق' : 'Choose application theme'}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-2 rounded-lg transition-colors ${
                  currentTheme === 'light'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-2 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`p-2 rounded-lg transition-colors ${
                  currentTheme === 'system'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'حجم الخط' : 'Font Size'}
            description={safeLanguage === 'ar' ? 'اختر حجم الخط المناسب' : 'Choose your preferred font size'}
          >
            <select
              value={fontSize}
              onChange={e => handleFontSizeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="sm">{safeLanguage === 'ar' ? 'صغير' : 'Small'}</option>
              <option value="md">{safeLanguage === 'ar' ? 'متوسط' : 'Medium'}</option>
              <option value="lg">{safeLanguage === 'ar' ? 'كبير' : 'Large'}</option>
            </select>
          </SettingItem>
        </SettingSection>

        {/* Performance & Cache */}
        <SettingSection
          title={safeLanguage === 'ar' ? 'الأداء والذاكرة المؤقتة' : 'Performance & Cache'}
          icon={<Zap className="w-5 h-5 text-green-600 dark:text-green-400" />}
        >
          <SettingItem
            label={safeLanguage === 'ar' ? 'مراقبة الأداء' : 'Performance Monitor'}
            description={safeLanguage === 'ar' ? 'عرض إحصائيات الأداء في الوقت الفعلي' : 'View real-time performance statistics'}
          >
            <Button
              variant="ghost"
              icon={<Cpu />}
              onClick={() => setShowPerformanceModal(true)}
            >
              {safeLanguage === 'ar' ? 'عرض' : 'View'}
            </Button>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
            description={safeLanguage === 'ar' ? 'تحسين الأداء عبر مسح البيانات المخزنة مؤقتاً' : 'Improve performance by clearing cached data'}
          >
            <Button
              variant="ghost"
              icon={<HardDrive />}
              onClick={handleClearCache}
            >
              {safeLanguage === 'ar' ? 'مسح' : 'Clear'}
            </Button>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'وضع عدم الاتصال' : 'Offline Mode'}
            description={safeLanguage === 'ar' ? 'استخدام التطبيق بدون اتصال بالإنترنت' : 'Use the app without internet connection'}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {navigator.onLine ? (
                  <>
                    <Wifi className="w-4 h-4 inline mr-1 text-green-500" />
                    {safeLanguage === 'ar' ? 'متصل' : 'Online'}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 inline mr-1 text-red-500" />
                    {safeLanguage === 'ar' ? 'غير متصل' : 'Offline'}
                  </>
                )}
              </span>
            </div>
          </SettingItem>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          title={safeLanguage === 'ar' ? 'الإشعارات' : 'Notifications'}
          icon={<Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
        >
          <SettingItem
            label={safeLanguage === 'ar' ? 'إشعارات المهام' : 'Task Notifications'}
            description={safeLanguage === 'ar' ? 'تلقي تذكيرات بالمهام اليومية' : 'Receive daily task reminders'}
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'إشعارات التقدم' : 'Progress Notifications'}
            description={safeLanguage === 'ar' ? 'تلقي تحديثات عن تقدمك' : 'Receive progress updates'}
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>
        </SettingSection>

        {/* Data Management */}
        <SettingSection
          title={safeLanguage === 'ar' ? 'إدارة البيانات' : 'Data Management'}
          icon={<Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        >
          <SettingItem
            label={safeLanguage === 'ar' ? 'تصدير البيانات' : 'Export Data'}
            description={safeLanguage === 'ar' ? 'حفظ نسخة احتياطية من بياناتك' : 'Save a backup of your data'}
          >
            <Button
              variant="ghost"
              icon={<Download />}
              onClick={handleExport}
            >
              {safeLanguage === 'ar' ? 'تصدير' : 'Export'}
            </Button>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'استيراد البيانات' : 'Import Data'}
            description={safeLanguage === 'ar' ? 'استعادة البيانات من نسخة احتياطية' : 'Restore data from backup'}
          >
            <Button
              variant="ghost"
              icon={<Upload />}
              onClick={() => setShowImportModal(true)}
            >
              {safeLanguage === 'ar' ? 'استيراد' : 'Import'}
            </Button>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}
            description={safeLanguage === 'ar' ? 'حذف جميع البيانات المحفوظة (لا يمكن التراجع)' : 'Delete all saved data (cannot be undone)'}
          >
            <Button
              variant="ghost"
              icon={<Trash2 />}
              onClick={() => setShowClearModal(true)}
              className="text-red-600 hover:text-red-700"
            >
              {safeLanguage === 'ar' ? 'مسح' : 'Clear'}
            </Button>
          </SettingItem>
        </SettingSection>

        {/* About */}
        <SettingSection
          title={safeLanguage === 'ar' ? 'حول التطبيق' : 'About'}
          icon={<Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        >
          <SettingItem
            label={safeLanguage === 'ar' ? 'الإصدار' : 'Version'}
            description="1.0.0"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              v1.0.0
            </span>
          </SettingItem>

          <SettingItem
            label={safeLanguage === 'ar' ? 'المساعدة' : 'Help'}
            description={safeLanguage === 'ar' ? 'دليل الاستخدام والدعم' : 'User guide and support'}
          >
            <Button
              variant="ghost"
              icon={<HelpCircle />}
              onClick={() => window.open('#', '_blank')}
            >
              {safeLanguage === 'ar' ? 'مساعدة' : 'Help'}
            </Button>
          </SettingItem>
        </SettingSection>
      </motion.div>

      {/* Performance Modal */}
      <Modal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        title={safeLanguage === 'ar' ? 'مراقبة الأداء' : 'Performance Monitor'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {safeLanguage === 'ar' ? 'معدل الإطارات' : 'FPS'}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {performanceStats.fps || '--'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {safeLanguage === 'ar' ? 'الذاكرة' : 'Memory'}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {performanceStats.memory ? `${Math.round(performanceStats.memory / 1024 / 1024)}MB` : '--'}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {safeLanguage === 'ar' 
              ? 'هذه الإحصائيات تُحدث في الوقت الفعلي لمراقبة أداء التطبيق'
              : 'These statistics update in real-time to monitor application performance'
            }
          </div>
        </div>
      </Modal>

      {/* Clear Data Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title={safeLanguage === 'ar' ? 'تأكيد مسح البيانات' : 'Confirm Data Clear'}
      >
        <div className="space-y-4">
          <p className="text-red-600 dark:text-red-400">
            {safeLanguage === 'ar' 
              ? 'هل أنت متأكد من رغبتك في مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.'
              : 'Are you sure you want to clear all data? This action cannot be undone.'
            }
          </p>
          <div className="flex space-x-3">
            <Button
              variant="danger"
              onClick={handleClearAllData}
            >
              {safeLanguage === 'ar' ? 'نعم، امسح' : 'Yes, Clear'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowClearModal(false)}
            >
              {safeLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={safeLanguage === 'ar' ? 'استيراد البيانات' : 'Import Data'}
      >
        <div className="space-y-4">
          <input
            type="file"
            accept=".json"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <div className="flex space-x-3">
            <Button
              onClick={handleImport}
              disabled={!importFile}
            >
              {safeLanguage === 'ar' ? 'استيراد' : 'Import'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowImportModal(false)}
            >
              {safeLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default SettingsPage;