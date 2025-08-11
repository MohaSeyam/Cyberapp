import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Shield, Bug, FileText
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import planData from '../data/PlanData.json';
import phasesData from '../data/phases.json';

const DaysPage = () => {
  const { weekId } = useParams();
  const navigate = useNavigate();
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;
  const isRTL = language === 'ar';

  // Safe access to useApp
  let appData;
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useApp:', error);
    appData = {
      progress: [],
      addOrUpdateProgress: async () => {},
      weekEvaluations: [],
      addOrUpdateWeekEvaluation: () => {}
    };
  }
  const { progress, addOrUpdateProgress, weekEvaluations, addOrUpdateWeekEvaluation } = appData;

  // Ensure data is available
  const safeProgress = Array.isArray(progress) ? progress : [];
  const safeWeekEvaluations = Array.isArray(weekEvaluations) ? weekEvaluations : [];

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Find current week data
  const week = (planData || []).find(w => w.week === parseInt(weekId));
  const weekNumber = parseInt(weekId);

  // Determine current phase
  const getCurrentPhase = () => {
    return (phasesData || []).find(phase => phase.weeks.includes(weekNumber));
  };

  const currentPhase = getCurrentPhase();

  // Safe translation function
  const safeT = (key) => {
    return key || (language === 'ar' ? 'غير محدد' : 'Undefined');
  };

  // Get day completion
  const getDayCompletion = (weekNumber, dayKey) => {
    const dayProgress = safeProgress.filter(p => p.weekId === weekNumber && p.dayKey === dayKey);
    if (dayProgress.length === 0) return { percentage: 0, completed: 0, total: 0 };
    
    const totalTasks = dayProgress.length;
    const completedTasks = dayProgress.filter(p => p.done).length;
    
    return {
      percentage: Math.round((completedTasks / totalTasks) * 100),
      completed: completedTasks,
      total: totalTasks
    };
  };

  // Get week completion
  const getWeekCompletion = (weekNumber) => {
    const weekProgress = safeProgress.filter(p => p.weekId === weekNumber);
    if (weekProgress.length === 0) return { percentage: 0, completed: 0, total: 0 };
    
    const totalTasks = weekProgress.length;
    const completedTasks = weekProgress.filter(p => p.done).length;
    
    return {
      percentage: Math.round((completedTasks / totalTasks) * 100),
      completed: completedTasks,
      total: totalTasks
    };
  };

  // Navigation functions
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

  const goToDayView = (dayIndex) => {
    if (currentPhase) {
      navigate(`/phases/${currentPhase.id}/weeks/${weekId}/days/${dayIndex + 1}`);
    } else {
      navigate(`/phases/1/weeks/${weekId}/days/${dayIndex + 1}`);
    }
  };

  const goToWeekView = () => {
    if (currentPhase) {
              navigate(`/phases/${currentPhase.id}`);
    } else {
      navigate('/phases');
    }
  };

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

  // Task type configurations
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

  // Week Evaluation Widget
  const WeekEvaluationWidget = ({ weekId, language, allTasksCompleted }) => {
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState('');
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const evalObj = safeWeekEvaluations.find(e => e.weekId === weekId);

    React.useEffect(() => {
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

    // Summary view
    const summary = evalObj && evalObj.rating ? (
      <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(star => (
            <span key={star} className={star <= evalObj.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          ))}
        </span>
        {evalObj.note && (
          <span className="text-xs text-gray-400 max-w-xs truncate">{evalObj.note.slice(0, 30)}...</span>
        )}
      </span>
    ) : null;

    if (!open) {
      return (
        <div className="mt-2 mb-4">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
          >
            <Star className="w-4 h-4" />
            {language === 'ar' ? 'تقييم الأسبوع' : 'Rate Week'}
          </button>
          {summary}
        </div>
      );
    }

    return (
      <div className="mt-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            {language === 'ar' ? 'تقييم الأسبوع:' : 'Week Rating:'}
          </span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                <span className={star <= rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>★</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-green-400 mt-1" />
          <textarea
            className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-900"
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
          />
        </div>
        <div className="flex justify-end items-center gap-2">
          {saved && (
            <span className="text-green-600 text-xs font-semibold transition-all">
              {language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved!'}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
          >
            {language === 'ar' ? 'حفظ التقييم' : 'Save Rating'}
          </Button>
        </div>
      </div>
    );
  };

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: (delay = 0) => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay }
    })
  };

  if (!week) {
    return (
      <PageLayout title="خطأ" subtitle="الأسبوع غير موجود" showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? `الأسبوع ${weekNumber} غير موجود` : `Week ${weekNumber} not found`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' 
              ? 'قد تكون البيانات غير محملة بشكل صحيح. جرب تحديث البيانات.'
              : 'The data may not be loaded correctly. Try refreshing the data.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="primary">
              {language === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
            </Button>
            <Button onClick={goToWeekView} variant="outline">
              {language === 'ar' ? 'العودة للمراحل' : 'Back to Phases'}
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const currentDay = week.days?.[selectedDayIndex];
  const weekCompletion = getWeekCompletion(weekNumber);

  // Check if all tasks in the week are completed
  const allTasksCompleted = week.days?.filter(day => day.key !== 'fri').every(day => 
    getDayCompletion(weekNumber, day.key).percentage === 100
  );

  return (
    <PageLayout 
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={goToWeekView}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span>
              {currentPhase 
                ? `${language === 'ar' ? 'العودة لمرحلة' : 'Back to'} ${currentPhase.title?.[language] || currentPhase.title?.en || (language === 'ar' ? 'المرحلة' : 'Phase')}`
                : language === 'ar' ? 'العودة للمراحل' : 'Back to Phases'
              }
            </span>
          </Button>
        </div>

        {/* Week Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2">
            {language === 'ar' ? `الأسبوع ${weekNumber}` : `Week ${weekNumber}`}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {week.title[language]}
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {week.objective[language]}
          </p>
        </div>

        {/* Week Progress */}
        <motion.div {...animations.stagger(0.1)}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'تقدم الأسبوع' : 'Week Progress'}
              </h2>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {weekCompletion.completed}/{weekCompletion.total} {language === 'ar' ? 'مهام' : 'tasks'}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  weekCompletion.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${weekCompletion.percentage}%` }}
              />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {weekCompletion.percentage}%
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Days Navigation */}
        <motion.div {...animations.stagger(0.2)}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                icon={<ChevronLeft />}
                onClick={goToPreviousDay}
                disabled={selectedDayIndex <= 0}
              />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'أيام الأسبوع' : 'Week Days'}
              </h2>
              <Button
                variant="ghost"
                icon={<ChevronRight />}
                onClick={goToNextDay}
                disabled={selectedDayIndex >= (week.days?.length || 0) - 1}
              />
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {week.days?.map((day, index) => {
                const DayIcon = dayIcons[day.key] || Calendar;
                const completion = getDayCompletion(weekNumber, day.key);
                const isCompleted = completion.percentage === 100;
                const isSelected = index === selectedDayIndex;
                
                return (
                  <motion.div
                    key={day.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-blue-500' :
                        isCompleted ? 'ring-2 ring-green-500' : ''
                      }`}
                      onClick={() => setSelectedDayIndex(index)}
                      hover={true}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <DayIcon className={`w-5 h-5 ${
                              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {day.day[language]}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {day.topic[language]}
                            </p>
                          </div>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {language === 'ar' ? 'التقدم' : 'Progress'}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {completion.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${completion.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Tasks Count */}
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{completion.completed}/{completion.total} {language === 'ar' ? 'مهام' : 'tasks'}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDayView(index);
                          }}
                        >
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Selected Day Details */}
        {currentDay && (
          <motion.div {...animations.stagger(0.3)}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentDay.day[language]} - {currentDay.topic[language]}
                </h2>
                <Button
                  variant="primary"
                  onClick={() => goToDayView(selectedDayIndex)}
                >
                  {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </div>

              {/* Tasks Preview */}
              <div className="space-y-3">
                {currentDay.tasks?.slice(0, 3).map((task, index) => {
                  const typeInfo = taskTypeConfig[task.type] || taskTypeConfig['Blue Team'];
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                        <TypeIcon className={`w-4 h-4 ${typeInfo.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {task.description[language]}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {task.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {currentDay.tasks?.length > 3 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {language === 'ar' 
                      ? `و ${currentDay.tasks.length - 3} مهام أخرى...`
                      : `And ${currentDay.tasks.length - 3} more tasks...`
                    }
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Week Evaluation */}
        <motion.div {...animations.stagger(0.4)}>
          <Card className="p-6">
            <WeekEvaluationWidget 
              weekId={weekNumber} 
              language={language} 
              allTasksCompleted={allTasksCompleted}
            />
          </Card>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default DaysPage;