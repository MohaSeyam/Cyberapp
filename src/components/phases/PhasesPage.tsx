import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Server, Eye, Search, Cloud, 
  Calendar, Clock, Target, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Home, ChevronRight, CheckCircle, Bug, FileText
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
  eye: Eye,
  search: Search,
  cloud: Cloud,
  target: Target,
  zap: TrendingUp,
  trophy: Trophy
};

// Breadcrumbs component
function Breadcrumbs() {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Home className="w-4 h-4 mr-1" />
        الرئيسية
      </button>
      
      <span className="flex items-center">
        <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200 font-semibold">
          المراحل
        </span>
      </span>
    </nav>
  );
}

export default function PhasesPage() {
  const { plan, progress, lang, refreshData } = useApp();
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

  // Safety checks
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Calculate phase completion
  const getPhaseCompletion = (phaseId: number) => {
    const phase = phasesData.find(p => p.id === phaseId);
    if (!phase) return { totalWeeks: 0, completedWeeks: 0, progress: 0 };

    const phaseWeeks = phase.weeks;
    const totalWeeks = phaseWeeks.length;
    
    // Debug logging
    console.log(`Phase ${phaseId}:`, {
      weeks: phaseWeeks,
      totalWeeks: totalWeeks,
      phaseTitle: phase.title.ar,
      availableWeeks: safePlan.map(w => w.week)
    });
    
    const completedWeeks = phaseWeeks.filter(week => {
      const weekData = safePlan.find(w => w.week === week);
      if (!weekData) {
        console.log(`Week ${week} not found in plan`);
        return false;
      }

      const totalTasks = weekData.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
      const weekProgress = safeProgress.filter(p => p.weekId === (week?.toString() || ''));
      const completedTasks = weekProgress.filter(p => p.done).length;

      return totalTasks > 0 && completedTasks === totalTasks;
    }).length;

    return {
      totalWeeks,
      completedWeeks,
      progress: totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0
    };
  };

  // Get phase data from phases.json
  const phases = phasesData;

  // Task type icons and colors mapping
  const taskTypeConfig = {
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
      icon: Eye,
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

  const goToPhaseWeeks = (phaseId: number) => {
    navigate(`/phase/${phaseId}`);
  };

  return (
    <PageLayout 
      title={safeT('learningPhases')}
      subtitle={safeT('choosePhaseToStart')}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: safeT('phases'), icon: BookOpen }
          ]} 
        />
        
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                خطة تعلم الأمن السيبراني
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                رحلة شاملة من المبتدئ إلى المتقدم في عالم الأمن السيبراني
              </p>
            </div>
          </div>
        </Card>

        {/* Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase, index) => {
            const completion = getPhaseCompletion(phase.id);
            const PhaseIcon = phaseIcons[(phase.icon || 'shield') as keyof typeof phaseIcons] || Shield;
            
            // Debug: Log phase data
            console.log(`Phase ${phase.id} (${phase.title.ar}):`, {
              weeks: phase.weeks,
              totalWeeks: phase.weeks.length,
              completion: completion
            });
            
            return (
              <motion.div key={phase.id} {...animations.stagger(index * 0.1)}>
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    completion.progress === 100 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'
                  }`} 
                  onClick={() => goToPhaseWeeks(phase.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${
                      phase.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' : 
                      phase.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 
                      phase.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900' : 
                      phase.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' : 
                      'bg-teal-100 dark:bg-teal-900'
                    }`}>
                      <PhaseIcon className={`w-6 h-6 ${
                        phase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                        phase.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                        phase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                        phase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
                        'text-teal-600 dark:text-teal-400'
                      }`} />
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        phase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                        phase.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                        phase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                        phase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
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
                        {phase.title[lang]}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {phase.focus[lang]}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500">المدة:</span>
                        <span className="font-medium">{phase.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500">المستوى:</span>
                        <span className="font-medium">{phase.difficulty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500">الأسابيع:</span>
                        <span className="font-medium">{completion.completedWeeks}/{completion.totalWeeks}</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          phase.color === 'blue' ? 'bg-blue-500' :
                          phase.color === 'green' ? 'bg-green-500' :
                          phase.color === 'indigo' ? 'bg-indigo-500' :
                          phase.color === 'purple' ? 'bg-purple-500' :
                          'bg-teal-500'
                        }`}
                        style={{ width: `${completion.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ملخص التقدم العام
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  إجمالي الأسابيع
                </h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {safePlan.length}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  الأسابيع المكتملة
                </h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {safePlan.filter(week => {
                    const totalTasks = week.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
                    const weekProgress = safeProgress.filter(p => p.weekId === (week.week?.toString() || ''));
                    const completedTasks = weekProgress.filter(p => p.done).length;
                    return totalTasks > 0 && completedTasks === totalTasks;
                  }).length}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  المراحل المكتملة
                </h4>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {phases.filter(phase => getPhaseCompletion(phase.id).progress === 100).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}