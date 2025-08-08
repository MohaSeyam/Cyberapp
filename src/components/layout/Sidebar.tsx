// Sidebar Component
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Calendar, FileText, BookOpen, TrendingUp, Settings, Book } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';

export default function Sidebar() {
  const { plan, lang } = useApp();
  const { t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  // Remove isSidebarOpen and toggle button logic

  // استخراج المراحل
  const phases = Array.from(new Set((plan || []).map(week => week?.phase).filter(Boolean))).sort();

  // استخراج الأسابيع حسب المرحلة المختارة
  const weeks = selectedPhase
    ? (plan || []).filter(week => week.phase === selectedPhase)
    : [];

  // استخراج الأيام حسب الأسبوع المختار
  const days = selectedWeek
    ? (plan || []).find(week => week.week === selectedWeek)?.days || []
    : [];

  // عناصر التنقل
  const navigationItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: Calendar, label: t('plan'), path: '/plan' },
    { icon: FileText, label: t('notes'), path: '/notes' },
    { icon: BookOpen, label: t('journal'), path: '/journal' },
    { icon: Book, label: lang === 'ar' ? 'الموارد' : 'Resources', path: '/resources' },
    { icon: TrendingUp, label: t('progress'), path: '/progress' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <aside className="fixed top-0 bottom-0 left-0 right-auto w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto z-30 shadow-lg">
      <div className="p-4">
        {/* Navigation Items */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {t('navigation')}
          </h3>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

          {/* Plan Tree */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('plan')}
            </h3>
            <ul className="space-y-1">
              {phases.map(phase => (
                <li key={phase}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${selectedPhase === phase ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setSelectedPhase(phase)}
                  >
                    {t('phase')} {phase}
                  </button>
                  {/* الأسابيع */}
                  {selectedPhase === phase && weeks.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {weeks.map(week => (
                        <li key={week.week}>
                          <button
                            className={`w-full text-left px-3 py-1 rounded-lg transition-all ${selectedWeek === week.week ? 'bg-blue-50 dark:bg-blue-700 text-blue-800 dark:text-blue-100' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                            onClick={() => setSelectedWeek(week.week)}
                          >
                            {t('week')} {week.week}
                          </button>
                          {/* الأيام */}
                          {selectedWeek === week.week && days.length > 0 && (
                            <ul className="ml-4 mt-1 space-y-1">
                              {days.map((day, idx) => (
                                <li key={day.key}>
                                  <Link
                                    to={`/day/${week.week}/${idx}`}
                                    className={`block px-3 py-1 rounded-lg transition-all ${location.pathname === `/day/${week.week}/${idx}` ? 'bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300'}`}
                                  >
                                    {day.day?.[lang] || day.key}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
  );
}