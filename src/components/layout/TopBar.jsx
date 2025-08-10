import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';
import { useApp } from '../../context/AppContext';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLocalization();
  const { theme, toggleTheme } = useApp();

  const isRTL = language === 'ar';

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return language === 'ar' ? 'الرئيسية' : 'Home';
    if (path === '/phases') return language === 'ar' ? 'المراحل' : 'Phases';
    if (path === '/progress') return language === 'ar' ? 'التقدم' : 'Progress';
    if (path === '/notes') return language === 'ar' ? 'الملاحظات' : 'Notes';
    if (path === '/journal') return language === 'ar' ? 'المدونة' : 'Journal';
    if (path === '/settings') return language === 'ar' ? 'الإعدادات' : 'Settings';
    
    return language === 'ar' ? 'التطبيق' : 'App';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ش</span>
              </div>
              <span className="hidden sm:block">
                {language === 'ar' ? 'خطة الأمن السيبراني' : 'Cyber Security Plan'}
              </span>
            </button>
          </div>

          {/* Page Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <span className="text-sm font-medium">
                {language === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'التبديل للوضع المظلم'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={language === 'ar' ? 'الإعدادات' : 'Settings'}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;