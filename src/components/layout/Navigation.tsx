// Navigation Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, FileText, BookOpen, TrendingUp, Settings, Download,
  Menu, X, ChevronDown, Sun, Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Button from '../ui/Button';
import geminiLogo from '../../assets/Gemini_Generated_Image_26mado26mado26ma.png';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const { lang, theme, setTheme } = useApp();
  const { t } = useLocalization();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: t('home'),
      path: '/',
      icon: Home,
      description: t('dashboard')
    },
    {
      name: t('phases'),
      path: '/phases',
      icon: Calendar,
      description: t('learningPhases')
    },
    {
      name: t('notes'),
      path: '/notes',
      icon: FileText,
      description: t('manageNotes')
    },
    {
      name: t('journal'),
      path: '/journal',
      icon: BookOpen,
      description: t('learningJournal')
    },
    {
      name: t('progress'),
      path: '/progress',
      icon: TrendingUp,
      description: t('trackProgress')
    },
    {
      name: t('exportData'),
      path: '/export',
      icon: Download,
      description: t('exportDataDescription')
    },
    {
      name: t('settings'),
      path: '/settings',
      icon: Settings,
      description: t('appSettings')
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <img 
                    src={geminiLogo} 
                    alt="Gemini Logo" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>';
                      }
                    }}
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('cyberSecurity')}
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Theme & Language Buttons */}
              <div className="flex items-center space-x-2">
                {/* Theme Toggle Button */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                {/* Language Switch Button */}
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={lang === 'ar' ? 'English' : 'العربية'}
                >
                  {lang === 'ar' ? 'EN' : 'ع'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className={`lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t('cyberSecurity')}
              </span>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              icon={isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            />
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </nav>
    </>
  );
}