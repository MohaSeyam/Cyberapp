import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Calendar, Target, Clock, BookOpen, 
  FileText, Star, Users, Award, Activity, Zap, ChevronDown, ChevronUp,
  TrendingDown, CheckCircle, AlertCircle, XCircle, Info
} from 'lucide-react';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import { useSimpleApp } from '../../context/SimpleAppContext';
import planData from '../../data/PlanData.json';

const AnalyticsDashboard = ({ onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('progress');
  const [isExpanded, setIsExpanded] = useState({});
  
  // Safe access to contexts
  let localizationData;
  let appData;
  
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
  
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useSimpleApp:', error);
    appData = {
      progress: [],
      taskEvaluations: [],
      notes: [],
      journalEntries: [],
      resources: []
    };
  }
  
  const { language } = localizationData;
  const { progress, taskEvaluations, notes, journalEntries, resources } = appData;
  
  // Ensure data is available
  const safeProgress = Array.isArray(progress) ? progress : [];
  const safeTaskEvaluations = Array.isArray(taskEvaluations) ? taskEvaluations : [];
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];
  const safeResources = Array.isArray(resources) ? resources : [];

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter data based on selected period
    const getFilteredData = (data, dateField) => {
      const filtered = data.filter(item => {
        const itemDate = new Date(item[dateField] || item.createdAt || item.timestamp);
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
    const filteredProgress = getFilteredData(safeProgress, 'createdAt');
    const completedTasks = filteredProgress.filter(p => p.done).length;
    const totalTasks = filteredProgress.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Evaluation analytics
    const filteredEvaluations = getFilteredData(safeTaskEvaluations, 'timestamp');
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
      new Date(p.createdAt).toDateString()
    )).size;
    
    const totalStudyTime = filteredProgress.length * 25; // Assuming 25 minutes per task
    const averageTasksPerDay = studyDays > 0 ? filteredProgress.length / studyDays : 0;

    // Streak calculation
    const streak = calculateStreak(safeProgress);

    // Performance trends
    const trends = calculateTrends(safeProgress, safeTaskEvaluations);

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
  }, [safeProgress, safeTaskEvaluations, safeNotes, safeJournalEntries, safeResources, selectedPeriod]);

  const calculateStreak = (progressData) => {
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
  };

  const calculateTrends = (progressData, evaluationsData) => {
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
  };

  const generateInsights = (data) => {
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
  };

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

  const getMetricIcon = (value, threshold = 70) => {
    if (value >= threshold) return TrendingUp;
    if (value >= threshold * 0.7) return Activity;
    return TrendingDown;
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'لوحة الإحصائيات المتقدمة' : 'Advanced Analytics Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Selector */}
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
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Key Metrics */}
          <div className="lg:col-span-2 xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
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
            </motion.div>
          </div>

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
            
            <AnimatePresence>
              {isExpanded.insights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {analytics.insights.map((insight, index) => (
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
                </motion.div>
              )}
            </AnimatePresence>
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
      </div>
    </div>
  );
};

export default AnalyticsDashboard;