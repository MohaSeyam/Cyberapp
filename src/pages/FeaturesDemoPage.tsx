import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Settings, Bell, Calendar, Download, Upload,
  Lightbulb, Target, Clock, TrendingUp, BookOpen, 
  Zap, Star, Award, Brain, Rocket, Shield, Cloud
} from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../ui/Button';
import SmartRecommendations from '../components/smart/SmartRecommendations';
import CalendarIntegration from '../components/integrations/CalendarIntegration';
import AdvancedNotifications from '../components/notifications/AdvancedNotifications';
import AutoBackup from '../components/backup/AutoBackup';
import { animations } from '../constants/theme';

type FeatureTab = 'recommendations' | 'calendar' | 'notifications' | 'backup';

export default function FeaturesDemoPage() {
  const { t, language } = useLocalization();
  const [activeTab, setActiveTab] = useState<FeatureTab>('recommendations');

  const features = [
    {
      id: 'recommendations' as FeatureTab,
      title: language === 'ar' ? 'التوصيات الذكية' : 'Smart Recommendations',
      description: language === 'ar' 
        ? 'توصيات مخصصة بناءً على تقدمك وأسلوب تعلمك'
        : 'Personalized recommendations based on your progress and learning style',
      icon: Lightbulb,
      color: 'text-blue-600'
    },
    {
      id: 'calendar' as FeatureTab,
      title: language === 'ar' ? 'تكامل التقويم' : 'Calendar Integration',
      description: language === 'ar' 
        ? 'مزامنة المهام والمواعيد مع تقويماتك الخارجية'
        : 'Sync tasks and appointments with your external calendars',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 'notifications' as FeatureTab,
      title: language === 'ar' ? 'الإشعارات المتقدمة' : 'Advanced Notifications',
      description: language === 'ar' 
        ? 'إدارة الإشعارات والتخصيص حسب احتياجاتك'
        : 'Manage notifications and customize according to your needs',
      icon: Bell,
      color: 'text-purple-600'
    },
    {
      id: 'backup' as FeatureTab,
      title: language === 'ar' ? 'النسخ الاحتياطي التلقائي' : 'Auto Backup',
      description: language === 'ar' 
        ? 'حماية بياناتك مع النسخ الاحتياطي التلقائي والمتقدم'
        : 'Protect your data with automatic and advanced backup',
      icon: Cloud,
      color: 'text-orange-600'
    }
  ];

  const renderFeatureContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return <SmartRecommendations />;
      case 'calendar':
        return <CalendarIntegration />;
      case 'notifications':
        return <AdvancedNotifications />;
      case 'backup':
        return <AutoBackup />;
      default:
        return <SmartRecommendations />;
    }
  };

  return (
    <PageLayout
      title={language === 'ar' ? 'عرض المميزات الجديدة' : 'New Features Demo'}
      subtitle={language === 'ar' ? 'اكتشف المميزات المتقدمة الجديدة' : 'Discover the new advanced features'}
      showBottomBar={true}
    >
      <div className="space-y-6">
        {/* عنوان الصفحة */}
        <motion.div
          {...animations.fadeIn}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'المميزات الجديدة' : 'New Features'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {language === 'ar' 
              ? 'اكتشف المميزات المتقدمة الجديدة التي تم إضافتها لتحسين تجربتك التعليمية'
              : 'Discover the new advanced features that have been added to enhance your learning experience'
            }
          </p>
        </motion.div>

        {/* شريط التنقل بين المميزات */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              {...animations.stagger(index * 0.1)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant={activeTab === feature.id ? "primary" : "outline"}
                onClick={() => setActiveTab(feature.id)}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
                <span>{feature.title}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* بطاقات المميزات */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              {...animations.stagger(index * 0.1)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setActiveTab(feature.id)}
              >
                <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-800 mb-4 inline-block`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* محتوى الميزة المحددة */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {renderFeatureContent()}
        </motion.div>

        {/* معلومات إضافية */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'كيف تستفيد من هذه المميزات؟' : 'How to benefit from these features?'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'التوصيات الذكية' : 'Smart Recommendations'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'احصل على توصيات مخصصة بناءً على تقدمك وأسلوب تعلمك'
                    : 'Get personalized recommendations based on your progress and learning style'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'تكامل التقويم' : 'Calendar Integration'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'مزامنة المهام مع تقويماتك الخارجية'
                    : 'Sync tasks with your external calendars'
                  }
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'الإشعارات المتقدمة' : 'Advanced Notifications'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'إدارة الإشعارات حسب احتياجاتك'
                    : 'Manage notifications according to your needs'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* أزرار الإجراءات */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button
            variant="primary"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Home className="w-5 h-5" />
            <span>
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/settings'}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Settings className="w-5 h-5" />
            <span>
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </span>
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
}