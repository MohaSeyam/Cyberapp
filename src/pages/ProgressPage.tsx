// Progress Page - Unified Design
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Target, Calendar, Award, Clock, CheckCircle,
  BarChart3, PieChart, Activity, Star, Trophy, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { animations } from '../constants/theme';

export default function ProgressPage() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Calculate statistics with safety checks
  const totalWeeks = safePlan.length;
  const totalTasks = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
  );
  const completedTasks = safeProgress.filter(p => p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate total duration with safety checks
  const totalDuration = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => 
      dayTotal + (day.tasks || []).reduce((taskTotal, task) => taskTotal + (task.duration || 0), 0), 0
    ), 0
  );
  
  const completedDuration = safeProgress.reduce((total, p) => {
    const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
    return total + (task?.duration || 0);
  }, 0);

  // Get current week progress with safety checks
  const currentWeek = safePlan.find(w => w.week === 1);
  const currentWeekTasks = currentWeek?.days?.reduce((total, day) => total + (day.tasks || []).length, 0) || 0;
  const currentWeekCompleted = safeProgress.filter(p => 
    currentWeek?.days?.some(day => (day.tasks || []).some(task => task.id === p.taskId))
  ).length;

  // Get phase statistics with safety checks
  const phases = Array.from(new Set(safePlan.map(week => week.phase))).sort();
  const phaseStats = phases.map(phase => {
    const phaseWeeks = safePlan.filter(week => week.phase === phase);
    const phaseTasks = phaseWeeks.reduce((total, week) => 
      total + (week.days || []).reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
    );
    const phaseCompleted = safeProgress.filter(p => 
      phaseWeeks.some(week => 
        (week.days || []).some(day => (day.tasks || []).some(task => task.id === p.taskId))
      )
    ).length;
    
    return {
      phase,
      totalTasks: phaseTasks,
      completedTasks: phaseCompleted,
      completionRate: phaseTasks > 0 ? Math.round((phaseCompleted / phaseTasks) * 100) : 0
    };
  });

  // Get recent activity with safety checks
  const recentProgress = safeProgress
    .filter(p => p.done)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  const stats = [
    {
      icon: Target,
      label: t('totalTasks'),
      value: totalTasks,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: t('completedTasks'),
      value: completedTasks,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: t('completionRate'),
      value: `${completionRate}%`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Clock,
      label: t('totalHours'),
      value: Math.round(totalDuration / 60),
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const achievements = [
    {
      icon: Star,
      title: t('firstTask'),
      description: t('completedFirstTask'),
      unlocked: completedTasks >= 1,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      icon: Trophy,
      title: t('weekWarrior'),
      description: t('completedWeek'),
      unlocked: currentWeekCompleted >= currentWeekTasks,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Zap,
      title: t('speedLearner'),
      description: t('completed5Tasks'),
      unlocked: completedTasks >= 5,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <PageLayout
      title={t('progress')}
      subtitle={t('trackYourLearningJourney')}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('progress')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('trackYourLearningJourney')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('overallProgress')}
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Main Statistics */}
      <motion.div
        {...animations.fadeIn}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            {...animations.stagger(index * 0.1)}
          >
            <Card
              variant="elevated"
              className="text-center"
            >
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full ${stat.bg} mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card
          title={t('progressOverview')}
          subtitle={t('yourLearningProgress')}
        >
          <div className="space-y-6">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('overallProgress')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedTasks} / {totalTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                />
              </div>
            </div>

            {/* Current Week Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('currentWeek')} ({t('week')} 1)
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentWeekCompleted} / {currentWeekTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentWeekTasks > 0 ? Math.round((currentWeekCompleted / currentWeekTasks) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                />
              </div>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('timeSpent')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(completedDuration / 60)} / {Math.round(totalDuration / 60)} {t('hours')}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalDuration > 0 ? Math.round((completedDuration / totalDuration) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Phase Progress */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card
          title={t('phaseProgress')}
          subtitle={t('progressByPhase')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phaseStats.map((phase, index) => (
              <motion.div
                key={phase.phase}
                {...animations.stagger(index * 0.1)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {t('phase')} {phase.phase}
                    </h4>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {phase.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.completionRate}%` }}
                      transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{phase.completedTasks} {t('completed')}</span>
                    <span>{phase.totalTasks} {t('total')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card
          title={t('achievements')}
          subtitle={t('unlockYourAchievements')}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                {...animations.stagger(index * 0.1)}
              >
                <div className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked 
                    ? `${achievement.bg} border-current ${achievement.color}` 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked ? 'bg-white dark:bg-gray-900' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.unlocked ? achievement.color : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.5 }}
      >
        <Card
          title={t('recentActivity')}
          subtitle={t('yourLatestProgress')}
        >
          <div className="space-y-4">
            {recentProgress.length > 0 ? (
              recentProgress.map((item, index) => {
                const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === item.taskId);
                return (
                  <motion.div
                    key={item.id}
                    {...animations.stagger(index * 0.05)}
                    className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {task?.title?.[lang] || t('completedTask')}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {new Date(item.updatedAt || 0).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noRecentActivity')}</p>
                <p className="text-sm">{t('completeTasksToSeeActivity')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}