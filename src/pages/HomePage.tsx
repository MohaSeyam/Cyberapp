// Home Page - Unified Design
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Target, Users, BookOpen, Calendar,
  TrendingUp, Award, ArrowRight, Play,
  CheckCircle, Clock, Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import PhaseCard from '../components/ui/PhaseCard';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';

export default function HomePage() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

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

  // Get unique phases with safety check
  const phases = Array.from(new Set(safePlan.map(week => week.phase))).sort();

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

  const quickActions = [
    {
      icon: BookOpen,
      title: t('startLearning'),
      subtitle: t('beginYourJourney'),
      variant: 'primary' as const,
      action: () => console.log('Start Learning')
    },
    {
      icon: Users,
      title: t('community'),
      subtitle: t('joinDiscord'),
      variant: 'outline' as const,
      action: () => console.log('Join Community')
    },
    {
      icon: Target,
      title: t('trackProgress'),
      subtitle: t('viewAnalytics'),
      variant: 'outline' as const,
      action: () => console.log('Track Progress')
    }
  ];

  return (
    <PageLayout
      title={lang === 'ar' ? 'رحلة الأمن السيبراني' : 'Cyber Security Journey'}
      subtitle={lang === 'ar'
        ? 'رحلة شاملة في عالم الأمن السيبراني - من الأساسيات إلى الاحتراف'
        : 'A comprehensive journey in cybersecurity - from basics to professional'
      }
      header={
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {lang === 'ar' ? 'رحلة الأمن السيبراني' : 'Cyber Security Journey'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {lang === 'ar'
                ? 'رحلة شاملة في عالم الأمن السيبراني - من الأساسيات إلى الاحتراف'
                : 'A comprehensive journey in cybersecurity - from basics to professional'
              }
            </p>
          </div>
        </div>
      }
    >
      {/* Statistics Cards */}
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

      {/* Progress Section */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card
          title={t('currentProgress')}
          subtitle={`${t('week')} ${currentWeek} - ${completionRate}% ${t('completed')}`}
        >
          <div className="space-y-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
              />
            </div>

            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{completedTasks} {t('completed')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{totalTasks} {t('total')}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Learning Phases */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
              {...animations.stagger(0.4 + index * 0.1)}
            >
              <PhaseCard
                phase={phase}
                weeks={safePlan.filter(week => week.phase === phase)}
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
        {...animations.fadeIn}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('quickActions')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              {...animations.stagger(0.5 + index * 0.1)}
            >
              <Card
                variant="elevated"
                hover
                onClick={action.action}
                className="h-32 flex flex-col justify-center items-center text-center"
              >
                <action.icon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.subtitle}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card
          title={t('recentActivity')}
          subtitle={t('yourLatestProgress')}
        >
          <div className="space-y-4">
            {completedTasks > 0 ? (
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  {t('completedTask')}: {t('cybersecurityBasics')}
                </span>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noActivityYet')}</p>
                <p className="text-sm">{t('startYourJourney')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}