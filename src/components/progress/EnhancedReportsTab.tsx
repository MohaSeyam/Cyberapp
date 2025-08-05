import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Download, FileText, FileSpreadsheet, FileCode, Calendar, Globe, BarChart3, CheckCircle } from 'lucide-react';

const EnhancedReportsTab = React.memo(({ plan, progress, appState, stats, language, colorClassMap, gradientClassMap, handleExport, isExporting, exportOptions, setExportOptions }) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [exportStats, setExportStats] = useState(null);

  // خيارات التصدير المتقدمة
  const exportFormats = useMemo(() => [
    { 
      id: 'pdf', 
      name: language === 'ar' ? 'PDF' : 'PDF', 
      description: language === 'ar' ? 'تقارير رسمية قابلة للطباعة' : 'Official printable reports',
      icon: FileText,
      color: 'text-red-500'
    },
    { 
      id: 'csv', 
      name: language === 'ar' ? 'CSV/Excel' : 'CSV/Excel', 
      description: language === 'ar' ? 'لتحليل البيانات في برامج الجداول الإلكترونية' : 'For data analysis in spreadsheet software',
      icon: FileSpreadsheet,
      color: 'text-green-500'
    },
    { 
      id: 'json', 
      name: 'JSON', 
      description: language === 'ar' ? 'بيانات منظمة للبرمجة' : 'Structured data for programming',
      icon: FileCode,
      color: 'text-blue-500'
    },
    { 
      id: 'markdown', 
      name: language === 'ar' ? 'Markdown (.md)' : 'Markdown (.md)', 
      description: language === 'ar' ? 'نسخة نصية مرنة' : 'Flexible text format',
      icon: FileText,
      color: 'text-purple-500'
    },
    { 
      id: 'txt', 
      name: language === 'ar' ? 'نص عادي (.txt)' : 'Plain Text (.txt)', 
      description: language === 'ar' ? 'نسخة بسيطة من الملاحظات' : 'Simple text version of notes',
      icon: FileText,
      color: 'text-gray-500'
    }
  ], [language]);

  const contentOptions = useMemo(() => [
    { 
      id: 'progress', 
      name: language === 'ar' ? 'التقدم فقط' : 'Progress Only',
      description: language === 'ar' ? 'تقارير المهام والإنجازات' : 'Task and achievement reports'
    },
    { 
      id: 'notes', 
      name: language === 'ar' ? 'الملاحظات والمدونات' : 'Notes & Journals',
      description: language === 'ar' ? 'جميع الملاحظات والمدونات الشخصية' : 'All personal notes and journal entries'
    },
    { 
      id: 'both', 
      name: language === 'ar' ? 'التقدم والملاحظات' : 'Progress & Notes',
      description: language === 'ar' ? 'كل شيء معًا' : 'Everything together'
    }
  ], [language]);

  const timeRangeOptions = useMemo(() => [
    { 
      id: 'current-week', 
      name: language === 'ar' ? 'الأسبوع الحالي' : 'Current Week',
      description: language === 'ar' ? 'الأسبوع الجاري فقط' : 'Current week only'
    },
    { 
      id: 'current-phase', 
      name: language === 'ar' ? 'المرحلة الحالية' : 'Current Phase',
      description: language === 'ar' ? 'المرحلة الحالية فقط' : 'Current phase only'
    },
    { 
      id: 'all', 
      name: language === 'ar' ? 'الكل' : 'All',
      description: language === 'ar' ? 'جميع البيانات المتاحة' : 'All available data'
    },
    { 
      id: 'custom', 
      name: language === 'ar' ? 'مخصص' : 'Custom',
      description: language === 'ar' ? 'اختر فترة زمنية محددة' : 'Choose specific time range'
    }
  ], [language]);

  const languageOptions = useMemo(() => [
    { 
      id: 'ar', 
      name: language === 'ar' ? 'العربية' : 'Arabic',
      flag: '🇸🇦'
    },
    { 
      id: 'en', 
      name: 'English',
      flag: '🇺🇸'
    },
    { 
      id: 'both', 
      name: language === 'ar' ? 'كلاهما' : 'Both',
      flag: '🌍'
    }
  ], [language]);

  // حساب إحصائيات التصدير
  const calculateExportStats = useCallback(() => {
    if (!plan || !progress || !appState) return null;

    const totalTasks = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length;
    const completedTasks = progress.filter(p => p.done).length;
    const totalNotes = appState.notes?.length || 0;
    const totalJournalEntries = appState.journalEntries?.length || 0;
    const totalResources = plan.flatMap(w => w.days || []).flatMap(d => d.resources || []).length;

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalNotes,
      totalJournalEntries,
      totalResources,
      totalContent: totalNotes + totalJournalEntries + completedTasks
    };
  }, [plan, progress, appState]);

  // تحديث الإحصائيات عند تغيير الخيارات
  React.useEffect(() => {
    const stats = calculateExportStats();
    setExportStats(stats);
  }, [calculateExportStats, exportOptions]);

  const handleExportClick = useCallback(() => {
    if (handleExport) {
      handleExport(exportOptions);
    }
  }, [handleExport, exportOptions]);

  return (
    <div className="space-y-8">
      {/* إحصائيات سريعة */}
      {exportStats && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {language === 'ar' ? 'إحصائيات التصدير' : 'Export Statistics'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{exportStats.totalTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'المهام' : 'Tasks'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{exportStats.completedTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'مكتملة' : 'Completed'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{exportStats.totalNotes}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'الملاحظات' : 'Notes'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{exportStats.totalJournalEntries}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'المدونات' : 'Journals'}</div>
            </div>
          </div>
        </Card>
      )}

      {/* خيارات التصدير الأساسية */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Download className="w-5 h-5 mr-2" />
              {language === 'ar' ? 'تصدير التقارير' : 'Export Reports'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'قم بتصدير تقدمك وملاحظاتك بعدة صيغ' : 'Export your progress and notes in various formats'}
            </p>
          </div>
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            {showAdvancedOptions ? 
              (language === 'ar' ? 'إخفاء الخيارات المتقدمة' : 'Hide Advanced Options') :
              (language === 'ar' ? 'خيارات متقدمة' : 'Advanced Options')
            }
          </button>
        </div>

        {/* خيارات التصدير */}
        <div className="space-y-6">
          {/* نوع المحتوى */}
          <div>
            <label className="block font-medium mb-3 text-gray-700 dark:text-gray-300">
              {language === 'ar' ? 'نوع المحتوى' : 'Content Type'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contentOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setExportOptions(o => ({ ...o, content: option.id }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    exportOptions?.content === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* صيغة الملف */}
          <div>
            <label className="block font-medium mb-3 text-gray-700 dark:text-gray-300">
              {language === 'ar' ? 'صيغة الملف' : 'File Format'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {exportFormats.map(format => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setExportOptions(o => ({ ...o, format: format.id }))}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      exportOptions?.format === format.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Icon className={`w-5 h-5 mr-2 ${format.color}`} />
                      <span className="font-medium text-gray-900 dark:text-white">{format.name}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{format.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* الخيارات المتقدمة */}
          {showAdvancedOptions && (
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              {/* النطاق الزمني */}
              <div>
                <label className="block font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'النطاق الزمني' : 'Time Range'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {timeRangeOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setExportOptions(o => ({ ...o, timeRange: option.id }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        exportOptions?.timeRange === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* لغة التصدير */}
              <div>
                <label className="block font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'لغة التصدير' : 'Export Language'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {languageOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setExportOptions(o => ({ ...o, exportLanguage: option.id }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        exportOptions?.exportLanguage === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{option.flag}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{option.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* زر التصدير */}
        <div className="mt-8">
          <button
            onClick={handleExportClick}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isExporting ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">{language === 'ar' ? 'جاري التصدير...' : 'Exporting...'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'تصدير التقرير' : 'Export Report'}
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
});

export default EnhancedReportsTab;