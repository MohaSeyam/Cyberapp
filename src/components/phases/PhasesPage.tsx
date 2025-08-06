import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Clock, BookOpen, Users, Shield, 
  TrendingUp, Award, Star, ArrowRight, Calendar,
  CheckCircle, Circle, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';
import { weekPhaseService } from '../../services/weekPhaseService';

export default function PhasesPage() {
  const { plan, progress } = useApp();
  const { language } = useLocalization();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  // Calculate phase data
  const phasesData = useMemo(() => {
    if (!plan) return [];

    const phases = weekPhaseService.getPhases();
    return phases.map(phase => {
      // Get weeks that belong to this phase
      const phaseWeeks = plan.filter(week => 
        phase.weeks.includes(week.week)
      );

      const totalTasks = phaseWeeks.reduce((sum, week) => 
        sum + (week.days?.reduce((daySum, day) => 
          daySum + (day.tasks?.length || 0), 0) || 0), 0
      );

      const completedTasks = progress.filter(p => 
        p.done && phase.weeks.includes(p.weekId)
      ).length;

      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...phase,
        weeks: phaseWeeks,
        totalTasks,
        completedTasks,
        progressPercentage
      };
    });
  }, [plan, progress]);

  const handlePhaseClick = (phaseId: number) => {
    setSelectedPhase(phaseId);
    // Navigate to phase weeks page
    window.location.href = `/phase/${phaseId}`;
  };

  const getPhaseIcon = (phaseId: number) => {
    const icons = [Target, Shield, Users, BookOpen, TrendingUp, Award];
    return icons[phaseId - 1] || Target;
  };

  const getPhaseColor = (phaseId: number) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo'];
    return colors[phaseId - 1] || 'blue';
  };

  const getPhaseGradient = (phaseId: number) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600'
    ];
    return gradients[phaseId - 1] || 'from-blue-500 to-blue-600';
  };

  return (
    <PageLayout 
      title=""
      subtitle=""
      showBottomBar={true}
      showHeader={false}
    >
      <motion.div {...animations.fadeIn} className="space-y-8">
        {/* Overall Progress Summary - Moved to top */}
        <motion.div {...animations.fadeIn}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'ملخص التقدم العام' : 'Overall Progress Summary'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'تتبع تقدمك عبر جميع مراحل التعلم' 
                    : 'Track your progress across all learning phases'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {phasesData.length > 0 
                    ? Math.round(phasesData.reduce((sum, phase) => sum + phase.progressPercentage, 0) / phasesData.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'متوسط التقدم' : 'Average Progress'}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phasesData.map((phase, index) => {
            const Icon = getPhaseIcon(phase.id);
            const color = getPhaseColor(phase.id);
            const gradient = getPhaseGradient(phase.id);

            return (
              <motion.div
                key={phase.id}
                {...animations.stagger(index * 0.1)}
                className="group cursor-pointer"
                onClick={() => handlePhaseClick(phase.id)}
              >
                <Card className="relative overflow-hidden group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className={`p-3 ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' : 
                                     color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                                     color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                                     color === 'orange' ? 'bg-orange-100 dark:bg-orange-900' :
                                     color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                                     'bg-indigo-100 dark:bg-indigo-900'} rounded-full`}>
                        <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                       color === 'green' ? 'text-green-600 dark:text-green-400' :
                                       color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                       color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                       color === 'red' ? 'text-red-600 dark:text-red-400' :
                                       'text-indigo-600 dark:text-indigo-400'}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {phase.progressPercentage}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'مكتمل' : 'Complete'}
                        </div>
                      </div>
                    </div>

                    {/* Title with increased spacing */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      {phase.title[language]}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                      {phase.focus[language]}
                    </p>

                    {/* Phase Weeks Preview - Above progress bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? 'أسابيع المرحلة' : 'Phase Weeks'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {phase.weeks.length} {language === 'ar' ? 'أسبوع' : 'weeks'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {phase.weeks.slice(0, 8).map((week, weekIndex) => {
                          const isCompleted = progress.some(p => p.weekId === week.week && p.done);
                          const isInProgress = progress.some(p => p.weekId === week.week && !p.done);
                          
                          let weekColorClass = '';
                          if (isCompleted) {
                            // Completed weeks - use phase color with success variant
                            weekColorClass = color === 'blue' ? 'bg-blue-500 text-white shadow-lg' :
                                           color === 'green' ? 'bg-green-500 text-white shadow-lg' :
                                           color === 'purple' ? 'bg-purple-500 text-white shadow-lg' :
                                           color === 'orange' ? 'bg-orange-500 text-white shadow-lg' :
                                           color === 'red' ? 'bg-red-500 text-white shadow-lg' :
                                           'bg-indigo-500 text-white shadow-lg';
                          } else if (isInProgress) {
                            // In progress weeks - use phase color with lighter variant
                            weekColorClass = color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-2 border-blue-300 dark:border-blue-600' :
                                           color === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 border-2 border-green-300 dark:border-green-600' :
                                           color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 border-2 border-purple-300 dark:border-purple-600' :
                                           color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-600' :
                                           color === 'red' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 border-2 border-red-300 dark:border-red-600' :
                                           'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-300 dark:border-indigo-600';
                          } else {
                            // Not started weeks - neutral gray
                            weekColorClass = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                          }

                          return (
                            <div
                              key={weekIndex}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110 ${weekColorClass}`}
                              title={isCompleted ? 
                                (language === 'ar' ? `الأسبوع ${week.week} مكتمل` : `Week ${week.week} completed`) :
                                isInProgress ? 
                                (language === 'ar' ? `الأسبوع ${week.week} قيد التقدم` : `Week ${week.week} in progress`) :
                                (language === 'ar' ? `الأسبوع ${week.week} لم يبدأ` : `Week ${week.week} not started`)
                              }
                            >
                              {isCompleted && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                              {week.week}
                            </div>
                          );
                        })}
                        {phase.weeks.length > 8 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                            +{phase.weeks.length - 8}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'green' ? 'bg-green-500' :
                            color === 'purple' ? 'bg-purple-500' :
                            color === 'orange' ? 'bg-orange-500' :
                            color === 'red' ? 'bg-red-500' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: `${phase.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Phase Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{phase.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>{phase.difficulty}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className={`w-5 h-5 ${color === 'blue' ? 'text-blue-500' :
                                           color === 'green' ? 'text-green-500' :
                                           color === 'purple' ? 'text-purple-500' :
                                           color === 'orange' ? 'text-orange-500' :
                                           color === 'red' ? 'text-red-500' :
                                           'text-indigo-500'}`} />
                    </div>
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