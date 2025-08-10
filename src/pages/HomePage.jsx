import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle, Users, Rocket, Lightbulb, Globe, Heart,
  Calendar, FileText, BookOpen, BarChart3, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const HomePage = () => {
  const navigate = useNavigate();
  const { language } = useLocalization();
  const isRTL = language === 'ar';

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

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: (delay = 0) => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay }
    })
  };

  return (
    <PageLayout
      title={language === 'ar' ? 'مرحباً بك في خطة الأمن السيبراني' : 'Welcome to Cyber Security Plan'}
      subtitle={language === 'ar' ? 'ابدأ رحلتك التعليمية اليوم' : 'Start your learning journey today'}
      showBottomBar={true}
    >
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        {/* Welcome Hero */}
        <motion.div {...animations.fadeIn}>
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
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...animations.stagger(0.2)}>
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
                    hover={true}
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
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div {...animations.stagger(0.4)}>
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
        </motion.div>

        {/* Start Learning CTA */}
        <motion.div {...animations.stagger(0.6)} className="text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'هل أنت مستعد للبدء؟' : 'Ready to Start?'}
            </h3>
            <p className="text-blue-100 mb-6">
              {language === 'ar' 
                ? 'ابدأ رحلتك في عالم الأمن السيبراني اليوم'
                : 'Start your cybersecurity journey today'
              }
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/phases')}
              className="bg-white text-blue-600 hover:bg-blue-50 border-white"
            >
              {language === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
            </Button>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default HomePage;