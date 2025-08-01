import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Globe, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import geminiLogo from '../../assets/gemini-logo.svg';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useApp();
  const { lang, setLang } = useLocalization();

  const handleLanguageToggle = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      style={{ zIndex: 1000 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src={geminiLogo} 
                alt="Gemini Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>';
                  }
                }}
              />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CyberPlan
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === 'light' ? 'التبديل إلى الوضع المظلم' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;