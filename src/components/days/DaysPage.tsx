import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Home, ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Shield, Bug, Eye, FileText
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

// Breadcrumbs component
function Breadcrumbs({ items }: { items: Array<{ label: string; onClick?: () => void; icon?: any }> }) {
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
      
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          {item.onClick ? (
            <button onClick={item.onClick} className="text-blue-600 dark:text-blue-400 hover:underline">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </button>
          ) : (
            <span className="text-gray-700 dark:text-gray-200 font-semibold">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function DaysPage() {
  const { plan, progress } = useApp();
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
  const getWeekCompletion = (weekNumber: number) => {
    const week = safePlan.find(w => w.week === weekNumber);
    if (!week) return { completed: 0, total: 0, percentage: 0 };

    const totalTasks = week.days?.reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => p.weekId === (weekNumber?.toString() || ''));
    const completedTasks = weekProgress.filter(p => p.done).length;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Navigation functions
  const goToNextDay = () => {
    if (week && week.days && selectedDayIndex < week.days.length - 1) {
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
      <PageLayout title="خطأ" subtitle="الأسبوع غير موجود" showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            الأسبوع غير موجود
          </h3>
          <Button onClick={goToWeekView}>
            العودة للمراحل
          </Button>
        </div>
      </PageLayout>
    );
  }

  const currentDay = week.days?.[selectedDayIndex];
  const weekCompletion = getWeekCompletion(weekNumber);

  const breadcrumbs = [
    { label: 'المراحل', icon: Calendar, onClick: goToWeekView },
    { label: `الأسبوع ${weekNumber}`, icon: Target },
    { label: 'الأيام', icon: Calendar }
  ];

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

  return (
    <PageLayout 
      title={safeT('weekDays')}
      subtitle={week?.title?.ar || ''}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { 
              label: safeT('phases'), 
              icon: BookOpen,
              onClick: () => navigate('/phases')
            },
            { 
              label: safeT('week'), 
              icon: Calendar 
            }
          ]} 
        />
        
        {/* Week Overview Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                الأسبوع {weekNumber}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {week.title?.[lang]}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft />}
              onClick={goToWeekView}
            >
              العودة للمراحل
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                هدف الأسبوع
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {week.objective?.[lang]}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                تقدم الأسبوع
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {weekCompletion.percentage}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {weekCompletion.completed} / {weekCompletion.total} مهام
              </p>
            </div>
          </div>
        </Card>

        {/* Day Navigation */}
        {currentDay && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft />}
                  onClick={goToPreviousDay}
                  disabled={selectedDayIndex <= 0}
                />
                
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentDay.day?.[lang]}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentDay.topic?.[lang]}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={selectedDayIndex >= (week.days?.length || 0) - 1}
                />
              </div>
              
              <Button
                variant="primary"
                onClick={() => goToDayView(selectedDayIndex)}
              >
                عرض اليوم
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  موضوع اليوم
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentDay.topic?.[lang] || 'لا يوجد موضوع محدد'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  تقدم اليوم
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getDayCompletion(weekNumber, currentDay.key).percentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {getDayCompletion(weekNumber, currentDay.key).completed} / {getDayCompletion(weekNumber, currentDay.key).total} مهام
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Days List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            أيام الأسبوع
          </h3>
          
          <div className="space-y-3">
            {week.days?.map((day, dayIndex) => {
              const dayKey = day.key;
              const dayProgress = safeProgress.filter(p => 
                p.weekId === (weekNumber?.toString() || '') && p.dayKey === dayKey
              );
              const completedTasks = dayProgress.filter(p => p.done).length;
              const totalTasks = day.tasks?.length || 0;
              const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              return (
                <motion.div 
                  key={dayKey} 
                  {...animations.stagger(dayIndex * 0.1)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    completionPercentage === 100 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                  onClick={() => goToDayView(dayIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        completionPercentage === 100 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {completionPercentage === 100 ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <DayIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {day.day[lang]}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {day.topic[lang]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {completionPercentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {completedTasks}/{totalTasks} مهام
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}