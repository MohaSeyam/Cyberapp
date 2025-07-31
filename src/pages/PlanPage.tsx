import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Calendar, BookOpen, Target, Clock, CheckCircle } from 'lucide-react';

export default function PlanPage() {
  const { plan, lang } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  // استخراج المراحل
  const phases = Array.from(new Set((plan || []).map(week => week?.phase).filter(Boolean))).sort();

  // تبديل توسيع المرحلة
  const togglePhase = (phase: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  // تبديل توسيع الأسبوع
  const toggleWeek = (week: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(week)) {
      newExpanded.delete(week);
    } else {
      newExpanded.add(week);
    }
    setExpandedWeeks(newExpanded);
  };

  // الحصول على أسابيع المرحلة
  const getWeeksForPhase = (phase: number) => {
    return (plan || []).filter(week => week.phase === phase);
  };

  // الحصول على أيام الأسبوع
  const getDaysForWeek = (weekNumber: number) => {
    return (plan || []).find(week => week.week === weekNumber)?.days || [];
  };

  // التحقق من أن اليوم نشط
  const isDayActive = (weekNumber: number, dayIndex: number) => {
    return location.pathname === `/day/${weekNumber}/${dayIndex}`;
  };

  return (
    <PageLayout title={t('plan')} subtitle={t('planSubtitle')} showHeader={true}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('plan')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('planDescription')}
          </p>
        </div>

        {/* Plan Tree */}
        <div className="space-y-4">
          {phases.map(phase => {
            const weeks = getWeeksForPhase(phase);
            const isExpanded = expandedPhases.has(phase);
            
            return (
              <Card key={phase} className="overflow-hidden">
                {/* Phase Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => togglePhase(phase)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('phase')} {phase}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {weeks.length} {t('weeks')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {weeks.length} {t('weeks')}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Weeks */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {weeks.map(week => {
                      const days = getDaysForWeek(week.week);
                      const isWeekExpanded = expandedWeeks.has(week.week);
                      
                      return (
                        <div key={week.week} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                          {/* Week Header */}
                          <div 
                            className="flex items-center justify-between p-4 pl-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => toggleWeek(week.week)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {t('week')} {week.week}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {days.length} {t('days')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {days.length} {t('days')}
                              </span>
                              {isWeekExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Days */}
                          {isWeekExpanded && (
                            <div className="bg-gray-50 dark:bg-gray-900">
                              {days.map((day, dayIndex) => (
                                <div 
                                  key={day.key}
                                  className={`flex items-center justify-between p-3 pl-12 cursor-pointer transition-colors ${
                                    isDayActive(week.week, dayIndex)
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                  onClick={() => navigate(`/day/${week.week}/${dayIndex}`)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-lg ${
                                      isDayActive(week.week, dayIndex)
                                        ? 'bg-blue-200 dark:bg-blue-800'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                      <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <span className={`font-medium ${
                                      isDayActive(week.week, dayIndex)
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {day.day?.[lang] || day.key}
                                    </span>
                                  </div>
                                  {isDayActive(week.week, dayIndex) && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {phases.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noPlanData')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('noPlanDataDescription')}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}