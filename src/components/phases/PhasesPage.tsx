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
      const phaseWeeks = plan.filter(week => 
        week.week >= phase.startWeek && week.week <= phase.endWeek
      );

      const totalTasks = phaseWeeks.reduce((sum, week) => 
        sum + (week.days?.reduce((daySum, day) => 
          daySum + (day.tasks?.length || 0), 0) || 0), 0
      );

      const completedTasks = progress.filter(p => 
        p.done && phaseWeeks.some(w => w.week === p.weekId)
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
      title={language === 'ar' ? 'المراحل' : 'Phases'}
      subtitle={language === 'ar' ? 'رحلة تعلم الأمن السيبراني' : 'Cybersecurity Learning Journey'}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-8">
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
                <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-full`}>
                        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>

                    {/* Phase Info */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {language === 'ar' ? phase.name.ar : phase.name.en}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {language === 'ar' ? phase.description.ar : phase.description.en}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {language === 'ar' ? 'التقدم' : 'Progress'}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {phase.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${phase.progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {phase.weeks.length}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {language === 'ar' ? 'أسبوع' : 'Weeks'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {phase.completedTasks}/{phase.totalTasks}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {language === 'ar' ? 'مهمة' : 'Tasks'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Phase Weeks Preview */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {language === 'ar' ? 'أسابيع المرحلة' : 'Phase Weeks'}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {phase.weeks.slice(0, 8).map((week, weekIndex) => {
                          const weekProgress = progress.filter(p => 
                            p.weekId === week.week && p.done
                          ).length;
                          const weekTotalTasks = week.days?.reduce((sum, day) => 
                            sum + (day.tasks?.length || 0), 0) || 0;
                          const weekPercentage = weekTotalTasks > 0 ? 
                            Math.round((weekProgress / weekTotalTasks) * 100) : 0;

                          return (
                            <div key={week.week} className="text-center">
                              <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium ${
                                weekPercentage === 100 
                                  ? 'bg-green-500 text-white' 
                                  : weekPercentage > 0 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {week.week}
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                <div 
                                  className={`h-1 rounded-full ${
                                    weekPercentage === 100 ? 'bg-green-500' : 
                                    weekPercentage > 0 ? 'bg-yellow-500' : 'bg-transparent'
                                  }`}
                                  style={{ width: `${weekPercentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {phase.weeks.length > 8 && (
                          <div className="text-center">
                            <div className="w-8 h-8 rounded-full mx-auto mb-1 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                              +{phase.weeks.length - 8}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Overall Progress Summary */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'التقدم الإجمالي' : 'Overall Progress'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {language === 'ar' 
                  ? 'رحلة شاملة في عالم الأمن السيبراني' 
                  : 'A comprehensive journey in cybersecurity'
                }
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {phasesData.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'مرحلة' : 'Phases'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {plan?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'أسبوع' : 'Weeks'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {progress.filter(p => p.done).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'مهمة مكتملة' : 'Completed Tasks'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(phasesData.reduce((sum, phase) => sum + phase.progressPercentage, 0) / phasesData.length || 0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'متوسط التقدم' : 'Avg Progress'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}