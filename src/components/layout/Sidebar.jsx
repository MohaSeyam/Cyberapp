import React from 'react';
import { Home, Target, BarChart3, FileText, BookOpen, Link, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language, direction, isRTL } = localizationData;
  const safeLanguage = language || 'ar';



  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: safeLanguage === 'ar' ? 'الرئيسية' : 'Home'
    },
    {
      path: '/phases',
      icon: Target,
      label: safeLanguage === 'ar' ? 'المراحل' : 'Phases'
    },
    {
      path: '/progress',
      icon: BarChart3,
      label: safeLanguage === 'ar' ? 'التقدم' : 'Progress'
    },
    {
      path: '/notes',
      icon: FileText,
      label: safeLanguage === 'ar' ? 'الملاحظات' : 'Notes'
    },
    {
      path: '/journal',
      icon: BookOpen,
      label: safeLanguage === 'ar' ? 'المدونة' : 'Journal'
    },
    {
      path: '/resources',
      icon: Link,
      label: safeLanguage === 'ar' ? 'المراجع' : 'Resources'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } lg:static lg:z-auto`}
        dir={direction}
        style={{ direction }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {safeLanguage === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                } ${isRTL ? 'space-x-reverse' : ''}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {safeLanguage === 'ar' ? 'استخدم القائمة للتنقل السريع' : 'Use the menu for quick navigation'}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;