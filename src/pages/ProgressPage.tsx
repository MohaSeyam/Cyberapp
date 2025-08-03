// Progress Page - Enhanced with Tabs, Skills Matrix, and Charts
import React, { useState, useMemo, useCallback } from 'react';
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
const useProgressStats = (plan, progress) => {
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

    // Simplified streak logic
    const currentStreak = 5;
    const longestStreak = 12;

    return {
      completionRate,
      completedTasks: completedTasksCount,
      totalTasks,
      completedDuration,
      totalDuration,
      currentStreak,
      longestStreak,
      blueTeamTasks,
      redTeamTasks,
      practicalTasks,
      theoreticalTasks,
      policiesTasks,
    };
  }, [plan, progress]);
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
            <ProgressChart />
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
            <PieChartComponent />
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

// Enhanced Reports Tab Component
const EnhancedReportsTab = React.memo(({ onExport }) => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Reports</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Generate detailed progress reports</p>
          </div>
          <Download className="w-6 h-6 text-red-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { format: 'PDF', icon: FileText, color: 'red', desc: 'Official printable report' },
            { format: 'CSV', icon: FileSpreadsheet, color: 'green', desc: 'Structured data for analysis' },
            { format: 'MD', icon: FileCode, color: 'blue', desc: 'Flexible editable text' }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.format}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 border-${item.color}-200 dark:border-${item.color}-700 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-center cursor-pointer hover:shadow-md transition-all duration-300`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 text-${item.color}-600 dark:text-${item.color}-400`} />
                <div className="font-semibold text-gray-900 dark:text-white">{item.format}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
              </motion.div>
            );
          })}
        </div>
        
        <Button 
          onClick={onExport} 
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </Button>
      </Card>
    </div>
  );
});

// --- 3. Main Component (Enhanced) ---
export default function ProgressPage() {
  const { plan, progress } = useApp();
  const { language } = useLocalization();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: 'weekly',
    content: 'both',
    format: 'pdf',
    language: language as ExportLanguage
  });

  // All complex calculations are now handled by the custom hook
  const stats = useProgressStats(plan, progress);

  const safeT = (key: string) => {
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
  };

  const getCurrentLanguageText = (text: { ar: string; en: string }) => {
    return language === 'ar' ? text.ar : text.en;
  };

  const handleExport = useCallback(async () => {
    try {
      console.log('Exporting with options:', reportOptions);
      
      let content = '';
      const timestamp = new Date().toLocaleDateString('en-US');
      
      content += '# ' + (language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report') + '\n';
      content += '**' + (language === 'ar' ? 'تاريخ التصدير' : 'Export Date') + ': ' + timestamp + '**\n\n';
      
      if (reportOptions.content === 'progress' || reportOptions.content === 'both') {
        content += '## ' + (language === 'ar' ? 'تقرير التقدم' : 'Progress Report') + '\n\n';
        content += '- ' + (language === 'ar' ? 'إجمالي المهام' : 'Total Tasks') + ': ' + stats.totalTasks + '\n';
        content += '- ' + (language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks') + ': ' + stats.completedTasks + '\n';
        content += '- ' + (language === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate') + ': ' + stats.completionRate.toFixed(1) + '%\n';
        content += '- ' + (language === 'ar' ? 'المسار الحالي' : 'Current Streak') + ': ' + stats.currentStreak + ' ' + (language === 'ar' ? 'أيام' : 'days') + '\n';
        content += '- ' + (language === 'ar' ? 'أطول مسار' : 'Longest Streak') + ': ' + stats.longestStreak + ' ' + (language === 'ar' ? 'أيام' : 'days') + '\n\n';
      }
      
      let fileName = 'cybersecurity-report-' + Date.now();
      let blob: Blob;
      
      switch (reportOptions.format) {
        case 'pdf':
          blob = new Blob([content], { type: 'application/pdf' });
          fileName += '.pdf';
          break;
        case 'csv':
          blob = new Blob([content], { type: 'text/csv' });
          fileName += '.csv';
          break;
        case 'markdown':
          blob = new Blob([content], { type: 'text/markdown' });
          fileName += '.md';
          break;
        default:
          blob = new Blob([content], { type: 'text/plain' });
          fileName += '.txt';
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
    }
  }, [reportOptions, language, stats]);

  return (
    <WeekPhaseProvider>
      <PageLayout 
        title={safeT('progress')}
        subtitle={safeT('trackYourLearning')}
        showBottomBar={true}
      >
        <motion.div {...animations.fadeIn} className="space-y-8">
          {/* Overall Progress Card */}
          <OverallProgressCard />

          {/* Enhanced Tab Navigation */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
              <div className="tab-container">
                <div className="flex flex-wrap lg:flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
                  {ENHANCED_TABS.map((tab, index) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    const tabStyle = ENHANCED_TAB_STYLES[tab.color as keyof typeof ENHANCED_TAB_STYLES];
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-item flex-1 lg:flex-none flex flex-col items-center justify-center p-4 min-w-[140px] transition-all duration-300 border-b-2 relative ${
                          isActive 
                            ? tabStyle.active + ' ' + tabStyle.border
                            : 'border-transparent ' + tabStyle.hover + ' ' + tabStyle.text
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Badge */}
                        {tab.badge && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {tab.badge}
                          </div>
                        )}
                        
                        <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : tabStyle.text}`} />
                        <span className="font-semibold text-sm">
                          {getCurrentLanguageText(tab.label)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden lg:block">
                          {getCurrentLanguageText(tab.description)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Animated Indicator */}
                <motion.div
                  className="tab-indicator"
                  layoutId="tab-indicator"
                  style={{
                    width: '140px',
                    left: `${ENHANCED_TABS.findIndex(tab => tab.id === activeTab) * 140}px`
                  }}
                />
              </div>
            </div>

            {/* Enhanced Tab Content */}
            <div className="mt-6 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="tab-content"
                >
                  {activeTab === 'overview' && (
                    <EnhancedOverviewTab stats={stats} language={language} safeT={safeT} />
                  )}
                  {activeTab === 'analytics' && <EnhancedAnalyticsTab />}
                  {activeTab === 'skills' && <EnhancedSkillsTab />}
                  {activeTab === 'achievements' && <EnhancedAchievementsTab />}
                  {activeTab === 'suggestions' && <EnhancedSuggestionsTab language={language} />}
                  {activeTab === 'reports' && <EnhancedReportsTab onExport={() => setShowExportModal(true)} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </PageLayout>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={getCurrentLanguageText({ ar: 'تأكيد التصدير', en: 'Confirm Export' })}
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full mr-4">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {getCurrentLanguageText({ ar: 'تأكيد تصدير التقرير', en: 'Confirm Report Export' })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getCurrentLanguageText({ 
                    ar: 'سيتم تصدير التقرير بالخيارات المحددة. قد تستغرق العملية بضع لحظات.',
                    en: 'The report will be exported with the selected options. This may take a few moments.'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              {getCurrentLanguageText({ ar: 'ملخص التصدير', en: 'Export Summary' })}
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getCurrentLanguageText({ ar: 'نوع التقرير', en: 'Report Type' })}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm">
                  {getCurrentLanguageText({ ar: 'أسبوعي', en: 'Weekly' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getCurrentLanguageText({ ar: 'المحتوى', en: 'Content' })}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-sm">
                  {getCurrentLanguageText({ ar: 'التقدم والملاحظات', en: 'Progress & Notes' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getCurrentLanguageText({ ar: 'الصيغة', en: 'Format' })}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-sm">
                  PDF
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              {getCurrentLanguageText({ ar: 'تصدير التقرير', en: 'Export Report' })}
            </Button>
            <Button
              onClick={() => setShowExportModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {getCurrentLanguageText({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{ __html: enhancedTabStyles }} />
    </WeekPhaseProvider>
  );
}
