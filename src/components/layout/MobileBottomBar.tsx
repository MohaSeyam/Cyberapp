// Mobile Bottom Bar Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Calendar, FileText, BookOpen, TrendingUp, Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';

export default function MobileBottomBar() {
  const { lang } = useApp();
  const { t } = useLocalization();
  const location = useLocation();

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
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-all duration-200 ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className={`flex flex-col items-center space-y-1 ${
                active ? 'transform scale-110' : ''
              }`}>
                <Icon className={`w-5 h-5 transition-all duration-200 ${
                  active ? 'text-blue-600 dark:text-blue-400' : ''
                }`} />
                <span className={`text-xs font-medium transition-all duration-200 ${
                  active ? 'text-blue-600 dark:text-blue-400' : ''
                }`}>
                  {item.name}
                </span>
              </div>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}