// Progress Page - Unified Design
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Target, Calendar, Award, Clock, CheckCircle,
  BarChart3, PieChart, Activity, Star, Trophy, Zap,
  Lightbulb, BookOpen, Users, Rocket, Shield, Brain,
  Heart, Coffee, Flame, Crown, Medal, Gift, Sparkles,
  Target as TargetIcon, Eye, Brain as BrainIcon, Zap as ZapIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { animations } from '../constants/theme';

export default function ProgressPage() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Calculate statistics with safety checks
  const totalWeeks = safePlan.length;
  const totalTasks = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
  );
  const completedTasks = safeProgress.filter(p => p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate total duration with safety checks
  const totalDuration = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => 
      dayTotal + (day.tasks || []).reduce((taskTotal, task) => taskTotal + (task.duration || 0), 0), 0
    ), 0
  );
  
  const completedDuration = safeProgress.reduce((total, p) => {
    const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
    return total + (task?.duration || 0);
  }, 0);

  // Get current week progress with safety checks
  const currentWeek = safePlan.find(w => w.week === 1);
  const currentWeekTasks = currentWeek?.days?.reduce((total, day) => total + (day.tasks || []).length, 0) || 0;
  const currentWeekCompleted = safeProgress.filter(p => 
    currentWeek?.days?.some(day => (day.tasks || []).some(task => task.id === p.taskId))
  ).length;

  // Get phase statistics with safety checks
  const phases = Array.from(new Set(safePlan.map(week => week.phase))).sort();
  const phaseStats = phases.map(phase => {
    const phaseWeeks = safePlan.filter(week => week.phase === phase);
    const phaseTasks = phaseWeeks.reduce((total, week) => 
      total + (week.days || []).reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
    );
    const phaseCompleted = safeProgress.filter(p => 
      phaseWeeks.some(week => 
        (week.days || []).some(day => (day.tasks || []).some(task => task.id === p.taskId))
      )
    ).length;
    
    return {
      phase,
      totalTasks: phaseTasks,
      completedTasks: phaseCompleted,
      completionRate: phaseTasks > 0 ? Math.round((phaseCompleted / phaseTasks) * 100) : 0
    };
  });

  // Get recent activity with safety checks
  const recentProgress = safeProgress
    .filter(p => p.done)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  // Smart Suggestions System
  const suggestions = useMemo(() => {
    const suggestionsList = [];

    // اقتراحات بناءً على التقدم
    if (completedTasks === 0) {
      suggestionsList.push({
        icon: Rocket,
        title: lang === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey',
        description: lang === 'ar' ? 'ابدأ بأول مهمة لتبدأ رحلتك في الأمن السيبراني' : 'Start with your first task to begin your cybersecurity journey',
        type: 'motivation',
        priority: 'high',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }

    if (completedTasks > 0 && completedTasks < 5) {
      suggestionsList.push({
        icon: Target,
        title: lang === 'ar' ? 'استمر في التقدم' : 'Keep Going',
        description: lang === 'ar' ? 'أنت على الطريق الصحيح! أكمل المزيد من المهام' : 'You\'re on the right track! Complete more tasks',
        type: 'motivation',
        priority: 'medium',
        color: 'text-green-600',
        bg: 'bg-green-50'
      });
    }

    // اقتراحات بناءً على معدل الإنجاز
    if (completionRate < 30) {
      suggestionsList.push({
        icon: Clock,
        title: lang === 'ar' ? 'خصص وقتاً منتظماً' : 'Set Regular Time',
        description: lang === 'ar' ? 'خصص 30 دقيقة يومياً للتعلم لتحسين تقدمك' : 'Set aside 30 minutes daily for learning to improve your progress',
        type: 'time-management',
        priority: 'high',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      });
    }

    if (completionRate > 70) {
      suggestionsList.push({
        icon: Trophy,
        title: lang === 'ar' ? 'أداء ممتاز!' : 'Excellent Performance!',
        description: lang === 'ar' ? 'معدل إنجازك ممتاز! فكر في التحديات المتقدمة' : 'Your completion rate is excellent! Consider advanced challenges',
        type: 'achievement',
        priority: 'medium',
        color: 'text-purple-600',
        bg: 'bg-purple-50'
      });
    }

    // اقتراحات بناءً على نوع المهام المكتملة
    const completedTaskTypes = safeProgress
      .filter(p => p.done)
      .map(p => {
        const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
        return task?.type;
      })
      .filter(Boolean);

    const blueTeamTasks = completedTaskTypes.filter(type => type === 'Blue Team').length;
    const redTeamTasks = completedTaskTypes.filter(type => type === 'Red Team').length;
    const practicalTasks = completedTaskTypes.filter(type => type === 'Practical').length;

    if (blueTeamTasks > redTeamTasks) {
      suggestionsList.push({
        icon: Shield,
        title: lang === 'ar' ? 'جرب الهجوم الأخلاقي' : 'Try Ethical Hacking',
        description: lang === 'ar' ? 'أنت جيد في الدفاع، جرب مهام Red Team' : 'You\'re good at defense, try Red Team tasks',
        type: 'skill-balance',
        priority: 'medium',
        color: 'text-red-600',
        bg: 'bg-red-50'
      });
    }

    if (redTeamTasks > blueTeamTasks) {
      suggestionsList.push({
        icon: Shield,
        title: lang === 'ar' ? 'تعلم الدفاع' : 'Learn Defense',
        description: lang === 'ar' ? 'أنت جيد في الهجوم، تعلم تقنيات الدفاع' : 'You\'re good at offense, learn defense techniques',
        type: 'skill-balance',
        priority: 'medium',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }

    if (practicalTasks < completedTasks * 0.3) {
      suggestionsList.push({
        icon: Wrench,
        title: lang === 'ar' ? 'الممارسة العملية' : 'Practical Practice',
        description: lang === 'ar' ? 'ركز على المهام العملية لتحسين مهاراتك' : 'Focus on practical tasks to improve your skills',
        type: 'skill-development',
        priority: 'high',
        color: 'text-green-600',
        bg: 'bg-green-50'
      });
    }

    // اقتراحات بناءً على الوقت
    const lastActivity = safeProgress
      .filter(p => p.done)
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];

    if (lastActivity) {
      const daysSinceLastActivity = Math.floor((Date.now() - new Date(lastActivity.updatedAt || 0).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastActivity > 3) {
        suggestionsList.push({
          icon: Coffee,
          title: lang === 'ar' ? 'عد للتعلم' : 'Return to Learning',
          description: lang === 'ar' ? `مر ${daysSinceLastActivity} أيام منذ آخر نشاط، حان الوقت للعودة` : `It's been ${daysSinceLastActivity} days since your last activity, time to return`,
          type: 'motivation',
          priority: 'high',
          color: 'text-orange-600',
          bg: 'bg-orange-50'
        });
      }
    }

    // اقتراحات عامة
    if (completionRate > 50) {
      suggestionsList.push({
        icon: Users,
        title: lang === 'ar' ? 'انضم للمجتمع' : 'Join the Community',
        description: lang === 'ar' ? 'انضم لمجتمع الأمن السيبراني لتبادل الخبرات' : 'Join the cybersecurity community to share experiences',
        type: 'community',
        priority: 'low',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
      });
    }

    if (completedTasks > 10) {
      suggestionsList.push({
        icon: BookOpen,
        title: lang === 'ar' ? 'اقرأ المزيد' : 'Read More',
        description: lang === 'ar' ? 'اقرأ الكتب والمقالات المتخصصة في الأمن السيبراني' : 'Read specialized books and articles in cybersecurity',
        type: 'knowledge',
        priority: 'medium',
        color: 'text-teal-600',
        bg: 'bg-teal-50'
      });
    }

    // اقتراحات بناءً على الوقت المستغرق
    const averageTaskTime = completedTasks > 0 ? completedDuration / completedTasks : 0;
    if (averageTaskTime > 60) {
      suggestionsList.push({
        icon: Brain,
        title: lang === 'ar' ? 'تحسين التركيز' : 'Improve Focus',
        description: lang === 'ar' ? 'حاول تقليل وقت المهام بتحسين التركيز' : 'Try to reduce task time by improving focus',
        type: 'productivity',
        priority: 'medium',
        color: 'text-pink-600',
        bg: 'bg-pink-50'
      });
    }

    // اقتراحات بناءً على المراحل
    const currentPhase = Math.max(...phases.filter(phase => {
      const phaseStat = phaseStats.find(p => p.phase === phase);
      return phaseStat && phaseStat.completionRate > 80;
    }));

    if (currentPhase > 0) {
      suggestionsList.push({
        icon: Crown,
        title: lang === 'ar' ? 'انتقل للمرحلة التالية' : 'Move to Next Phase',
        description: lang === 'ar' ? `أنت جاهز للمرحلة ${currentPhase + 1}` : `You're ready for Phase ${currentPhase + 1}`,
        type: 'progression',
        priority: 'high',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      });
    }

    // ترتيب الاقتراحات حسب الأولوية
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return suggestionsList.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]).slice(0, 6);
  }, [completedTasks, completionRate, safeProgress, safePlan, phases, phaseStats, completedDuration, lang]);

  const stats = [
    {
      icon: Target,
      label: t('totalTasks'),
      value: totalTasks,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: t('completedTasks'),
      value: completedTasks,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: t('completionRate'),
      value: `${completionRate}%`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Clock,
      label: t('totalHours'),
      value: Math.round(totalDuration / 60),
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const achievements = [
    {
      icon: Star,
      title: lang === 'ar' ? 'أول خطوة' : 'First Step',
      description: lang === 'ar' ? 'أكمل أول مهمة' : 'Complete your first task',
      unlocked: completedTasks >= 1,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      progress: Math.min(completedTasks, 1)
    },
    {
      icon: Trophy,
      title: lang === 'ar' ? 'محارب الأسبوع' : 'Week Warrior',
      description: lang === 'ar' ? 'أكمل أسبوع كامل' : 'Complete a full week',
      unlocked: currentWeekCompleted >= currentWeekTasks,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      progress: Math.min(currentWeekCompleted, currentWeekTasks)
    },
    {
      icon: Zap,
      title: lang === 'ar' ? 'متعلم سريع' : 'Speed Learner',
      description: lang === 'ar' ? 'أكمل 5 مهام' : 'Complete 5 tasks',
      unlocked: completedTasks >= 5,
      color: 'text-green-600',
      bg: 'bg-green-50',
      progress: Math.min(completedTasks, 5)
    },
    {
      icon: Crown,
      title: lang === 'ar' ? 'ملك الأمن السيبراني' : 'Cybersecurity King',
      description: lang === 'ar' ? 'أكمل 20 مهمة' : 'Complete 20 tasks',
      unlocked: completedTasks >= 20,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      progress: Math.min(completedTasks, 20)
    },
    {
      icon: Shield,
      title: lang === 'ar' ? 'حامي الشبكات' : 'Network Guardian',
      description: lang === 'ar' ? 'أكمل 10 مهام دفاعية' : 'Complete 10 defensive tasks',
      unlocked: blueTeamTasks >= 10,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      progress: Math.min(blueTeamTasks, 10)
    },
    {
      icon: Fire,
      title: lang === 'ar' ? 'هاكر أخلاقي' : 'Ethical Hacker',
      description: lang === 'ar' ? 'أكمل 10 مهام هجومية' : 'Complete 10 offensive tasks',
      unlocked: redTeamTasks >= 10,
      color: 'text-red-600',
      bg: 'bg-red-50',
      progress: Math.min(redTeamTasks, 10)
    },
    {
      icon: Brain,
      title: lang === 'ar' ? 'عقل متطور' : 'Advanced Mind',
      description: lang === 'ar' ? 'أكمل 15 مهمة عملية' : 'Complete 15 practical tasks',
      unlocked: practicalTasks >= 15,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      progress: Math.min(practicalTasks, 15)
    },
    {
      icon: Heart,
      title: lang === 'ar' ? 'متسق' : 'Consistent',
      description: lang === 'ar' ? 'تعلم لمدة 7 أيام متتالية' : 'Learn for 7 consecutive days',
      unlocked: false, // سيتم حسابها لاحقاً
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      progress: 0
    }
  ];

  return (
    <PageLayout
      title={t('progress')}
      subtitle={t('trackYourLearning')}
      showHeader={true}
    >
      {/* Main Statistics */}
      <motion.div
        {...animations.fadeIn}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            {...animations.stagger(index * 0.1)}
          >
            <Card
              variant="elevated"
              className="text-center"
            >
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full ${stat.bg} mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card
          title={t('progressOverview')}
          subtitle={t('yourLearningProgress')}
        >
          <div className="space-y-6">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('overallProgress')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedTasks} / {totalTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                />
              </div>
            </div>

            {/* Current Week Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('currentWeek')} ({t('week')} 1)
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentWeekCompleted} / {currentWeekTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentWeekTasks > 0 ? Math.round((currentWeekCompleted / currentWeekTasks) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                />
              </div>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('timeSpent')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(completedDuration / 60)} / {Math.round(totalDuration / 60)} {t('hours')}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalDuration > 0 ? Math.round((completedDuration / totalDuration) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Phase Progress */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card
          title={lang === 'ar' ? 'تقدم المراحل' : 'Phase Progress'}
          subtitle={lang === 'ar' ? 'التقدم حسب المرحلة' : 'Progress by Phase'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phaseStats.map((phase, index) => (
              <motion.div
                key={phase.phase}
                {...animations.stagger(index * 0.1)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {lang === 'ar' ? 'المرحلة' : 'Phase'} {phase.phase}
                    </h4>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {phase.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.completionRate}%` }}
                      transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{phase.completedTasks} {lang === 'ar' ? 'مكتمل' : 'completed'}</span>
                    <span>{phase.totalTasks} {lang === 'ar' ? 'إجمالي' : 'total'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Advanced Statistics */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <Card
          title={lang === 'ar' ? 'إحصائيات متقدمة' : 'Advanced Statistics'}
          subtitle={lang === 'ar' ? 'تحليل مفصل لتقدمك' : 'Detailed analysis of your progress'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Task Type Distribution */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {lang === 'ar' ? 'توزيع أنواع المهام' : 'Task Type Distribution'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">🛡️ {lang === 'ar' ? 'دفاعي' : 'Blue Team'}</span>
                  <span>{blueTeamTasks}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">🔥 {lang === 'ar' ? 'هجومي' : 'Red Team'}</span>
                  <span>{redTeamTasks}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">⚡ {lang === 'ar' ? 'عملي' : 'Practical'}</span>
                  <span>{practicalTasks}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-600">💡 {lang === 'ar' ? 'مهارات ناعمة' : 'Soft Skills'}</span>
                  <span>{completedTasks - blueTeamTasks - redTeamTasks - practicalTasks}</span>
                </div>
              </div>
            </div>

            {/* Learning Speed */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {lang === 'ar' ? 'سرعة التعلم' : 'Learning Speed'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'متوسط الوقت/مهمة' : 'Avg Time/Task'}</span>
                  <span>{completedTasks > 0 ? Math.round(completedDuration / completedTasks) : 0} {lang === 'ar' ? 'دقيقة' : 'min'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'المهام/يوم' : 'Tasks/Day'}</span>
                  <span>{completedTasks > 0 ? (completedTasks / Math.max(1, Math.floor((Date.now() - new Date(safeProgress[0]?.updatedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1) : 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'ساعات التعلم' : 'Learning Hours'}</span>
                  <span>{Math.round(completedDuration / 60)} {lang === 'ar' ? 'ساعة' : 'hrs'}</span>
                </div>
              </div>
            </div>

            {/* Streak Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {lang === 'ar' ? 'معلومات الاستمرارية' : 'Streak Information'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'أطول سلسلة' : 'Longest Streak'}</span>
                  <span>0 {lang === 'ar' ? 'يوم' : 'days'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'السلسلة الحالية' : 'Current Streak'}</span>
                  <span>0 {lang === 'ar' ? 'يوم' : 'days'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'آخر نشاط' : 'Last Activity'}</span>
                  <span>{lastActivity ? new Date(lastActivity.updatedAt || 0).toLocaleDateString() : lang === 'ar' ? 'لا يوجد' : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {lang === 'ar' ? 'مقاييس الأداء' : 'Performance Metrics'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'كفاءة التعلم' : 'Learning Efficiency'}</span>
                  <span>{completionRate > 0 ? Math.round((completionRate / (completedDuration / 60)) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{lang === 'ar' ? 'نقاط التقدم' : 'Progress Points'}</span>
                  <span>{completedTasks * 10}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card
          title={lang === 'ar' ? 'الإنجازات' : 'Achievements'}
          subtitle={lang === 'ar' ? 'افتح إنجازاتك' : 'Unlock Your Achievements'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const maxProgress = achievement.title.includes('5') ? 5 : 
                                achievement.title.includes('10') ? 10 :
                                achievement.title.includes('15') ? 15 :
                                achievement.title.includes('20') ? 20 :
                                achievement.title.includes('أول') || achievement.title.includes('First') ? 1 :
                                currentWeekTasks;
              
              const progressPercentage = maxProgress > 0 ? (achievement.progress / maxProgress) * 100 : 0;
              
              return (
                <motion.div
                  key={achievement.title}
                  {...animations.stagger(index * 0.1)}
                >
                  <div className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    achievement.unlocked 
                      ? `${achievement.bg} border-current ${achievement.color}` 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked ? 'bg-white dark:bg-gray-900' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <achievement.icon className={`w-6 h-6 ${
                          achievement.unlocked ? achievement.color : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${
                          achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-xs ${
                          achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {achievement.progress} / {maxProgress}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                          className={`h-2 rounded-full ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {/* Unlock Status */}
                    {achievement.unlocked && (
                      <div className="mt-2 text-center">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {lang === 'ar' ? 'مفتوح' : 'Unlocked'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Smart Suggestions */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card
          title={lang === 'ar' ? 'الاقتراحات الذكية' : 'Smart Suggestions'}
          subtitle={lang === 'ar' ? 'اقتراحات مخصصة لتحسين تقدمك' : 'Personalized suggestions to improve your progress'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.title}
                {...animations.stagger(index * 0.1)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                  suggestion.bg + ' border-current ' + suggestion.color
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-900 ${suggestion.color}`}>
                    <suggestion.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm mb-1 ${suggestion.color}`}>
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {suggestion.priority === 'high' ? (lang === 'ar' ? 'عالية' : 'High') :
                         suggestion.priority === 'medium' ? (lang === 'ar' ? 'متوسطة' : 'Medium') :
                         (lang === 'ar' ? 'منخفضة' : 'Low')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{lang === 'ar' ? 'لا توجد اقتراحات حالياً' : 'No suggestions available'}</p>
              <p className="text-sm">{lang === 'ar' ? 'استمر في التعلم لرؤية اقتراحات مخصصة' : 'Continue learning to see personalized suggestions'}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.6 }}
      >
        <Card
          title={t('recentActivity')}
          subtitle={t('yourLatestProgress')}
        >
          <div className="space-y-4">
            {recentProgress.length > 0 ? (
              recentProgress.map((item, index) => {
                const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === item.taskId);
                return (
                  <motion.div
                    key={item.id}
                    {...animations.stagger(index * 0.05)}
                    className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {task?.title?.[lang] || t('completedTask')}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {new Date(item.updatedAt || 0).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noRecentActivity')}</p>
                <p className="text-sm">{t('completeTasksToSeeActivity')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}