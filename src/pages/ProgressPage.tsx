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

// Tab Types
type TabType = 'overview' | 'analytics' | 'skills' | 'achievements' | 'suggestions' | 'reports';

// Enhanced Tab Configuration - IMPROVED ORGANIZATION
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
    description: { ar: 'تحليل مفصل للأداء', en: 'Detailed performance analysis' }
  },
  {
    id: 'reports',
    label: { ar: 'التقارير', en: 'Reports' },
    icon: FileText,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    description: { ar: 'تصدير وتقارير', en: 'Export and reports' }
  },
  {
    id: 'skills',
    label: { ar: 'المهارات', en: 'Skills' },
    icon: Brain,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    description: { ar: 'مصفوفة المهارات', en: 'Skills matrix' },
    badge: 'DEV'
  },
  {
    id: 'achievements',
    label: { ar: 'الإنجازات', en: 'Achievements' },
    icon: Trophy,
    color: 'yellow',
    gradient: 'from-yellow-500 to-yellow-600',
    description: { ar: 'الإنجازات والجوائز', en: 'Achievements and awards' },
    badge: 'DEV'
  },
  {
    id: 'suggestions',
    label: { ar: 'الاقتراحات', en: 'Suggestions' },
    icon: Lightbulb,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    description: { ar: 'اقتراحات للتحسين', en: 'Improvement suggestions' }
  }
];

// Improved Tab Component with better organization
function EnhancedTabs({ tabs, activeTab, setActiveTab, language }) {
  const isRTL = language === 'ar';
  
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-1 py-3`}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap min-w-fit tab-button
                    ${isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? tab.label.ar : tab.label.en}
                  </span>
                  {tab.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full tab-badge">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
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

  // Memoized complex calculations - OPTIMIZED with early returns
  const streaks = useMemo(() => {
    if (!progress || progress.length === 0) return { current: 0, longest: 0 };
    
    let current = 0, longest = 0, streak = 0;
    let lastDate = null;
    
    // Filter and sort in one pass for better performance
    const completedProgress = progress.filter(p => p.done);
    if (completedProgress.length === 0) return { current: 0, longest: 0 };
    
    const sorted = completedProgress.sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    
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

  // Memoized stats calculation with early return
  const stats = useMemo(() => {
    if (!plan || !progress) return null;
    return useProgressStats(plan, progress, streaks);
  }, [plan, progress, streaks]);

  // Color and gradient class maps for dynamic styling - MEMOIZED
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

  // Memoized safeT function to prevent re-creation
  const safeT = useCallback((key: string) => {
    try {
      return language === 'ar' ? t(key) : t(key);
    } catch {
      return key;
    }
  }, [language]);

  // FIXED: Enhanced export function with proper error handling and validation
  const handleAdvancedExport = useCallback(async (options) => {
    if (!plan || !appState) {
      toast.error(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    // Validate options
    if (!options?.format || !options?.content) {
      toast.error(language === 'ar' ? 'يرجى اختيار صيغة الملف ونوع المحتوى' : 'Please select file format and content type');
      return;
    }

    setIsExporting(true);
    try {
      // Optimized export logic with early returns
      const timestamp = new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
      let fileName = `cyberplan-report-${Date.now()}`;
      let blob;

      // Filter data efficiently
      const filteredData = filterDataByOptions(options, plan, appState);
      const { filteredTasks, filteredNotes, filteredResources } = filteredData;

      if (filteredTasks.length === 0 && filteredNotes.length === 0) {
        toast.error(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
        return;
      }

      // Calculate totals efficiently
      const totalNotes = filteredNotes.length;
      const totalResources = filteredResources.length;

      // Create export data based on format
      switch (options.format) {
        case 'json': {
          const exportData = {
            metadata: {
              appName: 'Gemini CyberPlan',
              exportDate: timestamp,
              reportType: options.reportType || 'complete',
              contentType: options.contentType || 'both',
              language: options.exportLanguage || language,
              totalTasks: filteredTasks.length,
              totalNotes: totalNotes,
              totalResources: totalResources
            },
            tasks: filteredTasks.map(task => ({
              id: task.id,
              title: language === 'ar' ? (task?.description?.ar || '') : (task?.description?.en || ''),
              type: task.type,
              duration: task.duration,
              isCompleted: progress.some(p => p.taskId === task.id && p.done)
            })),
            notes: filteredNotes.map(note => ({
              id: note.id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              createdAt: note.createdAt
            })),
            resources: filteredResources.map(resource => ({
              id: resource.id,
              title: resource.title,
              type: resource.type,
              url: resource.url
            }))
          };
          
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          fileName += '.json';
          break;
        }
        case 'pdf': {
          try {
            // Dynamic import for jsPDF - only when needed
            const jsPDF = await import('jspdf').then(module => module.default);
            const doc = new jsPDF({ orientation: language === 'ar' ? 'rtl' : 'ltr', unit: 'pt', format: 'a4' });
            
            // Basic PDF content
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor('#1D4ED8');
            doc.text(language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report', 110, 60, { align: 'left' });
            
            doc.setFontSize(12);
            doc.setTextColor('#333');
            doc.text(`${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}`, 110, 80, { align: 'left' });
            
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
            
            // Dynamic import for Papa - only when needed
            const Papa = await import('papaparse').then(module => module.default);
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
  }, [language, plan, progress, appState]);

  // Helper function for filtering data with improved error handling
  const filterDataByOptions = useCallback((options, planData, appStateData) => {
    const result = {
      filteredTasks: [],
      filteredNotes: [],
      filteredResources: []
    };

    try {
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
      result.filteredTasks = filteredTasks.map(task => ({
        ...task,
        isCompleted: progress.some(p => p.taskId === task.id && p.done),
        completedDate: progress.find(p => p.taskId === task.id && p.done)?.dayKey
      }));

      // Filter notes and resources
      if (options.content === 'notes' || options.content === 'both') {
        result.filteredNotes = Object.values(appStateData.notes || {}).flat();
        result.filteredResources = Object.values(appStateData.resources || {}).flat();
      }
    } catch (error) {
      console.error('Error filtering data:', error);
      // Return empty arrays if filtering fails
      return result;
    }

    return result;
  }, [progress]);

  // Early return if no data
  if (!plan || !progress || !stats) {
    return (
      <WeekPhaseProvider>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </WeekPhaseProvider>
    );
  }

  const pageDirection = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <WeekPhaseProvider>
      <div dir={pageDirection}>
        <PageLayout 
          title={safeT('progress')}
          subtitle={safeT('trackYourLearning')}
          showBottomBar={true}
        >
          {/* Tabs at the top with improved organization */}
          <EnhancedTabs
            tabs={ENHANCED_TABS.filter(tab => !['skills', 'achievements'].includes(tab.id) || process.env.NODE_ENV === 'development')}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            language={language}
          />

          <motion.div {...animations.fadeIn} className="space-y-6">
            {/* Overall Progress Card */}
            <OverallProgressCard />
            
            {/* Tab Content with enhanced styling */}
            <Card className="overflow-hidden enhanced-card">
              <div className="p-6">
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
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </PageLayout>
      </div>
    </WeekPhaseProvider>
  );
}
