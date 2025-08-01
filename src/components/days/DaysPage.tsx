import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Sun, Moon, Coffee, Zap, Heart, Brain
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useWeekPhaseData } from '../../hooks/useWeekPhaseData';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TaskCard from '../ui/TaskCard';
import { animations } from '../../constants/theme';

// Day icons mapping
const dayIcons = {
  sat: Sun,
  sun: Sun,
  mon: Coffee,
  tue: Zap,
  wed: Heart,
  thu: Brain,
  fri: Star
};

export default function DaysPage() {
  const { weekId = "1" } = useParams();
  const navigate = useNavigate();
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  const { getWeekData } = useWeekPhaseData();
  
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Get week data
  const weekNumber = parseInt(weekId);
  const weekData = getWeekData(weekNumber);
  const week = safePlan.find(w => w.week === weekNumber);

  // Calculate day completion
  const getDayCompletion = (dayIndex: number) => {
    if (!week || !week.days || !week.days[dayIndex]) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const day = week.days[dayIndex];
    const totalTasks = day.tasks?.length || 0;
    const dayProgress = safeProgress.filter(p => 
      p.weekId === weekNumber.toString() && p.dayKey === day.key
    );
    const completedTasks = dayProgress.filter(p => p.done).length;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Calculate week completion
  const getWeekCompletion = () => {
    if (!week || !week.days) return { completed: 0, total: 0, percentage: 0 };

    const totalTasks = week.days.reduce((sum, day) => sum + (day.tasks?.length || 0), 0);
    const weekProgress = safeProgress.filter(p => p.weekId === weekNumber.toString());
    const completedTasks = weekProgress.filter(p => p.done).length;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Navigation functions
  const goToNextDay = () => {
    if (week && week.days && selectedDayIndex < week.days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const goToPreviousDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const selectDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  };

  const goToDayView = (dayIndex: number) => {
    navigate(`/day/${weekId}/${dayIndex}`);
  };

  if (!week || !weekData) {
    return (
      <PageLayout title={t('days')} subtitle={t('dailyPlan')} showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('loading')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loadingDayData')}
          </p>
        </div>
      </PageLayout>
    );
  }

  const currentDay = week.days?.[selectedDayIndex];
  const weekCompletion = getWeekCompletion();

  return (
    <PageLayout 
      title={`${t('week')} ${weekNumber} - ${t('days')}`} 
      subtitle={weekData.weekData.title[lang]} 
      showHeader={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Week Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('week')} {weekNumber}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {weekData.weekData.title[lang]}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('weekObjective')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weekData.weekData.objective[lang]}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('weekProgress')}
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {weekCompletion.percentage}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {weekCompletion.completed} / {weekCompletion.total} {t('tasks')}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('phase')} {weekData.phase}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weekData.phaseData.title[lang]}
              </p>
            </div>
          </div>
        </Card>

        {/* Day Navigation */}
        {currentDay && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft />}
                  onClick={goToPreviousDay}
                  disabled={selectedDayIndex <= 0}
                />
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {dayIcons[currentDay.key as keyof typeof dayIcons] && 
                      React.createElement(dayIcons[currentDay.key as keyof typeof dayIcons], {
                        className: "w-6 h-6 text-blue-600 dark:text-blue-400 mr-2"
                      })
                    }
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentDay.day?.[lang] || 'Unknown Day'}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentDay.topic?.[lang] || 'No topic'}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={selectedDayIndex >= (week.days?.length || 0) - 1}
                />
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => goToDayView(selectedDayIndex)}
              >
                {t('viewDay')}
              </Button>
            </div>

            {/* Day Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('dayTopic')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentDay.topic?.[lang] || 'No topic'}
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t('dayProgress')}
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {getDayCompletion(selectedDayIndex).percentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {getDayCompletion(selectedDayIndex).completed} / {getDayCompletion(selectedDayIndex).total} {t('tasks')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Days List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('weekDays')}
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {week.days?.length || 0} {t('days')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {week.days?.map((day, index) => {
              const dayCompletion = getDayCompletion(index);
              const isSelected = index === selectedDayIndex;
              const DayIcon = dayIcons[day.key as keyof typeof dayIcons] || Calendar;
              
              return (
                <motion.div
                  key={day.key}
                  {...animations.stagger(index * 0.1)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => selectDay(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <DayIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {day.day?.[lang]}
                      </h4>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dayCompletion.percentage === 100
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : dayCompletion.percentage > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {dayCompletion.percentage}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {day.topic?.[lang] || 'No topic'}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            dayCompletion.percentage === 100
                              ? 'bg-green-500'
                              : dayCompletion.percentage > 0
                              ? 'bg-yellow-500'
                              : 'bg-gray-400 dark:bg-gray-600'
                          }`}
                          style={{ width: `${dayCompletion.percentage}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{dayCompletion.completed}/{dayCompletion.total} {t('tasks')}</span>
                        <span>{day.tasks?.length || 0} {t('total')}</span>
                      </div>
                    </div>
                  </div>

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

        {/* Current Day Tasks Preview */}
        {currentDay && currentDay.tasks && currentDay.tasks.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('todayTasks')} - {currentDay.day?.[lang]}
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => goToDayView(selectedDayIndex)}
              >
                {t('viewAllTasks')}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentDay.tasks.slice(0, 4).map((task, index) => (
                <motion.div key={task.id} {...animations.stagger(index * 0.1)}>
                  <TaskCard 
                    task={task} 
                    weekId={weekNumber} 
                    dayKey={currentDay.key} 
                    variant="compact" 
                  />
                </motion.div>
              ))}
            </div>

            {currentDay.tasks.length > 4 && (
              <div className="text-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToDayView(selectedDayIndex)}
                >
                  {t('viewAllTasks')} ({currentDay.tasks.length})
                </Button>
              </div>
            )}
          </Card>
        )}
      </motion.div>
    </PageLayout>
  );
}