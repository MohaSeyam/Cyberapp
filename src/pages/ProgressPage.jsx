import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, CheckCircle, Clock, Target, BarChart3, 
  Award, BookOpen, Users, Star, Activity, BarChart, TrendingDown, Zap, AlertCircle, XCircle, Info,
  FileText, ChevronDown, ChevronUp, Plus, SquarePen, Trash, Calendar as CalendarIcon
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import GoalEditorModal from '../components/GoalEditorModal';

const ProgressPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isExpanded, setIsExpanded] = useState({});
  const [goalEditor, setGoalEditor] = useState(null);
  const [goalFilter, setGoalFilter] = useState('all'); // all | active | completed
  const [goalSort, setGoalSort] = useState('recent'); // recent | progress_desc | due_asc
  const [goalQuery, setGoalQuery] = useState('');
  
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
      plan: [],
      progress: [],
      notes: [],
      journalEntries: [],
      taskEvaluations: [],
      weekEvaluations: []
    };
  }
  const { 
    plan, 
    progress, 
    notes, 
    journalEntries,
    taskEvaluations,
    weekEvaluations,
    resources,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    setGoalProgress
  } = appData;

  // Ensure data is available
  const safePlan = Array.isArray(plan) ? plan : [];
  const safeProgress = Array.isArray(progress) ? progress : [];
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];
  const safeTaskEvaluations = Array.isArray(taskEvaluations) ? taskEvaluations : [];
  const safeWeekEvaluations = Array.isArray(weekEvaluations) ? weekEvaluations : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeGoals = Array.isArray(goals) ? goals : [];

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const normalizeDate = (value) => {
        const d = new Date(value);
        return isNaN(d.getTime()) ? now : d;
      };

      const normalizedProgress = safeProgress.map(p => ({
        ...p,
        createdAt: p.createdAt || p.updatedAt || p.timestamp || now.toISOString()
      }));
      const normalizedEvaluations = safeTaskEvaluations.map(e => ({
        ...e,
        timestamp: e.timestamp || e.createdAt || now.toISOString()
      }));

      // Filter data based on selected period
      const getFilteredData = (data, dateField) => {
        const filtered = data.filter(item => {
          const itemDate = normalizeDate(item[dateField] || item.createdAt || item.timestamp);
          if (selectedPeriod === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= weekAgo;
          } else if (selectedPeriod === 'month') {
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
          } else if (selectedPeriod === 'year') {
            return itemDate.getFullYear() === currentYear;
          }
          return true; // all time
        });
        return filtered;
      };

      // Progress analytics
      const filteredProgress = getFilteredData(normalizedProgress, 'createdAt');
      const completedTasks = filteredProgress.filter(p => p.done).length;
      const totalTasks = filteredProgress.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Evaluation analytics
      const filteredEvaluations = getFilteredData(normalizedEvaluations, 'timestamp');
      const averageRating = filteredEvaluations.length > 0 
        ? filteredEvaluations.reduce((sum, ev) => sum + (ev.rating || 0), 0) / filteredEvaluations.length 
        : 0;
      const averageUnderstanding = filteredEvaluations.length > 0
        ? filteredEvaluations.reduce((sum, ev) => sum + (ev.understanding || 0), 0) / filteredEvaluations.length
        : 0;

      // Content analytics
      const filteredNotes = getFilteredData(safeNotes, 'createdAt');
      const filteredJournals = getFilteredData(safeJournalEntries, 'createdAt');
      const filteredResources = getFilteredData(safeResources, 'createdAt');

      // Study patterns
      const studyDays = new Set(filteredProgress.map(p => 
        normalizeDate(p.createdAt).toDateString()
      )).size;
      
      const totalStudyTime = filteredProgress.length * 25; // Assuming 25 minutes per task
      const averageTasksPerDay = studyDays > 0 ? filteredProgress.length / studyDays : 0;

      // Streak calculation
      const streak = calculateStreak(normalizedProgress);

      // Performance trends
      const trends = calculateTrends(normalizedProgress, normalizedEvaluations);

      // Learning insights
      const insights = generateInsights({
        completionRate,
        averageRating,
        averageUnderstanding,
        studyDays,
        totalStudyTime,
        averageTasksPerDay,
        streak,
        trends
      });

      return {
        completionRate: Math.round(completionRate * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        averageUnderstanding: Math.round(averageUnderstanding * 10) / 10,
        totalTasks: completedTasks,
        totalNotes: filteredNotes.length,
        totalJournals: filteredJournals.length,
        totalResources: filteredResources.length,
        studyDays,
        totalStudyTime,
        averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
        streak,
        trends,
        insights
      };
    } catch (error) {
      console.error('Analytics computation error:', error);
      return {
        completionRate: 0,
        averageRating: 0,
        averageUnderstanding: 0,
        totalTasks: 0,
        totalNotes: 0,
        totalJournals: 0,
        totalResources: 0,
        studyDays: 0,
        totalStudyTime: 0,
        averageTasksPerDay: 0,
        streak: 0,
        trends: Array.from({ length: 7 }, (_, i) => ({ date: new Date().toDateString(), tasks: 0, evaluations: 0 })),
        insights: []
      };
    }
  }, [safeProgress, safeTaskEvaluations, safeNotes, safeJournalEntries, safeResources, selectedPeriod]);

  // Calculate progress statistics for overview tab
  const progressStats = useMemo(() => {
    // Calculate total tasks and completed tasks
    const allTasks = safePlan.flatMap(week => 
      (week?.days || []).flatMap(day => day.tasks || [])
    );
    const totalCount = allTasks.length;
    const completedCount = safeProgress.filter(p => p.done).length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Calculate average rating
    const ratings = safeTaskEvaluations.map(evaluation => evaluation.rating).filter(rating => rating > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
    
    // Calculate phase progress - group weeks by phase
    const phaseGroups = safePlan.reduce((acc, week) => {
      const phaseId = week.phase;
      if (!acc[phaseId]) {
        acc[phaseId] = {
          id: phaseId,
          title: { ar: `المرحلة ${phaseId}`, en: `Phase ${phaseId}` },
          weeks: []
        };
      }
      acc[phaseId].weeks.push(week);
      return acc;
    }, {});
    
    const phaseProgress = Object.values(phaseGroups).map(phase => {
      const phaseTasks = phase.weeks
        .flatMap(week => (week?.days || []))
        .flatMap(day => (day?.tasks || []));
      
      const completedPhaseTasks = phaseTasks.filter(task => 
        safeProgress.some(completed => completed.taskId === task.id && completed.done)
      );
      
      return {
        ...phase,
        progress: phaseTasks.length > 0 ? (completedPhaseTasks.length / phaseTasks.length) * 100 : 0,
        completedTasks: completedPhaseTasks.length,
        totalTasks: phaseTasks.length
      };
    });

    // Calculate streak - count completed tasks (since we don't have completion dates)
    const currentStreak = safeProgress.filter(p => p.done).length;

    return {
      completionRate,
      averageRating,
      phaseProgress,
      currentStreak,
      completedCount,
      totalCount,
      notesCount: safeNotes.length,
      journalCount: safeJournalEntries.length
    };
  }, [safeProgress, safePlan, safeTaskEvaluations, safeNotes, safeJournalEntries]);

  // Helper functions for analytics
  function calculateStreak(progressData) {
    if (!progressData.length) return 0;
    
    const sortedDates = progressData
      .filter(p => p.done)
      .map(p => new Date(p.createdAt).toDateString())
      .sort()
      .reverse();
    
    if (!sortedDates.length) return 0;
    
    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if there's activity today or yesterday
    const hasRecentActivity = sortedDates.includes(today) || sortedDates.includes(yesterday);
    if (!hasRecentActivity) return 0;
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = new Date(sortedDates[i + 1]);
      const diffDays = (currentDate - nextDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateTrends(progressData, evaluationsData) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    const dailyProgress = last7Days.map(date => ({
      date,
      tasks: progressData.filter(p => 
        new Date(p.createdAt).toDateString() === date && p.done
      ).length,
      evaluations: evaluationsData.filter(e => 
        new Date(e.timestamp).toDateString() === date
      ).length
    }));

    return dailyProgress;
  }

  function generateInsights(data) {
    const insights = [];
    
    if (data.completionRate >= 80) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: language === 'ar' ? 'معدل إنجاز ممتاز' : 'Excellent Completion Rate',
        message: language === 'ar' 
          ? `أنت تنجز ${data.completionRate}% من مهامك بنجاح!`
          : `You're completing ${data.completionRate}% of your tasks successfully!`
      });
    } else if (data.completionRate < 50) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        title: language === 'ar' ? 'تحتاج لتحسين معدل الإنجاز' : 'Need to Improve Completion Rate',
        message: language === 'ar'
          ? `معدل إنجازك ${data.completionRate}%. حاول زيادة التركيز على المهام.`
          : `Your completion rate is ${data.completionRate}%. Try to focus more on tasks.`
      });
    }

    if (data.averageRating >= 4) {
      insights.push({
        type: 'success',
        icon: Star,
        title: language === 'ar' ? 'تقييمات عالية' : 'High Ratings',
        message: language === 'ar'
          ? `متوسط تقييمك ${data.averageRating}/5. استمر في العمل الجيد!`
          : `Your average rating is ${data.averageRating}/5. Keep up the good work!`
      });
    }

    if (data.streak >= 7) {
      insights.push({
        type: 'success',
        icon: Zap,
        title: language === 'ar' ? 'سلسلة متتالية ممتازة' : 'Excellent Streak',
        message: language === 'ar'
          ? `أنت تدرس منذ ${data.streak} أيام متتالية!`
          : `You've been studying for ${data.streak} consecutive days!`
      });
    } else if (data.streak === 0) {
      insights.push({
        type: 'warning',
        icon: XCircle,
        title: language === 'ar' ? 'ابدأ الدراسة اليوم' : 'Start Studying Today',
        message: language === 'ar'
          ? 'لم تدرس منذ فترة. ابدأ اليوم لبناء عادة الدراسة!'
          : 'You haven\'t studied recently. Start today to build a study habit!'
      });
    }

    if (data.averageTasksPerDay >= 3) {
      insights.push({
        type: 'success',
        icon: Activity,
        title: language === 'ar' ? 'نشاط عالي' : 'High Activity',
        message: language === 'ar'
          ? `تنجز ${data.averageTasksPerDay} مهام يومياً في المتوسط.`
          : `You complete ${data.averageTasksPerDay} tasks daily on average.`
      });
    }

    return insights;
  }

  const toggleExpanded = (section) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getMetricColor = (value, threshold = 70) => {
    if (value >= threshold) return 'text-green-600 dark:text-green-400';
    if (value >= threshold * 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  };

  // Goals filtered/sorted list
  const filteredGoals = useMemo(() => {
    let list = [...safeGoals];
    // status filter
    if (goalFilter === 'completed') {
      list = list.filter(g => (g.progress || 0) >= 100);
    } else if (goalFilter === 'active') {
      list = list.filter(g => (g.progress || 0) < 100);
    }
    // search
    if (goalQuery.trim()) {
      const q = goalQuery.toLowerCase();
      list = list.filter(g => (g.title || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q));
    }
    // sort
    if (goalSort === 'progress_desc') {
      list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
    } else if (goalSort === 'due_asc') {
      list.sort((a, b) => {
        const da = a.targetDate ? new Date(a.targetDate).getTime() : Infinity;
        const db = b.targetDate ? new Date(b.targetDate).getTime() : Infinity;
        return da - db;
      });
    } else {
      // recent (updatedAt desc)
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    }
    return list;
  }, [safeGoals, goalFilter, goalSort, goalQuery]);

  const goalsAnalytics = useMemo(() => {
    const total = safeGoals.length;
    const completed = safeGoals.filter(g => (g.progress || 0) >= 100).length;
    const inProgress = safeGoals.filter(g => (g.progress || 0) > 0 && (g.progress || 0) < 100).length;
    const avgProgress = total ? Math.round((safeGoals.reduce((s, g) => s + (g.progress || 0), 0) / total) * 10) / 10 : 0;
    return { total, completed, inProgress, avgProgress };
  }, [safeGoals]);

  const StatCard = ({ icon, title, value, subtitle, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600 dark:text-${color}-400` })}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const ProgressBar = ({ progress, label, color = "blue" }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <PageLayout
      title={language === 'ar' ? 'الأهداف والتقدم' : 'Goals & Progress'}
      subtitle={language === 'ar' ? 'تتبع تقدمك في التعلم' : 'Track your learning progress'}
    >
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {language === 'ar' ? 'التحليلات المتقدمة' : 'Advanced Analytics'}
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {language === 'ar' ? 'الأهداف' : 'Goals'}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle />}
            title={language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
            value={`${progressStats.completedCount}/${progressStats.totalCount}`}
            subtitle={`${Math.round(progressStats.completionRate)}% ${language === 'ar' ? 'مكتمل' : 'complete'}`}
            color="green"
          />
          <StatCard
            icon={<Star />}
            title={language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
            value={progressStats.averageRating > 0 ? progressStats.averageRating.toFixed(1) : '0.0'}
            subtitle={language === 'ar' ? 'من 5 نجوم' : 'out of 5 stars'}
            color="yellow"
          />
          <StatCard
            icon={<Activity />}
            title={language === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activity'}
            value={progressStats.currentStreak}
            subtitle={language === 'ar' ? 'مهمة مكتملة هذا الأسبوع' : 'tasks completed this week'}
            color="blue"
          />
          <StatCard
            icon={<BookOpen />}
            title={language === 'ar' ? 'المحتوى المنشأ' : 'Content Created'}
            value={progressStats.notesCount + progressStats.journalCount}
            subtitle={`${progressStats.notesCount} ${language === 'ar' ? 'ملاحظة' : 'notes'}, ${progressStats.journalCount} ${language === 'ar' ? 'مدونة' : 'entries'}`}
            color="purple"
          />
        </div>

        {/* Goals Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'ملخص الأهداف' : 'Goals Summary'}
            </h2>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {language === 'ar' ? 'إدارة الأهداف' : 'Manage Goals'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{language === 'ar' ? 'عدد الأهداف' : 'Total Goals'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{safeGoals.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{language === 'ar' ? 'مكتمل' : 'Completed'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{safeGoals.filter(g => (g.progress || 0) >= 100).length}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{language === 'ar' ? 'قيد العمل' : 'In Progress'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{safeGoals.filter(g => (g.progress || 0) > 0 && (g.progress || 0) < 100).length}</div>
            </div>
          </div>

          {safeGoals.slice(0, 3).map(goal => (
            <div key={goal.id} className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{goal.title || (language === 'ar' ? 'هدف بدون عنوان' : 'Untitled Goal')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{Math.round(goal.progress || 0)}%</div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.round(goal.progress || 0)}%` }} />
              </div>
            </div>
          ))}

          {safeGoals.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'لا توجد أهداف بعد' : 'No goals yet'}
            </div>
          )}
        </Card>

        {/* Phase Progress */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تقدم المراحل' : 'Phase Progress'}
            </h2>
          </div>
          
          <div className="space-y-6">
            {progressStats.phaseProgress.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {phase.title?.[language] || phase.title?.en || `Phase ${phase.id}`}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {phase.completedTasks}/{phase.totalTasks} {language === 'ar' ? 'مهمة' : 'tasks'}
                    </span>
                  </div>
                  <ProgressBar
                    progress={phase.progress}
                    label=""
                    color={phase.progress >= 100 ? "green" : phase.progress >= 50 ? "yellow" : "blue"}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
          </div>
          
          <div className="space-y-4">
            {safeProgress.filter(p => p.done).slice(0, 5).map((progressItem, index) => {
              // Find the corresponding task from the plan
              const week = safePlan.find(w => String(w.week) === String(progressItem.weekId));
              const day = week?.days?.find(d => d.key === progressItem.dayKey);
              const task = day?.tasks?.find(t => String(t.id) === String(progressItem.taskId));
              
              return (
                <motion.div
                  key={progressItem.id || `${progressItem.weekId}-${progressItem.dayKey}-${progressItem.taskId}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task?.description?.[language] || task?.description?.en || `Task ${progressItem.taskId}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'مكتمل' : 'Completed'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            
            {safeProgress.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'لا توجد مهام مكتملة بعد' : 'No completed tasks yet'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الإنجازات' : 'Achievements'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: language === 'ar' ? 'البداية' : 'Getting Started',
                description: language === 'ar' ? 'أكمل أول مهمة' : 'Complete your first task',
                achieved: progressStats.completedCount >= 1,
                icon: <CheckCircle className="w-6 h-6" />
              },
              {
                title: language === 'ar' ? 'المثابرة' : 'Perseverance',
                description: language === 'ar' ? 'أكمل 10 مهام' : 'Complete 10 tasks',
                achieved: progressStats.completedCount >= 10,
                icon: <Target className="w-6 h-6" />
              },
              {
                title: language === 'ar' ? 'الكاتب' : 'Writer',
                description: language === 'ar' ? 'أنشئ أول ملاحظة' : 'Create your first note',
                achieved: progressStats.notesCount >= 1,
                icon: <BookOpen className="w-6 h-6" />
              },
              {
                title: language === 'ar' ? 'المدون' : 'Journalist',
                description: language === 'ar' ? 'اكتب أول مدونة' : 'Write your first journal entry',
                achieved: progressStats.journalCount >= 1,
                icon: <Users className="w-6 h-6" />
              }
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  achievement.achieved
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.achieved
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {React.cloneElement(achievement.icon, {
                      className: `w-5 h-5 ${
                        achievement.achieved
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`
                    })}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      achievement.achieved
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.achieved
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div {...animations.fadeIn} className="space-y-6">
          {/* Period Selector */}
          <div className="flex justify-end">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="week">{language === 'ar' ? 'الأسبوع' : 'Week'}</option>
              <option value="month">{language === 'ar' ? 'الشهر' : 'Month'}</option>
              <option value="year">{language === 'ar' ? 'السنة' : 'Year'}</option>
              <option value="all">{language === 'ar' ? 'كل الوقت' : 'All Time'}</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Completion Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className={`text-sm font-medium ${getMetricColor(analytics.completionRate)}`}>
                  {analytics.completionRate}%
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.totalTasks}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}
              </p>
            </div>

            {/* Average Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm font-medium ${getMetricColor(analytics.averageRating, 4)}`}>
                  {analytics.averageRating}/5
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.averageRating}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'متوسط التقييم' : 'Avg Rating'}
              </p>
            </div>

            {/* Study Streak */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className={`text-sm font-medium ${getMetricColor(analytics.streak, 7)}`}>
                  {analytics.streak}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {analytics.streak}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'أيام متتالية' : 'Day Streak'}
              </p>
            </div>

            {/* Study Time */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {Math.round(analytics.totalStudyTime / 60)}h
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(analytics.totalStudyTime / 60)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'ساعات الدراسة' : 'Study Hours'}
              </p>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Content Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'المحتوى' : 'Content'}
                </h2>
                <button
                  onClick={() => toggleExpanded('content')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {isExpanded.content ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? 'الملاحظات' : 'Notes'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analytics.totalNotes}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? 'المدونات' : 'Journals'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analytics.totalJournals}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? 'الموارد' : 'Resources'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analytics.totalResources}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الرؤى' : 'Insights'}
                </h2>
                <button
                  onClick={() => toggleExpanded('insights')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {isExpanded.insights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-3">
                {analytics.insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      insight.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <insight.icon className={`w-4 h-4 mt-0.5 ${
                        insight.type === 'success' 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Patterns */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'أنماط الدراسة' : 'Study Patterns'}
                </h2>
                <button
                  onClick={() => toggleExpanded('patterns')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {isExpanded.patterns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'أيام الدراسة' : 'Study Days'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analytics.studyDays}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'متوسط المهام/يوم' : 'Avg Tasks/Day'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analytics.averageTasksPerDay}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'متوسط الفهم' : 'Avg Understanding'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {analytics.averageUnderstanding}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Trends */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'اتجاهات التقدم' : 'Progress Trends'}
              </h2>
              
              <div className="grid grid-cols-7 gap-2">
                {analytics.trends.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {new Date(day.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                        weekday: 'short' 
                      })}
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded p-2">
                      <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {day.tasks}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'مهام' : 'tasks'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <motion.div {...animations.fadeIn} className="space-y-6">
          {/* Goals Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'عدد الأهداف' : 'Total Goals'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{goalsAnalytics.total}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'مكتمل' : 'Completed'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{goalsAnalytics.completed}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'قيد العمل' : 'In Progress'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{goalsAnalytics.inProgress}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'متوسط التقدم' : 'Avg Progress'}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{goalsAnalytics.avgProgress}%</div>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'ar' ? 'أهدافي' : 'My Goals'}
              </h2>
              <button
                onClick={() => setGoalEditor({ id: 0 })}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'إضافة هدف' : 'Add Goal'}
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <input
                value={goalQuery}
                onChange={(e) => setGoalQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث في الأهداف...' : 'Search goals...'}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                <option value="active">{language === 'ar' ? 'قيد العمل' : 'Active'}</option>
                <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
              </select>
              <select
                value={goalSort}
                onChange={(e) => setGoalSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="recent">{language === 'ar' ? 'الأحدث' : 'Recent'}</option>
                <option value="progress_desc">{language === 'ar' ? 'حسب التقدم (تنازلي)' : 'By Progress (desc)'}</option>
                <option value="due_asc">{language === 'ar' ? 'حسب التاريخ (تصاعدي)' : 'By Due Date (asc)'}</option>
              </select>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? `${filteredGoals.length} نتيجة` : `${filteredGoals.length} results`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals.map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title || (language === 'ar' ? 'هدف بدون عنوان' : 'Untitled Goal')}</h3>
                      {goal.targetDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(goal.targetDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGoalEditor(goal)}
                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">{goal.description}</p>
                  )}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{Math.round(goal.progress || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.round(goal.progress || 0)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGoalProgress(goal.id, Math.min(100, (goal.progress || 0) + 10))}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => setGoalProgress(goal.id, Math.max(0, (goal.progress || 0) - 10))}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      -10%
                    </button>
                    {goal.linked && (
                      <button
                        onClick={() => navigate(`/phases/${goal.linked.phaseId}/weeks/${goal.linked.weekId}/days/${goal.linked.dayKey}`)}
                        className="ml-auto px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {language === 'ar' ? 'اذهب للمهمة' : 'Go to task'}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredGoals.length === 0 && (
                <div className="text-center py-10 col-span-full text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'لا توجد نتائج' : 'No results'}
                </div>
              )}
            </div>
          </Card>

          {/* Goal Editor Modal */}
          <GoalEditorModal
            goalEditor={goalEditor}
            setGoalEditor={setGoalEditor}
            language={language}
            plan={safePlan}
            onSave={async (payload) => {
              if (!payload.title?.trim()) return;
              if (payload.id) {
                await updateGoal(payload.id, payload);
              } else {
                await addGoal(payload);
              }
              setGoalEditor(null);
            }}
          />
        </motion.div>
      )}
    </PageLayout>
  );
};

export default ProgressPage;