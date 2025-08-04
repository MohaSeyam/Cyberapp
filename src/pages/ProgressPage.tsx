// Progress Page - Enhanced with Tabs, Skills Matrix, and Charts
import React, { useState, useMemo, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Clock, Flame, Trophy, BarChart3, PieChart, 
  TrendingUp, Award, Star, Users, BookOpen, Zap,
  CheckCircle, Circle, Calendar, Activity, ArrowRight,
  LineChart, Brain, Lightbulb, Download, FileText, 
  FileSpreadsheet, FileCode, FileArchive, CalendarDays,
  ChevronRight, ChevronLeft, Sparkles, Target as TargetIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { animations } from '../constants/theme';
import { WeekPhaseProvider } from '../components/WeekPhaseProvider';
import OverallProgressCard from '../components/progress/OverallProgressCard';
import ProgressChart from '../components/charts/ProgressChart';
import PieChartComponent from '../components/charts/PieChart';
import Logo from '../components/ui/Logo';
import toast from 'react-hot-toast';
import { openDB } from 'idb';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { loadLibrary } from '../utils/lazyImports';

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

// Custom CSS for enhanced tabs
const enhancedTabStyles = `
  .tab-container {
    position: relative;
    overflow: hidden;
  }
  
  .tab-indicator {
    position: absolute;
    bottom: 0;
    height: 3px;
    background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899);
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .tab-item {
    position: relative;
    overflow: hidden;
  }
  
  .tab-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }
  
  .tab-item:hover::before {
    left: 100%;
  }
  
  .tab-content {
    animation: fadeInUp 0.3s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .progress-ring {
    transform: rotate(-90deg);
  }
  
  .progress-ring-circle {
    transition: stroke-dasharray 0.35s;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
`;

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

// Helper function to avoid template literal issues
const getProgressText = (rate: number, completed: number, total: number, lang: string) => {
  const baseText = rate + '% Complete - ' + completed + '/' + total + ' tasks';
  return lang === 'ar' ? baseText : baseText;
};

// Enhanced Tab Configuration
const ENHANCED_TABS = [
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
    icon: LineChart,
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
  },
  {
    id: 'reports',
    label: { ar: 'التقارير', en: 'Reports' },
    icon: Download,
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    description: { ar: 'تصدير التقارير', en: 'Export reports' },
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

// --- 1. Custom Hook for Logic Separation ---
const useProgressStats = (plan, progress, streaks) => {
  return useMemo(() => {
    const allTasks = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []);
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    
    const totalTasks = taskMap.size;
    const completedProgress = progress.filter(p => p.done);
    const completedTasksCount = completedProgress.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const completedDuration = completedProgress.reduce((total, p) => {
      const task = taskMap.get(p.taskId);
      return total + (task?.duration || 0);
    }, 0);

    const totalDuration = allTasks.reduce((total, task) => total + (task?.duration || 0), 0);

    const completedTaskTypes = completedProgress.map(p => taskMap.get(p.taskId)?.type).filter(Boolean);
    const blueTeamTasks = completedTaskTypes.filter(type => type === 'Blue Team').length;
    const redTeamTasks = completedTaskTypes.filter(type => type === 'Red Team').length;
    const practicalTasks = completedTaskTypes.filter(type => type === 'Practical').length;
    const theoreticalTasks = completedTaskTypes.filter(type => type === 'Theoretical').length;
    const policiesTasks = completedTaskTypes.filter(type => type === 'Policies').length;

    return {
      completionRate,
      completedTasks: completedTasksCount,
      totalTasks,
      completedDuration,
      totalDuration,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      blueTeamTasks,
      redTeamTasks,
      practicalTasks,
      theoreticalTasks,
      policiesTasks,
    };
  }, [plan, progress, streaks]);
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
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 dark:from-${metric.color}-900/20 dark:to-${metric.color}-900/30 opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-800 rounded-full`}>
                      <Icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
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
                        className={`text-${metric.color}-500`}
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
            </motion.div>
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
              <motion.div
                key={item.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`text-center p-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-lg border border-${item.color}-200 dark:border-${item.color}-700 hover:shadow-md transition-all duration-300`}
              >
                <div className={`text-3xl font-bold text-${item.color}-600 dark:text-${item.color}-400 mb-2`}>
                  {item.count}
                </div>
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`w-5 h-5 text-${item.color}-500 mr-2`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {safeT(item.type.toLowerCase().replace(' ', ''))}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {((item.count / stats.completedTasks) * 100).toFixed(1)}%
                </div>
              </motion.div>
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
        <motion.div
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
        </motion.div>
        
        <motion.div
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
        </motion.div>
      </div>
    </div>
  );
});

// Enhanced Skills Tab Component
const EnhancedSkillsTab = React.memo(() => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills Matrix</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assess your acquired skills</p>
          </div>
          <Brain className="w-6 h-6 text-green-500" />
        </div>
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Skills assessment will be implemented here.</p>
        </div>
      </Card>
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
      <motion.div
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
      </motion.div>
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
          ? '❌ فشل في تصدير التقرير' 
          : '❌ Failed to export report'
      );
    } finally {
      setIsExporting(false);
    }
  }, [exportOptions, language]);

  // Main export function that can be called from anywhere
  const performExport = useCallback(async (options) => {
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
            title: language === 'ar' ? task.description.ar : task.description.en,
            description: language === 'ar' ? task.description.ar : task.description.en,
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
        break;
      }
      case 'csv': {
        const csvData = [
          ['Task ID', 'Title', 'Type', 'Duration', 'Completed'],
          ...filteredTasks.map(task => [
            task.id,
            language === 'ar' ? task.description.ar : task.description.en,
            task.type,
            task.duration,
            progress.some(p => p.taskId === task.id && p.done) ? 'Yes' : 'No'
          ])
        ];
        
        const csv = Papa.unparse(csvData);
        blob = new Blob([csv], { type: 'text/csv' });
        fileName += '.csv';
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
  }, [language, plan, progress, appState]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {getCurrentLanguageText({ ar: 'تصدير التقارير', en: 'Export Reports' })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getCurrentLanguageText({ ar: 'إنشاء تقارير مفصلة للتقدم', en: 'Generate detailed progress reports' })}
            </p>
          </div>
          <Download className="w-6 h-6 text-blue-500" />
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {getCurrentLanguageText({ ar: 'خيارات التصدير', en: 'Export Options' })}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type */}
          <div>
            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
              {getCurrentLanguageText({ ar: 'نوع التقرير', en: 'Report Type' })}
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={exportOptions.reportType}
              onChange={e => setExportOptions(o => ({ ...o, reportType: e.target.value }))}
            >
              <option value="weekly">{getCurrentLanguageText({ ar: 'أسبوعي', en: 'Weekly' })}</option>
              <option value="phase">{getCurrentLanguageText({ ar: 'مرحلي', en: 'Phase' })}</option>
              <option value="complete">{getCurrentLanguageText({ ar: 'كامل', en: 'Complete' })}</option>
              <option value="custom">{getCurrentLanguageText({ ar: 'مخصص', en: 'Custom' })}</option>
            </select>
          </div>

          {/* Content Type */}
          <div>
            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
              {getCurrentLanguageText({ ar: 'نوع المحتوى', en: 'Content Type' })}
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={exportOptions.contentType}
              onChange={e => setExportOptions(o => ({ ...o, contentType: e.target.value }))}
            >
              <option value="progress">{getCurrentLanguageText({ ar: 'التقدم فقط', en: 'Progress Only' })}</option>
              <option value="notes">{getCurrentLanguageText({ ar: 'الملاحظات فقط', en: 'Notes Only' })}</option>
              <option value="both">{getCurrentLanguageText({ ar: 'التقدم والملاحظات', en: 'Progress & Notes' })}</option>
            </select>
          </div>

          {/* Week Selection (for weekly reports) */}
          {exportOptions.reportType === 'weekly' && (
            <div>
              <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                {getCurrentLanguageText({ ar: 'اختر الأسبوع', en: 'Select Week' })}
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={exportOptions.selectedWeek}
                onChange={e => setExportOptions(o => ({ ...o, selectedWeek: e.target.value }))}
              >
                <option value="">{getCurrentLanguageText({ ar: 'اختر الأسبوع', en: 'Select Week' })}</option>
                {weeksList.map(week => (
                  <option key={week.id} value={week.id}>{week.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Phase Selection (for phase reports) */}
          {exportOptions.reportType === 'phase' && (
            <div>
              <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                {getCurrentLanguageText({ ar: 'اختر المرحلة', en: 'Select Phase' })}
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={exportOptions.selectedPhase}
                onChange={e => setExportOptions(o => ({ ...o, selectedPhase: e.target.value }))}
              >
                <option value="">{getCurrentLanguageText({ ar: 'اختر المرحلة', en: 'Select Phase' })}</option>
                {phasesList.map(phase => (
                  <option key={phase.id} value={phase.id}>{phase.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Date Range */}
          {exportOptions.reportType === 'custom' && (
            <>
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {getCurrentLanguageText({ ar: 'من تاريخ', en: 'From Date' })}
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={exportOptions.dateRange.start}
                  onChange={e => setExportOptions(o => ({ ...o, dateRange: { ...o.dateRange, start: e.target.value } }))}
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {getCurrentLanguageText({ ar: 'إلى تاريخ', en: 'To Date' })}
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={exportOptions.dateRange.end}
                  onChange={e => setExportOptions(o => ({ ...o, dateRange: { ...o.dateRange, end: e.target.value } }))}
                />
              </div>
            </>
          )}

          {/* Format Selection */}
          <div>
            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
              {getCurrentLanguageText({ ar: 'صيغة الملف', en: 'File Format' })}
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={exportOptions.format}
              onChange={e => setExportOptions(o => ({ ...o, format: e.target.value }))}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="txt">Text</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Export Summary */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {getCurrentLanguageText({ ar: 'ملخص التصدير', en: 'Export Summary' })}
        </h4>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {getCurrentLanguageText({ ar: 'نوع التقرير', en: 'Report Type' })}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {getCurrentLanguageText({
                ar: exportOptions.reportType === 'weekly' ? 'أسبوعي' : 
                    exportOptions.reportType === 'phase' ? 'مرحلي' : 
                    exportOptions.reportType === 'complete' ? 'كامل' : 'مخصص',
                en: exportOptions.reportType === 'weekly' ? 'Weekly' : 
                    exportOptions.reportType === 'phase' ? 'Phase' : 
                    exportOptions.reportType === 'complete' ? 'Complete' : 'Custom'
              })}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {getCurrentLanguageText({ ar: 'نوع المحتوى', en: 'Content Type' })}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {getCurrentLanguageText({
                ar: exportOptions.contentType === 'progress' ? 'التقدم فقط' : 
                    exportOptions.contentType === 'notes' ? 'الملاحظات فقط' : 'التقدم والملاحظات',
                en: exportOptions.contentType === 'progress' ? 'Progress Only' : 
                    exportOptions.contentType === 'notes' ? 'Notes Only' : 'Progress & Notes'
              })}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {getCurrentLanguageText({ ar: 'صيغة الملف', en: 'File Format' })}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {exportOptions.format.toUpperCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Export Button */}
      <Card className="p-6">
        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          {isExporting ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">{getCurrentLanguageText({ ar: 'جاري التصدير...', en: 'Exporting...' })}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              {getCurrentLanguageText({ ar: 'تصدير التقرير', en: 'Export Report' })}
            </>
          )}
        </Button>
      </Card>
    </div>
  );
});

// 1. مكون تبويبات جديد
function SimpleTabs({ tabs, activeTab, setActiveTab, language }) {
  const isRTL = language === 'ar';
  return (
    <div
      className={`w-full overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-6`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2 px-2 py-2`}
        style={{ minWidth: '400px' }}
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center flex-1 min-w-[80px] px-2 py-2 rounded-lg transition-all duration-200
                ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
              style={{ outline: isActive ? '2px solid #3B82F6' : 'none' }}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="text-xs whitespace-nowrap">{language === 'ar' ? tab.label.ar : tab.label.en}</span>
              {tab.badge && (
                <span className="mt-1 text-[10px] bg-yellow-200 text-yellow-800 rounded px-1 py-0.5">{tab.badge}</span>
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

  const stats = useMemo(() => useProgressStats(plan, progress, streaks), [plan, progress, streaks]);

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



  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      let fileName = 'cybersecurity-report-' + Date.now();
      let blob: Blob;
      const now = new Date();
      const timestamp = now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
      const dayName = now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
      const appUrl = window.location.origin;
      
      // Filter data based on advanced options
      const { filteredTasks, filteredNotes, filteredResources } = filterDataByOptions(options, plan, appState);
      
      // --- إحصائيات ---
      const totalNotes = filteredNotes.length;
      const totalResources = filteredResources.length;
      const taskTypes = {};
      filteredTasks.forEach(task => {
        taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
      });
      const mostTaskType = Object.entries(taskTypes).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
      const daysProductivity = {};
      progress.filter(p => p.done && filteredTasks.some(t => t.id === p.taskId)).forEach(p => {
        daysProductivity[p.dayKey] = (daysProductivity[p.dayKey] || 0) + 1;
      });
      const mostProductiveDay = Object.entries(daysProductivity).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
      
      // --- جداول المهام ---
      const taskHeaders = language === 'ar'
        ? ['#️⃣', 'الأسبوع', 'اليوم', 'عنوان المهمة', 'الوصف', 'نوع المهمة', '⏱️ المدة', '✅ منجزة؟', '📅 تاريخ الإنجاز', '📝 عدد الملاحظات']
        : ['#️⃣', 'Week', 'Day', 'Task Title', 'Description', 'Task Type', '⏱️ Duration', '✅ Done?', '📅 Done Date', '📝 Notes Count'];
      const taskRows = [taskHeaders];
      
      // Find week and day info for filtered tasks
      filteredTasks.forEach(task => {
        let weekInfo = 'Unknown';
        let dayInfo = 'Unknown';
        
        // Find the week and day for this task
        plan.forEach(week => {
          week.days.forEach(day => {
            if (day.tasks.some(t => t.id === task.id)) {
              weekInfo = week.week;
              dayInfo = language === 'ar' ? day.day.ar : day.day.en;
            }
          });
        });
        
        const doneObj = progress.find(p => p.taskId === task.id && p.done);
        const notesCount = filteredNotes.filter(n => n.taskId === task.id).length;
        taskRows.push([
          task.id,
          weekInfo,
          dayInfo,
          language === 'ar' ? (task.description.ar.split(' ')[0] || '-') : (task.description.en.split(' ')[0] || '-'),
          language === 'ar' ? task.description.ar : task.description.en,
          getTaskTypeEmoji(task.type) + ' ' + (language === 'ar' ? task.type : task.type),
          task.duration,
          doneObj ? (language === 'ar' ? '✅ نعم' : '✅ Yes') : (language === 'ar' ? '❌ لا' : '❌ No'),
          doneObj ? new Date(doneObj.updatedAt || now).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-',
          notesCount
        ]);
      });
      
      // --- جداول الملاحظات ---
      const noteHeaders = language === 'ar'
        ? ['#️⃣', 'الأسبوع', 'اليوم', 'عنوان الملاحظة', 'المحتوى', 'الوسوم', 'تاريخ الإنشاء', 'تاريخ التحديث', 'مرتبطة بمهمة', 'عدد الكلمات']
        : ['#️⃣', 'Week', 'Day', 'Note Title', 'Content', 'Tags', 'Created', 'Updated', 'Task', 'Word Count'];
      const noteRows = [noteHeaders];
      filteredNotes.forEach(note => {
        noteRows.push([
          note.id || '-',
          note.weekId,
          note.dayKey,
          note.title,
          note.content,
          note.tags.join(', '),
          note.createdAt ? new Date(note.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-',
          note.updatedAt ? new Date(note.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-',
          note.taskId,
          note.content.split(' ').length
        ]);
      });
      
      // --- جداول المراجع ---
      const resourceHeaders = language === 'ar'
        ? ['#️⃣', 'الأسبوع', 'اليوم', 'العنوان', 'النوع', 'الرابط', 'تاريخ الإضافة', 'الوصف', 'تم الاستخدام؟']
        : ['#️⃣', 'Week', 'Day', 'Title', 'Type', 'URL', 'Added', 'Description', 'Used?'];
      const resourceRows = [resourceHeaders];
      filteredResources.forEach(resource => {
        resourceRows.push([
          resource.id || '-',
          resource.weekId || '-',
          resource.dayIndex || '-',
          resource.title,
          getResourceTypeEmoji(resource.type) + ' ' + resource.type,
          resource.url,
          resource.createdAt ? new Date(resource.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '-',
          resource.description || '-',
          '❌'
        ]);
      });
      // --- QR Code ---
      let qrDataUrl = '';
      try {
        const QRCode = await loadLibrary('QRCode');
        qrDataUrl = await QRCode.toDataURL(appUrl);
      } catch {}
      // --- ملاحظات المشرف ---
      const supervisorNote = language === 'ar'
        ? 'ملاحظات المشرف: ...............................................................'
        : 'Supervisor Notes: ...............................................................';
      switch (options.format) {
        case 'json': {
          const exportData = {
            metadata: {
              appName: APP_NAME,
              exportDate: timestamp,
                          reportType: options.reportType,
            contentType: options.contentType,
              language: language,
              totalTasks: filteredTasks.length,
              totalNotes: totalNotes,
              totalResources: totalResources,
              mostTaskType: mostTaskType,
              mostProductiveDay: mostProductiveDay
            },
            tasks: filteredTasks.map(task => ({
              id: task.id,
              title: language === 'ar' ? task.description.ar : task.description.en,
              description: language === 'ar' ? task.description.ar : task.description.en,
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
            })),
            progress: progress.filter(p => filteredTasks.some(t => t.id === p.taskId)),
            statistics: {
              taskTypes: taskTypes,
              daysProductivity: daysProductivity
            }
          };
          
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          fileName += '.json';
          break;
        }
        case 'pdf': {
          const jsPDF = await loadLibrary('jsPDF');
          const doc = new jsPDF({ orientation: language === 'ar' ? 'rtl' : 'ltr', unit: 'pt', format: 'a4' });
          // لوجو
          try {
            const img = new Image();
            img.src = LOGO_URL;
            await new Promise((resolve) => { img.onload = resolve; });
            doc.addImage(img, 'PNG', 40, 30, 50, 50);
          } catch {}
          // عنوان
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor('#1D4ED8');
          doc.text(language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report', 110, 60, { align: 'left' });
          doc.setFontSize(12);
          doc.setTextColor('#333');
          doc.text(`${language === 'ar' ? 'اليوم' : 'Day'}: ${dayName}`, 110, 80, { align: 'left' });
          doc.text(`${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}`, 110, 100, { align: 'left' });
          // جدول
          let y = 140;
          doc.setFontSize(14);
          doc.setTextColor('#3B82F6');
          doc.text(language === 'ar' ? 'ملخص التقدم' : 'Progress Summary', 40, y);
          y += 20;
          doc.setFontSize(12);
          doc.setTextColor('#222');
          rows.forEach(([k, v], i) => {
            if (i === 0) {
              doc.setFont('helvetica', 'bold');
              doc.setFillColor('#E0E7FF');
              doc.rect(40, y - 12, 300, 18, 'F');
            } else {
              doc.setFont('helvetica', 'normal');
            }
            doc.text(`${k}`, 50, y);
            doc.text(`${v}`, 200, y);
            y += 20;
          });
          // --- إحصائيات ---
          y += 20;
          doc.setFontSize(12);
          doc.setTextColor('#1D4ED8');
          doc.text((language === 'ar' ? 'عدد الملاحظات:' : 'Total Notes:') + ' ' + totalNotes, 40, y);
          y += 16;
          doc.text((language === 'ar' ? 'عدد المراجع:' : 'Total References:') + ' ' + totalResources, 40, y);
          y += 16;
          doc.text((language === 'ar' ? 'أكثر نوع مهمة:' : 'Most Task Type:') + ' ' + (language === 'ar' ? mostTaskType : mostTaskType), 40, y);
          y += 16;
          doc.text((language === 'ar' ? 'أكثر يوم إنتاجية:' : 'Most Productive Day:') + ' ' + mostProductiveDay, 40, y);
          y += 20;
          // --- QR Code ---
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', 400, 30, 80, 80);
          }
          // --- جداول ---
          // جدول المهام
          y += 30;
          doc.setFontSize(14);
          doc.setTextColor('#1D4ED8');
          doc.text(language === 'ar' ? 'قائمة المهام' : 'Task List', 40, y);
          y += 20;
          doc.setFontSize(10);
          doc.setTextColor('#222');
          taskRows.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (i === 0) doc.setTextColor('#1D4ED8');
              else if (row[7]?.includes('✅')) doc.setTextColor('#16A34A');
              else if (row[7]?.includes('❌')) doc.setTextColor('#DC2626');
              else doc.setTextColor('#222');
              doc.text(String(cell), 50 + j * 90, y);
            });
            y += 14;
          });
          // جدول الملاحظات
          y += 20;
          doc.setFontSize(14);
          doc.setTextColor('#1D4ED8');
          doc.text(language === 'ar' ? 'الملاحظات' : 'Notes', 40, y);
          y += 20;
          doc.setFontSize(10);
          doc.setTextColor('#222');
          noteRows.forEach((row, i) => {
            row.forEach((cell, j) => {
              doc.text(String(cell), 50 + j * 80, y);
            });
            y += 14;
          });
          // جدول المراجع
          y += 20;
          doc.setFontSize(14);
          doc.setTextColor('#1D4ED8');
          doc.text(language === 'ar' ? 'المراجع' : 'References', 40, y);
          y += 20;
          doc.setFontSize(10);
          doc.setTextColor('#222');
          resourceRows.forEach((row, i) => {
            row.forEach((cell, j) => {
              doc.text(String(cell), 50 + j * 80, y);
            });
            y += 14;
          });
          // --- ملاحظات المشرف ---
          y += 30;
          doc.setFontSize(12);
          doc.setTextColor('#6366F1');
          doc.text(supervisorNote, 40, y);
          // تذييل
          doc.setFontSize(10);
          doc.setTextColor('#888');
          doc.text(`${APP_NAME} - ${language === 'ar' ? 'تم توليد التقرير بواسطة التطبيق' : 'Report generated by the app'}`, 40, 800);
          blob = doc.output('blob');
          fileName += '.pdf';
          break;
        }
        case 'csv': {
          const Papa = await loadLibrary('Papa');
          const csv = Papa.unparse([
            ...rows,
            [],
            [language === 'ar' ? 'عدد الملاحظات' : 'Total Notes', totalNotes],
            [language === 'ar' ? 'عدد المراجع' : 'Total References', totalResources],
            [language === 'ar' ? 'أكثر نوع مهمة' : 'Most Task Type', mostTaskType],
            [language === 'ar' ? 'أكثر يوم إنتاجية' : 'Most Productive Day', mostProductiveDay],
            [],
            [language === 'ar' ? 'قائمة المهام' : 'Task List'],
            ...taskRows,
            [],
            [language === 'ar' ? 'الملاحظات' : 'Notes'],
            ...noteRows,
            [],
            [language === 'ar' ? 'المراجع' : 'References'],
            ...resourceRows,
            [],
            [supervisorNote],
            [language === 'ar' ? 'تم توليد التقرير بواسطة' : 'Report generated by', APP_NAME],
            [language === 'ar' ? 'تاريخ التصدير' : 'Export Date', timestamp],
          ]);
          blob = new Blob([csv], { type: 'text/csv' });
          fileName += '.csv';
          break;
        }
        case 'markdown': {
          let md = `![logo](${LOGO_URL})\n`;
          md += `# ${(language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report')}\n`;
          md += `**${language === 'ar' ? 'اليوم' : 'Day'}:** ${dayName}\n`;
          md += `**${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}:** ${timestamp}\n`;
          md += `\n| ${rows[0][0]} | ${rows[0][1]} |\n|---|---|\n`;
          for (let i = 1; i < rows.length; i++) {
            md += `| ${rows[i][0]} | ${rows[i][1]} |\n`;
          }
          // --- إحصائيات ---
          md += `\n- ${language === 'ar' ? 'عدد الملاحظات' : 'Total Notes'}: ${totalNotes}`;
          md += `\n- ${language === 'ar' ? 'عدد المراجع' : 'Total References'}: ${totalResources}`;
          md += `\n- ${language === 'ar' ? 'أكثر نوع مهمة' : 'Most Task Type'}: ${mostTaskType}`;
          md += `\n- ${language === 'ar' ? 'أكثر يوم إنتاجية' : 'Most Productive Day'}: ${mostProductiveDay}`;
          // المهام
          md += `\n## ${language === 'ar' ? 'قائمة المهام' : 'Task List'}\n`;
          md += `|${taskHeaders.join('|')}|\n|${taskHeaders.map(()=>'---').join('|')}|\n`;
          for (let i = 1; i < taskRows.length; i++) {
            md += `|${taskRows[i].join('|')}|\n`;
          }
          // الملاحظات
          md += `\n## ${language === 'ar' ? 'الملاحظات' : 'Notes'}\n`;
          md += `|${noteHeaders.join('|')}|\n|${noteHeaders.map(()=>'---').join('|')}|\n`;
          for (let i = 1; i < noteRows.length; i++) {
            md += `|${noteRows[i].join('|')}|\n`;
          }
          // المراجع
          md += `\n## ${language === 'ar' ? 'المراجع' : 'References'}\n`;
          md += `|${resourceHeaders.join('|')}|\n|${resourceHeaders.map(()=>'---').join('|')}|\n`;
          for (let i = 1; i < resourceRows.length; i++) {
            md += `|${resourceRows[i].join('|')}|\n`;
          }
          md += `\n---\n${supervisorNote}\n${language === 'ar' ? 'تم توليد التقرير بواسطة' : 'Report generated by'} **${APP_NAME}**`;
          blob = new Blob([md], { type: 'text/markdown' });
          fileName += '.md';
          break;
        }
        case 'txt':
        default: {
          let txt = (language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report') + '\n';
          txt += (language === 'ar' ? 'اليوم: ' : 'Day: ') + dayName + '\n';
          txt += (language === 'ar' ? 'تاريخ التصدير: ' : 'Export Date: ') + timestamp + '\n';
          for (let i = 1; i < rows.length; i++) {
            txt += `${rows[i][0]}: ${rows[i][1]}\n`;
          }
          // --- إحصائيات ---
          txt += `\n${language === 'ar' ? 'عدد الملاحظات' : 'Total Notes'}: ${totalNotes}\n`;
          txt += `${language === 'ar' ? 'عدد المراجع' : 'Total References'}: ${totalResources}\n`;
          txt += `${language === 'ar' ? 'أكثر نوع مهمة' : 'Most Task Type'}: ${mostTaskType}\n`;
          txt += `${language === 'ar' ? 'أكثر يوم إنتاجية' : 'Most Productive Day'}: ${mostProductiveDay}\n`;
          // المهام
          txt += `\n${language === 'ar' ? 'قائمة المهام' : 'Task List'}\n`;
          txt += taskHeaders.join(' | ') + '\n';
          for (let i = 1; i < taskRows.length; i++) {
            txt += taskRows[i].join(' | ') + '\n';
          }
          // الملاحظات
          txt += `\n${language === 'ar' ? 'الملاحظات' : 'Notes'}\n`;
          txt += noteHeaders.join(' | ') + '\n';
          for (let i = 1; i < noteRows.length; i++) {
            txt += noteRows[i].join(' | ') + '\n';
          }
          // المراجع
          txt += `\n${language === 'ar' ? 'المراجع' : 'References'}\n`;
          txt += resourceHeaders.join(' | ') + '\n';
          for (let i = 1; i < resourceRows.length; i++) {
            txt += resourceRows[i].join(' | ') + '\n';
          }
          txt += `\n---\n${supervisorNote}\n${language === 'ar' ? 'تم توليد التقرير بواسطة' : 'Report generated by'} ${APP_NAME}\n`;
          blob = new Blob([txt], { type: 'text/plain' });
          fileName += '.txt';
          break;
        }
        case 'xlsx': {
          const ws = XLSX.utils.aoa_to_sheet([
            [APP_NAME],
            [language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report'],
            [language === 'ar' ? 'اليوم' : 'Day', dayName],
            [language === 'ar' ? 'تاريخ التصدير' : 'Export Date', timestamp],
            [],
            ...rows,
            [],
            [language === 'ar' ? 'عدد الملاحظات' : 'Total Notes', totalNotes],
            [language === 'ar' ? 'عدد المراجع' : 'Total References', totalResources],
            [language === 'ar' ? 'أكثر نوع مهمة' : 'Most Task Type', mostTaskType],
            [language === 'ar' ? 'أكثر يوم إنتاجية' : 'Most Productive Day', mostProductiveDay],
            [],
            [language === 'ar' ? 'قائمة المهام' : 'Task List'],
            ...taskRows,
            [],
            [language === 'ar' ? 'الملاحظات' : 'Notes'],
            ...noteRows,
            [],
            [language === 'ar' ? 'المراجع' : 'References'],
            ...resourceRows,
            [],
            [supervisorNote]
          ]);
          // رأس ملون
          ws['A7'].s = { fill: { fgColor: { rgb: 'E0E7FF' } }, font: { bold: true } };
          ws['B7'].s = { fill: { fgColor: { rgb: 'E0E7FF' } }, font: { bold: true } };
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Report');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          fileName += '.xlsx';
          break;
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(
        language === 'ar' 
          ? '✓ تم تصدير التقرير بنجاح' 
          : '✓ Report exported successfully'
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        language === 'ar' 
          ? '❌ فشل في تصدير التقرير' 
          : '❌ Failed to export report'
      );
    } finally {
      setIsExporting(false);
    }
  }, [language, plan, progress, appState]);

  const pageDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <WeekPhaseProvider>
      <div dir={pageDirection}>
        <PageLayout 
          title={safeT('progress')}
          subtitle={safeT('trackYourLearning')}
          showBottomBar={true}
        >
          <motion.div {...animations.fadeIn} className="space-y-8">
            {/* Overall Progress Card */}
            <OverallProgressCard />
            {/* تبويبات جديدة */}
            <SimpleTabs
              tabs={ENHANCED_TABS.filter(tab => !['skills', 'achievements'].includes(tab.id) || process.env.NODE_ENV === 'development')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              language={language}
            />
            {/* محتوى التاب */}
            <Card className="overflow-hidden">
              <div className="mt-2 p-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="tab-content"
                  >
                    {isExporting && <LoadingSpinner />}
                    {activeTab === 'overview' && (
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProgressOverview />
                      </Suspense>
                    )}
                    {activeTab === 'analytics' && (
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProgressAnalytics />
                      </Suspense>
                    )}
                    {activeTab === 'skills' && <EnhancedSkillsTab />}
                    {activeTab === 'achievements' && <EnhancedAchievementsTab />}
                    {activeTab === 'suggestions' && <EnhancedSuggestionsTab language={language} />}
                    {activeTab === 'reports' && <EnhancedReportsTab />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </PageLayout>



        {/* Custom Styles */}
        <style dangerouslySetInnerHTML={{ __html: enhancedTabStyles }} />
      </div>
    </WeekPhaseProvider>
  );
}
