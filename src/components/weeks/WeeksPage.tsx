import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useWeekPhaseData } from '../../hooks/useWeekPhaseData';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';

export default function WeeksPage() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  const { getWeekData, getPhaseWeeks, getPhaseProgress, getCurrentPhase } = useWeekPhaseData();
  
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'all' | 'phase'>('all');

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Get current week data
  const currentWeekData = getWeekData(selectedWeek);
  const currentPhase = getCurrentPhase();

  // Calculate week completion
  const getWeekCompletion = (weekNumber: number) => {
    const week = safePlan.find(w => w.week === weekNumber);
    if (!week) return { completed: 0, total: 0, percentage: 0 };

    const totalTasks = week.days?.reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => p.weekId === (weekNumber?.toString() || ''));
    const completedTasks = weekProgress.filter(p => p.done).length;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Get all weeks for current phase
  const currentPhaseWeeks = useMemo(() => {
    if (!currentWeekData) return [];
    return getPhaseWeeks(currentWeekData.phase);
  }, [currentWeekData, getPhaseWeeks]);

  // Navigation functions
  const goToNextWeek = () => {
    if (selectedWeek < 50) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  const goToPreviousWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const selectWeek = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
  };

  if (!currentWeekData) {
    return (
      <PageLayout title={t('weeks')} subtitle={t('weeklyPlan')} showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('loading')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loadingWeekData')}
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={`${t('week')} ${selectedWeek}`} 
      subtitle={currentWeekData.weekData.title[lang]} 
      showHeader={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Week Navigation */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft />}
                onClick={goToPreviousWeek}
                disabled={selectedWeek <= 1}
              />
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('week')} {selectedWeek}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentWeekData.weekData.title[lang]}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight />}
                onClick={goToNextWeek}
                disabled={selectedWeek >= 50}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('all')}
              >
                {t('allWeeks')}
              </Button>
              <Button
                variant={viewMode === 'phase' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('phase')}
              >
                {t('phaseWeeks')}
              </Button>
            </div>
          </div>

          {/* Week Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('weekObjective')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentWeekData.weekData.objective[lang]}
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('completion')}
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getWeekCompletion(selectedWeek).percentage}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {getWeekCompletion(selectedWeek).completed} / {getWeekCompletion(selectedWeek).total} {t('tasks')}
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('phase')} {currentWeekData.phase}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentWeekData.phaseData.title[lang]}
              </p>
            </div>
          </div>
        </Card>

        {/* Phase Information */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {currentWeekData.phaseData.title[lang]}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentWeekData.phaseData.focus[lang]}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('phaseObjectives')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentWeekData.phaseData.mainContent[lang]}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('duration')}: {currentWeekData.phaseData.duration}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('difficulty')}: {currentWeekData.phaseData.difficulty}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('phaseProgress')}
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">{t('progress')}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {getPhaseProgress(currentWeekData.phase)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getPhaseProgress(currentWeekData.phase)}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {currentPhaseWeeks.length}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">{t('totalWeeks')}</p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {currentPhaseWeeks.filter(week => getWeekCompletion(week.week).percentage === 100).length}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">{t('completedWeeks')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Weeks List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {viewMode === 'all' ? t('allWeeks') : `${t('phase')} ${currentWeekData.phase} ${t('weeks')}`}
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {viewMode === 'all' ? safePlan.length : currentPhaseWeeks.length} {t('weeks')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(viewMode === 'all' ? safePlan : currentPhaseWeeks).map((week, index) => {
              const weekCompletion = getWeekCompletion(week.week);
              const isSelected = week.week === selectedWeek;
              const weekData = getWeekData(week.week);
              
              return (
                <motion.div
                  key={week.week}
                  {...animations.stagger(index * 0.1)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => selectWeek(week.week)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {t('week')} {week.week}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      weekCompletion.percentage === 100
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : weekCompletion.percentage > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {weekCompletion.percentage}%
                    </span>
                  </div>

                  {weekData && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {weekData.weekData.title[lang]}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              weekCompletion.percentage === 100
                                ? 'bg-green-500'
                                : weekCompletion.percentage > 0
                                ? 'bg-yellow-500'
                                : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                            style={{ width: `${weekCompletion.percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{weekCompletion.completed}/{weekCompletion.total} {t('tasks')}</span>
                          <span>{weekData.phaseData.title[lang]}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}