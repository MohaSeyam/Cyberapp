import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Target, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  ArrowLeft, ChevronRight, CheckCircle, Bug, FileText, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import phasesData from '../data/phases.json';

const PhasesPage = () => {
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { progress } = useApp();
  const isRTL = language === 'ar';

  // Ensure data is available
  const safeProgress = progress || [];

  // Get phases data with safety check
  const safePhasesData = (() => {
    try {
      return phasesData || [];
    } catch (error) {
      console.error('Error loading phases data:', error);
      return [];
    }
  })();

  // Calculate phase completion
  const getPhaseCompletion = (phase) => {
    const phaseWeeks = phase.weeks || [];
    const completedWeeks = phaseWeeks.filter(week => {
      const weekProgress = safeProgress.filter(p => p.weekId === week);
      return weekProgress.length > 0 && weekProgress.every(p => p.done);
    }).length;
    
    return {
      completed: completedWeeks,
      total: phaseWeeks.length,
      percentage: Math.round((completedWeeks / phaseWeeks.length) * 100)
    };
  };

  // Phase type configurations
  const phaseTypeConfig = {
    'Blue Team': {
      icon: Shield,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    'Red Team': {
      icon: Bug,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400'
    },
    'Particular': {
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    'Soft Skills': {
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    'Policies': {
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  };

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
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>

        {/* Main Title */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2">
            {language === 'ar' ? 'خطة الأمن السيبراني' : 'Cyber Security Plan'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === 'ar' 
              ? '50 أسبوع من التعلم المنظم والمتدرج'
              : '50 weeks of organized and progressive learning'
            }
          </p>
        </div>

        {/* Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {safePhasesData.map((phase, index) => {
            const completion = getPhaseCompletion(phase);
            const isCompleted = completion.percentage === 100;
            const isInProgress = completion.percentage > 0 && completion.percentage < 100;
            
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isCompleted ? 'ring-2 ring-green-500' : 
                    isInProgress ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => navigate(`/phase/${phase.id}`)}
                  hover={true}
                >
                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${phaseTypeConfig['Blue Team'].bgColor}`}>
                        <Target className={`w-6 h-6 ${phaseTypeConfig['Blue Team'].textColor}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {phase.title[language]}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {phase.duration}
                        </p>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  {/* Phase Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {phase.focus[language]}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'التقدم' : 'Progress'}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {completion.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 
                          isInProgress ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        style={{ width: `${completion.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Phase Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{completion.completed}/{completion.total} {language === 'ar' ? 'أسابيع' : 'weeks'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{phase.difficulty}</span>
                    </div>
                  </div>

                  {/* Navigation Arrow */}
                  <div className="mt-4 flex justify-end">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <motion.div {...animations.stagger(0.4)}>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'ملخص التقدم العام' : 'Overall Progress Summary'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {safePhasesData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'المراحل' : 'Phases'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {safePhasesData.reduce((acc, phase) => acc + phase.weeks.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'الأسابيع' : 'Weeks'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {safePhasesData.filter(phase => getPhaseCompletion(phase).percentage === 100).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'مكتملة' : 'Completed'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(safePhasesData.reduce((acc, phase) => acc + getPhaseCompletion(phase).percentage, 0) / safePhasesData.length)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'متوسط التقدم' : 'Avg Progress'}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default PhasesPage;