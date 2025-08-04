// Enhanced Home Page with Better RTL Support
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Target, Users, BookOpen, Calendar,
  TrendingUp, Award, ArrowRight, Play,
  CheckCircle, Clock, Star, FileText,
  Zap, Globe, Bookmark, Settings,
  BarChart3, Lightbulb, Rocket, Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import geminiLogo from '../assets/Gemini_Generated_Image_26mado26mado26ma.png';

export default function HomePage() {
  const { plan, progress } = useApp();
  const { t, language } = useLocalization();
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
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Target,
      label: t('totalTasks'),
      value: totalTasks,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      label: t('completionRate'),
      value: `${completionRate}%`,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Award,
      label: t('completedTasks'),
      value: completedTasks,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const quickActions = [
    {
      icon: Rocket,
      title: t('startLearning'),
      subtitle: t('beginYourJourney'),
      variant: 'primary' as const,
      action: () => navigate('/phases'),
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: BarChart3,
      title: t('viewProgress'),
      subtitle: t('trackYourProgress'),
      variant: 'secondary' as const,
      action: () => navigate('/progress'),
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: FileText,
      title: t('manageNotes'),
      subtitle: t('organizeYourNotes'),
      variant: 'outline' as const,
      action: () => navigate('/notes'),
      gradient: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: BookOpen,
      title: t('learningJournal'),
      subtitle: t('reflectOnLearning'),
      variant: 'outline' as const,
      action: () => navigate('/journal'),
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'الأمان السيبراني',
      description: 'تعلم أساسيات الأمان السيبراني وحماية الأنظمة',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Globe,
      title: 'الشبكات العالمية',
      description: 'فهم الشبكات والاتصالات العالمية',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Zap,
      title: 'التقنيات المتقدمة',
      description: 'استكشاف أحدث التقنيات في مجال الأمن السيبراني',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Heart,
      title: 'التعلم المستمر',
      description: 'نهج التعلم المستمر والتطوير المهني',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <PageLayout 
      title={safeT('welcome')}
      subtitle={safeT('cyberSecurityLearning')}
      showBottomBar={true}
    >
      {/* Hero Section with Enhanced RTL Support */}
      <motion.div
        {...animations.fadeIn}
        className="mb-12 text-center"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            className="relative w-40 h-40 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            <img 
              src={geminiLogo} 
              alt="Gemini Logo" 
              className="relative w-40 h-40 object-contain opacity-90"
              style={{ backgroundColor: 'transparent' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<svg class="w-40 h-40 text-blue-600 dark:text-blue-400 opacity-90" fill="currentColor" viewBox="0 0 24 24" style="background-color: transparent;"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>';
                }
              }}
            />
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
          style={{ 
            fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit',
            lineHeight: language === 'ar' ? '1.4' : '1.2'
          }}
        >
          CyberPlan
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
          style={{ 
            fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit',
            lineHeight: language === 'ar' ? '1.8' : '1.6'
          }}
        >
          {safeT('cyberSecurityLearning')}
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/phases')}
            className="text-lg px-8 py-4"
          >
            <Rocket className="w-5 h-5 ml-2" />
            {t('startLearning')}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/progress')}
            className="text-lg px-8 py-4"
          >
            <BarChart3 className="w-5 h-5 ml-2" />
            {t('viewProgress')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Enhanced Progress Section */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card
          title={t('currentProgress')}
          subtitle={`${t('week')} ${currentWeek} - ${completionRate}% ${t('completed')}`}
          onClick={() => navigate('/progress')}
          className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="space-y-6">
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-4 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </motion.div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">{completedTasks} {t('completed')}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{totalTasks} {t('total')}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Statistics Cards */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            {...animations.stagger(index * 0.1)}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              variant="elevated"
              className="text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
              onClick={() => {
                if (stat.label === t('totalTasks') || stat.label === t('completedTasks')) {
                  navigate('/progress');
                } else if (stat.label === t('totalWeeks')) {
                  navigate('/day/1/0');
                }
              }}
            >
              <div className="flex flex-col items-center p-6">
                <div className={`p-4 rounded-full ${stat.bg} mb-4 relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`}></div>
                  <stat.icon className={`w-8 h-8 ${stat.color} relative z-10`} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Quick Actions */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t('quickActions')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              {...animations.stagger(0.5 + index * 0.1)}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                variant="elevated"
                hover
                onClick={action.action}
                className="h-48 flex flex-col justify-center items-center text-center cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className={`p-4 rounded-full ${action.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.subtitle}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* New Features Section */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          مميزات المنصة
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              {...animations.stagger(0.6 + index * 0.1)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                variant="elevated"
                className="text-center p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className={`p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-4 inline-block`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Recent Activity */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Card
          title={t('recentActivity')}
          subtitle={t('yourLatestProgress')}
          onClick={() => navigate('/progress')}
          className="cursor-pointer hover:shadow-xl transition-all duration-300"
        >
          <div className="space-y-4">
            {completedTasks > 0 ? (
              <motion.div 
                className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t('completedTask')}: {t('cybersecurityBasics')}
                  </span>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    تم إكمال المهمة بنجاح
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Star className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('noActivityYet')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('startYourJourney')}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/day/1/0')}
                  className="px-8 py-3"
                >
                  <Rocket className="w-5 h-5 ml-2" />
                  {t('startLearning')}
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}