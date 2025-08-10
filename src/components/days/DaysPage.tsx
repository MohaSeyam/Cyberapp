import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Home, ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Shield, Bug, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WeekEvaluation } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';
import phasesData from '../../data/phases.json';

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

// WeekEvaluationWidget component
const WeekEvaluationWidget = ({ weekId, language, allTasksCompleted }) => {
  const { weekEvaluations, addOrUpdateWeekEvaluation } = useApp();
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const evalObj = weekEvaluations.find(e => e.weekId === weekId);
  const isRTL = language === 'ar';

  useEffect(() => {
    if (evalObj) {
      setRating(evalObj.rating);
      setNote(evalObj.note || '');
    } else {
      setRating(0);
      setNote('');
    }
  }, [evalObj, weekId]);

  const handleSave = () => {
    addOrUpdateWeekEvaluation({ weekId, rating, note: note || undefined });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  // ملخص التقييم
  const summary = evalObj && evalObj.rating ? (
    <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 ml-2">
      <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(star => (
          <span key={star} className={star <= evalObj.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
      </span>
      {evalObj.note && (
        <span className="ml-2 text-xs text-gray-400 max-w-xs truncate">{evalObj.note.slice(0, 30)}...</span>
      )}
    </span>
  ) : null;

  if (!allTasksCompleted) return null;

  return (
    <div className="mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow hover:bg-green-50 dark:hover:bg-green-800 transition-all text-xs font-semibold ${open ? 'ring-2 ring-green-400' : ''}`}
        title={language === 'ar' ? 'تقييم الأسبوع' : 'Rate Week'}
      >
        <Star className="w-4 h-4 text-yellow-400 mr-1" />
        {language === 'ar' ? 'تقييم الأسبوع' : 'Rate Week'}
        {summary}
      </button>
      {open && (
        <div className="mt-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-green-200 dark:border-green-700 shadow-2xl max-w-xs animate-fade-in flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{language === 'ar' ? 'تقييم الأسبوع:' : 'Week Rating:'}</span>
            <span className="flex items-center gap-0.5 ml-2">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                  <span className={star <= rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>★</span>
                </button>
              ))}
            </span>
          </div>
          <div className="flex items-start gap-2 mb-1">
            <FileText className="w-5 h-5 text-green-400 mt-1" />
            <textarea
              className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-900"
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={language === 'ar' ? 'ملاحظات عن الأسبوع...' : 'Notes about this week...'}
            />
          </div>
          <div className="flex justify-end items-center gap-2 mt-2">
            {saved && (
              <span className="text-green-600 text-xs font-semibold transition-all">{language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved!'}</span>
            )}
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-1 text-sm font-semibold shadow transition-all">
              {language === 'ar' ? 'حفظ التقييم' : 'Save Evaluation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
    const dayProgress = safeProgress.filter(p => Number(p.weekId) === Number(weekNumber) && p.dayKey === dayKey);
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

    const totalTasks = week.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => Number(p.weekId) === Number(weekNumber));
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

  // تحديد المرحلة التي ينتمي إليها هذا الأسبوع
  const getCurrentPhase = () => {
    return phasesData.find(phase => phase.weeks.includes(weekNumber));
  };

  const currentPhase = getCurrentPhase();

  const goToWeekView = () => {
    if (currentPhase) {
      navigate(`/phase/${currentPhase.id}`);
    } else {
      navigate('/phases');
    }
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

  // في DaysPage، احسب هل جميع المهام في الأسبوع مكتملة، ومرر allTasksCompleted إلى WeekEvaluationWidget
  const allTasksCompleted = week.days?.filter(day => day.key !== 'fri').every(day => 
    getDayCompletion(weekNumber, day.key).percentage === 100
  );

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
        {/* Back Button */}
        <div className="flex items-center mb-4">
          <button
            onClick={goToWeekView}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {currentPhase 
                ? `العودة لمرحلة ${currentPhase.title?.ar || currentPhase.title?.en || 'المرحلة'}`
                : 'العودة للمراحل'
              }
            </span>
          </button>
        </div>

        {/* Breadcrumbs */}
        {/* تم إزالة العنوان والشرح من الأعلى */}
        {/* Week Header - اسم الأسبوع صغير، العنوان كبير، لا زر عودة */}
        <div className="mb-4">
          <span className="text-base text-gray-500 dark:text-gray-400">الأسبوع {weekNumber}</span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1 mb-2">
            {week.title?.ar}
          </h1>
        </div>
        {/* Week Evaluation Widget */}
        <WeekEvaluationWidget weekId={weekNumber} language={t('language') === 'ar' ? 'ar' : 'en'} allTasksCompleted={allTasksCompleted} />
        {/* Days List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            أيام الأسبوع
          </h3>
          <div className="space-y-3">
            {week.days?.filter(day => day.key !== 'fri').map((day, dayIndex) => {
              const dayKey = day.key;
              const dayProgress = safeProgress.filter(p => 
                Number(p.weekId) === Number(weekNumber) && p.dayKey === dayKey
              );
              const completedTasks = dayProgress.filter(p => p.done).length;
              const totalTasks = day.tasks?.length || 0;
              const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const DayIcon = dayIcons[dayKey] || Calendar;
              return (
                <motion.div 
                  key={dayKey} 
                  {...animations.stagger(dayIndex * 0.1)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600`}
                  onClick={() => goToDayView(dayIndex)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900 shadow-sm">
                      <DayIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {day.name?.ar || day.day?.ar}
                      </h4>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        {day.topic?.ar}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">عدد المهام</span>
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
              );
            })}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
        }
