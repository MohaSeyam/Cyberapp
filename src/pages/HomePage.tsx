// Home Page - Unified Design
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Target, Users, BookOpen, Calendar,
  TrendingUp, Award, ArrowRight, Play,
  CheckCircle, Clock, Star, FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import PhaseCard from '../components/ui/PhaseCard';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';

export default function HomePage() {
  const { plan, progress } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  // Comprehensive safety checks for data
  const safePlan = Array.isArray(plan) ? plan : [];
  const safeProgress = Array.isArray(progress) ? progress : [];

  // Calculate statistics with comprehensive safety checks
  const totalWeeks = 50; // Total weeks from phases.json
  const totalTasks = safePlan.reduce((total, week) => {
    if (!week || !Array.isArray(week.days)) return total;
    return total + week.days.filter(day => day.key !== 'fri').reduce((dayTotal, day) => {
      if (!day || !Array.isArray(day.tasks)) return dayTotal;
      return dayTotal + day.tasks.length;
    }, 0);
  }, 0);
  
  const completedTasks = safeProgress.filter(p => p && p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
      action: () => navigate('/phases')
    },
    {
      icon: TrendingUp,
      title: t('viewProgress'),
      subtitle: t('trackYourProgress'),
      variant: 'secondary' as const,
      action: () => navigate('/progress')
    },
    {
      icon: FileText,
      title: t('manageNotes'),
      subtitle: t('organizeYourNotes'),
      variant: 'outline' as const,
      action: () => navigate('/notes')
    },
    {
      icon: BookOpen,
      title: t('learningJournal'),
      subtitle: t('reflectOnLearning'),
      variant: 'outline' as const,
      action: () => navigate('/journal')
    }
  ];



  return (
    <PageLayout 
      title={safeT('welcome')}
      subtitle={safeT('cyberSecurityLearning')}
      showBottomBar={true}
    >


      {/* Progress Section */}
      <motion.div
        {...animations.fadeIn}
        className="mb-8"
      >
        <Card
          title={t('currentProgress')}
          subtitle={`${t('week')} ${currentWeek} - ${completionRate}% ${t('completed')}`}
          onClick={() => navigate('/progress')}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
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

      {/* Statistics Cards */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            {...animations.stagger(index * 0.1)}
          >
            <Card
              variant="elevated"
              className="text-center cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => {
                if (stat.label === t('totalTasks') || stat.label === t('completedTasks')) {
                  navigate('/progress');
                } else if (stat.label === t('totalWeeks')) {
                  navigate('/day/1/0');
                }
              }}
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

      {/* Quick Actions */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
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
                className="h-32 flex flex-col justify-center items-center text-center cursor-pointer"
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
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card
          title={t('recentActivity')}
          subtitle={t('yourLatestProgress')}
          onClick={() => navigate('/progress')}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
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
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => navigate('/day/1/0')}
                >
                  {t('startLearning')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}