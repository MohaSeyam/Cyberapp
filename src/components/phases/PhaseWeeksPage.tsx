import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  ArrowLeft, Shield, Server, Search, Cloud, Bug, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';
import phasesData from '../../data/phases.json';

// Phase icons mapping
const phaseIcons = {
  shield: Shield,
  server: Server,
  eye: Target,
  search: Search,
  cloud: Cloud,
  target: Target,
  zap: TrendingUp,
  trophy: Trophy
};

export default function PhaseWeeksPage() {
  const { plan, progress } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { phaseId } = useParams();

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  // Safety checks
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Get phase data
  const phases = phasesData;

  const currentPhase = phases.find(p => p.id === parseInt(phaseId));
  
  // Get phase weeks - if not found in plan, create them from phases data
  const phaseWeeks = currentPhase ? currentPhase.weeks.map(weekNumber => {
    // Try to find the week in the plan
    const existingWeek = safePlan.find(w => w.week === weekNumber);
    
    if (existingWeek) {
      return existingWeek;
    } else {
      // Create a placeholder week if not found in plan
      return {
        week: weekNumber,
        title: {
          ar: `الأسبوع ${weekNumber}`,
          en: `Week ${weekNumber}`
        },
        days: []
      };
    }
  }) : [];

  const getWeekCompletion = (weekNumber: number) => {
    const weekData = safePlan.find(w => w.week === weekNumber);
    if (!weekData) return { totalTasks: 0, completedTasks: 0, progress: 0 };

    const totalTasks = weekData.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => p.weekId === (weekNumber?.toString() || ''));
    const completedTasks = weekProgress.filter(p => p.done).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, progress };
  };

  const getPhaseCompletion = () => {
    const totalWeeks = phaseWeeks.length;
    const completedWeeks = phaseWeeks.filter(week => {
      const completion = getWeekCompletion(week.week);
      return completion.progress === 100;
    }).length;
    const progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

    return { totalWeeks, completedWeeks, progress };
  };

  const goToWeekDays = (weekNumber: number) => {
    navigate(`/days/${weekNumber}`);
  };

  const goToPhases = () => {
    navigate('/phases');
  };

  if (!currentPhase) {
    return (
      <PageLayout 
        title="مرحلة غير موجودة"
        subtitle="المرحلة المطلوبة غير متوفرة"
        showBottomBar={true}
      >
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            المرحلة المطلوبة غير موجودة
          </p>
          <Button onClick={goToPhases} variant="primary">
            العودة إلى المراحل
          </Button>
        </div>
      </PageLayout>
    );
  }

  const phaseCompletion = getPhaseCompletion();
  const PhaseIcon = phaseIcons[currentPhase.icon as keyof typeof phaseIcons] || Shield;

  return (
    <PageLayout 
      title={currentPhase.title.ar}
      subtitle={`${currentPhase.focus.ar} - ${currentPhase.duration} - ${currentPhase.difficulty}`}
      showBottomBar={true}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Button
              onClick={goToPhases}
              variant="outline"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للمراحل
            </Button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {currentPhase.title.ar}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
            {currentPhase.focus.ar}
          </p>
          
          {/* Phase Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  currentPhase.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' : 
                  currentPhase.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 
                  currentPhase.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900' : 
                  currentPhase.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' : 
                  'bg-teal-100 dark:bg-teal-900'
                }`}>
                  <PhaseIcon className={`w-6 h-6 ${
                    currentPhase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                    currentPhase.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                    currentPhase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                    currentPhase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
                    'text-teal-600 dark:text-teal-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تقدم المرحلة
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {phaseCompletion.completedWeeks} من {phaseCompletion.totalWeeks} أسابيع مكتملة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  currentPhase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                  currentPhase.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                  currentPhase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                  currentPhase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
                  'text-teal-600 dark:text-teal-400'
                }`}>
                  {phaseCompletion.progress}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  currentPhase.color === 'blue' ? 'bg-blue-500' :
                  currentPhase.color === 'green' ? 'bg-green-500' :
                  currentPhase.color === 'indigo' ? 'bg-indigo-500' :
                  currentPhase.color === 'purple' ? 'bg-purple-500' :
                  'bg-teal-500'
                }`}
                style={{ width: `${phaseCompletion.progress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phaseWeeks.map((week, index) => {
            const completion = getWeekCompletion(week.week);
            
            return (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => goToWeekDays(week.week)}
              >
                <Card
                  className={`h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    completion.progress === 100 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${
                      currentPhase.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' : 
                      currentPhase.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 
                      currentPhase.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900' : 
                      currentPhase.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' : 
                      'bg-teal-100 dark:bg-teal-900'
                    }`}>
                      <Calendar className={`w-6 h-6 ${
                        currentPhase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                        currentPhase.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                        currentPhase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                        currentPhase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
                        'text-teal-600 dark:text-teal-400'
                      }`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        currentPhase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                        currentPhase.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                        currentPhase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                        currentPhase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
                        'text-teal-600 dark:text-teal-400'
                      }`}>
                        {completion.progress}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        مكتمل
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {week.title?.ar || `الأسبوع ${week.week}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {completion.totalTasks} مهمة - {completion.completedTasks} مكتملة
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentPhase.color === 'blue' ? 'bg-blue-500' :
                          currentPhase.color === 'green' ? 'bg-green-500' :
                          currentPhase.color === 'indigo' ? 'bg-indigo-500' :
                          currentPhase.color === 'purple' ? 'bg-purple-500' :
                          'bg-teal-500'
                        }`}
                        style={{ width: `${completion.progress}%` }}
                      />
                    </div>

                    {completion.progress === 100 && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 ml-2" />
                        <span className="text-sm font-medium">مكتمل</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </PageLayout>
  );
}