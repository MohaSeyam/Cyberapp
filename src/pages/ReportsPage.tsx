import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Calendar, FileText, TrendingUp, BookOpen, 
  Clock, CalendarDays, Target, BarChart3, FileSpreadsheet,
  FileText as FileTextIcon, FileCode, FileArchive
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

type ReportType = 'daily' | 'weekly' | 'phase' | 'complete';
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

export default function ReportsPage() {
  const { plan, progress, appState } = useApp();
  const { t, language } = useLocalization();
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: 'daily',
    content: 'both',
    format: 'pdf',
    language: language as ExportLanguage
  });

  // Report type options
  const reportTypes = [
    { 
      id: 'daily', 
      label: { ar: 'تقرير يومي', en: 'Daily Report' },
      icon: Calendar,
      description: { ar: 'تقرير شامل ليوم واحد', en: 'Comprehensive report for a single day' }
    },
    { 
      id: 'weekly', 
      label: { ar: 'تقرير أسبوعي', en: 'Weekly Report' },
      icon: CalendarDays,
      description: { ar: 'تقرير شامل لأسبوع كامل', en: 'Comprehensive report for a full week' }
    },
    { 
      id: 'phase', 
      label: { ar: 'تقرير مرحلي', en: 'Phase Report' },
      icon: Target,
      description: { ar: 'تقرير شامل لمرحلة كاملة', en: 'Comprehensive report for a complete phase' }
    },
    { 
      id: 'complete', 
      label: { ar: 'تقرير كامل', en: 'Complete Report' },
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
      icon: FileTextIcon,
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

  const handleExport = async () => {
    try {
      // هنا سيتم تنفيذ عملية التصدير الفعلية
      console.log('Exporting with options:', reportOptions);
      
      // محاكاة عملية التصدير
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  const getCurrentLanguageText = (obj: any) => {
    return obj[language] || obj.ar || obj.en || '';
  };

  return (
    <PageLayout 
      title={getCurrentLanguageText({ ar: 'تصدير التقارير', en: 'Export Reports' })}
      subtitle={getCurrentLanguageText({ 
        ar: 'تصدير تقارير مفصلة بتنسيقات مختلفة', 
        en: 'Export detailed reports in different formats' 
      })}
      showBottomBar={true}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
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

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={getCurrentLanguageText({ ar: 'تأكيد التصدير', en: 'Confirm Export' })}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {getCurrentLanguageText({ 
              ar: 'سيتم تصدير التقرير بالخيارات المحددة. قد تستغرق العملية بضع لحظات.',
              en: 'The report will be exported with the selected options. This may take a few moments.'
            })}
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              {getCurrentLanguageText({ ar: 'ملخص التصدير', en: 'Export Summary' })}
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {getCurrentLanguageText({ ar: 'نوع التقرير', en: 'Report Type' })}:
                </span>
                <span>{getCurrentLanguageText(reportTypes.find(t => t.id === reportOptions.type)?.label || {})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {getCurrentLanguageText({ ar: 'المحتوى', en: 'Content' })}:
                </span>
                <span>{getCurrentLanguageText(contentTypes.find(c => c.id === reportOptions.content)?.label || {})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {getCurrentLanguageText({ ar: 'الصيغة', en: 'Format' })}:
                </span>
                <span>{getCurrentLanguageText(fileFormats.find(f => f.id === reportOptions.format)?.label || {})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {getCurrentLanguageText({ ar: 'اللغة', en: 'Language' })}:
                </span>
                <span>{getCurrentLanguageText(languageOptions.find(l => l.id === reportOptions.language)?.label || {})}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              {getCurrentLanguageText({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              icon={<Download className="w-4 h-4" />}
            >
              {getCurrentLanguageText({ ar: 'تصدير', en: 'Export' })}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}