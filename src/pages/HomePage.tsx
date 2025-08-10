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

import { ErrorBoundary } from 'react-error-boundary';

function HomeErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">{t('homePageError')}</h2>
      <p>{error?.message || t('reloadOrTryLater')}</p>
    </div>
  );
}

export default function HomePage() {
  const { t, language } = useLocalization();
  const navigate = useNavigate();
  
  // Quick actions
  const quickActions = [
    {
      title: language === 'ar' ? 'بدء التعلم اليوم' : 'Start Today\'s Learning',
      description: language === 'ar' ? 'انتقل إلى مهام اليوم' : 'Go to today\'s tasks',
      icon: Calendar,
      color: 'bg-blue-500',
      href: '/progress'
    },
    {
      title: language === 'ar' ? 'إضافة ملاحظة' : 'Add Note',
      description: language === 'ar' ? 'اكتب ملاحظات جديدة' : 'Write new notes',
      icon: FileText,
      color: 'bg-green-500',
      href: '/notes'
    },
    {
      title: language === 'ar' ? 'كتابة في المدونة' : 'Write Journal',
      description: language === 'ar' ? 'اكتب في مدونة التعلم' : 'Write in learning journal',
      icon: BookOpen,
      color: 'bg-purple-500',
      href: '/journal'
    },
    {
      title: language === 'ar' ? 'عرض التقدم' : 'View Progress',
      description: language === 'ar' ? 'راجع إحصائيات التقدم' : 'Review progress statistics',
      icon: BarChart3,
      color: 'bg-orange-500',
      href: '/progress'
    }
  ];
  return (
    <PageLayout
      title={language === 'ar' ? 'مرحباً بك في خطة الأمن السيبراني' : 'Welcome to Cyber Security Plan'}
      subtitle={language === 'ar' ? 'ابدأ رحلتك التعليمية اليوم' : 'Start your learning journey today'}
      showBottomBar={true}
    >
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        {/* Welcome Hero */}
        <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'رحلة شاملة في عالم الأمن السيبراني' : 'Comprehensive Journey in Cybersecurity'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {language === 'ar' 
              ? 'خطة منظمة لمدة 50 أسبوع لتعلم الأمن السيبراني من الأساسيات إلى المستويات المتقدمة'
              : 'A structured 50-week plan to learn cybersecurity from fundamentals to advanced levels'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{language === 'ar' ? '50 أسبوع منظمة' : '50 Organized Weeks'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{language === 'ar' ? 'مهارات عملية' : 'Practical Skills'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Rocket className="w-4 h-4 text-purple-500" />
              <span>{language === 'ar' ? 'تقدم مستمر' : 'Continuous Progress'}</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(action.href)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Features Overview */}
        <Card className="p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {language === 'ar' ? 'مميزات التطبيق' : 'App Features'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'تعلم ذكي' : 'Smart Learning'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'خطة تعليمية منظمة ومتدرجة'
                  : 'Organized and progressive learning plan'
                }
              </p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'مراجع شاملة' : 'Comprehensive Resources'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'مكتبة غنية من المراجع والموارد'
                  : 'Rich library of references and resources'
                }
              </p>
            </div>
            <div className="text-center">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'تتبع التقدم' : 'Progress Tracking'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'إحصائيات مفصلة لتقدمك التعليمي'
                  : 'Detailed statistics for your learning progress'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}