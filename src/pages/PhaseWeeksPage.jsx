import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Target, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  ArrowLeft, ChevronRight, CheckCircle, Bug, FileText,
  Shield
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import phasesData from '../data/phases.json';
import planData from '../data/PlanData.json';

const PhaseWeeksPage = () => {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;
  const isRTL = language === 'ar';

  // Safe access to useApp
  let appData;
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useApp:', error);
    appData = {
      progress: []
    };
  }
  const { progress } = appData;

  // Ensure data is available
  const safeProgress = Array.isArray(progress) ? progress : [];

  // Find current phase
  const currentPhase = (phasesData || []).find(phase => phase.id === parseInt(phaseId));

  // Get weeks for this phase
  const phaseWeeks = (planData || []).filter(week => currentPhase?.weeks.includes(week.week));

  // Calculate week completion
  const getWeekCompletion = (weekNumber) => {
    const phaseIdInt = parseInt(phaseId);
    const week = (planData || []).find(w => String(w.week) === String(weekNumber) && String(w.phase) === String(phaseIdInt));
    if (!week || !Array.isArray(week.days)) return { percentage: 0, completed: 0, total: 0 };
    const totalTasks = week.days.reduce((total, day) => total + (Array.isArray(day.tasks) ? day.tasks.length : 0), 0);
    if (totalTasks === 0) return { percentage: 0, completed: 0, total: 0 };
    const weekProgress = safeProgress.filter(p => String(p.weekId) === String(weekNumber) && (p.phaseId == null || String(p.phaseId) === String(phaseIdInt)));
    const completedTasks = weekProgress.filter(p => p.done).length;
    return {
      percentage: Math.round((completedTasks / totalTasks) * 100),
      completed: completedTasks,
      total: totalTasks
    };
  };



  // Get total tasks for a week from data
  const getWeekTotalTasks = (weekNumber) => {
    const week = (planData || []).find(w => w.week === weekNumber && w.phase === parseInt(phaseId));
    if (!week || !week.days) return 0;
    
    return week.days.reduce((total, day) => {
      return total + (day.tasks ? day.tasks.length : 0);
    }, 0);
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

  const goToPhases = () => {
    navigate('/phases');
  };

  if (!currentPhase) {
    return (
      <PageLayout title="خطأ" subtitle="المرحلة غير موجودة" showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'المرحلة غير موجودة' : 'Phase not found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' 
              ? 'قد تكون البيانات غير محملة بشكل صحيح. جرب تحديث البيانات.'
              : 'The data may not be loaded correctly. Try refreshing the data.'
            }
          </p>
          <Button onClick={goToPhases} variant="primary">
            {language === 'ar' ? 'العودة للمراحل' : 'Back to Phases'}
          </Button>
        </div>
      </PageLayout>
    );
  }

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
            onClick={goToPhases}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {language === 'ar' ? 'العودة للمراحل' : 'Back to Phases'}
          </Button>
        </div>

        {/* Phase Header */}
        <div className="text-center mb-10 mt-2">
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2">
              {currentPhase.title[language]}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
              {currentPhase.focus[language]}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{currentPhase.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{currentPhase.difficulty}</span>
              </div>
              
            </div>
          </div>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phaseWeeks.map((week, index) => {
            const completion = getWeekCompletion(week.week);
            const isCompleted = completion.percentage === 100;
            const isInProgress = completion.percentage > 0 && completion.percentage < 100;
            
            return (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isCompleted ? 'ring-2 ring-green-500' : 
                    isInProgress ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => navigate(`/phases/${phaseId}/weeks/${week.week}`)}
                  hover={true}
                >
                  {/* Week Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {language === 'ar' ? `الأسبوع ${week.week}` : `Week ${week.week}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {week.title[language]}
                      </p>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  {/* Week Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {week.objective[language]}
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



                  {/* Week Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{completion.completed}/{getWeekTotalTasks(week.week)} {language === 'ar' ? 'مهام' : 'tasks'}</span>
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

        {/* Phase Summary */}
        <motion.div {...animations.stagger(0.4)}>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'ملخص المرحلة' : 'Phase Summary'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {phaseWeeks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'الأسابيع' : 'Weeks'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {phaseWeeks.filter(week => getWeekCompletion(week.week).percentage === 100).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'مكتملة' : 'Completed'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {phaseWeeks.reduce((acc, week) => acc + (week.days?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'الأيام' : 'Days'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(phaseWeeks.reduce((acc, week) => acc + getWeekCompletion(week.week).percentage, 0) / phaseWeeks.length)}%
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

export default PhaseWeeksPage;