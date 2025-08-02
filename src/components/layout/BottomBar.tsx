// BottomBar Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText, BookOpen, TrendingUp, Settings, Sun, Moon } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';
import { useApp } from '../../context/AppContext';

export default function BottomBar() {
  const location = useLocation();
  const { t, language } = useLocalization();
  const { theme, setTheme } = useApp();
  
  // إعادة إنشاء العناصر عند تغيير اللغة
  const items = React.useMemo(() => [
    { icon: Home, label: t('home'), path: '/' },
    { icon: FileText, label: t('notes'), path: '/notes' },
    { icon: BookOpen, label: t('journal'), path: '/journal' },
    { icon: TrendingUp, label: t('progress'), path: '/progress' },
    { icon: BarChart3, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ], [t, language]);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 lg:hidden">
      {items.map(item => {
        const Icon = item.icon;
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'}`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs text-center leading-tight">{item.label}</span>
          </Link>
        );
      })}
      {/* تم إزالة زر الثيم */}
    </nav>
  );
}