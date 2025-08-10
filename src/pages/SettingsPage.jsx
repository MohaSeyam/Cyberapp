import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Globe, Moon, Sun, Palette, Bell, Shield, Database, 
  Download, Upload, Trash2, User, Info, HelpCircle, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { theme, setTheme, exportData, importData, clearAllData } = useApp();
  const isRTL = language === 'ar';

  // Ensure data is available
  const safeTheme = theme || 'light';
  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
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
      title={language === 'ar' ? 'الإعدادات' : 'Settings'}
      subtitle={language === 'ar' ? 'تخصيص تجربتك' : 'Customize your experience'}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Appearance */}
        <SettingSection
          title={language === 'ar' ? 'المظهر' : 'Appearance'}
          icon={<Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        >
          <SettingItem
            label={language === 'ar' ? 'اللغة' : 'Language'}
            description={language === 'ar' ? 'اختر لغة التطبيق' : 'Choose application language'}
          >
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'المظهر' : 'Theme'}
            description={language === 'ar' ? 'اختر مظهر التطبيق' : 'Choose application theme'}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleThemeChange('auto')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'auto'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </SettingItem>
        </SettingSection>

        {/* Data Management */}
        <SettingSection
          title={language === 'ar' ? 'إدارة البيانات' : 'Data Management'}
          icon={<Database className="w-5 h-5 text-green-600 dark:text-green-400" />}
        >
          <SettingItem
            label={language === 'ar' ? 'تصدير البيانات' : 'Export Data'}
            description={language === 'ar' ? 'حفظ نسخة احتياطية من بياناتك' : 'Save a backup of your data'}
          >
            <Button
              variant="outline"
              icon={<Download />}
              onClick={handleExport}
            >
              {language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'استيراد البيانات' : 'Import Data'}
            description={language === 'ar' ? 'استعادة البيانات من ملف' : 'Restore data from file'}
          >
            <Button
              variant="outline"
              icon={<Upload />}
              onClick={() => setShowImportModal(true)}
            >
              {language === 'ar' ? 'استيراد' : 'Import'}
            </Button>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}
            description={language === 'ar' ? 'حذف جميع البيانات نهائياً' : 'Permanently delete all data'}
          >
            <Button
              variant="danger"
              icon={<Trash2 />}
              onClick={() => setShowClearModal(true)}
            >
              {language === 'ar' ? 'مسح' : 'Clear'}
            </Button>
          </SettingItem>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          title={language === 'ar' ? 'الإشعارات' : 'Notifications'}
          icon={<Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
        >
          <SettingItem
            label={language === 'ar' ? 'إشعارات المهام' : 'Task Notifications'}
            description={language === 'ar' ? 'تلقي تذكيرات بالمهام اليومية' : 'Receive daily task reminders'}
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'إشعارات التقدم' : 'Progress Notifications'}
            description={language === 'ar' ? 'تلقي تحديثات عن تقدمك' : 'Receive progress updates'}
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </SettingItem>
        </SettingSection>

        {/* Privacy & Security */}
        <SettingSection
          title={language === 'ar' ? 'الخصوصية والأمان' : 'Privacy & Security'}
          icon={<Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        >
          <SettingItem
            label={language === 'ar' ? 'البيانات المحلية' : 'Local Data'}
            description={language === 'ar' ? 'جميع البيانات محفوظة محلياً على جهازك' : 'All data is stored locally on your device'}
          >
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {language === 'ar' ? 'آمن' : 'Secure'}
            </span>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'التشفير' : 'Encryption'}
            description={language === 'ar' ? 'البيانات مشفرة تلقائياً' : 'Data is automatically encrypted'}
          >
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {language === 'ar' ? 'مفعل' : 'Enabled'}
            </span>
          </SettingItem>
        </SettingSection>

        {/* About */}
        <SettingSection
          title={language === 'ar' ? 'حول التطبيق' : 'About'}
          icon={<Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
        >
          <SettingItem
            label={language === 'ar' ? 'الإصدار' : 'Version'}
            description="1.0.0"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              v1.0.0
            </span>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'المساعدة' : 'Help'}
            description={language === 'ar' ? 'دليل الاستخدام والدعم' : 'User guide and support'}
          >
            <Button
              variant="ghost"
              icon={<HelpCircle />}
              onClick={() => window.open('#', '_blank')}
            >
              {language === 'ar' ? 'مساعدة' : 'Help'}
            </Button>
          </SettingItem>

          <SettingItem
            label={language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            description={language === 'ar' ? 'قراءة سياسة الخصوصية' : 'Read privacy policy'}
          >
            <Button
              variant="ghost"
              icon={<ExternalLink />}
              onClick={() => window.open('#', '_blank')}
            >
              {language === 'ar' ? 'عرض' : 'View'}
            </Button>
          </SettingItem>
        </SettingSection>

        {/* Import Modal */}
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title={language === 'ar' ? 'استيراد البيانات' : 'Import Data'}
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' 
                ? 'اختر ملف البيانات للاستيراد. سيتم استبدال البيانات الحالية.'
                : 'Select a data file to import. This will replace your current data.'
              }
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files[0])}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowImportModal(false)}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!importFile}
              >
                {language === 'ar' ? 'استيراد' : 'Import'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Clear Data Modal */}
        <Modal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          title={language === 'ar' ? 'تأكيد مسح البيانات' : 'Confirm Clear Data'}
        >
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400 font-medium">
              {language === 'ar' 
                ? 'تحذير: هذا الإجراء سيحذف جميع البيانات نهائياً ولا يمكن التراجع عنه.'
                : 'Warning: This action will permanently delete all data and cannot be undone.'
              }
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' 
                ? 'هل أنت متأكد من أنك تريد المتابعة؟'
                : 'Are you sure you want to proceed?'
              }
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowClearModal(false)}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={handleClearAllData}
              >
                {language === 'ar' ? 'مسح جميع البيانات' : 'Clear All Data'}
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageLayout>
  );
};

export default SettingsPage;