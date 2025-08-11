import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme, setTheme, isSystemTheme } = useTheme();
  const { language } = useSimpleLocalization();

  const isArabic = language === 'ar';

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getThemeIcon = () => {
    if (isSystemTheme) {
      return (
        <svg className={`${iconSizes[size]} transition-transform duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (theme === 'dark') {
      return (
        <svg className={`${iconSizes[size]} transition-transform duration-300 rotate-90`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
    
    return (
      <svg className={`${iconSizes[size]} transition-transform duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    );
  };

  const getThemeLabel = () => {
    if (isSystemTheme) {
      return isArabic ? 'النظام' : 'System';
    }
    return theme === 'dark' 
      ? (isArabic ? 'فاتح' : 'Light') 
      : (isArabic ? 'داكن' : 'Dark');
  };

  const handleClick = () => {
    toggleTheme();
  };

  const handleSystemClick = (e) => {
    e.stopPropagation();
    setTheme('system');
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main toggle button */}
      <button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]} 
          relative 
          flex items-center justify-center 
          bg-gray-100 dark:bg-gray-800 
          hover:bg-gray-200 dark:hover:bg-gray-700 
          border border-gray-300 dark:border-gray-600 
          rounded-lg 
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          focus:ring-offset-white dark:focus:ring-offset-gray-900
          group-hover:scale-105
        `}
        title={isArabic ? 'تبديل المظهر' : 'Toggle theme'}
        aria-label={isArabic ? 'تبديل المظهر' : 'Toggle theme'}
      >
        <div className="relative">
          {getThemeIcon()}
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </div>
      </button>

      {/* Theme options dropdown */}
      <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[120px]">
          {/* Light theme option */}
          <button
            onClick={() => setTheme('light')}
            className={`
              w-full px-3 py-2 text-left text-sm rounded-md transition-colors duration-200
              ${theme === 'light' && !isSystemTheme 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              flex items-center space-x-2 ${isArabic ? 'space-x-reverse' : ''}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{isArabic ? 'فاتح' : 'Light'}</span>
          </button>

          {/* Dark theme option */}
          <button
            onClick={() => setTheme('dark')}
            className={`
              w-full px-3 py-2 text-left text-sm rounded-md transition-colors duration-200
              ${theme === 'dark' && !isSystemTheme 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              flex items-center space-x-2 ${isArabic ? 'space-x-reverse' : ''}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>{isArabic ? 'داكن' : 'Dark'}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          {/* System theme option */}
          <button
            onClick={handleSystemClick}
            className={`
              w-full px-3 py-2 text-left text-sm rounded-md transition-colors duration-200
              ${isSystemTheme 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              flex items-center space-x-2 ${isArabic ? 'space-x-reverse' : ''}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{isArabic ? 'النظام' : 'System'}</span>
          </button>
        </div>
      </div>

      {/* Current theme indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default ThemeToggle;