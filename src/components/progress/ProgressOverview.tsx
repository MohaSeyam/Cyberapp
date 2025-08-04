import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Flame, Trophy, BarChart3, TrendingUp, Award, Star, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import OverallProgressCard from './OverallProgressCard';
import { animations } from '../../constants/theme';

export default function ProgressOverview() {
  const { plan, progress, appState } = useApp();
  const { language } = useLocalization();

  const stats = useMemo(() => {
    const totalTasks = plan.flatMap(week => week.days.flatMap(day => day.tasks)).length;
    const completedTasks = progress.filter(p => p.done).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate streaks
    let current = 0, longest = 0, streak = 0;
    let lastDate = null;
    const sorted = [...progress.filter(p => p.done)].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i].dayKey);
      if (lastDate && (date - lastDate) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
      } else {
        streak = 1;
      }
      if (streak > longest) longest = streak;
      lastDate = date;
    }
    current = streak;

    // Calculate time spent
    const totalTime = progress.reduce((acc, p) => acc + (p.timeSpent || 0), 0);
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      currentStreak: current,
      longestStreak: longest,
      totalTime,
      hours,
      minutes
    };
  }, [plan, progress]);

  const safeT = (key: string) => {
    const translations = {
      progress: { ar: 'التقدم', en: 'Progress' },
      trackYourLearning: { ar: 'تتبع رحلتك التعليمية', en: 'Track Your Learning Journey' },
      completionRate: { ar: 'معدل الإكمال', en: 'Completion Rate' },
      completionRateDesc: { ar: 'نسبة المهام المكتملة', en: 'Percentage of completed tasks' },
      completedTasks: { ar: 'المهام المكتملة', en: 'Completed Tasks' },
      completedTasksDesc: { ar: 'عدد المهام المنتهية', en: 'Number of finished tasks' },
      timeSpent: { ar: 'الوقت المستغرق', en: 'Time Spent' },
      timeSpentDesc: { ar: 'الوقت المستغرق في التعلم', en: 'Time spent learning' },
      currentStreak: { ar: 'المسار الحالي', en: 'Current Streak' },
      currentStreakDesc: { ar: 'أيام التعلم المتتالية', en: 'Consecutive learning days' }
    };
    return translations[key]?.[language] || key;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {safeT('progress')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {safeT('trackYourLearning')}
        </p>
      </motion.div>

      {/* Overall Progress Card */}
      <OverallProgressCard />

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {safeT('completionRate')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completionRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {safeT('completionRateDesc')}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {safeT('completedTasks')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {safeT('completedTasksDesc')}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {safeT('timeSpent')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.hours}h {stats.minutes}m
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {safeT('timeSpentDesc')}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {safeT('currentStreak')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.currentStreak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {safeT('currentStreakDesc')}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}