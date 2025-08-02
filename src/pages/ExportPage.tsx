// Export Page - Advanced Export System
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, FileText, FileSpreadsheet, FileJson, FileImage,
  Calendar, Clock, Database, Settings, ArrowDown, CheckCircle,
  Image, File, BookOpen, BarChart3, Filter, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { animations } from '../constants/theme';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  mimeType: string;
  extension: string;
}

interface ExportOptions {
  content: 'notes' | 'journal' | 'progress' | 'all';
  timeRange: 'daily' | 'weekly' | 'monthly' | 'phase' | 'all';
  format: string;
  language: 'ar' | 'en';
  selectedDate?: string;
  selectedWeek?: string;
  selectedMonth?: string;
  selectedPhase?: string;
}

export default function ExportPage() {
  const { plan, progress, appState } = useApp();
  const { t } = useLocalization();
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    content: 'all',
    timeRange: 'all',
    format: 'pdf',
    language: 'ar'
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

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'تقارير رسمية قابلة للطباعة',
      icon: FileText,
      mimeType: 'application/pdf',
      extension: 'pdf'
    },
    {
      id: 'csv',
      name: 'CSV/Excel',
      description: 'لتحليل البيانات في برامج الجداول الإلكترونية',
      icon: FileSpreadsheet,
      mimeType: 'text/csv',
      extension: 'csv'
    },
    {
      id: 'markdown',
      name: 'Markdown (.md)',
      description: 'نسخة نصية مرنة',
      icon: FileText,
      mimeType: 'text/markdown',
      extension: 'md'
    },
    {
      id: 'txt',
      name: 'نص عادي (.txt)',
      description: 'نسخة بسيطة من الملاحظات',
      icon: FileText,
      mimeType: 'text/plain',
      extension: 'txt'
    }
  ];

  const contentOptions = [
    { id: 'notes', name: 'الملاحظات والمدونات', icon: BookOpen },
    { id: 'progress', name: 'تقارير التقدم', icon: BarChart3 },
    { id: 'all', name: 'كلاهما معًا', icon: Database }
  ];

  const timeRangeOptions = [
    { id: 'daily', name: 'يومي', icon: Calendar },
    { id: 'weekly', name: 'أسبوعي', icon: Calendar },
    { id: 'monthly', name: 'شهري', icon: Calendar },
    { id: 'phase', name: 'حسب المرحلة', icon: Calendar },
    { id: 'all', name: 'كامل', icon: Database }
  ];

  const languageOptions = [
    { id: 'ar', name: 'العربية', icon: Globe },
    { id: 'en', name: 'English', icon: Globe }
  ];

  const getFilteredData = (options: ExportOptions) => {
    const data: any = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      options: options
    };

    // Filter by content type
    if (options.content === 'notes' || options.content === 'all') {
      data.notes = appState?.notes || {};
      data.journal = appState?.journal || {};
    }

    if (options.content === 'progress' || options.content === 'all') {
      data.plan = plan || [];
      data.progress = progress || [];
    }

    // Filter by time range
    if (options.timeRange !== 'all') {
      // Apply time filtering logic here
      // This is a simplified version - you can enhance it based on your needs
    }

    return data;
  };

  const generateExportData = (options: ExportOptions) => {
    const data = getFilteredData(options);

    switch (options.format) {
      case 'pdf':
        return generatePDF(data, options);
      case 'csv':
        return generateCSV(data, options);
      case 'markdown':
        return generateMarkdown(data, options);
      case 'txt':
        return generateTXT(data, options);
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const generatePDF = (data: any, options: ExportOptions) => {
    // Simplified PDF generation - you can enhance this with a proper PDF library
    let content = `تقرير التصدير\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
    
    if (data.notes) {
      content += `الملاحظات:\n`;
      Object.entries(data.notes).forEach(([day, notes]: [string, any]) => {
        notes.forEach((note: any) => {
          content += `- ${note.title}: ${note.content.replace(/<[^>]*>/g, '')}\n`;
        });
      });
    }

    if (data.progress) {
      content += `\nالتقدم:\n`;
      data.progress.forEach((p: any) => {
        content += `- ${p.taskId}: ${p.done ? 'مكتمل' : 'غير مكتمل'}\n`;
      });
    }

    return content;
  };

  const generateCSV = (data: any, options: ExportOptions) => {
    const headers = ['Task ID', 'Task Name', 'Week', 'Day', 'Status', 'Completed Date'];
    const rows = data.progress?.map((p: any) => {
      const task = data.plan
        ?.flatMap((w: any) => w.days || [])
        ?.flatMap((d: any) => d.tasks || [])
        ?.find((t: any) => t.id === p.taskId);
      
      return [
        p.taskId,
        task?.title || 'Unknown',
        p.weekId || '',
        p.dayKey || '',
        p.done ? 'Completed' : 'Pending',
        p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''
      ];
    }) || [];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateMarkdown = (data: any, options: ExportOptions) => {
    let content = `# تقرير التصدير\n\n`;
    content += `**تاريخ التصدير:** ${new Date().toLocaleDateString('ar-SA')}\n\n`;
    
    if (data.notes) {
      content += `## الملاحظات\n\n`;
      Object.entries(data.notes).forEach(([day, notes]: [string, any]) => {
        notes.forEach((note: any) => {
          content += `### ${note.title}\n`;
          content += `${note.content.replace(/<[^>]*>/g, '')}\n\n`;
        });
      });
    }

    if (data.progress) {
      content += `## التقدم\n\n`;
      data.progress.forEach((p: any) => {
        content += `- ${p.taskId}: ${p.done ? '✅ مكتمل' : '⏳ غير مكتمل'}\n`;
      });
    }

    return content;
  };

  const generateTXT = (data: any, options: ExportOptions) => {
    let content = `تقرير التصدير\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
    
    if (data.notes) {
      content += `الملاحظات:\n`;
      Object.entries(data.notes).forEach(([day, notes]: [string, any]) => {
        notes.forEach((note: any) => {
          content += `- ${note.title}: ${note.content.replace(/<[^>]*>/g, '')}\n`;
        });
      });
    }

    return content;
  };

  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);

    try {
      const format = exportFormats.find(f => f.id === exportOptions.format);
      if (!format) throw new Error('Format not found');

      const data = generateExportData(exportOptions);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create and download file
      const blob = new Blob([data], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString().split('T')[0]}.${format.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport(new Date());
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const getProgressStats = () => {
    const totalTasks = plan?.reduce((total, week) => 
      total + (week.days || []).filter(day => day.key !== 'fri').reduce((dayTotal, day) => 
        dayTotal + (day.tasks || []).length, 0), 0) || 0;
    
    const completedTasks = progress?.filter(p => p.done).length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, completionRate };
  };

  const stats = getProgressStats();

  return (
    <PageLayout 
      title={safeT('export')}
      subtitle={safeT('exportDescription')}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={animations.page}
        className="space-y-6"
      >
        {/* Export Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.totalTasks}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي المهام
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.completedTasks}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                المهام المكتملة
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.completionRate}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                نسبة الإنجاز
              </p>
            </div>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <Download className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                تصدير البيانات
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                اختر الخيارات المناسبة لتصدير بياناتك
              </p>
            </div>

            <Button
              onClick={() => setShowExportModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              <Download className="w-5 h-5 ml-2" />
              تصدير البيانات
            </Button>

            {lastExport && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                آخر تصدير: {lastExport.toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        </Card>

        {/* Export Formats Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            صيغ التصدير المتاحة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => (
              <div key={format.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <format.icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {format.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="خيارات التصدير"
        size="lg"
      >
        <div className="space-y-6">
          {/* Content Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              تحديد المحتوى للتصدير
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {contentOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="content"
                    value={option.id}
                    checked={exportOptions.content === option.id}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, content: e.target.value as any }))}
                    className="text-blue-600"
                  />
                  <option.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">{option.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Range Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              تحديد النطاق الزمني
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {timeRangeOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="timeRange"
                    value={option.id}
                    checked={exportOptions.timeRange === option.id}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, timeRange: e.target.value as any }))}
                    className="text-blue-600"
                  />
                  <option.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">{option.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              اختيار صيغة الملف
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {exportFormats.map((format) => (
                <label key={format.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={exportOptions.format === format.id}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    className="text-blue-600"
                  />
                  <format.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">{format.name}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              تحديد لغة التصدير
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {languageOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="language"
                    value={option.id}
                    checked={exportOptions.language === option.id}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, language: e.target.value as any }))}
                    className="text-blue-600"
                  />
                  <option.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">{option.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Progress */}
          {exporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>جارٍ التصدير...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowExportModal(false)}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {exporting ? 'جارٍ التصدير...' : 'تصدير'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}