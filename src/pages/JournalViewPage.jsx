import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Tag, Calendar, Clock, Target, FileText, Copy, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { formatGregorianDate } from '../utils/date';

export default function JournalViewPage() {
  const { id: entryId } = useParams();
  const navigate = useNavigate();
  const { journalEntries, deleteJournalEntry, plan } = useSimpleApp();
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    localizationData = { language: 'ar', direction: 'rtl', isRTL: true };
  }
  const { language, direction } = localizationData;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // معالجة الأخطاء
  if (!journalEntries || !entryId) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'المدونة غير موجودة' : 'Journal Entry Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'المدونة التي تبحث عنها غير موجودة أو تم حذفها.' : 'The journal entry you are looking for does not exist or has been deleted.'}
          </p>
          <Button onClick={() => navigate('/journal')}>
            {language === 'ar' ? 'العودة للمدونات' : 'Back to Journals'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  // تنسيق التاريخ باللغة العربية
  const formatDate = (dateString, language) => {
    try {
      const date = new Date(dateString);
      if (language === 'ar') {
        return date.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return dateString;
    }
  };

  // البحث عن المدونة في جميع المدونات
  const journalEntry = React.useMemo(() => {
    if (!journalEntries || !entryId) return null;
    
    // البحث في مصفوفة المدونات
    const foundEntry = journalEntries.find(e => e.id === parseInt(entryId));
    if (foundEntry) {
      return foundEntry;
    }
    
    return null;
  }, [journalEntries, entryId]);

  // البحث عن اليوم المرتبط بالمدونة
  const dayInfo = React.useMemo(() => {
    try {
      // 1. التأكد من وجود البيانات المطلوبة
      if (!journalEntry || !plan) return null;
      
      // التحقق من وجود weekId و dayKey
      const weekId = journalEntry.weekId;
      const dayKey = journalEntry.dayKey;
      
      if (!weekId || !dayKey) return null;
      
      // 2. البحث عن الأسبوع المطابق في الخطة
      const week = plan.find(w => w.week === parseInt(weekId));
      
      if (week) {
        // 3. البحث عن اليوم المطابق داخل الأسبوع
        const day = week.days?.find(d => d.key === dayKey);
        // 4. حساب فهرس اليوم داخل الأسبوع
        const dayIndex = Array.isArray(week.days) ? week.days.findIndex(d => d.key === dayKey) : -1;
        
        // 5. إرجاع كائن يحتوي على معلومات الأسبوع واليوم مع الفهرس
        return { week, day, dayIndex };
      }
      return null;
    } catch (error) {
      console.error('Error in dayInfo calculation:', error);
      return null;
    }
  }, [journalEntry, plan]);

  // دالة مساعدة للكشف عن نوع المدونة
  const getJournalType = () => {
    if (dayInfo) return 'day';
    if (journalEntry?.tags?.includes('مدونة عامة') || journalEntry?.tags?.includes('General Journal')) return 'general';
    return 'unknown';
  };

  // دالة مساعدة لعرض اسم اليوم باللغة المطلوبة
  const getDayName = (day) => {
    try {
      if (!day?.day) return language === 'ar' ? 'اليوم' : 'Day';
      return day.day[language] || day.day.ar || day.day.en || (language === 'ar' ? 'اليوم' : 'Day');
    } catch (error) {
      console.error('Error in getDayName:', error);
      return language === 'ar' ? 'اليوم' : 'Day';
    }
  };

  // دالة مساعدة لعرض موضوع اليوم باللغة المطلوبة
  const getDayTopic = (day) => {
    try {
      if (!day?.topic) return null;
      return day.topic[language] || day.topic.ar || day.topic.en;
    } catch (error) {
      console.error('Error in getDayTopic:', error);
      return null;
    }
  };

  const handleDeleteJournalEntry = async () => {
    try {
      await deleteJournalEntry(parseInt(entryId));
      toast.success('✓ تم حذف المدونة بنجاح', {
        icon: '🗑️',
        style: {
          background: '#10B981',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px'
        }
      });
      setShowDeleteModal(false);
      navigate(-1);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('✕ فشل في حذف المدونة', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px'
        }
      });
    }
  };

  const handleEditJournalEntry = () => {
    // فتح صفحة التعديل في نفس الصفحة
    navigate(`/journal/${entryId}/edit`);
  };

  const handleCopyContent = async () => {
    try {
      // نسخ العنوان والمحتوى
      const contentToCopy = `${journalEntry.title}\n\n${journalEntry.content.replace(/<[^>]*>/g, '')}`;
      await navigator.clipboard.writeText(contentToCopy);
      toast.success('✓ تم نسخ المحتوى بنجاح', {
        icon: '📋',
        style: {
          background: '#10B981',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px'
        }
      });
    } catch (error) {
      console.error('Error copying content:', error);
      toast.error('✕ فشل في نسخ المحتوى', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px'
        }
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${journalEntry.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .content { line-height: 1.6; }
              .meta { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="title">${journalEntry.title}</div>
            <div class="meta">
              ${dayInfo ? `اليوم: ${getDayName(dayInfo.day)}` : ''}
              ${journalEntry.createdAt ? `تاريخ الإنشاء: ${new Date(journalEntry.createdAt).toLocaleDateString('ar-SA')}` : ''}
            </div>
            <div class="content">${journalEntry.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!journalEntry) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'المدونة غير موجودة' : 'Journal Entry Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' ? 'المدونة التي تبحث عنها غير موجودة أو تم حذفها.' : 'The journal entry you are looking for does not exist or has been deleted.'}
            </p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              {language === 'ar' ? 'العودة' : 'Go Back'}
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`flex items-center justify-between mb-6 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={language === 'ar' ? 'العودة' : 'Back'}
              aria-label={language === 'ar' ? 'العودة' : 'Back'}
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
                          <div className={`flex items-center gap-1.5 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`} style={{zIndex:2}}>
                <button onClick={handleCopyContent} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={language === 'ar' ? 'نسخ' : 'Copy'}>
                  <Copy className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={language === 'ar' ? 'طباعة' : 'Print'}>
                  <Printer className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <button onClick={handleEditJournalEntry} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={language === 'ar' ? 'تعديل' : 'Edit'}>
                  <Edit2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
                <button onClick={() => setShowDeleteModal(true)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20" title={language === 'ار' ? 'حذف' : 'Delete'}>
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
          </div>

          <div className="text-center">
            {/* Day Title */}
            {dayInfo && (
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-full">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                    {getDayName(dayInfo.day)}
                  </span>
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    {language === 'ar' ? `الأسبوع ${dayInfo.week.week}` : `Week ${dayInfo.week.week}`}
                  </span>
                </div>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {journalEntry.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                {dayInfo && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                      <span className="text-purple-700 dark:text-purple-200 font-medium">
                        {language === 'ar' ? 'تم الإنشاء لليوم:' : 'Created for:'} {getDayName(dayInfo.day)} {language === 'ar' ? `(الأسبوع ${dayInfo.week.week})` : `(Week ${dayInfo.week.week})`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const idx = typeof dayInfo.dayIndex === 'number' && dayInfo.dayIndex >= 0 ? dayInfo.dayIndex + 1 : 1;
                        navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${idx}`);
                      }}
                      className="px-2 py-1 text-xs rounded border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      {language === 'ar' ? 'اذهب لليوم' : 'Open Day'}
                    </button>
                  </div>
                )}
                {journalEntry.createdAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatGregorianDate(journalEntry.createdAt, language, true)}
                    </span>
                  </div>
                )}
              {journalEntry.tags && journalEntry.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>{journalEntry.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8">
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: journalEntry.content }}
            />
          </Card>
        </motion.div>

        {/* قسم عرض معلومات اليوم المرتبط بالمدونة */}
        {dayInfo ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                    {language === 'ar' ? 'معلومات اليوم' : 'Day Information'}
                  </h3>
                </div>
                {/* زر الانتقال لصفحة اليوم في الخطة */}
                <Button
                  variant="outline"
                  onClick={() => {
                    const idx = typeof dayInfo.dayIndex === 'number' && dayInfo.dayIndex >= 0 ? dayInfo.dayIndex + 1 : 1;
                    navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${idx}`);
                  }}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-900/20"
                >
                  {language === 'ar' ? 'العودة لصفحة اليوم' : 'Go to Day Page'}
                </Button>
              </div>
              {/* عرض تفاصيل اليوم والأسبوع */}
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{language === 'ar' ? 'الأسبوع:' : 'Week:'}</span> {dayInfo.week.week}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{language === 'ar' ? 'اليوم:' : 'Day:'}</span> {getDayName(dayInfo.day)}
                </p>
                {/* عرض موضوع اليوم إن وجد */}
                {getDayTopic(dayInfo.day) && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'الموضوع:' : 'Topic:'}</span> {getDayTopic(dayInfo.day)}
                  </p>
                )}
                {journalEntry.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}</span> {formatGregorianDate(journalEntry.createdAt, language, true)}
                  </p>
                )}
                {journalEntry.updatedAt && journalEntry.updatedAt !== journalEntry.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'}</span> {formatGregorianDate(journalEntry.updatedAt, language, true)}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'مدونة عامة' : 'General Journal'}
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ar' 
                    ? 'هذه مدونة عامة غير مرتبطة بيوم محدد في الخطة'
                    : 'This is a general journal entry not associated with any specific day in the plan'
                  }
                </p>
                {journalEntry.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}</span> {formatGregorianDate(journalEntry.createdAt, language, true)}
                  </p>
                )}
                {journalEntry.updatedAt && journalEntry.updatedAt !== journalEntry.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'}</span> {formatGregorianDate(journalEntry.updatedAt, language, true)}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        size="md"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'هل أنت متأكد من حذف هذه المدونة؟' : 'Are you sure you want to delete this journal entry?'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'لا يمكن التراجع عن هذا الإجراء.' : 'This action cannot be undone.'}
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteJournalEntry}
            >
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}