// BottomBar Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText, BookOpen, TrendingUp, Settings, Sun, Moon } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';
import { useApp } from '../../context/AppContext';

export default function BottomBar() {
  const location = useLocation();
  const { t } = useLocalization();
  const { theme, setTheme } = useApp();
  const items = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: Calendar, label: t('plan'), path: '/plan' },
    { icon: FileText, label: t('notes'), path: '/notes' },
    { icon: BookOpen, label: t('journal'), path: '/journal' },
    { icon: TrendingUp, label: t('progress'), path: '/progress' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 md:hidden">
      {items.map(item => {
        const Icon = item.icon;
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'}`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
      
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`flex flex-col items-center justify-center px-2 py-1 transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300`}
        title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
      >
        {theme === 'dark' ? <Sun className="w-6 h-6 mb-1" /> : <Moon className="w-6 h-6 mb-1" />}
        <span className="text-xs">{theme === 'dark' ? t('light') : t('dark')}</span>
      </button>
    </nav>
  );
}