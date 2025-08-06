import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Target, BookOpen, Users, 
  CheckCircle, Circle, ArrowLeft, ChevronRight,
  TrendingUp, Award, Star, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import { weekPhaseService } from '../services/weekPhaseService';

export default function WeeksPage() {
  const { plan, progress } = useApp();
  const { language } = useLocalization();
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Get current phase data
  const currentPhase = useMemo(() => {
    if (!phaseId) return null;
    const phases = weekPhaseService.getPhases();
    return phases.find(p => p.id === parseInt(phaseId));
  }, [phaseId]);

  // Get weeks for current phase
  const phaseWeeks = useMemo(() => {
    if (!plan || !currentPhase) return [];
    return plan.filter(week => 
      week.week >= currentPhase.startWeek && week.week <= currentPhase.endWeek
    );
  }, [plan, currentPhase]);

  // Calculate week progress
  const getWeekProgress = (week: any) => {
    const totalTasks = week.days?.reduce((sum: number, day: any) => 
      sum + (day.tasks?.length || 0), 0) || 0;
    const completedTasks = progress.filter(p => 
      p.weekId === week.week && p.done
    ).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Get day name in Arabic
  const getDayName = (dayKey: string) => {
    const dayNames: { [key: string]: string } = {
      'sun': 'الأحد',
      'mon': 'الاثنين', 
      'tue': 'الثلاثاء',
      'wed': 'الأربعاء',
      'thu': 'الخميس',
      'fri': 'الجمعة',
      'sat': 'السبت'
    };
    return dayNames[dayKey] || dayKey;
  };

  // Get task type icon and color
  const getTaskTypeConfig = (type: string) => {
    const configs: { [key: string]: { icon: any; color: string; bgColor: string } } = {
      'Blue Team': { icon: Shield, color: 'blue', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
      'Red Team': { icon: Target, color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/30' },
      'Practical': { icon: TrendingUp, color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/30' },
      'Theoretical': { icon: BookOpen, color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
      'Policies': { icon: Award, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' }
    };
    return configs[type] || { icon: Circle, color: 'gray', bgColor: 'bg-gray-100 dark:bg-gray-900/30' };
  };

  const handleWeekClick = (week: any) => {
    setSelectedWeek(week.week);
    navigate(`/week/${week.week}`);
  };

  const handleBackToPhases = () => {
    navigate('/phases');
  };

  if (!currentPhase) {
    return (
      <PageLayout title="خطأ" subtitle="المرحلة غير موجودة">
        <div className="text-center">
          <p>المرحلة غير موجودة</p>
          <Button onClick={handleBackToPhases}>العودة للمراحل</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={language === 'ar' ? currentPhase.name.ar : currentPhase.name.en}
      subtitle={language === 'ar' ? currentPhase.description.ar : currentPhase.description.en}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Phase Navigation Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'المرحلة الحالية' : 'Current Phase'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? currentPhase.name.ar : currentPhase.name.en}
              </span>
            </div>
          </div>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phaseWeeks.map((week, index) => {
            const weekProgress = getWeekProgress(week);
            const isCompleted = weekProgress === 100;
            const hasProgress = weekProgress > 0;

            return (
              <motion.div
                key={week.week}
                {...animations.stagger(index * 0.1)}
                className="group cursor-pointer"
                onClick={() => handleWeekClick(week)}
              >
                <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                  hasProgress ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 
                  'border-gray-200 dark:border-gray-700'
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className={`p-3 rounded-full ${
                        isCompleted ? 'bg-green-100 dark:bg-green-900/30' :
                        hasProgress ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-gray-100 dark:bg-gray-900/30'
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                          isCompleted ? 'text-green-600 dark:text-green-400' :
                          hasProgress ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {language === 'ar' ? `الأسبوع ${week.week}` : `Week ${week.week}`}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'أسبوع التعلم' : 'Learning Week'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  {/* Days Preview */}
                  <div className="space-y-3">
                    {week.days?.slice(0, 5).map((day, dayIndex) => {
                      const dayTasks = day.tasks || [];
                      const completedTasks = progress.filter(p => 
                        p.weekId === week.week && p.dayKey === day.key && p.done
                      ).length;
                      const dayProgress = dayTasks.length > 0 ? 
                        Math.round((completedTasks / dayTasks.length) * 100) : 0;

                      return (
                        <div key={day.key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              dayProgress === 100 ? 'bg-green-500 text-white' :
                              dayProgress > 0 ? 'bg-yellow-500 text-white' :
                              'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {dayIndex + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {getDayName(day.key)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {dayTasks.length} {language === 'ar' ? 'مهمة' : 'tasks'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Line */}
                          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className={`h-1 rounded-full transition-all duration-300 ${
                                dayProgress === 100 ? 'bg-green-500' :
                                dayProgress > 0 ? 'bg-yellow-500' :
                                'bg-transparent'
                              }`}
                              style={{ width: `${dayProgress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Week Progress */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {language === 'ar' ? 'تقدم الأسبوع' : 'Week Progress'}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {weekProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' :
                          hasProgress ? 'bg-yellow-500' :
                          'bg-gray-300 dark:bg-gray-600'
                        }`}
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Phase Summary */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'ملخص المرحلة' : 'Phase Summary'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {language === 'ar' ? currentPhase.description.ar : currentPhase.description.en}
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {phaseWeeks.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'أسبوع' : 'Weeks'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {phaseWeeks.filter(week => getWeekProgress(week) === 100).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'مكتمل' : 'Completed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(phaseWeeks.reduce((sum, week) => sum + getWeekProgress(week), 0) / phaseWeeks.length || 0)}%
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