import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, BookOpen, FileText, BarChart3, Settings, 
  User, ChevronLeft, Menu, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { animations } from '../../constants/theme';

interface TopNavBarProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
  subtitle?: string;
}

export default function TopNavBar({ 
  showBackButton = false, 
  onBackClick, 
  title, 
  subtitle 
}: TopNavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useApp();
  const { t } = useLocalization();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  const navigationItems = [
    { path: '/', label: safeT('home'), icon: Home },
    { path: '/phases', label: safeT('phases'), icon: BookOpen },
    { path: '/notes', label: safeT('notes'), icon: FileText },
    { path: '/progress', label: safeT('progress'), icon: BarChart3 },
    { path: '/settings', label: safeT('settings'), icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.nav 
        {...animations.fadeIn}
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={onBackClick || (() => navigate(-1))}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {/* Page Title */}
              {title && (
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Center Section - MAS Logo */}
            <motion.div 
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* MAS Circle Background */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">MAS</span>
                </div>
                
                {/* Decorative Ring */}
                <div className="absolute inset-0 border-2 border-blue-300 dark:border-blue-600 rounded-full animate-pulse"></div>
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    محمد عبد السلام
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'dark' ? safeT('switchToLight') : safeT('switchToDark')}
              >
                {theme === 'dark' ? (
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Desktop Navigation */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around h-16">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer for fixed positioning */}
      <div className="h-16"></div>
    </>
  );
}