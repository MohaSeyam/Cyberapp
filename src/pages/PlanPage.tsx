import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

export default function PlanPage() {
  const { plan, lang } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

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
    <PageLayout title={t('plan')} subtitle={t('planSubtitle')} showHeader={true}>
      {/* مراحل */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('phases')}</h2>
        <div className="flex flex-wrap gap-3">
          {phases.map(phase => (
            <button
              key={phase}
              onClick={() => { setSelectedPhase(phase); setSelectedWeek(null); }}
              className={`px-5 py-3 rounded-lg font-semibold transition-all border-2 ${selectedPhase === phase ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'}`}
            >
              {t('phase')} {phase}
            </button>
          ))}
        </div>
      </div>
      {/* أسابيع */}
      {selectedPhase && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t('weeks')}</h2>
          <div className="flex flex-wrap gap-3">
            {weeks.map(week => (
              <button
                key={week.week}
                onClick={() => setSelectedWeek(week.week)}
                className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${selectedWeek === week.week ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
              >
                {t('week')} {week.week}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* أيام */}
      {selectedWeek && days.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t('days')}</h2>
          <div className="flex flex-wrap gap-3">
            {days.map((day, idx) => (
              <button
                key={day.key}
                onClick={() => navigate(`/day/${selectedWeek}/${idx}`)}
                className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${window.location.pathname === `/day/${selectedWeek}/${idx}` ? 'bg-blue-400 text-white border-blue-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
              >
                {day.day?.[lang] || day.key}
              </button>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}