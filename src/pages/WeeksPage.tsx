import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronRight, ArrowLeft, CheckCircle, Circle,
  Target, Clock, BookOpen, Users, Shield, TrendingUp, Award
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import { weekPhaseService } from '../services/weekPhaseService';

export default function WeeksPage() {
  const { phaseId } = useParams();
  const { plan, progress } = useApp();
  const { language } = useLocalization();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'all' | 'current'>('current');

  // Safety checks for data
  if (!plan || !progress || !phaseId) {
    return (
      <PageLayout 
        title={language === 'ar' ? 'الأسابيع' : 'Weeks'}
        subtitle={language === 'ar' ? 'أسابيع التعلم' : 'Learning Weeks'}
        showBottomBar={true}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Get current phase data
  const phases = weekPhaseService.getPhases();
  const currentPhase = phases.find(p => p.id === parseInt(phaseId));
  
  if (!currentPhase) {
    return (
      <PageLayout 
        title={language === 'ar' ? 'خطأ' : 'Error'}
        subtitle={language === 'ar' ? 'المرحلة غير موجودة' : 'Phase not found'}
        showBottomBar={true}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              {language === 'ar' ? 'المرحلة غير موجودة' : 'Phase not found'}
            </div>
            <Button onClick={() => navigate('/phases')}>
              {language === 'ar' ? 'العودة للمراحل' : 'Back to Phases'}
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Get weeks for current phase
  const phaseWeeks = plan.filter(week => currentPhase.weeks.includes(week.week));

  // Calculate week progress
  const getWeekProgress = (week: any) => {
    if (!week || !week.days) return 0;
    
    const totalTasks = week.days.reduce((sum: number, day: any) => 
      sum + (day.tasks?.length || 0), 0
    );
    
    if (totalTasks === 0) return 0;
    
    const completedTasks = progress.filter(p => 
      p.weekId === week.week && p.done
    ).length;
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  // Get day name
  const getDayName = (dayKey: string) => {
    const dayNames = {
      sat: { ar: 'السبت', en: 'Saturday' },
      sun: { ar: 'الأحد', en: 'Sunday' },
      mon: { ar: 'الإثنين', en: 'Monday' },
      tue: { ar: 'الثلاثاء', en: 'Tuesday' },
      wed: { ar: 'الأربعاء', en: 'Wednesday' },
      thu: { ar: 'الخميس', en: 'Thursday' },
      fri: { ar: 'الجمعة', en: 'Friday' }
    };
    return dayNames[dayKey as keyof typeof dayNames]?.[language] || dayKey;
  };

  // Get task type configuration
  const getTaskTypeConfig = (type: string) => {
    const configs = {
      'Blue Team': { color: 'blue', icon: Shield },
      'Red Team': { color: 'red', icon: Target },
      'Practical': { color: 'green', icon: BookOpen },
      'Theoretical': { color: 'purple', icon: Users },
      'Policies': { color: 'orange', icon: TrendingUp }
    };
    return configs[type as keyof typeof configs] || { color: 'gray', icon: Circle };
  };

  const handleWeekClick = (week: any) => {
    navigate(`/week/${week.week}`);
  };

  // Calculate phase progress
  const phaseProgress = phaseWeeks.length > 0 ? 
    Math.round(phaseWeeks.reduce((sum, week) => sum + getWeekProgress(week), 0) / phaseWeeks.length) : 0;

  return (
    <PageLayout 
      title={language === 'ar' ? `المرحلة ${currentPhase.id}` : `Phase ${currentPhase.id}`}
      subtitle={currentPhase.title[language]}
      showBottomBar={true}
      titleClassName="text-center text-3xl md:text-4xl font-bold text-white drop-shadow-lg"
      subtitleClassName="text-center text-lg text-white/90"
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Phase Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentPhase.title[language]}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPhase.focus[language]}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {phaseProgress}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'متوسط التقدم' : 'Average Progress'}
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {phaseWeeks.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'أسبوع' : 'Weeks'}
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {phaseWeeks.filter(week => getWeekProgress(week) === 100).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'مكتملة' : 'Completed'}
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(phaseWeeks.reduce((sum, week) => sum + getWeekProgress(week), 0) / phaseWeeks.length || 0)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'متوسط التقدم' : 'Avg Progress'}
              </div>
            </div>
          </Card>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phaseWeeks.map((week, index) => {
            // Ensure week has required properties
            if (!week || typeof week.week !== 'number') {
              return null;
            }

            const weekProgress = getWeekProgress(week);
            const isCompleted = weekProgress === 100;
            const hasProgress = weekProgress > 0;

            return (
              <motion.div
                key={`week-${week.week}-${index}`}
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
                  <div className="flex items-center justify-between mb-6">
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
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {language === 'ar' ? `الأسبوع ${week.week}` : `Week ${week.week}`}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'أسبوع التعلم' : 'Learning Week'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  {/* Days Preview */}
                  <div className="space-y-3">
                    {week.days?.slice(0, 5).map((day, dayIndex) => {
                      if (!day || !day.key) return null;

                      const dayTasks = day.tasks || [];
                      const completedTasks = progress.filter(p => 
                        p.weekId === week.week && p.dayKey === day.key && p.done
                      ).length;
                      const dayProgress = dayTasks.length > 0 ? 
                        Math.round((completedTasks / dayTasks.length) * 100) : 0;

                      return (
                        <div key={`day-${week.week}-${day.key}-${dayIndex}`} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
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
                          
                          {/* Progress Line Only */}
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
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
                        {language === 'ar' ? 'التقدم' : 'Progress'}
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
                          'bg-transparent'
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
      </motion.div>
    </PageLayout>
  );
}