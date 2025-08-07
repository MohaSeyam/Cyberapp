// Progress Page - Enhanced with Tabs, Skills Matrix, and Charts
import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Brain, Lightbulb, FileText, Trophy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { loadLibrary } from '../utils/lazyImports';
import EnhancedOverviewTab from '../components/progress/EnhancedOverviewTab';
import EnhancedAnalyticsTab from '../components/progress/EnhancedAnalyticsTab';
import EnhancedSkillsTab from '../components/progress/EnhancedSkillsTab';
import EnhancedAchievementsTab from '../components/progress/EnhancedAchievementsTab';
import EnhancedSuggestionsTab from '../components/progress/EnhancedSuggestionsTab';
import EnhancedReportsTab from '../components/progress/EnhancedReportsTab';
import useProgressStats from '../hooks/useProgressStats';

// Lazy load components for better performance
const ProgressOverview = lazy(() => import('../components/progress/ProgressOverview'));
const ProgressAnalytics = lazy(() => import('../components/progress/ProgressAnalytics'));

// Export Constants
const REPORT_TYPES = [
  { id: 'weekly', label: { ar: 'أسبوعي', en: 'Weekly' } },
  { id: 'phase', label: { ar: 'مرحلي', en: 'Phase' } },
  { id: 'complete', label: { ar: 'كامل', en: 'Complete' } },
  { id: 'custom', label: { ar: 'مخصص', en: 'Custom' } }
];

const CONTENT_TYPES = [
  { id: 'progress', label: { ar: 'التقدم فقط', en: 'Progress Only' } },
  { id: 'notes', label: { ar: 'الملاحظات فقط', en: 'Notes Only' } },
  { id: 'both', label: { ar: 'التقدم والملاحظات', en: 'Progress & Notes' } }
];

const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF' },
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'txt', label: 'Text' }
];

// Tab Types
type TabType = 'overview' | 'analytics' | 'skills' | 'achievements' | 'suggestions' | 'reports';

// Skills Matrix Interface
interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0-5
  description: string;
  color: string;
}

// Report Types
type ReportType = 'weekly' | 'phase' | 'complete';
type ContentType = 'progress' | 'notes' | 'both';
type FileFormat = 'pdf' | 'csv' | 'markdown' | 'txt';
type ExportLanguage = 'ar' | 'en';

interface ReportOptions {
  type: ReportType;
  content: ContentType;
  format: FileFormat;
  language: ExportLanguage;
  dateRange?: {
    start: Date;
    end: Date;
  };
  phaseId?: number;
}

// Enhanced Tab Configuration
const ENHANCED_TABS = [
  {
    id: 'overview',
    label: { ar: 'نظرة عامة', en: 'Overview' },
    icon: BarChart3,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    description: { ar: 'ملخص شامل للتقدم', en: 'Comprehensive progress summary' }
  },
  {
    id: 'analytics',
    label: { ar: 'التحليلات', en: 'Analytics' },
    icon: TrendingUp,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    description: { ar: 'تحليل مفصل للبيانات', en: 'Detailed data analysis' }
  },
  {
    id: 'skills',
    label: { ar: 'المهارات', en: 'Skills' },
    icon: Brain,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    description: { ar: 'تقييم المهارات المكتسبة', en: 'Assessment of acquired skills' }
  },
  {
    id: 'achievements',
    label: { ar: 'الإنجازات', en: 'Achievements' },
    icon: Trophy,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    description: { ar: 'الإنجازات والجوائز', en: 'Achievements and awards' }
  },
  {
    id: 'suggestions',
    label: { ar: 'الاقتراحات', en: 'Suggestions' },
    icon: Lightbulb,
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-600',
    description: { ar: 'نصائح للتحسين', en: 'Improvement suggestions' }
  },
  {
    id: 'reports',
    label: { ar: 'التقارير', en: 'Reports' },
    icon: FileText,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    description: { ar: 'تصدير التقارير', en: 'Export reports' },
    badge: 'جديد'
  },
  {
    id: 'overview',
    label: { ar: 'نظرة عامة', en: 'Overview' },
    icon: BarChart3,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    description: { ar: 'ملخص شامل للتقدم', en: 'Comprehensive progress summary' },
    badge: null
  },
  {
    id: 'analytics',
    label: { ar: 'التحليلات', en: 'Analytics' },
    icon: TrendingUp,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    description: { ar: 'رسوم بيانية مفصلة', en: 'Detailed charts and graphs' },
    badge: 'New'
  },
  {
    id: 'skills',
    label: { ar: 'المهارات', en: 'Skills' },
    icon: Brain,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    description: { ar: 'تقييم المهارات المكتسبة', en: 'Assess acquired skills' },
    badge: null
  },
  {
    id: 'achievements',
    label: { ar: 'الإنجازات', en: 'Achievements' },
    icon: Trophy,
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-600',
    description: { ar: 'المراحل والإنجازات', en: 'Milestones and achievements' },
    badge: 'Hot'
  },
  {
    id: 'suggestions',
    label: { ar: 'الاقتراحات', en: 'Suggestions' },
    icon: Lightbulb,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    description: { ar: 'نصائح للتحسين', en: 'Improvement tips' },
    badge: null
  }
] as const;

// Enhanced Tab Styles
const ENHANCED_TAB_STYLES = {
  blue: {
    border: 'border-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
    indicator: 'bg-blue-500'
  },
  purple: {
    border: 'border-purple-500',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    active: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg',
    indicator: 'bg-purple-500'
  },
  green: {
    border: 'border-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
    hover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    active: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
    indicator: 'bg-green-500'
  },
  yellow: {
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    active: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg',
    indicator: 'bg-yellow-500'
  },
  orange: {
    border: 'border-orange-500',
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
    active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
    indicator: 'bg-orange-500'
  },
  red: {
    border: 'border-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
    hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    active: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
    indicator: 'bg-red-500'
  }
} as const;

// أضف في أعلى الملف:
const colorClassMap = {
  blue: {
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
    bg100: 'bg-blue-100',
    bg800: 'dark:bg-blue-800',
    text600: 'text-blue-600',
    text400: 'dark:text-blue-400',
    border200: 'border-blue-200',
    border700: 'dark:border-blue-700',
    text500: 'text-blue-500',
  },
  red: {
    bgLight: 'bg-red-50',
    bgDark: 'dark:bg-red-900/20',
    bg100: 'bg-red-100',
    bg800: 'dark:bg-red-800',
    text600: 'text-red-600',
    text400: 'dark:text-red-400',
    border200: 'border-red-200',
    border700: 'dark:border-red-700',
    text500: 'text-red-500',
  },
  green: {
    bgLight: 'bg-green-50',
    bgDark: 'dark:bg-green-900/20',
    bg100: 'bg-green-100',
    bg800: 'dark:bg-green-800',
    text600: 'text-green-600',
    text400: 'dark:text-green-400',
    border200: 'border-green-200',
    border700: 'dark:border-green-700',
    text500: 'text-green-500',
  },
  purple: {
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-900/20',
    bg100: 'bg-purple-100',
    bg800: 'dark:bg-purple-800',
    text600: 'text-purple-600',
    text400: 'dark:text-purple-400',
    border200: 'border-purple-200',
    border700: 'dark:border-purple-700',
    text500: 'text-purple-500',
  },
  orange: {
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-900/20',
    bg100: 'bg-orange-100',
    bg800: 'dark:bg-orange-800',
    text600: 'text-orange-600',
    text400: 'dark:text-orange-400',
    border200: 'border-orange-200',
    border700: 'dark:border-orange-700',
    text500: 'text-orange-500',
  },
};

// Enhanced Overview Tab Component
const EnhancedOverviewTab = React.memo(({ stats, language, safeT }) => {
  const metrics = [
    { 
      label: safeT('completionRate'), 
      value: stats.completionRate + '%', 
      color: 'blue',
      icon: Target,
      progress: stats.completionRate,
      description: safeT('completionRateDesc')
    },
    { 
      label: safeT('completedTasks'), 
      value: stats.completedTasks, 
      color: 'green',
      icon: CheckCircle,
      progress: (stats.completedTasks / stats.totalTasks) * 100,
      description: safeT('completedTasksDesc')
    },
    { 
      label: safeT('timeSpent'), 
      value: Math.round(stats.completedDuration / 60) + 'h', 
      color: 'purple',
      icon: Clock,
      progress: (stats.completedDuration / stats.totalDuration) * 100,
      description: safeT('timeSpentDesc')
    },
    { 
      label: safeT('currentStreak'), 
      value: stats.currentStreak, 
      color: 'orange',
      icon: Flame,
      progress: (stats.currentStreak / stats.longestStreak) * 100,
      description: safeT('currentStreakDesc')
    },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClassMap[metric.color]?.bgLight} ${colorClassMap[metric.color]?.bgDark} opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${colorClassMap[metric.color]?.bg100} ${colorClassMap[metric.color]?.bg800} rounded-full`}>
                      <Icon className={`w-6 h-6 ${colorClassMap[metric.color]?.text600} dark:${colorClassMap[metric.color]?.text400}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {metric.label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="relative w-16 h-16 mx-auto">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={colorClassMap[metric.color]?.text500}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${metric.progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {Math.round(metric.progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {metric.description}
                  </p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Enhanced Task Types Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {safeT('taskTypesDistribution')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {safeT('distributionOfCompletedTasks')}
            </p>
          </div>
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { type: 'Blue Team', count: stats.blueTeamTasks, color: 'blue', icon: Target },
            { type: 'Red Team', count: stats.redTeamTasks, color: 'red', icon: Zap },
            { type: 'Practical', count: stats.practicalTasks, color: 'green', icon: CheckCircle },
            { type: 'Theoretical', count: stats.theoreticalTasks, color: 'purple', icon: BookOpen },
            { type: 'Policies', count: stats.policiesTasks, color: 'orange', icon: FileText }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`text-center p-4 ${colorClassMap[item.color]?.bgLight} ${colorClassMap[item.color]?.bgDark} rounded-lg border ${colorClassMap[item.color]?.border200} ${colorClassMap[item.color]?.border700} hover:shadow-md transition-all duration-300`}
              >
                <div className={`text-3xl font-bold ${colorClassMap[item.color]?.text600} dark:${colorClassMap[item.color]?.text400} mb-2`}>
                  {item.count}
                </div>
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`w-5 h-5 ${colorClassMap[item.color]?.text500} mr-2`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {safeT(item.type.toLowerCase().replace(' ', ''))}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {((item.count / stats.completedTasks) * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
});

// Enhanced Analytics Tab Component
const EnhancedAnalyticsTab = React.memo(() => {
  const { plan, progress } = useApp();
  
  // Prepare data for ProgressChart
  const progressData = useMemo(() => {
    if (!plan || !progress) return [];
    
    return plan.map((week, index) => {
      const weekTasks = week.days.flatMap(day => day.tasks);
      const completedTasks = progress.filter(p => 
        p.done && weekTasks.some(task => task.id === p.taskId)
      ).length;
      
      return {
        week: `Week ${week.week}`,
        completed: completedTasks,
        total: weekTasks.length,
        percentage: weekTasks.length > 0 ? (completedTasks / weekTasks.length) * 100 : 0
      };
    });
  }, [plan, progress]);

  // Prepare data for PieChart
  const pieData = useMemo(() => {
    if (!plan || !progress) return [];
    
    const taskTypes = {};
    plan.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach(task => {
          taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
        });
      });
    });

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B'];
    
    return Object.entries(taskTypes).map(([type, count], index) => ({
      name: type,
      value: count,
      color: colors[index % colors.length]
    }));
  }, [plan, progress]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Chart</h3>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <ProgressChart data={progressData} />
          </Card>
        </div>
        
        <div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Task Distribution</h3>
              <PieChart className="w-6 h-6 text-purple-500" />
            </div>
            <PieChartComponent data={pieData} />
          </Card>
        </div>
      </div>
    </div>
  );
});

// Enhanced Achievements Tab Component
const EnhancedAchievementsTab = React.memo(() => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your milestones and achievements</p>
          </div>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Achievements and milestones will be displayed here.</p>
        </div>
      </Card>
    </div>
  );
});

// Enhanced Suggestions Tab Component
const EnhancedSuggestionsTab = React.memo(({ language }) => {
  const t = (ar, en) => language === 'ar' ? ar : en;
  return (
    <div className="space-y-8">
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500" />
          </div>
          
          <div className="relative z-10">
            <div className="relative inline-block mb-6">
              <Lightbulb className="w-16 h-16 mx-auto text-green-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {t('ممتاز!', 'Excellent!')}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              {t('أنت على المسار الصحيح. استمر في التعلم والمثابرة!', "You're on the right track. Keep learning and persevering!")}
            </p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                {t('مستمر', 'Consistent')}
              </div>
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <Target className="w-4 h-4 mr-1" />
                {t('مركّز', 'Focused')}
              </div>
              <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                {t('متقدم', 'Progressive')}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

// Data filtering function - moved outside components for reuse
const filterDataByOptions = (options, plan, appState) => {
  const { reportType, contentType, dateRange, selectedWeek, selectedPhase } = options;
  const now = new Date();
  
  // Filter tasks based on report type
  let filteredTasks = [];
  let filteredNotes = [];
  let filteredResources = [];
  
  switch (reportType) {
    case 'weekly':
      if (selectedWeek) {
        // Export specific week data
        filteredTasks = plan
          .filter(week => week.week === parseInt(selectedWeek))
          .flatMap(week => week.days.flatMap(day => day.tasks));
        filteredNotes = Object.values(appState.notes)
          .flat()
          .filter(note => note.weekId === parseInt(selectedWeek));
        filteredResources = Object.values(appState.resources || {})
          .flat()
          .filter(resource => resource.weekId === parseInt(selectedWeek));
      } else {
        // Export current week data
        const currentWeek = Math.ceil((now.getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
        filteredTasks = plan
          .filter(week => week.week === currentWeek)
          .flatMap(week => week.days.flatMap(day => day.tasks));
        filteredNotes = Object.values(appState.notes)
          .flat()
          .filter(note => note.weekId === currentWeek);
        filteredResources = Object.values(appState.resources || {})
          .flat()
          .filter(resource => resource.weekId === currentWeek);
      }
      break;
      
    case 'phase':
      if (selectedPhase) {
        // Export specific phase data
        const phaseStartWeek = (parseInt(selectedPhase) - 1) * 4 + 1;
        const phaseEndWeek = parseInt(selectedPhase) * 4;
        filteredTasks = plan
          .filter(week => week.week >= phaseStartWeek && week.week <= phaseEndWeek)
          .flatMap(week => week.days.flatMap(day => day.tasks));
        filteredNotes = Object.values(appState.notes)
          .flat()
          .filter(note => note.weekId >= phaseStartWeek && note.weekId <= phaseEndWeek);
        filteredResources = Object.values(appState.resources || {})
          .flat()
          .filter(resource => resource.weekId >= phaseStartWeek && resource.weekId <= phaseEndWeek);
      } else {
        // Export current phase data
        const currentWeek = Math.ceil((now.getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
        const currentPhase = Math.ceil(currentWeek / 4);
        const phaseStartWeek = (currentPhase - 1) * 4 + 1;
        const phaseEndWeek = currentPhase * 4;
        filteredTasks = plan
          .filter(week => week.week >= phaseStartWeek && week.week <= phaseEndWeek)
          .flatMap(week => week.days.flatMap(day => day.tasks));
        filteredNotes = Object.values(appState.notes)
          .flat()
          .filter(note => note.weekId >= phaseStartWeek && note.weekId <= phaseEndWeek);
        filteredResources = Object.values(appState.resources || {})
          .flat()
          .filter(resource => resource.weekId >= phaseStartWeek && resource.weekId <= phaseEndWeek);
      }
      break;
      
    case 'complete':
      // Export all data
      filteredTasks = plan.flatMap(week => week.days.flatMap(day => day.tasks));
      filteredNotes = Object.values(appState.notes).flat();
      filteredResources = Object.values(appState.resources || {}).flat();
      break;
      
    case 'custom':
      // Export data within custom date range
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        filteredTasks = plan.flatMap(week => week.days.flatMap(day => day.tasks));
        filteredNotes = Object.values(appState.notes)
          .flat()
          .filter(note => {
            const noteDate = new Date(note.createdAt);
            return noteDate >= startDate && noteDate <= endDate;
          });
        filteredResources = Object.values(appState.resources || {})
          .flat()
          .filter(resource => {
            const resourceDate = new Date(resource.createdAt);
            return resourceDate >= startDate && resourceDate <= endDate;
          });
      }
      break;
  }
  
  // Filter by content type
  if (contentType === 'progress') {
    filteredNotes = [];
    filteredResources = [];
  } else if (contentType === 'notes') {
    filteredTasks = [];
    filteredResources = [];
  }
  
  return { filteredTasks, filteredNotes, filteredResources };
};

// Enhanced Reports Tab Component
const EnhancedReportsTab = React.memo(() => {
  const { plan, progress, appState } = useApp();
  const { language } = useLocalization();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    reportType: 'weekly',
    contentType: 'both',
    format: 'pdf',
    selectedWeek: '',
    selectedPhase: '',
    dateRange: { start: '', end: '' }
  });

  const getCurrentLanguageText = (text: { ar: string; en: string }) => {
    return language === 'ar' ? text.ar : text.en;
  };

  // Generate weeks list
  const weeksList = useMemo(() => {
    if (!plan) return [];
    return plan.map(week => ({
      id: week.week,
      label: getCurrentLanguageText({ ar: `الأسبوع ${week.week}`, en: `Week ${week.week}` })
    }));
  }, [plan, language]);

  // Generate phases list
  const phasesList = useMemo(() => {
    if (!plan) return [];
    const phases = [];
    for (let i = 1; i <= Math.ceil(plan.length / 4); i++) {
      phases.push({
        id: i,
        label: getCurrentLanguageText({ ar: `المرحلة ${i}`, en: `Phase ${i}` })
      });
    }
    return phases;
  }, [plan, language]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Validate export options
      if (!exportOptions.reportType || !exportOptions.contentType || !exportOptions.format) {
        throw new Error('Please fill in all required export options');
      }
      
      // Prepare export options based on selections
      const options = {
        reportType: exportOptions.reportType,
        contentType: exportOptions.contentType,
        format: exportOptions.format,
        dateRange: exportOptions.dateRange,
        selectedWeek: exportOptions.selectedWeek,
        selectedPhase: exportOptions.selectedPhase
      };
      
      // Call the main export function with the options
      await performExport(options);
      
      toast.success(
        language === 'ar' 
          ? '✓ تم تصدير التقرير بنجاح' 
          : '✓ Report exported successfully'
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        language === 'ar' 
          ? `❌ فشل في تصدير التقرير: ${error.message}` 
          : `❌ Failed to export report: ${error.message}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions, language, performExport]);

  // Main export function that can be called from anywhere
  const performExport = useCallback(async (options) => {
    try {
      // Validate inputs
      if (!plan || !appState) {
        throw new Error('No data available for export');
      }
      
      if (!options || !options.format) {
        throw new Error('Invalid export options');
      }
      
      let fileName = 'cybersecurity-report-' + Date.now();
      let blob: Blob;
      const now = new Date();
      const timestamp = now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
      const dayName = now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
      const appUrl = window.location.origin;
      
      // Filter data based on options
      const { filteredTasks, filteredNotes, filteredResources } = filterDataByOptions(options, plan, appState);
      
      // Prepare data for export
      const totalNotes = filteredNotes.length;
      const totalResources = filteredResources.length;
      const taskTypes = {};
      filteredTasks.forEach(task => {
        taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
      });
      const mostTaskType = Object.entries(taskTypes).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
      
      // Create export data based on format
      switch (options.format) {
        case 'json': {
          const exportData = {
            metadata: {
              appName: 'Gemini CyberPlan',
              exportDate: timestamp,
              reportType: options.reportType,
              contentType: options.contentType,
              language: language,
              totalTasks: filteredTasks.length,
              totalNotes: totalNotes,
              totalResources: totalResources,
              mostTaskType: mostTaskType
            },
            tasks: filteredTasks.map(task => ({
              id: task.id,
              title: language === 'ar' ? (task?.description?.ar || '') : (task?.description?.en || ''),
              description: language === 'ar' ? (task?.description?.ar || '') : (task?.description?.en || ''),
              type: task.type,
              duration: task.duration,
              isCompleted: progress.some(p => p.taskId === task.id && p.done),
              completedDate: progress.find(p => p.taskId === task.id && p.done)?.updatedAt,
              notesCount: filteredNotes.filter(n => n.taskId === task.id).length
            })),
            notes: filteredNotes.map(note => ({
              id: note.id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
              taskId: note.taskId,
              wordCount: note.content.split(' ').length
            })),
            resources: filteredResources.map(resource => ({
              id: resource.id,
              title: resource.title,
              type: resource.type,
              url: resource.url,
              description: resource.description,
              createdAt: resource.createdAt
            }))
          };
          
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          fileName += '.json';
          break;
        }
        case 'pdf': {
          try {
            // Dynamic import for jsPDF
            const jsPDF = await import('jspdf').then(module => module.default);
            const doc = new jsPDF({ orientation: language === 'ar' ? 'rtl' : 'ltr', unit: 'pt', format: 'a4' });
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor('#1D4ED8');
            doc.text(language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report', 110, 60, { align: 'left' });
            doc.setFontSize(12);
            doc.setTextColor('#333');
            doc.text(`${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}`, 110, 80, { align: 'left' });
            
            // Add basic content
            let y = 120;
            doc.setFontSize(14);
            doc.setTextColor('#1D4ED8');
            doc.text(language === 'ar' ? 'ملخص التقرير' : 'Report Summary', 40, y);
            y += 20;
            doc.setFontSize(12);
            doc.setTextColor('#222');
            doc.text(`${language === 'ar' ? 'عدد المهام' : 'Total Tasks'}: ${filteredTasks.length}`, 40, y);
            y += 16;
            doc.text(`${language === 'ar' ? 'عدد الملاحظات' : 'Total Notes'}: ${totalNotes}`, 40, y);
            y += 16;
            doc.text(`${language === 'ar' ? 'عدد المراجع' : 'Total Resources'}: ${totalResources}`, 40, y);
            
            blob = doc.output('blob');
            fileName += '.pdf';
          } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            throw new Error('Failed to generate PDF. Please try another format.');
          }
          break;
        }
        case 'csv': {
          try {
            const csvData = [
              ['Task ID', 'Title', 'Type', 'Duration', 'Completed'],
              ...filteredTasks.map(task => [
                task.id,
                language === 'ar' ? (task?.description?.ar || '') : (task?.description?.en || ''),
                task.type,
                task.duration,
                progress.some(p => p.taskId === task.id && p.done) ? 'Yes' : 'No'
              ])
            ];
            
            // Dynamic import for Papa
            const Papa = await loadLibrary('Papa');
        const csv = Papa.unparse(csvData);
            blob = new Blob([csv], { type: 'text/csv' });
            fileName += '.csv';
          } catch (csvError) {
            console.error('CSV generation error:', csvError);
            throw new Error('Failed to generate CSV. Please try another format.');
          }
          break;
        }
        default: {
          // Default to text format
          let txt = `${language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report'}\n`;
          txt += `${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}\n\n`;
          txt += `${language === 'ar' ? 'عدد المهام' : 'Total Tasks'}: ${filteredTasks.length}\n`;
          txt += `${language === 'ar' ? 'عدد الملاحظات' : 'Total Notes'}: ${totalNotes}\n`;
          txt += `${language === 'ar' ? 'عدد المراجع' : 'Total Resources'}: ${totalResources}\n`;
          
          blob = new Blob([txt], { type: 'text/plain' });
          fileName += '.txt';
          break;
        }
      }
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }, [language, plan, progress, appState]);

  return (
    <EnhancedReportsTab plan={plan} progress={progress} appState={appState} stats={stats} language={language} />
  );
});

// Enhanced Tabs Component
function SimpleTabs({ tabs, activeTab, setActiveTab, language }) {
  const isRTL = language === 'ar';
  return (
    <div
      className={`w-full overflow-x-auto bg-white dark:bg-gray-900`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-1 px-4 py-3`}
        style={{ minWidth: '500px' }}
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="whitespace-nowrap font-medium">
                {language === 'ar' ? tab.label.ar : tab.label.en}
              </span>
              {tab.badge && (
                <span className="ml-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full px-2 py-0.5 font-medium">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- 3. Main Component (Enhanced) ---
export default function ProgressPage() {
  const { plan, progress, appState } = useApp();
  const { language } = useLocalization();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    content: 'both',
    format: 'pdf',
    timeRange: 'all',
    exportLanguage: language
  });

  // Memoized complex calculations
  const streaks = useMemo(() => {
    let current = 0, longest = 0, streak = 0;
    let lastDate = null;
    const sorted = [...progress.filter(p => p.done)].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i].dayKey);
      if (lastDate && (date - lastDate) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
      } else {
        streak = 1;
      }
      if (streak > longest) longest = streak;
      lastDate = date;
    }
    current = streak;
    return { current, longest };
  }, [progress]);

  const stats = useProgressStats(plan, progress, streaks);

  // Color and gradient class maps for dynamic styling
  const colorClassMap = useMemo(() => ({
    blue: {
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      bg100: 'bg-blue-100',
      bg800: 'dark:bg-blue-800',
      text600: 'text-blue-600',
      text400: 'dark:text-blue-400',
      border200: 'border-blue-200',
      border700: 'dark:border-blue-700',
      text500: 'text-blue-500',
    },
    red: {
      bgLight: 'bg-red-50',
      bgDark: 'dark:bg-red-900/20',
      bg100: 'bg-red-100',
      bg800: 'dark:bg-red-800',
      text600: 'text-red-600',
      text400: 'dark:text-red-400',
      border200: 'border-red-200',
      border700: 'dark:border-red-700',
      text500: 'text-red-500',
    },
    green: {
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      bg100: 'bg-green-100',
      bg800: 'dark:bg-green-800',
      text600: 'text-green-600',
      text400: 'dark:text-green-400',
      border200: 'border-green-200',
      border700: 'dark:border-green-700',
      text500: 'text-green-500',
    },
    purple: {
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-900/20',
      bg100: 'bg-purple-100',
      bg800: 'dark:bg-purple-800',
      text600: 'text-purple-600',
      text400: 'dark:text-purple-400',
      border200: 'border-purple-200',
      border700: 'dark:border-purple-700',
      text500: 'text-purple-500',
    },
    orange: {
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      bg100: 'bg-orange-100',
      bg800: 'dark:bg-orange-800',
      text600: 'text-orange-600',
      text400: 'dark:text-orange-400',
      border200: 'border-orange-200',
      border700: 'dark:border-orange-700',
      text500: 'text-orange-500',
    }
  }), []);

  const gradientClassMap = useMemo(() => ({
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }), []);

  const safeT = useCallback((key: string) => {
    const translations = {
      progress: { ar: 'التقدم', en: 'Progress' },
      trackYourLearning: { ar: 'تتبع رحلتك التعليمية', en: 'Track Your Learning Journey' },
      completionRate: { ar: 'معدل الإكمال', en: 'Completion Rate' },
      completionRateDesc: { ar: 'نسبة المهام المكتملة', en: 'Percentage of completed tasks' },
      completedTasks: { ar: 'المهام المكتملة', en: 'Completed Tasks' },
      completedTasksDesc: { ar: 'عدد المهام المنتهية', en: 'Number of finished tasks' },
      timeSpent: { ar: 'الوقت المستغرق', en: 'Time Spent' },
      timeSpentDesc: { ar: 'الوقت المستغرق في التعلم', en: 'Time spent learning' },
      currentStreak: { ar: 'المسار الحالي', en: 'Current Streak' },
      currentStreakDesc: { ar: 'أيام التعلم المتتالية', en: 'Consecutive learning days' },
      overview: { ar: 'نظرة عامة', en: 'Overview' },
      analytics: { ar: 'التحليلات', en: 'Analytics' },
      skills: { ar: 'المهارات', en: 'Skills' },
      achievements: { ar: 'الإنجازات', en: 'Achievements' },
      suggestions: { ar: 'الاقتراحات', en: 'Suggestions' },
      reports: { ar: 'التقارير', en: 'Reports' },
      taskTypesDistribution: { ar: 'توزيع أنواع المهام', en: 'Task Types Distribution' },
      distributionOfCompletedTasks: { ar: 'توزيع المهام المكتملة', en: 'Distribution of completed tasks' },
      blueteam: { ar: 'الفريق الأزرق', en: 'Blue Team' },
      redteam: { ar: 'الفريق الأحمر', en: 'Red Team' },
      practical: { ar: 'عملي', en: 'Practical' },
      theoretical: { ar: 'نظري', en: 'Theoretical' },
      policies: { ar: 'السياسات', en: 'Policies' }
    };
    return translations[key]?.[language] || key;
  }, [language]);

  const getCurrentLanguageText = (text: { ar: string; en: string }) => {
    return language === 'ar' ? text.ar : text.en;
  };

  const APP_NAME = 'Gemini CyberPlan';
  const LOGO_URL = window.location.origin + '/assets/Gemini_Generated_Image_26mado26mado26ma.png';

  const getTaskTypeEmoji = useCallback((type) => {
    switch(type) {
      case 'Blue Team': return '🟦';
      case 'Red Team': return '🟥';
      case 'Soft Skills': return '🟨';
      case 'Practical': return '🟩';
      default: return '';
    }
  }, []);

  const getResourceTypeEmoji = useCallback((type) => {
    switch(type) {
      case 'video': return '🎥';
      case 'article': return '📰';
      case 'book': return '📖';
      case 'tool': return '🛠️';
      case 'podcast': return '🎧';
      case 'course': return '🎓';
      case 'quiz': return '❓';
      case 'project': return '🗂️';
      case 'community': return '👥';
      case 'news': return '🗞️';
      case 'link': return '🔗';
      default: return '';
    }
  }, []);

  // Advanced Export Logic
  const handleAdvancedExport = useCallback(async (options) => {
    setIsExporting(true);
    try {
      // Load required libraries
      const { jsPDF } = await loadLibrary('jspdf');
      const { default: Papa } = await loadLibrary('papaparse');
      const XLSX = await loadLibrary('xlsx');

      // Filter data based on options
      const filteredData = filterDataByOptions(options, plan, appState);
      
      // Generate content based on format
      let content, filename;
      
      switch (options.format) {
        case 'pdf':
          content = await generatePDFContent(filteredData, options, language);
          filename = `cyberplan-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'csv':
          content = await generateCSVContent(filteredData, options, language);
          filename = `cyberplan-data-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'json':
          content = JSON.stringify(filteredData, null, 2);
          filename = `cyberplan-data-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'markdown':
          content = generateMarkdownContent(filteredData, options, language);
          filename = `cyberplan-report-${new Date().toISOString().split('T')[0]}.md`;
          break;
        case 'txt':
          content = generateTextContent(filteredData, options, language);
          filename = `cyberplan-report-${new Date().toISOString().split('T')[0]}.txt`;
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Download file
      const blob = new Blob([content], { 
        type: options.format === 'pdf' ? 'application/pdf' : 
              options.format === 'csv' ? 'text/csv' :
              options.format === 'json' ? 'application/json' :
              'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(language === 'ar' ? 'تم تصدير التقرير بنجاح!' : 'Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التصدير' : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [plan, appState, language]);

  // Content generation functions
  const generatePDFContent = async (data, options, lang) => {
    const { jsPDF } = await loadLibrary('jspdf');
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(lang === 'ar' ? 'تقرير CyberPlan' : 'CyberPlan Report', 20, 20);
    
    // Add content based on options
    if (options.content === 'progress' || options.content === 'both') {
      doc.setFontSize(14);
      doc.text(lang === 'ar' ? 'التقدم:' : 'Progress:', 20, 40);
      // Add progress data...
    }
    
    if (options.content === 'notes' || options.content === 'both') {
      doc.setFontSize(14);
      doc.text(lang === 'ar' ? 'الملاحظات:' : 'Notes:', 20, 80);
      // Add notes data...
    }
    
    return doc.output('blob');
  };

  const generateCSVContent = async (data, options, lang) => {
    const Papa = await loadLibrary('Papa');
    const headers = lang === 'ar' ? 
      ['المهمة', 'النوع', 'الحالة', 'التاريخ'] : 
      ['Task', 'Type', 'Status', 'Date'];
    
    const rows = data.tasks?.map(task => [
      lang === 'ar' ? task.description?.ar || '' : task.description?.en || '',
      task.type || '',
      task.isCompleted ? (lang === 'ar' ? 'مكتمل' : 'Completed') : (lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'),
      task.date || ''
    ]) || [];
    
    return Papa.unparse({ fields: headers, data: rows });
  };

  const generateMarkdownContent = (data, options, lang) => {
    let content = `# ${lang === 'ar' ? 'تقرير CyberPlan' : 'CyberPlan Report'}\n\n`;
    
    if (options.content === 'progress' || options.content === 'both') {
      content += `## ${lang === 'ar' ? 'التقدم' : 'Progress'}\n\n`;
      data.tasks?.forEach(task => {
        content += `- ${lang === 'ar' ? task.description?.ar || '' : task.description?.en || ''} (${task.type})\n`;
      });
    }
    
    if (options.content === 'notes' || options.content === 'both') {
      content += `\n## ${lang === 'ar' ? 'الملاحظات' : 'Notes'}\n\n`;
      data.notes?.forEach(note => {
        content += `### ${note.title}\n${note.content}\n\n`;
      });
    }
    
    return content;
  };

  const generateTextContent = (data, options, lang) => {
    let content = `${lang === 'ar' ? 'تقرير CyberPlan' : 'CyberPlan Report'}\n`;
    content += '='.repeat(50) + '\n\n';
    
    if (options.content === 'progress' || options.content === 'both') {
      content += `${lang === 'ar' ? 'التقدم:' : 'Progress:'}\n`;
      data.tasks?.forEach(task => {
        content += `- ${lang === 'ar' ? task.description?.ar || '' : task.description?.en || ''}\n`;
      });
    }
    
    return content;
  };

  // Filter data based on export options
  const filterDataByOptions = useCallback((options, planData, appStateData) => {
    const result = {
      tasks: [],
      notes: [],
      journalEntries: [],
      resources: []
    };

    // Filter tasks based on time range
    let filteredTasks = [];
    if (options.timeRange === 'current-week') {
      const currentWeek = new Date();
      const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
      filteredTasks = planData.flatMap(w => w.days || [])
        .flatMap(d => d.tasks || [])
        .filter(task => {
          const taskDate = new Date(task.date || Date.now());
          return taskDate >= weekStart;
        });
    } else if (options.timeRange === 'current-phase') {
      // Filter by current phase logic
      filteredTasks = planData.flatMap(w => w.days || [])
        .flatMap(d => d.tasks || []);
    } else {
      // All tasks
      filteredTasks = planData.flatMap(w => w.days || [])
        .flatMap(d => d.tasks || []);
    }

    // Add progress information to tasks
    result.tasks = filteredTasks.map(task => ({
      ...task,
      isCompleted: progress.some(p => p.taskId === task.id && p.done),
      completedDate: progress.find(p => p.taskId === task.id && p.done)?.dayKey
    }));

    // Filter notes and journal entries
    if (options.content === 'notes' || options.content === 'both') {
      result.notes = appStateData.notes || [];
      result.journalEntries = appStateData.journalEntries || [];
    }

    // Filter resources
    result.resources = planData.flatMap(w => w.days || [])
      .flatMap(d => d.resources || []);

    return result;
  }, [progress]);

  const pageDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <WeekPhaseProvider>
      <div dir={pageDirection}>
        <PageLayout 
          showBottomBar={true}
        >
          <motion.div {...animations.fadeIn} className="space-y-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-6xl font-bold text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {safeT('progress')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {safeT('trackYourLearning')}
              </p>
            </div>

            {/* Enhanced Tabs - Moved to top */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <SimpleTabs
                tabs={ENHANCED_TABS.filter(tab => !['skills', 'achievements'].includes(tab.id) || process.env.NODE_ENV === 'development')}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                language={language}
              />
            </div>

            {/* Overall Progress Card */}
            <OverallProgressCard />

            {/* Tab Content */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="p-6">
                <div className="tab-content">
                    {isExporting && <LoadingSpinner />}
                    {activeTab === 'overview' && (
                      <Suspense fallback={<LoadingSpinner />}>
                        <EnhancedOverviewTab stats={stats} language={language} safeT={safeT} colorClassMap={colorClassMap} gradientClassMap={gradientClassMap} />
                      </Suspense>
                    )}
                    {activeTab === 'analytics' && (
                      <Suspense fallback={<LoadingSpinner />}>
                        <EnhancedAnalyticsTab plan={plan} progress={progress} stats={stats} language={language} colorClassMap={colorClassMap} />
                      </Suspense>
                    )}
                    {activeTab === 'skills' && <EnhancedSkillsTab stats={stats} language={language} />}
                    {activeTab === 'achievements' && <EnhancedAchievementsTab stats={stats} language={language} />}
                    {activeTab === 'suggestions' && <EnhancedSuggestionsTab language={language} />}
                    {activeTab === 'reports' && (
                      <EnhancedReportsTab 
                        plan={plan}
                        progress={progress}
                        appState={appState}
                        stats={stats}
                        language={language}
                        colorClassMap={colorClassMap}
                        gradientClassMap={gradientClassMap}
                        handleExport={handleAdvancedExport}
                        isExporting={isExporting}
                        exportOptions={exportOptions}
                        setExportOptions={setExportOptions}
                      />
                    )}
                </div>
              </div>
            </Card>
          </motion.div>
        </PageLayout>
      </div>
    </WeekPhaseProvider>
  );
}
