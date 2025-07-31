import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Calendar, ChevronRight, Home, ArrowLeft, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import PhasesList from '../components/phases/PhasesList';
import PhaseDetails from '../components/phases/PhaseDetails';
import { phaseService } from '../services/phaseService';
import { animations } from '../constants/theme';

// Breadcrumbs component
function Breadcrumbs({ items, onNavigate }) {
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          {idx > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}
          {item.onClick ? (
            <button onClick={item.onClick} className="text-blue-600 dark:text-blue-400 hover:underline">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </button>
          ) : (
            <span className="text-gray-700 dark:text-gray-200 font-semibold">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

type ViewMode = 'phases' | 'weeks' | 'days';

export default function PlanPageEnhanced() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  
  // فحص البيانات الأساسية
  if (!plan || !Array.isArray(plan) || plan.length === 0) {
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('loading')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loadingPlanData')}
          </p>
        </div>
      </PageLayout>
    );
  }

  // فحص phaseService
  if (!phaseService) {
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('error')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('serviceNotAvailable')}
          </p>
        </div>
      </PageLayout>
    );
  }
  const [viewMode, setViewMode] = useState<ViewMode>('phases');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Safe plan data
  const safePlan = plan || [];

  // حساب الأسابيع المنجزة
  const completedWeeks = useMemo(() => {
    if (!safePlan || !progress) return [];
    
    return safePlan
      .filter(week => {
        if (!week || !week.week) return false;
        const weekProgress = progress.filter(p => p.weekId === week.week.toString());
        const totalTasks = week.days?.reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
        const completedTasks = weekProgress.filter(p => p.done).length;
        return totalTasks > 0 && completedTasks === totalTasks;
      })
      .map(week => week.week)
      .filter(Boolean);
  }, [safePlan, progress]);

  // إجمالي التقدم
  const totalWeeks = safePlan?.length || 0;
  const completedCount = completedWeeks?.length || 0;
  const progressPercentage = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

  // المرحلة الحالية
  const currentPhase = phaseService?.getCurrentPhase?.(completedWeeks) || null;

  // الأسابيع للمرحلة المختارة
  const phaseWeeks = selectedPhaseId && phaseService?.getWeeksByPhase ? phaseService.getWeeksByPhase(selectedPhaseId) : [];

  // التنقل بين المستويات
  const handlePhaseClick = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
    setViewMode('weeks');
    setSelectedWeek(null);
    setSelectedDayIndex(null);
  };
  const handleBackToPhases = () => {
    setViewMode('phases');
    setSelectedPhaseId(null);
    setSelectedWeek(null);
    setSelectedDayIndex(null);
  };
  const handleWeekClick = (weekNumber: number) => {
    const week = phaseWeeks.find(w => w.week === weekNumber);
    setSelectedWeek(week);
    setViewMode('days');
    setSelectedDayIndex(null);
  };
  const handleBackToWeeks = () => {
    setViewMode('weeks');
    setSelectedWeek(null);
    setSelectedDayIndex(null);
  };
  const handleDayClick = (dayIdx: number) => {
    setSelectedDayIndex(dayIdx);
  };
  const handleBackToDays = () => {
    setSelectedDayIndex(null);
  };

  // Breadcrumbs items
  const breadcrumbs = [];
  breadcrumbs.push({ label: t('plan'), icon: Layers, onClick: handleBackToPhases });
  if (selectedPhaseId && phaseService?.getPhaseById) {
    const phase = phaseService.getPhaseById(selectedPhaseId);
    breadcrumbs.push({ label: phase?.title?.[lang] || t('phase'), icon: Layers, onClick: handleBackToPhases });
  }
  if (selectedWeek) {
    breadcrumbs.push({ label: (selectedWeek.title?.[lang] || t('week') + ' ' + selectedWeek.week), icon: Calendar, onClick: handleBackToWeeks });
  }
  if (selectedDayIndex !== null && selectedWeek) {
    const day = selectedWeek.days?.[selectedDayIndex];
    breadcrumbs.push({ label: day?.day?.[lang] || t('day'), icon: Target });
  }

  // عرض اليوم (DayView)
  if (selectedDayIndex !== null && selectedWeek) {
    const day = selectedWeek.days?.[selectedDayIndex];
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <Breadcrumbs items={breadcrumbs} onNavigate={() => {}} />
        <Card className="mb-6">
          <div className="p-4 flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={handleBackToDays} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {day?.day?.[lang] || t('day')}
            </h2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{day?.title?.[lang]}</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{day?.objective?.[lang]}</p>
            {/* المهام */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">{t('tasks')}</h4>
              <ul className="list-disc pl-6">
                {(day?.tasks || []).map((task, idx) => (
                  <li key={idx} className="mb-1">
                    <span className="font-medium">{task.title?.[lang] || task.title?.en}</span> - {task.type}
                  </li>
                ))}
              </ul>
            </div>
            {/* الموارد */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">{t('resources')}</h4>
              <ul className="list-disc pl-6">
                {(day?.resources || []).map((res, idx) => (
                  <li key={idx} className="mb-1">
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">{res.title}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* ملاحظات */}
            <div>
              <h4 className="font-semibold mb-2">{t('notes')}</h4>
              <p className="text-gray-700 dark:text-gray-200 text-sm">{day?.notes_prompt?.[lang]}</p>
            </div>
          </div>
        </Card>
      </PageLayout>
    );
  }

  // عرض أيام الأسبوع
  if (viewMode === 'days' && selectedWeek) {
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <Breadcrumbs items={breadcrumbs} onNavigate={() => {}} />
        <Card className="mb-6">
          <div className="p-4 flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={handleBackToWeeks} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedWeek.title?.[lang] || t('week') + ' ' + selectedWeek.week}
            </h2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('days')}</h3>
            <ul className="space-y-3">
              {(selectedWeek.days || []).map((day, idx) => (
                <li key={idx}>
                  <button
                    className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                    onClick={() => handleDayClick(idx)}
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{day.day?.[lang] || t('day')}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{day.title?.[lang]}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </PageLayout>
    );
  }

  // عرض أسابيع المرحلة
  if (viewMode === 'weeks' && selectedPhaseId) {
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <Breadcrumbs items={breadcrumbs} onNavigate={() => {}} />
        <Card className="mb-6">
          <div className="p-4 flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={handleBackToPhases} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {phaseService?.getPhaseById?.(selectedPhaseId)?.title?.[lang] || t('phase')}
            </h2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('weeks')}</h3>
            <ul className="space-y-3">
              {phaseWeeks.map((week, idx) => (
                <li key={week.week}>
                  <button
                    className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                    onClick={() => handleWeekClick(week.week)}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{week.title?.[lang] || t('week') + ' ' + week.week}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{week.objective?.[lang]}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </PageLayout>
    );
  }

  // عرض قائمة المراحل
  return (
    <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
      <Breadcrumbs items={breadcrumbs} onNavigate={() => {}} />
      {/* Progress Overview */}
      <motion.div {...animations.fadeIn} className="mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('overallProgress')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {completedCount} {t('of')} {totalWeeks} {t('weeksCompleted')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {progressPercentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('complete')}
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('progress')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedCount}/{totalWeeks} {t('weeks')}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-3 bg-blue-600 rounded-full"
                />
              </div>
            </div>
            {/* Current Phase Indicator */}
            {currentPhase && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      {lang === 'ar' ? 'المرحلة الحالية' : 'Current Phase'}: {currentPhase.title?.[lang]}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {phaseService?.getPhaseStats?.(currentPhase.id, completedWeeks)?.remainingWeeks || 0} {lang === 'ar' ? 'أسبوع متبقي' : 'weeks remaining'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      {/* Phases List */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
        <div className="flex items-center space-x-3 mb-6">
          <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {lang === 'ar' ? 'مراحل التعلم' : 'Learning Phases'}
          </h2>
        </div>
        <PhasesList
          completedWeeks={completedWeeks}
          onPhaseClick={handlePhaseClick}
          lang={lang}
        />
      </motion.div>
    </PageLayout>
  );
}