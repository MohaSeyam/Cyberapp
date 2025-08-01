// Mobile Bottom Bar Component
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, FileText, BarChart3, Settings
} from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';

export default function MobileBottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();

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
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden"
    >
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
    </motion.nav>
  );
}