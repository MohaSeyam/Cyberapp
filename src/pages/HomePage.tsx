// Home Page - Modern Blue Design
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Target, Users, BookOpen, Calendar, 
  TrendingUp, Award, ArrowRight, Play, Pause 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PhaseCard from '../components/ui/PhaseCard';
import Button from '../components/ui/Button';
import type { Week } from '../types';

export default function HomePage() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  // Calculate statistics
  const totalWeeks = plan.length;
  const totalTasks = plan.reduce((total, week) => 
    total + week.days.reduce((dayTotal, day) => dayTotal + day.tasks.length, 0), 0
  );
  const completedTasks = progress.filter(p => p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get unique phases
  const phases = Array.from(new Set(plan.map(week => week.phase))).sort();

  // Get current week (you can implement your own logic)
  const currentWeek = 1; // This should be calculated based on user progress

  const stats = [
    {
      icon: Calendar,
      label: t('totalWeeks'),
      value: totalWeeks,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Target,
      label: t('totalTasks'),
      value: totalTasks,
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
      icon: Award,
      label: t('completedTasks'),
      value: completedTasks,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-6 py-16 sm:px-8 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Shield className="w-12 h-12 mr-3" />
                <h1 className="text-4xl font-bold">Cyber Security Journey</h1>
              </div>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                {lang === 'ar' 
                  ? 'رحلة شاملة في عالم الأمن السيبراني - من الأساسيات إلى الاحتراف'
                  : 'A comprehensive journey in cybersecurity - from basics to professional'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-12 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className={`${stat.bg} p-6 rounded-xl border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color} bg-white dark:bg-gray-800`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Current Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-12 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('currentProgress')}
              </h2>
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('week')} {currentWeek}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
              />
            </div>
            
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{completedTasks} {t('completed')}</span>
              <span>{totalTasks} {t('total')}</span>
            </div>
          </motion.div>

          {/* Phases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('learningPhases')}
              </h2>
              <Button
                variant="outline"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {t('viewAll')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phases.map((phase, index) => (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                >
                  <PhaseCard
                    phase={phase}
                    weeks={plan.filter(week => week.phase === phase)}
                    isActive={selectedPhase === phase}
                    onClick={() => setSelectedPhase(phase)}
                    variant="detailed"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('quickActions')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                variant="primary"
                size="lg"
                className="h-20 flex-col space-y-2"
                icon={<BookOpen className="w-8 h-8" />}
              >
                <span className="text-lg font-semibold">{t('startLearning')}</span>
                <span className="text-sm opacity-90">{t('beginYourJourney')}</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col space-y-2"
                icon={<Users className="w-8 h-8" />}
              >
                <span className="text-lg font-semibold">{t('community')}</span>
                <span className="text-sm opacity-90">{t('joinDiscord')}</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col space-y-2"
                icon={<Target className="w-8 h-8" />}
              >
                <span className="text-lg font-semibold">{t('trackProgress')}</span>
                <span className="text-sm opacity-90">{t('viewAnalytics')}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}