import React from 'react';
import { Settings, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import { useSimpleApp } from '../../context/SimpleAppContext';
import ThemeToggle from '../ui/ThemeToggle';

const TopBar = ({ onSidebarToggle, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { language, direction, isRTL, toggleLanguage } = useSimpleLocalization();
  const { theme } = useSimpleApp();
  
  const safeLanguage = language || 'ar';
  const safeTheme = theme || 'light';

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return safeLanguage === 'ar' ? 'الرئيسية' : 'Home';
    if (path === '/phases') return safeLanguage === 'ar' ? 'المراحل' : 'Phases';
    if (path === '/progress') return safeLanguage === 'ar' ? 'التقدم' : 'Progress';
    if (path === '/notes') return safeLanguage === 'ar' ? 'الملاحظات' : 'Notes';
    if (path === '/journal') return safeLanguage === 'ar' ? 'المدونة' : 'Journal';
    if (path === '/settings') return safeLanguage === 'ar' ? 'الإعدادات' : 'Settings';
    
    return safeLanguage === 'ar' ? 'التطبيق' : 'App';
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      dir={direction}
      style={{ direction }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title and Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle - Only on large screens */}
            {onSidebarToggle && (
              <button
                onClick={onSidebarToggle}
                className="hidden lg:flex p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={safeLanguage === 'ar' ? 'إغلاق/فتح القائمة الجانبية' : 'Toggle Sidebar'}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ش</span>
              </div>
              <span className="hidden sm:block">
                {safeLanguage === 'ar' ? 'خطة الأمن السيبراني' : 'Cyber Security Plan'}
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
              onClick={() => {
                console.log('Language toggle clicked, current language:', safeLanguage);
                toggleLanguage();
                
                // Force immediate direction update
                setTimeout(() => {
                  const newDirection = safeLanguage === 'ar' ? 'ltr' : 'rtl';
                  document.documentElement.dir = newDirection;
                  document.documentElement.offsetHeight; // Force reflow
                  console.log('Direction updated to:', newDirection);
                }, 0);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={safeLanguage === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <span className="text-sm font-medium">
                {safeLanguage === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            {/* Enhanced Theme Toggle */}
            <ThemeToggle />

            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={safeLanguage === 'ar' ? 'الإعدادات' : 'Settings'}
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