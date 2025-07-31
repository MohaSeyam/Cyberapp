// Sidebar Component
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';

export default function Sidebar() {
  const { plan, lang } = useApp();
  const { t } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <>
      {/* Toggle Button for Large Screens */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hidden md:block xl:hidden"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`hidden md:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto p-4 transition-transform duration-300 z-40 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('phases')}</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul>
          {phases.map(phase => (
            <li key={phase}>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all ${selectedPhase === phase ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setSelectedPhase(phase)}
              >
                {t('phase')} {phase}
              </button>
              {/* الأسابيع */}
              {selectedPhase === phase && weeks.length > 0 && (
                <ul className="ml-4 mt-1">
                  {weeks.map(week => (
                    <li key={week.week}>
                      <button
                        className={`w-full text-left px-3 py-1 rounded-lg mb-1 transition-all ${selectedWeek === week.week ? 'bg-blue-50 dark:bg-blue-700 text-blue-800 dark:text-blue-100' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                        onClick={() => setSelectedWeek(week.week)}
                      >
                        {t('week')} {week.week}
                      </button>
                      {/* الأيام */}
                      {selectedWeek === week.week && days.length > 0 && (
                        <ul className="ml-4 mt-1">
                          {days.map((day, idx) => (
                            <li key={day.key}>
                              <Link
                                to={`/day/${week.week}/${idx}`}
                                className={`block px-3 py-1 rounded-lg mb-1 transition-all ${location.pathname === `/day/${week.week}/${idx}` ? 'bg-blue-200 dark:bg-blue-600 text-blue-900 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300'}`}
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
      </aside>
    </>
  );
}