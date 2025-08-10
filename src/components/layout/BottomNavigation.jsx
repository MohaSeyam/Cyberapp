import React from 'react';
import { Home, Target, BarChart3, FileText, BookOpen, Link } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalization } from '../../context/LocalizationContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, direction, isRTL } = useLocalization();
  const safeLanguage = language || 'ar';

  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: safeLanguage === 'ar' ? 'الرئيسية' : 'Home',
      labelShort: safeLanguage === 'ar' ? 'الرئيسية' : 'Home'
    },
    {
      path: '/phases',
      icon: Target,
      label: safeLanguage === 'ar' ? 'المراحل' : 'Phases',
      labelShort: safeLanguage === 'ar' ? 'المراحل' : 'Phases'
    },
    {
      path: '/progress',
      icon: BarChart3,
      label: safeLanguage === 'ar' ? 'التقدم' : 'Progress',
      labelShort: safeLanguage === 'ar' ? 'التقدم' : 'Progress'
    },
    {
      path: '/notes',
      icon: FileText,
      label: safeLanguage === 'ar' ? 'الملاحظات' : 'Notes',
      labelShort: safeLanguage === 'ar' ? 'الملاحظات' : 'Notes'
    },
    {
      path: '/journal',
      icon: BookOpen,
      label: safeLanguage === 'ar' ? 'المدونة' : 'Journal',
      labelShort: safeLanguage === 'ar' ? 'المدونة' : 'Journal'
    },
    {
      path: '/resources',
      icon: Link,
      label: safeLanguage === 'ar' ? 'المراجع' : 'Resources',
      labelShort: safeLanguage === 'ar' ? 'المراجع' : 'Resources'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      dir={direction}
      style={{ direction }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-around h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${active ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium hidden sm:block">
                  {item.labelShort}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
