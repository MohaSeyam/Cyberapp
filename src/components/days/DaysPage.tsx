import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Home, ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Shield, Bug, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';
import { FixedSizeList as List } from 'react-window';

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
  const { plan, progress, refreshData } = useApp();
  const { t, lang } = useLocalization();
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
      p.weekId?.toString() === (weekNumber?.toString() || '') && p.dayKey === dayKey
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
    const weekProgress = safeProgress.filter(p => p.weekId?.toString() === (weekNumber?.toString() || ''));
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
            الأسبوع {weekNumber} غير موجود
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            قد تكون البيانات غير محملة بشكل صحيح. جرب تحديث البيانات.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={refreshData} variant="primary">
              تحديث البيانات
            </Button>
            <Button onClick={goToWeekView} variant="outline">
              العودة للمراحل
            </Button>
          </div>
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

  return (
    <PageLayout 
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Breadcrumbs */}
        {/* تم إزالة العنوان والشرح من الأعلى */}
        {/* Week Header - اسم الأسبوع صغير، العنوان كبير، لا زر عودة */}
        <div className="mb-4">
          <span className="text-base text-gray-500 dark:text-gray-400">{t('week')} {weekNumber}</span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1 mb-2">
            {week.title?.[lang]}
          </h1>
        </div>
        {/* Days List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('daysOfWeek')}
          </h3>
          {/* virtualization: استخدم react-window بدلاً من map */}
          <div style={{ height: 500, width: '100%' }}>
            <List
              height={500}
              itemCount={week.days?.filter(day => day.key !== 'fri').length || 0}
              itemSize={140}
              width={'100%'}
              itemData={{
                days: week.days?.filter(day => day.key !== 'fri') || [],
                safeProgress,
                weekNumber,
                lang,
                t,
                goToDayView,
                animations
              }}
            >
              {({ index, style, data }) => {
                const day = data.days[index];
                const dayKey = day.key;
                const dayProgress = data.safeProgress.filter(p => 
                  p.weekId?.toString() === (data.weekNumber?.toString() || '') && p.dayKey === dayKey
                );
                const completedTasks = dayProgress.filter(p => p.done).length;
                const totalTasks = day.tasks?.length || 0;
                const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                const DayIcon = dayIcons[dayKey] || Calendar;
                return (
                  <div style={style}>
                    <motion.div 
                      key={dayKey} 
                      {...data.animations.stagger(index * 0.1)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600`}
                      onClick={() => data.goToDayView(index)}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900 shadow-sm">
                          <DayIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {day.name?.[data.lang] || day.day?.[data.lang]}
                          </h4>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            {day.topic?.[data.lang]}
                          </p>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{data.t('tasksCount')}</span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{completedTasks}/{totalTasks}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                        <div 
                          className="h-3 rounded-full transition-all duration-300 bg-blue-500"
                          style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                        />
                      </div>
                    </motion.div>
                  </div>
                );
              }}
            </List>
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
        }
