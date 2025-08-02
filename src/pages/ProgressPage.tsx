// Progress Page - Enhanced with Tabs, Skills Matrix, and Charts
import React, { useState, useMemo } from 'react';
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
import PieChart from '../components/charts/PieChart';
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

export default function ProgressPage() {
  const { plan, progress, appState } = useApp();
  const { t, language } = useLocalization();
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: 'daily',
    content: 'both',
    format: 'pdf',
    language: language as ExportLanguage
  });
  
  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  // Report type options
  const reportTypes = [
    { 
      id: 'weekly', 
      label: { ar: 'تقرير أسبوعي', en: 'Weekly Report' },
      icon: CalendarDays,
      description: { ar: 'تقرير شامل لأسبوع كامل من 50 أسبوع', en: 'Comprehensive report for a full week from 50 weeks' }
    },
    { 
      id: 'phase', 
      label: { ar: 'تقرير مرحلي', en: 'Phase Report' },
      icon: Target,
      description: { ar: 'تقرير شامل لمرحلة كاملة من 8 مراحل', en: 'Comprehensive report for a complete phase from 8 phases' }
    },
    { 
      id: 'complete', 
      label: { ar: 'تقرير شامل', en: 'Complete Report' },
      icon: BarChart3,
      description: { ar: 'تقرير شامل لجميع البيانات', en: 'Comprehensive report for all data' }
    }
  ];

  // Content type options
  const contentTypes = [
    { 
      id: 'progress', 
      label: { ar: 'التقدم فقط', en: 'Progress Only' },
      icon: TrendingUp,
      description: { ar: 'تصدير بيانات التقدم والمهام', en: 'Export progress and tasks data' }
    },
    { 
      id: 'notes', 
      label: { ar: 'الملاحظات فقط', en: 'Notes Only' },
      icon: FileText,
      description: { ar: 'تصدير الملاحظات والمدونات', en: 'Export notes and journal entries' }
    },
    { 
      id: 'both', 
      label: { ar: 'الكل معاً', en: 'Everything Together' },
      icon: FileArchive,
      description: { ar: 'تصدير جميع البيانات معاً', en: 'Export all data together' }
    }
  ];

  // File format options
  const fileFormats = [
    { 
      id: 'pdf', 
      label: { ar: 'PDF', en: 'PDF' },
      icon: FileText,
      description: { ar: 'تقرير رسمي قابل للطباعة', en: 'Official printable report' }
    },
    { 
      id: 'csv', 
      label: { ar: 'CSV/Excel', en: 'CSV/Excel' },
      icon: FileSpreadsheet,
      description: { ar: 'بيانات منظمة للتحليل', en: 'Structured data for analysis' }
    },
    { 
      id: 'markdown', 
      label: { ar: 'Markdown', en: 'Markdown' },
      icon: FileCode,
      description: { ar: 'نص مرن قابل للتعديل', en: 'Flexible editable text' }
    },
    { 
      id: 'txt', 
      label: { ar: 'نص عادي', en: 'Plain Text' },
      icon: FileText,
      description: { ar: 'نسخة بسيطة من البيانات', en: 'Simple data copy' }
    }
  ];

  // Language options
  const languageOptions = [
    { 
      id: 'ar', 
      label: { ar: 'العربية', en: 'Arabic' },
      description: { ar: 'تصدير باللغة العربية', en: 'Export in Arabic' }
    },
    { 
      id: 'en', 
      label: { ar: 'English', en: 'English' },
      description: { ar: 'تصدير باللغة الإنجليزية', en: 'Export in English' }
    }
  ];

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // استخراج مهمة بناءً على id
  const getTaskById = (taskId: string) =>
    safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === taskId);

  // Calculate statistics with safety checks
  const totalWeeks = 50; // Total weeks from phases.json
  const totalTasks = safePlan.reduce((total, week) => 
    total + (week.days || []).filter(day => day.key !== 'fri').reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
  );
  const completedTasks = safeProgress.filter(p => p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate total duration with safety checks
  const totalDuration = safePlan.reduce((total, week) => 
    total + (week.days || []).filter(day => day.key !== 'fri').reduce((dayTotal, day) => 
      dayTotal + (day.tasks || []).reduce((taskTotal, task) => taskTotal + (task.duration || 0), 0), 0
    ), 0
  );
  
  const completedDuration = safeProgress.reduce((total, p) => {
    const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
    return total + (task?.duration || 0);
  }, 0);

  const getCurrentLanguageText = (obj: any) => {
    return obj[language] || obj.ar || obj.en || '';
  };

  const handleExport = async () => {
    try {
      console.log('Exporting with options:', reportOptions);
      
      // جمع البيانات حسب الخيارات
      let content = '';
      const timestamp = new Date().toLocaleDateString('en-US');
      
      // إضافة عنوان التقرير
      content += `# ${language === 'ar' ? 'تقرير الأمن السيبراني' : 'Cybersecurity Report'}\n`;
      content += `**${language === 'ar' ? 'تاريخ التصدير' : 'Export Date'}: ${timestamp}**\n\n`;
      
      // إضافة شعار التطبيق
      content += `![Logo](data:image/png;base64,${await getLogoBase64()})\n\n`;
      
      // إضافة محتوى التقرير حسب النوع
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
        
        // إضافة الملاحظات
        const notes = await getNotes();
        if (notes.length > 0) {
          content += `### ${language === 'ar' ? 'الملاحظات' : 'Notes'}\n\n`;
          notes.forEach(note => {
            content += `#### ${note.title}\n`;
            content += `**${language === 'ar' ? 'التاريخ' : 'Date'}: ${new Date(note.createdAt).toLocaleDateString('en-US')}**\n\n`;
            content += `${note.content.replace(/<[^>]*>/g, '')}\n\n`;
          });
        }
        
        // إضافة المدونات
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
      let mimeType = 'text/plain';
      let fileExtension = '.txt';
      
      switch (reportOptions.format) {
        case 'pdf':
          // تحويل Markdown إلى PDF
          content = await convertToPDF(content);
          mimeType = 'application/pdf';
          fileExtension = '.pdf';
          fileName += '.pdf';
          break;
        case 'csv':
          content = convertToCSV();
          mimeType = 'text/csv';
          fileExtension = '.csv';
          fileName += '.csv';
          break;
        case 'markdown':
          mimeType = 'text/markdown';
          fileExtension = '.md';
          fileName += '.md';
          break;
        default: // txt
          mimeType = 'text/plain';
          fileExtension = '.txt';
          fileName += '.txt';
      }
      
      // إنشاء وتنزيل الملف
      const blob = new Blob([content], { type: mimeType });
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
          : '✓ Report exported successfully',
        {
          icon: '📊',
          style: {
            background: '#10B981',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px'
          }
        }
      );
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        language === 'ar' 
          ? '✕ فشل في تصدير التقرير' 
          : '✕ Failed to export report',
        {
          icon: '❌',
          style: {
            background: '#EF4444',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px'
          }
        }
      );
    }
  };

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
      const response = await fetch('/src/assets/Gemini_Generated_Image_26mado26mado26ma.png');
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
    // محاكاة تحويل إلى PDF - في التطبيق الحقيقي ستستخدم مكتبة مثل jsPDF
    return content;
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
  ], [blueTeamTasks, redTeamTasks, practicalTasks, theoreticalTasks, policiesTasks]);

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
  }, [completedTasks, completionRate, currentStreak, blueTeamTasks, redTeamTasks, policiesTasks]);

  // Tab Components
  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
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
                </div>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-800 rounded-full">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-2 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  {language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
                </h3>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  {language === 'ar' ? 'من أصل' : 'out of'} {totalTasks} {language === 'ar' ? 'مهمة' : 'tasks'}
                </p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-800 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  {language === 'ar' ? 'الوقت المستغرق' : 'Time Spent'}
                </h3>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(completedDuration / 60)}h
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  {language === 'ar' ? 'من أصل' : 'out of'} {Math.round(totalDuration / 60)}h {language === 'ar' ? 'إجمالي' : 'total'}
                </p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-800 rounded-full">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-2 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  {language === 'ar' ? 'المسار الحالي' : 'Current Streak'}
                </h3>
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  {language === 'ar' ? 'أيام متتالية' : 'days in a row'}
                </p>
              </div>
              <div className="p-4 bg-orange-100 dark:bg-orange-800 rounded-full">
                <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Task Types Distribution */}
                <Card title={safeT('taskTypesDistribution')} subtitle={safeT('distributionOfCompletedTasks')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{blueTeamTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('blueTeam')}</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{redTeamTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('redTeam')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{practicalTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('practical')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{theoreticalTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('theoretical')}</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{policiesTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('policies')}</div>
          </div>
        </div>
      </Card>
    </div>
  );

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
          <PieChart data={generateTaskTypeData()} />
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
          <PieChart data={generateCategoryData()} />
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
            {language === 'ar' ? 'أنت على المسار الصحيح. استمر في التعلم!' : 'You\'re on the right track. Keep learning!'}
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
                          ar: `المرحلة ${index + 1}: ${phase.name?.ar || `مرحلة ${index + 1}`}`, 
                          en: `Phase ${index + 1}: ${phase.name?.en || `Phase ${index + 1}`}` 
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

      {/* Language Selection */}
      <Card>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-orange-600" />
            {getCurrentLanguageText({ ar: 'لغة التصدير', en: 'Export Language' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languageOptions.map((lang) => {
              const isSelected = reportOptions.language === lang.id;
              return (
                <motion.div
                  key={lang.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  }`}
                  onClick={() => setReportOptions(prev => ({ ...prev, language: lang.id as ExportLanguage }))}
                >
                  <div className="flex items-center mb-3">
                    <span className={`font-semibold ${
                      isSelected ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getCurrentLanguageText(lang.label)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCurrentLanguageText(lang.description)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          icon={<Download className="w-5 h-5" />}
          onClick={() => setShowExportModal(true)}
          className="px-8 py-4 text-lg"
        >
          {getCurrentLanguageText({ ar: 'تصدير التقرير', en: 'Export Report' })}
        </Button>
      </div>
    </div>
  );

  // Tab Configuration with enhanced design
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
      description: { ar: 'المسارات والإنجازات', en: 'Milestones and achievements' }
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

  return (
    <WeekPhaseProvider>
      <PageLayout 
        title={safeT('progress')}
        subtitle={safeT('trackYourLearning')}
        showBottomBar={true}
      >
        <motion.div {...animations.fadeIn} className="space-y-8">
          
          {/* Enhanced Header with Progress Overview */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {language === 'ar' ? 'مركز التقدم' : 'Progress Center'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {language === 'ar' 
                    ? `إكمال ${completionRate}% من المهام - ${completedTasks}/${totalTasks}`
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
                    {language === 'ar' ? 'مهام مكتملة' : 'Completed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalDuration - completedDuration}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'ساعات متبقية' : 'Hours Left'}
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
                const colorClasses = {
                  blue: isActive ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                  purple: isActive ? 'bg-purple-500 text-white' : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
                  green: isActive ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
                  yellow: isActive ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
                  orange: isActive ? 'bg-orange-500 text-white' : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
                  red: isActive ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                };
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 lg:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] transition-all duration-300 border-b-2 ${
                      isActive 
                        ? `border-${tab.color}-500 ${colorClasses[tab.color as keyof typeof colorClasses]}`
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isActive ? '' : colorClasses[tab.color as keyof typeof colorClasses].split(' ')[0]}`} />
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
                <OverviewTab />
              </div>
            )}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'skills' && <SkillsTab />}
            {activeTab === 'achievements' && <AchievementsTab />}
            {activeTab === 'suggestions' && <SuggestionsTab />}
            {activeTab === 'reports' && <ReportsTab />}
          </div>
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
                    {getCurrentLanguageText(reportTypes.find(t => t.id === reportOptions.type)?.label || {})}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getCurrentLanguageText({ ar: 'المحتوى', en: 'Content' })}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-sm">
                    {getCurrentLanguageText(contentTypes.find(c => c.id === reportOptions.content)?.label || {})}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getCurrentLanguageText({ ar: 'الصيغة', en: 'Format' })}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-sm">
                    {getCurrentLanguageText(fileFormats.find(f => f.id === reportOptions.format)?.label || {})}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getCurrentLanguageText({ ar: 'اللغة', en: 'Language' })}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white bg-orange-100 dark:bg-orange-900 px-3 py-1 rounded-full text-sm">
                    {getCurrentLanguageText(languageOptions.find(l => l.id === reportOptions.language)?.label || {})}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="px-6 py-3 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {getCurrentLanguageText({ ar: 'إلغاء', en: 'Cancel' })}
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                icon={<Download className="w-5 h-5" />}
                className="px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                {getCurrentLanguageText({ ar: 'تصدير التقرير', en: 'Export Report' })}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Custom Styles */}
        <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      </WeekPhaseProvider>
    );
  }