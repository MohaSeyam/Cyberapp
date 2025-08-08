import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Home, ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useWeekPhaseData } from '../../hooks/useWeekPhaseData';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';

// Breadcrumbs component
function Breadcrumbs({ items }: { items: Array<{ label: string; onClick?: () => void; icon?: any }> }) {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Home className="w-4 h-4 mr-1" />
        الرئيسية
      </button>
      
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
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

export default function WeeksPage() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  const { getWeekData, getPhaseWeeks, getPhaseProgress, getCurrentPhase } = useWeekPhaseData();
  const navigate = useNavigate();
  
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

    const totalTasks = week.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => p.weekId?.toString() === (weekNumber?.toString() || ''));
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

  const goToDays = (weekNumber: number) => {
    navigate(`/days/${weekNumber}`);
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

  const breadcrumbs = [
    { label: t('plan'), icon: Calendar },
    { label: `${t('week')} ${selectedWeek}`, icon: Target }
  ];

  return (
    <PageLayout 
      title={`${t('week')} ${selectedWeek}`} 
      subtitle={currentWeekData.weekData.title[lang]} 
      showHeader={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />
        
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
                <p className="text-gray-600 dark:text-gray-300">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('هل تريد إصلاح الأسابيع المفقودة؟')) {
                    useApp().fixMissingWeeks();
                  }
                }}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('fixMissingWeeks')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Week Progress */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('weekObjective')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentWeekData.weekData.objective[lang]}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('weekProgress')}
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getWeekCompletion(selectedWeek).percentage}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {getWeekCompletion(selectedWeek).completed} / {getWeekCompletion(selectedWeek).total} {t('tasks')}
              </p>
            </div>
          </div>
        </Card>

        {/* Phase Information */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPhase?.title[lang] || `${t('phase')} ${currentWeekData.phase}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentPhase?.focus[lang] || t('noPhaseDescription')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {getPhaseProgress(currentWeekData.phase)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                {t('phaseProgress')}
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${getPhaseProgress(currentWeekData.phase)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{currentPhaseWeeks.length} {t('weeksInPhase')}</span>
            <span>{currentPhaseWeeks.filter(w => getWeekCompletion(w.week).percentage === 100).length} {t('completed')}</span>
          </div>
        </Card>

        {/* Weeks List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {viewMode === 'all' ? t('allWeeks') : t('phaseWeeks')}
          </h3>
          
          <div className="space-y-3">
            {(viewMode === 'all' ? safePlan : currentPhaseWeeks).map((week) => {
              const completion = getWeekCompletion(week.week);
              const isCurrentWeek = week.week === selectedWeek;
              
              return (
                <motion.div
                  key={week.week}
                  {...animations.stagger(week.week * 0.1)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    isCurrentWeek
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                  onClick={() => selectWeek(week.week)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        completion.percentage === 100
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {completion.percentage === 100 ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {t('week')} {week.week}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {week.title[lang]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {completion.percentage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {completion.completed}/{completion.total} {t('tasks')}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToDays(week.week);
                        }}
                      >
                        {t('viewDays')}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completion.percentage === 100
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}