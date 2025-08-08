import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Shield, Bug, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';

// Day icons mapping
const dayIcons = {
  sat: Sun,
  sun: Sun,
  mon: Coffee,
  tue: Zap,
  wed: Heart,
  thu: Brain,
  fri: Star
};

export default function DaysPage() {
  const { plan, progress, refreshData } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { weekId } = useParams();

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  const weekNumber = parseInt(weekId);
  const week = safePlan.find(w => w.week === weekNumber);

  // Calculate day completion
  const getDayCompletion = (weekNumber: number, dayKey: string) => {
    const dayProgress = safeProgress.filter(p => 
      p.weekId === (weekNumber?.toString() || '') && p.dayKey === dayKey
    );
    const completedTasks = dayProgress.filter(p => p.done).length;
    const totalTasks = dayProgress.length;
    
    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Calculate week completion
  const getWeekCompletion = () => {
    if (!week) return { totalTasks: 0, completedTasks: 0, progress: 0 };

    const totalTasks = week.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => p.weekId === (weekNumber?.toString() || ''));
    const completedTasks = weekProgress.filter(p => p.done).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, progress };
  };

  const goToNextDay = () => {
    if (selectedDayIndex < (week?.days?.length || 0) - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const goToPreviousDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const goToDayView = (dayIndex: number) => {
    navigate(`/day/${weekId}/${dayIndex}`);
  };

  const goToWeekView = () => {
    navigate('/phases');
  };

  if (!week) {
    return (
      <PageLayout 
        title="أسبوع غير موجود"
        subtitle="الأسبوع المطلوب غير متوفر"
        showBottomBar={true}
      >
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            الأسبوع المطلوب غير موجود في الخطة
          </p>
          <Button onClick={goToWeekView} variant="primary">
            العودة إلى المراحل
          </Button>
        </div>
      </PageLayout>
    );
  }

  const weekCompletion = getWeekCompletion();
  const days = week.days?.filter(day => day.key !== 'fri') || [];

  return (
    <PageLayout 
      title={`الأسبوع ${weekNumber}`}
      subtitle={`${weekCompletion.completedTasks} من ${weekCompletion.totalTasks} مهمة مكتملة`}
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
              onClick={goToWeekView}
              variant="outline"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للمراحل
            </Button>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            الأسبوع {weekNumber}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
            {week.title?.ar || `أهداف ومهام الأسبوع ${weekNumber}`}
          </p>
          
          {/* Week Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تقدم الأسبوع
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {weekCompletion.completedTasks} من {weekCompletion.totalTasks} مهمة مكتملة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {weekCompletion.progress}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500 bg-blue-500"
                style={{ width: `${weekCompletion.progress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day, index) => {
            const completion = getDayCompletion(weekNumber, day.key);
            const DayIcon = dayIcons[day.key as keyof typeof dayIcons] || Sun;
            
            return (
              <motion.div
                key={day.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => goToDayView(index)}
              >
                <Card
                  className={`h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    completion.percentage === 100 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <DayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {completion.percentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        مكتمل
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {day.title?.ar || `اليوم ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {completion.total} مهمة - {completion.completed} مكتملة
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                        style={{ width: `${completion.percentage}%` }}
                      />
                    </div>

                    {completion.percentage === 100 && (
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

        {/* Week Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                ملخص الأسبوع
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    إجمالي المهام
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {weekCompletion.totalTasks}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    المهام المكتملة
                  </h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {weekCompletion.completedTasks}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    نسبة الإنجاز
                  </h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {weekCompletion.progress}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}