import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Globe, Moon, Sun, Palette, Bell, Shield, 
  User
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import { useTheme } from '../context/ThemeContext';

import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  
  const { language, setLanguage } = useSimpleLocalization();
  const { theme, setTheme } = useSimpleApp();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  
  const safeLanguage = language || 'ar';
  const isRTL = safeLanguage === 'ar';
  const currentTheme = appTheme || theme || 'light';

  // Ensure data is available
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'md');

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

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    localStorage.setItem('fontSize', value);
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
      </motion.div>

    </PageLayout>
  );
};

export default SettingsPage;