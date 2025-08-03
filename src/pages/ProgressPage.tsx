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

<<<<<<< HEAD
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
=======
// Memoized Tab Components for better performance
const MemoizedOverviewTab = memo(({ 
  completionRate, 
  completedTasks, 
  totalTasks, 
  completedDuration, 
  totalDuration, 
  currentStreak, 
  blueTeamTasks, 
  redTeamTasks, 
  practicalTasks, 
  theoreticalTasks, 
  policiesTasks, 
  language, 
  safeT 
}: any) => (
  <div className="space-y-8">
    {/* Enhanced Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
>>>>>>> 922cf3290735d2d5285baa636546d935863f05ef
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
<<<<<<< HEAD
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
=======
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                {language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}
              </h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {completionRate}%
              </p>
              <div className="mt-3 w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
>>>>>>> 922cf3290735d2d5285baa636546d935863f05ef
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
  
  // FIX: Changed initial type to a valid option 'weekly' to prevent crash
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
      
<<<<<<< HEAD
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
=======
      // Add report title
      content += `# ${language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report'}\n`;
      content += `**${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}**\n\n`;
      
      // Add application logo
      content += `![Logo](data:image/png;base64,${await getLogoBase64()})\n\n`;
      
      // Add report content based on type
      if (reportOptions.content === 'progress' || reportOptions.content === 'both') {
        content += `## ${language === 'ar' ? 'تقرير التقدم' : 'Progress Report'}\n\n`;
        content += `- ${language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}: ${totalTasks}\n`;
        content += `- ${language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}: ${completedTasks}\n`;
        content += `- ${language === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate'}: ${completionRate.toFixed(1)}%\n`;
        content += `- ${language === 'ar' ? 'المسار الحالي' : 'Current Streak'}: ${currentStreak} ${language === 'ar' ? 'أيام' : 'days'}\n`;
        content += `- ${language === 'ar' ? 'أطول مسار' : 'Longest Streak'}: ${longestStreak} ${language === 'ar' ? 'أيام' : 'days'}\n\n`;
      }
      
      if (reportOptions.content === 'notes' || reportOptions.content === 'both') {
        content += `## ${language === 'ar' ? 'الملاحظات والمدونات' : 'Notes and Journal Entries'}\n\n`;
        
        // Add notes
        const notes = await getNotes();
        if (notes.length > 0) {
          content += `### ${language === 'ar' ? 'الملاحظات' : 'Notes'}\n\n`;
          notes.forEach(note => {
            content += `#### ${note.title}\n`;
            content += `**${language === 'ar' ? 'التاريخ' : 'Date'}: ${new Date(note.createdAt).toLocaleDateString('en-US')}**\n\n`;
            content += `${note.content.replace(/<[^>]*>/g, '')}\n\n`;
          });
        }
        
        // Add journal entries
        const journalEntries = await getJournalEntries();
        if (journalEntries.length > 0) {
          content += `### ${language === 'ar' ? 'المدونات' : 'Journal Entries'}\n\n`;
          journalEntries.forEach(entry => {
            content += `#### ${entry.title}\n`;
            content += `**${language === 'ar' ? 'التاريخ' : 'Date'}: ${new Date(entry.createdAt).toLocaleDateString('en-US')}**\n\n`;
            content += `${entry.content.replace(/<[^>]*>/g, '')}\n\n`;
          });
        }
      }
      
      // إنشاء الملف حسب الصيغة
      let fileName = `cybersecurity-report-${Date.now()}`;
>>>>>>> 922cf3290735d2d5285baa636546d935863f05ef
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
<<<<<<< HEAD
  }, [reportOptions, language, stats]);
=======
  }, [reportOptions, language, totalTasks, completedTasks, completionRate, currentStreak, longestStreak]);

  // Calculate streak information
  const calculateStreak = () => {
    if (safeProgress.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const completedDates = safeProgress
      .filter(p => p.done)
      .map(p => new Date(p.updatedAt || 0).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (completedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    for (let i = 0; i < completedDates.length; i++) {
      const currentDate = new Date(completedDates[i]);
      const nextDate = i < completedDates.length - 1 ? new Date(completedDates[i + 1]) : null;
      
      if (nextDate) {
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
      } else {
        tempStreak++;
      }
      
      if (i === 0) {
        const daysSinceLastActivity = Math.floor((Date.now() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastActivity === 0 || daysSinceLastActivity === 1) {
          currentStreak = tempStreak;
        } else if (daysSinceLastActivity === 2 && completedDates.includes(yesterday)) {
          currentStreak = tempStreak;
        } else {
          currentStreak = 0;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  };
  
  const { currentStreak, longestStreak } = calculateStreak();

  // Helper functions for export
  const getLogoBase64 = async () => {
    try {
      const response = await fetch(appLogo); // Use the imported logo variable
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      return '';
    }
  };

  const getNotes = async () => {
    try {
      const db = await openDB('cyberplan', 1);
      return await db.getAll('notes');
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  };

  const getJournalEntries = async () => {
    try {
      const db = await openDB('cyberplan', 1);
      return await db.getAll('journal');
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  };

  const convertToPDF = async (content: string) => {
    try {
      // إنشاء عنصر HTML مؤقت لتحويله إلى PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = language === 'ar' ? 'Cairo, Arial, sans-serif' : 'Arial, sans-serif';
      tempDiv.style.direction = language === 'ar' ? 'rtl' : 'ltr';
      tempDiv.style.textAlign = language === 'ar' ? 'right' : 'left';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.fontSize = '14px';
      
      // Add content
      tempDiv.innerHTML = content.replace(/\n/g, '<br>');
      
      // Add logo at the top
      const logoImg = document.createElement('img');
      logoImg.src = appLogo; // Use the imported logo variable
      logoImg.style.width = '100px';
      logoImg.style.height = 'auto';
      logoImg.style.display = 'block';
      logoImg.style.margin = language === 'ar' ? '0 0 20px auto' : '0 auto 20px 0';
      
      const logoContainer = document.createElement('div');
      logoContainer.style.textAlign = 'center';
      logoContainer.style.marginBottom = '30px';
      logoContainer.appendChild(logoImg);
      
      tempDiv.insertBefore(logoContainer, tempDiv.firstChild);
      
      document.body.appendChild(tempDiv);
      
      // Wait for image to load
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
        setTimeout(resolve, 1000); // timeout after 1 second
      });
      
      // Convert HTML to canvas then to PDF
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      const canvas = await html2canvas.default(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Clean up temporary element
      document.body.removeChild(tempDiv);
      
      return pdf.output('blob');
    } catch (error) {
      console.error('PDF conversion error:', error);
      // In case of failure, return plain text
      return new Blob([content], { type: 'text/plain' });
    }
  };

  const convertToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Tasks', totalTasks],
      ['Completed Tasks', completedTasks],
      ['Completion Rate', `${completionRate.toFixed(1)}%`],
      ['Current Streak', currentStreak],
      ['Longest Streak', longestStreak]
    ];
    
    return csvData.map(row => row.join(',')).join('\n');
  };

  // Get last activity
  const lastActivity = safeProgress
    .filter(p => p.done)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];

  // Calculate task types distribution (including Policies)
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
  const theoreticalTasks = completedTaskTypes.filter(type => type === 'Theoretical').length;
  const policiesTasks = completedTaskTypes.filter(type => type === 'Policies').length;

  // Generate chart data
  const generateProgressData = () => {
    const weeklyData = safePlan.map((week, index) => {
      const weekTasks = (week.days || []).filter(day => day.key !== 'fri').flatMap(day => day.tasks || []);
      const completedTasks = safeProgress.filter(p => 
        weekTasks.some(task => task.id === p.taskId && p.done)
      ).length;
      
      return {
        week: `الأسبوع ${week.week}`,
        completed: completedTasks,
        total: weekTasks.length,
        percentage: weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0
      };
    });

    return weeklyData.slice(0, 10); // Show last 10 weeks
  };

  const generateTaskTypeData = () => {
    const taskTypes = new Map<string, number>();
    
    safePlan.forEach(week => {
      (week.days || []).forEach(day => {
        (day.tasks || []).forEach(task => {
          const type = task.type || 'عام';
          taskTypes.set(type, (taskTypes.get(type) || 0) + 1);
        });
      });
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return Array.from(taskTypes.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const generateCategoryData = () => {
    const categories = new Map<string, number>();
    
    safePlan.forEach(week => {
      (week.days || []).forEach(day => {
        (day.tasks || []).forEach(task => {
          const category = task.category || 'عام';
          categories.set(category, (categories.get(category) || 0) + 1);
        });
      });
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return Array.from(categories.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  // Skills Matrix Data
  const skillsMatrix: Skill[] = useMemo(() => [
    {
      id: '1',
      name: language === 'ar' ? 'التحليل الجنائي' : 'Forensic Analysis',
      category: language === 'ar' ? 'التحليل' : 'Analysis',
      level: Math.min(5, Math.floor(blueTeamTasks / 3)),
      description: language === 'ar' ? 'مهارات تحليل الأدلة الرقمية' : 'Digital evidence analysis skills',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: language === 'ar' ? 'اختبار الاختراق' : 'Penetration Testing',
      category: language === 'ar' ? 'الهجوم' : 'Offensive',
      level: Math.min(5, Math.floor(redTeamTasks / 3)),
      description: language === 'ar' ? 'مهارات اختبار الاختراق' : 'Penetration testing skills',
      color: 'bg-red-500'
    },
    {
      id: '3',
      name: language === 'ar' ? 'التحليل العملي' : 'Practical Analysis',
      category: language === 'ar' ? 'التطبيق' : 'Practical',
      level: Math.min(5, Math.floor(practicalTasks / 2)),
      description: language === 'ar' ? 'مهارات التطبيق العملي' : 'Practical application skills',
      color: 'bg-green-500'
    },
    {
      id: '4',
      name: language === 'ar' ? 'المفاهيم النظرية' : 'Theoretical Concepts',
      category: language === 'ar' ? 'النظرية' : 'Theory',
      level: Math.min(5, Math.floor(theoreticalTasks / 2)),
      description: language === 'ar' ? 'فهم المفاهيم النظرية' : 'Understanding theoretical concepts',
      color: 'bg-purple-500'
    },
    {
      id: '5',
      name: language === 'ar' ? 'السياسات والإجراءات' : 'Policies & Procedures',
      category: language === 'ar' ? 'السياسات' : 'Policies',
      level: Math.min(5, Math.floor(policiesTasks / 2)),
      description: language === 'ar' ? 'فهم السياسات والإجراءات' : 'Understanding policies and procedures',
      color: 'bg-orange-500'
    },
    {
      id: '6',
      name: language === 'ar' ? 'الأمن السيبراني' : 'Cybersecurity',
      category: language === 'ar' ? 'الأمن' : 'Security',
      level: Math.min(5, Math.floor((blueTeamTasks + redTeamTasks) / 4)),
      description: language === 'ar' ? 'مهارات الأمن السيبراني الشاملة' : 'Comprehensive cybersecurity skills',
      color: 'bg-indigo-500'
    }
  ], [blueTeamTasks, redTeamTasks, practicalTasks, theoreticalTasks, policiesTasks, language]);

  // Smart Suggestions System
  const suggestions = useMemo(() => {
    const suggestionsList = [];

    if (completedTasks === 0) {
      suggestionsList.push({
        icon: ArrowRight,
        title: language === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey',
        description: language === 'ar' ? 'ابدأ بأول مهمة لتبدأ رحلتك في الأمن السيبراني' : 'Start with your first task to begin your cybersecurity journey',
        type: 'motivation',
        priority: 'high',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }

    if (completionRate < 30) {
      suggestionsList.push({
        icon: Clock,
        title: language === 'ar' ? 'خصص وقتاً منتظماً' : 'Set Regular Time',
        description: language === 'ar' ? 'خصص 30 دقيقة يومياً للتعلم لتحسين تقدمك' : 'Set aside 30 minutes daily for learning to improve your progress',
        type: 'time-management',
        priority: 'high',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      });
    }

    if (currentStreak === 0 && completedTasks > 0) {
      suggestionsList.push({
        icon: Flame,
        title: language === 'ar' ? 'استعد نشاطك' : 'Get Back on Track',
        description: language === 'ar' ? 'استعد نشاطك اليومي لبناء عادة التعلم' : 'Get back to daily activity to build learning habits',
        type: 'motivation',
        priority: 'medium',
        color: 'text-red-600',
        bg: 'bg-red-50'
      });
    }

    if (blueTeamTasks < redTeamTasks) {
      suggestionsList.push({
        icon: ArrowRight,
        title: language === 'ar' ? 'ركز على الدفاع' : 'Focus on Defense',
        description: language === 'ar' ? 'ركز على مهام الفريق الأزرق لتحسين مهارات الدفاع' : 'Focus on blue team tasks to improve defensive skills',
        type: 'skill-balance',
        priority: 'medium',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }

    if (policiesTasks < 2) {
      suggestionsList.push({
        icon: BookOpen,
        title: language === 'ar' ? 'تعلم السياسات' : 'Learn Policies',
        description: language === 'ar' ? 'ركز على مهام السياسات لفهم الإجراءات الأمنية' : 'Focus on policy tasks to understand security procedures',
        type: 'skill-balance',
        priority: 'medium',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      });
    }

    return suggestionsList;
  }, [completedTasks, completionRate, currentStreak, blueTeamTasks, redTeamTasks, policiesTasks, language]);

  // Tab Components
  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="التقدم عبر الزمن" subtitle="رسم بياني أسبوعي للتقدم">
          <ProgressChart 
            data={generateProgressData()} 
            type="line"
          />
        </Card>

        <Card title="توزيع أنواع المهام" subtitle="رسم بياني دائري للتوزيع">
          <PieChartComponent data={generateTaskTypeData()} />
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="التقدم الأسبوعي" subtitle="رسم بياني عمودي">
          <ProgressChart 
            data={generateProgressData()} 
            type="bar"
          />
        </Card>

        <Card title="توزيع الفئات" subtitle="توزيع المهام حسب الفئة">
          <PieChartComponent data={generateCategoryData()} />
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card title="إحصائيات مفصلة" subtitle="تحليل شامل">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">إجمالي الأسابيع</span>
            <span className="font-semibold text-gray-900 dark:text-white">{totalWeeks}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">إجمالي المهام</span>
            <span className="font-semibold text-gray-900 dark:text-white">{totalTasks}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">المهام المكتملة</span>
            <span className="font-semibold text-gray-900 dark:text-white">{completedTasks}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">إجمالي المدة</span>
            <span className="font-semibold text-gray-900 dark:text-white">{Math.round(totalDuration / 60)} ساعة</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const SkillsTab = () => (
    <div className="space-y-6">
      {/* Skills Matrix */}
      <Card title={safeT('skillsMatrix')} subtitle={safeT('yourSkillLevels')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillsMatrix.map((skill, index) => (
            <motion.div key={skill.id} {...animations.stagger(index * 0.1)}>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h4>
                  <div className={`w-3 h-3 rounded-full ${skill.color}`}></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{skill.description}</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded-full ${
                        level <= skill.level ? skill.color : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {skill.level}/5 {safeT('level')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Skills Categories */}
      <Card title={safeT('skillCategories')} subtitle={safeT('categoryBreakdown')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(skillsMatrix.map(s => s.category))).map((category, index) => {
            const categorySkills = skillsMatrix.filter(s => s.category === category);
            const avgLevel = Math.round(categorySkills.reduce((sum, s) => sum + s.level, 0) / categorySkills.length);
            return (
              <motion.div key={category} {...animations.stagger(index * 0.1)}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{category}</h4>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgLevel}/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{categorySkills.length} {safeT('skills')}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-6">
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'first-task',
            title: language === 'ar' ? 'الخطوة الأولى' : 'First Step',
            description: language === 'ar' ? 'أكمل أول مهمة' : 'Complete your first task',
            icon: Target,
            unlocked: completedTasks >= 1,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            id: 'streak-3',
            title: language === 'ar' ? 'نشاط مستمر' : 'Consistent Activity',
            description: language === 'ar' ? 'حافظ على نشاط 3 أيام متتالية' : 'Maintain 3-day streak',
            icon: Flame,
            unlocked: currentStreak >= 3,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          },
          {
            id: 'blue-team',
            title: language === 'ar' ? 'محلل دفاعي' : 'Defensive Analyst',
            description: language === 'ar' ? 'أكمل 5 مهام فريق أزرق' : 'Complete 5 blue team tasks',
            icon: ArrowRight,
            unlocked: blueTeamTasks >= 5,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            id: 'red-team',
            title: language === 'ar' ? 'مخترق أخلاقي' : 'Ethical Hacker',
            description: language === 'ar' ? 'أكمل 5 مهام فريق أحمر' : 'Complete 5 red team tasks',
            icon: Zap,
            unlocked: redTeamTasks >= 5,
            color: 'text-red-600',
            bg: 'bg-red-50'
          },
          {
            id: 'policies',
            title: language === 'ar' ? 'خبير السياسات' : 'Policy Expert',
            description: language === 'ar' ? 'أكمل 3 مهام سياسات' : 'Complete 3 policy tasks',
            icon: BookOpen,
            unlocked: policiesTasks >= 3,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          },
          {
            id: 'completion-50',
            title: language === 'ar' ? 'نصف الطريق' : 'Halfway There',
            description: language === 'ar' ? 'أكمل 50% من المهام' : 'Complete 50% of tasks',
            icon: Trophy,
            unlocked: completionRate >= 50,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          }
        ].map((achievement, index) => (
          <motion.div key={achievement.id} {...animations.stagger(index * 0.1)}>
            <Card className={`p-6 text-center transition-all duration-300 ${
              achievement.unlocked ? achievement.bg : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className={`flex items-center justify-center mb-4 ${
                achievement.unlocked ? achievement.color : 'text-gray-400'
              }`}>
                <achievement.icon className="w-8 h-8" />
              </div>
              <h4 className={`font-semibold mb-2 ${
                achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {achievement.title}
              </h4>
              <p className={`text-sm ${
                achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="mt-3">
                  <CheckCircle className="w-5 h-5 mx-auto text-green-600 dark:text-green-400" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const SuggestionsTab = () => (
    <div className="space-y-6">
      {/* Smart Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => (
          <motion.div key={index} {...animations.stagger(index * 0.1)}>
            <Card className={`p-6 ${suggestion.bg} dark:bg-gray-800`}>
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${suggestion.bg.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                  <suggestion.icon className={`w-6 h-6 ${suggestion.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${suggestion.color}`}>
                    {suggestion.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {suggestion.description}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      suggestion.priority === 'medium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {suggestion.priority === 'high' ? (language === 'ar' ? 'عالية' : 'High') :
                        suggestion.priority === 'medium' ? (language === 'ar' ? 'متوسطة' : 'Medium') :
                        (language === 'ar' ? 'منخفضة' : 'Low')} {language === 'ar' ? 'الأولوية' : 'Priority'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'ممتاز!' : 'Excellent!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {/* FIX: Use double quotes to avoid escaping the apostrophe, which causes the build error */}
            {language === 'ar' ? 'أنت على المسار الصحيح. استمر في التعلم!' : "You're on the right track. Keep learning!"}
          </p>
        </Card>
      )}
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-8">
      
      {/* Logo Header for Reports */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Logo size="lg" className="mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تقارير الأمن السيبراني' : 'Cybersecurity Reports'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'تصدير تقارير مفصلة ومخصصة' : 'Export detailed and customized reports'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Report Type Selection */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            {getCurrentLanguageText({ ar: 'نوع التقرير', en: 'Report Type' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = reportOptions.type === type.id;
              return (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  onClick={() => setReportOptions(prev => ({ ...prev, type: type.id as ReportType }))}
                >
                  <div className="flex items-center mb-3">
                    <Icon className={`w-5 h-5 mr-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className={`font-semibold ${
                      isSelected ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getCurrentLanguageText(type.label)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCurrentLanguageText(type.description)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Content Type Selection */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-green-600" />
            {getCurrentLanguageText({ ar: 'نوع المحتوى', en: 'Content Type' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentTypes.map((content) => {
              const Icon = content.icon;
              const isSelected = reportOptions.content === content.id;
              return (
                <motion.div
                  key={content.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                  onClick={() => setReportOptions(prev => ({ ...prev, content: content.id as ContentType }))}
                >
                  <div className="flex items-center mb-3">
                    <Icon className={`w-5 h-5 mr-2 ${
                      isSelected ? 'text-green-600' : 'text-gray-500'
                    }`} />
                    <span className={`font-semibold ${
                      isSelected ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getCurrentLanguageText(content.label)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCurrentLanguageText(content.description)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* File Format Selection */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Download className="w-6 h-6 mr-2 text-purple-600" />
            {getCurrentLanguageText({ ar: 'صيغة الملف', en: 'File Format' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fileFormats.map((format) => {
              const Icon = format.icon;
              const isSelected = reportOptions.format === format.id;
              return (
                <motion.div
                  key={format.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                  onClick={() => setReportOptions(prev => ({ ...prev, format: format.id as FileFormat }))}
                >
                  <div className="flex items-center mb-3">
                    <Icon className={`w-5 h-5 mr-2 ${
                      isSelected ? 'text-purple-600' : 'text-gray-500'
                    }`} />
                    <span className={`font-semibold ${
                      isSelected ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getCurrentLanguageText(format.label)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCurrentLanguageText(format.description)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Date/Phase Selection */}
      {(reportOptions.type === 'weekly' || reportOptions.type === 'phase') && (
        <Card>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarDays className="w-6 h-6 mr-2 text-indigo-600" />
              {getCurrentLanguageText({ 
                ar: reportOptions.type === 'weekly' ? 'اختر الأسبوع' : 'اختر المرحلة', 
                en: reportOptions.type === 'weekly' ? 'Select Week' : 'Select Phase' 
              })}
            </h3>

          {reportOptions.type === 'weekly' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getCurrentLanguageText({ ar: 'من أسبوع', en: 'From Week' })}
                  </label>
                  <input
                    type="week"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    value={reportOptions.dateRange?.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const startDate = e.target.value ? new Date(e.target.value) : undefined;
                      setReportOptions(prev => ({
                        ...prev,
                        dateRange: {
                          start: startDate || new Date(),
                          end: prev.dateRange?.end || new Date()
                        }
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {getCurrentLanguageText({ ar: 'إلى أسبوع', en: 'To Week' })}
                  </label>
                  <input
                    type="week"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    value={reportOptions.dateRange?.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const endDate = e.target.value ? new Date(e.target.value) : undefined;
                      setReportOptions(prev => ({
                        ...prev,
                        dateRange: {
                          start: prev.dateRange?.start || new Date(),
                          end: endDate || new Date()
                        }
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {reportOptions.type === 'phase' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getCurrentLanguageText({ ar: 'اختر المرحلة', en: 'Select Phase' })}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  value={reportOptions.phaseId || ''}
                  onChange={(e) => {
                    setReportOptions(prev => ({
                      ...prev,
                      phaseId: e.target.value ? parseInt(e.target.value) : undefined
                    }));
                  }}
                >
                  <option value="">
                    {getCurrentLanguageText({ ar: 'اختر مرحلة...', en: 'Select a phase...' })}
                  </option>
                  {safePlan.map((phase, index) => (
                    <option key={index} value={index}>
                      {getCurrentLanguageText({ 
                        ar: `Phase ${index + 1}: ${phase.name?.ar || 'Phase ' + (index + 1)}`, 
                        en: `Phase ${index + 1}: ${phase.name?.en || 'Phase ' + (index + 1)}` 
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          </div>
        </Card>
      )}
    </div>
  );

  // FIX: Created a map for dynamic Tailwind classes to ensure they are detected by the JIT compiler.
  const colorClassesMap = {
    blue: {
      active: 'bg-blue-500 text-white border-blue-500',
      inactive: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    purple: {
      active: 'bg-purple-500 text-white border-purple-500',
      inactive: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    },
    green: {
      active: 'bg-green-500 text-white border-green-500',
      inactive: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    },
    yellow: {
      active: 'bg-yellow-500 text-white border-yellow-500',
      inactive: 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    },
    orange: {
      active: 'bg-orange-500 text-white border-orange-500',
      inactive: 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
    },
    red: {
      active: 'bg-red-500 text-white border-red-500',
      inactive: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
    },
  };

  // Tab Configuration with enhanced design
  const tabs = [
    { 
      id: 'overview', 
      label: { ar: 'Overview', en: 'Overview' }, 
      icon: BarChart3,
      color: 'blue',
      description: { ar: 'Comprehensive progress summary', en: 'Comprehensive progress summary' }
    },
    { 
      id: 'analytics', 
      label: { ar: 'Analytics', en: 'Analytics' }, 
      icon: LineChart,
      color: 'purple',
      description: { ar: 'Detailed charts and graphs', en: 'Detailed charts and graphs' }
    },
    { 
      id: 'skills', 
      label: { ar: 'Skills', en: 'Skills' }, 
      icon: Brain,
      color: 'green',
      description: { ar: 'Assess acquired skills', en: 'Assess acquired skills' }
    },
    { 
      id: 'achievements', 
      label: { ar: 'Achievements', en: 'Achievements' }, 
      icon: Trophy,
      color: 'yellow',
      description: { ar: 'Milestones and achievements', en: 'Milestones and achievements' }
    },
    { 
      id: 'suggestions', 
      label: { ar: 'Suggestions', en: 'Suggestions' }, 
      icon: Lightbulb,
      color: 'orange',
      description: { ar: 'Improvement tips', en: 'Improvement tips' }
    },
    { 
      id: 'reports', 
      label: { ar: 'Reports', en: 'Reports' }, 
      icon: Download,
      color: 'red',
      description: { ar: 'Export reports', en: 'Export reports' }
    }
  ];
>>>>>>> 922cf3290735d2d5285baa636546d935863f05ef

  return (
    <WeekPhaseProvider>
      <PageLayout 
        title={safeT('progress')}
        subtitle={safeT('trackYourLearning')}
        showBottomBar={true}
      >
        <motion.div {...animations.fadeIn} className="space-y-8">
<<<<<<< HEAD
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
=======
          
          {/* Enhanced Header with Progress Overview */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {language === 'ar' ? 'Progress Center' : 'Progress Center'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {language === 'ar' 
                    ? `${completionRate}% Complete - ${completedTasks}/${totalTasks} tasks`
                    : `${completionRate}% Complete - ${completedTasks}/${totalTasks} tasks`
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'Completed' : 'Completed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((totalDuration - completedDuration) / 60)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'Hours Left' : 'Hours Left'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-wrap lg:flex-nowrap overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const colorKey = tab.color as keyof typeof colorClassesMap;
                const colorClasses = colorClassesMap[colorKey];
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 lg:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] transition-all duration-300 border-b-2 ${
                      isActive 
                        ? colorClasses.active
                        : `${colorClasses.inactive} border-transparent hover:border-gray-300`
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isActive ? '' : colorClasses.inactive.split(' ')[0]}`} />
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
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Overall Progress Card - Using New Component */}
                <OverallProgressCard />
                <MemoizedOverviewTab 
                  completionRate={completionRate} 
                  completedTasks={completedTasks} 
                  totalTasks={totalTasks} 
                  completedDuration={completedDuration} 
                  totalDuration={totalDuration} 
                  currentStreak={currentStreak} 
                  blueTeamTasks={blueTeamTasks} 
                  redTeamTasks={redTeamTasks} 
                  practicalTasks={practicalTasks} 
                  theoreticalTasks={theoreticalTasks} 
                  policiesTasks={policiesTasks} 
                  language={language} 
                  safeT={safeT} 
>>>>>>> 922cf3290735d2d5285baa636546d935863f05ef
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
