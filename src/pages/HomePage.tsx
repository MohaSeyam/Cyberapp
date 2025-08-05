// Enhanced Home Page - Refactored with Components and Hooks
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, BookOpen, Calendar,
  CheckCircle, Clock, Star, FileText,
  Zap, Globe, Bookmark, Settings,
  BarChart3, Lightbulb, Rocket, Heart
} from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { useHome } from '../hooks/useHome';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import HomeHero from '../components/home/HomeHero';
import HomeStats from '../components/home/HomeStats';
import QuickActions from '../components/home/QuickActions';
import { ErrorBoundary } from 'react-error-boundary';

function HomeErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">حدث خطأ في الصفحة الرئيسية</h2>
      <p>{error?.message || 'يرجى إعادة تحميل الصفحة أو المحاولة لاحقًا.'}</p>
    </div>
  );
}

export default function HomePage() {
  const { t, language } = useLocalization();
  const navigate = useNavigate();
  const {
    totalWeeks,
    totalTasks,
    completedTasks,
    completionRate,
    currentWeek,
    stats,
    quickActions,
    features
  } = useHome();

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  // Enhanced Progress Section
  const ProgressSection = () => (
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
  );

  // Features Section
  const FeaturesSection = () => (
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
                {feature.icon === 'Shield' && <Shield className={`w-8 h-8 ${feature.color}`} />}
                {feature.icon === 'Globe' && <Globe className={`w-8 h-8 ${feature.color}`} />}
                {feature.icon === 'Zap' && <Zap className={`w-8 h-8 ${feature.color}`} />}
                {feature.icon === 'Heart' && <Heart className={`w-8 h-8 ${feature.color}`} />}
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
  );

  // Recent Activity Section
  const RecentActivitySection = () => (
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
  );

  return (
    <ErrorBoundary FallbackComponent={HomeErrorFallback}>
      <PageLayout 
        title={safeT('welcome')}
        subtitle={safeT('cyberSecurityLearning')}
        showBottomBar={true}
      >
        {/* Hero Section */}
        <HomeHero 
          language={language}
          t={t}
          navigate={navigate}
        />

        {/* Progress Section */}
        <ProgressSection />

        {/* Statistics Cards */}
        <HomeStats 
          stats={stats}
          t={t}
          navigate={navigate}
        />

        {/* Quick Actions */}
        <QuickActions 
          actions={quickActions}
          t={t}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* Recent Activity */}
        <RecentActivitySection />
      </PageLayout>
    </ErrorBoundary>
  );
}