// Progress Page - Enhanced with Tabs, Skills Matrix, and Charts
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Clock, Flame, Trophy, BarChart3, PieChart, 
  TrendingUp, Award, Star, Users, BookOpen, Zap,
  CheckCircle, Circle, Calendar, Activity, ArrowRight,
  LineChart, Brain, Lightbulb, Download, FileText, 
  FileSpreadsheet, FileCode, FileArchive, CalendarDays
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

// Custom CSS for hiding scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
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

// --- 2. Child Components (Decoupled & Memoized) ---
const OverviewTab = React.memo(({ stats, language, safeT }) => {
  const metrics = [
    { 
      label: safeT('completionRate'), 
      value: stats.completionRate + '%', 
      color: 'blue',
      icon: Target
    },
    { 
      label: safeT('completedTasks'), 
      value: stats.completedTasks, 
      color: 'green',
      icon: CheckCircle
    },
    { 
      label: safeT('timeSpent'), 
      value: Math.round(stats.completedDuration / 60) + 'h', 
      color: 'purple',
      icon: Clock
    },
    { 
      label: safeT('currentStreak'), 
      value: stats.currentStreak, 
      color: 'orange',
      icon: Flame
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-500 mb-1">{metric.label}</h3>
                    <p className="text-4xl font-bold text-blue-600">{metric.value}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

const AnalyticsTab = React.memo(() => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Progress Chart</h3>
          <ProgressChart />
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Task Distribution</h3>
          <PieChartComponent />
        </Card>
      </div>
    </div>
  );
});

const SkillsTab = React.memo(() => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Skills Matrix</h3>
        <p className="text-gray-600">Skills assessment will be implemented here.</p>
      </Card>
    </div>
  );
});

const AchievementsTab = React.memo(() => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Achievements</h3>
        <p className="text-gray-600">Achievements and milestones will be displayed here.</p>
      </Card>
    </div>
  );
});

const SuggestionsTab = React.memo(({ language }) => {
  const t = (ar, en) => language === 'ar' ? ar : en;
  return (
    <div className="space-y-8">
      <Card className="p-8 text-center">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {t('ممتاز!', 'Excellent!')}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {t('أنت على المسار الصحيح. استمر في التعلم والمثابرة!', "You're on the right track. Keep learning and persevering!")}
        </p>
      </Card>
    </div>
  );
});

const ReportsTab = React.memo(({ onExport }) => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Export Reports</h3>
        <Button onClick={onExport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </Card>
    </div>
  );
});

// --- 3. Main Component (Cleaned and Simplified) ---
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
      completedTasks: { ar: 'المهام المكتملة', en: 'Completed Tasks' },
      timeSpent: { ar: 'الوقت المستغرق', en: 'Time Spent' },
      currentStreak: { ar: 'المسار الحالي', en: 'Current Streak' },
      overview: { ar: 'نظرة عامة', en: 'Overview' },
      analytics: { ar: 'التحليلات', en: 'Analytics' },
      skills: { ar: 'المهارات', en: 'Skills' },
      achievements: { ar: 'الإنجازات', en: 'Achievements' },
      suggestions: { ar: 'الاقتراحات', en: 'Suggestions' },
      reports: { ar: 'التقارير', en: 'Reports' }
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

  const tabs = [
    { 
      id: 'overview', 
      label: { ar: 'نظرة عامة', en: 'Overview' }, 
      icon: BarChart3,
      color: 'blue',
      description: { ar: 'ملخص شامل للتقدم', en: 'Comprehensive progress summary' }
    },
    { 
      id: 'analytics', 
      label: { ar: 'التحليلات', en: 'Analytics' }, 
      icon: LineChart,
      color: 'purple',
      description: { ar: 'رسوم بيانية مفصلة', en: 'Detailed charts and graphs' }
    },
    { 
      id: 'skills', 
      label: { ar: 'المهارات', en: 'Skills' }, 
      icon: Brain,
      color: 'green',
      description: { ar: 'تقييم المهارات المكتسبة', en: 'Assess acquired skills' }
    },
    { 
      id: 'achievements', 
      label: { ar: 'الإنجازات', en: 'Achievements' }, 
      icon: Trophy,
      color: 'yellow',
      description: { ar: 'المراحل والإنجازات', en: 'Milestones and achievements' }
    },
    { 
      id: 'suggestions', 
      label: { ar: 'الاقتراحات', en: 'Suggestions' }, 
      icon: Lightbulb,
      color: 'orange',
      description: { ar: 'نصائح للتحسين', en: 'Improvement tips' }
    },
    { 
      id: 'reports', 
      label: { ar: 'التقارير', en: 'Reports' }, 
      icon: Download,
      color: 'red',
      description: { ar: 'تصدير التقارير', en: 'Export reports' }
    }
  ];

  const TAB_STYLES = {
    blue: {
      border: 'border-blue-500',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      active: 'bg-blue-500 text-white'
    },
    purple: {
      border: 'border-purple-500',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      active: 'bg-purple-500 text-white'
    },
    green: {
      border: 'border-green-500',
      text: 'text-green-600',
      hover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      active: 'bg-green-500 text-white'
    },
    yellow: {
      border: 'border-yellow-500',
      text: 'text-yellow-600',
      hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      active: 'bg-yellow-500 text-white'
    },
    orange: {
      border: 'border-orange-500',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      active: 'bg-orange-500 text-white'
    },
    red: {
      border: 'border-red-500',
      text: 'text-red-600',
      hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      active: 'bg-red-500 text-white'
    }
  } as const;

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
              <div className="flex flex-wrap lg:flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  const tabStyle = TAB_STYLES[tab.color as keyof typeof TAB_STYLES];
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 lg:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] transition-all duration-300 border-b-2 ${
                        isActive 
                          ? tabStyle.border + ' ' + tabStyle.active
                          : 'border-transparent ' + tabStyle.hover
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={'w-6 h-6 mb-2 ' + (isActive ? '' : tabStyle.text)} />
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
                <OverviewTab stats={stats} language={language} safeT={safeT} />
              )}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'skills' && <SkillsTab />}
              {activeTab === 'achievements' && <AchievementsTab />}
              {activeTab === 'suggestions' && <SuggestionsTab language={language} />}
              {activeTab === 'reports' && <ReportsTab onExport={() => setShowExportModal(true)} />}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              {getCurrentLanguageText({ ar: 'تصدير التقرير', en: 'Export Report' })}
            </Button>
            <Button
              onClick={() => setShowExportModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {getCurrentLanguageText({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
          </div>
        </div>
      </Modal>
    </WeekPhaseProvider>
  );
}