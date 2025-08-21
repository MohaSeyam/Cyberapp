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
import planData from '../data/PlanData.json';

export default function NoteViewPage() {
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const { notes } = useSimpleApp();
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    localizationData = { language: 'ar', direction: 'rtl', isRTL: true };
  }
  const { language, direction } = localizationData;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // معالجة الأخطاء
  if (!notes || !noteId) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'الملاحظة غير موجودة' : 'Note Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {language === 'ar' ? 'الملاحظة التي تبحث عنها غير موجودة أو تم حذفها.' : 'The note you are looking for does not exist or has been deleted.'}
          </p>
          <Button onClick={() => navigate('/notes')}>
            {language === 'ar' ? 'العودة للملاحظات' : 'Back to Notes'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  // البحث عن الملاحظة في جميع الملاحظات
  const note = React.useMemo(() => {
    if (!notes || !noteId) return null;
    const foundNote = notes.find(n => n.id === parseInt(noteId));
    if (foundNote) {
      return foundNote;
    }
    return null;
  }, [notes, noteId]);

  // البحث عن اليوم المرتبط بالملاحظة باستخدام بيانات الخطة الثابتة ودعم phaseId
  const dayInfo = React.useMemo(() => {
    try {
      if (!note) return null;
      const weekId = note.weekId;
      const dayKey = note.dayKey;
      const phaseId = note.phaseId;
      if (!weekId || !dayKey) return null;
      const week = (planData || []).find(w => {
        const weekMatch = String(w.week) === String(weekId);
        const phaseMatch = phaseId ? String(w.phase) === String(phaseId) : true;
        return weekMatch && phaseMatch;
      });
      if (week) {
        const day = Array.isArray(week.days) ? week.days.find(d => String(d.key) === String(dayKey)) : null;
        const dayIndex = Array.isArray(week.days) ? week.days.findIndex(d => String(d.key) === String(dayKey)) : -1;
        return { week, day, dayIndex };
      }
      return null;
    } catch (error) {
      console.error('Error in dayInfo calculation:', error);
      return null;
    }
  }, [note]);

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

  const handleDeleteNote = async () => {
    try {
      // سيتم تنفيذ الحذف من خلال السياق في مكان آخر
      // هنا فقط واجهة الاستخدام
      setShowDeleteModal(false);
      navigate(-1);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = () => {
    navigate(`/notes/${noteId}/edit`);
  };

  const handleCopyContent = async () => {
    try {
      const contentToCopy = `${note.title}\n\n${note.content.replace(/<[^>]*>/g, '')}`;
      await navigator.clipboard.writeText(contentToCopy);
      toast.success('✓ تم نسخ المحتوى بنجاح', {
        icon: '📋',
        style: { background: '#10B981', color: '#ffffff', borderRadius: '8px', fontSize: '14px' }
      });
    } catch (error) {
      console.error('Error copying content:', error);
      toast.error('✕ فشل في نسخ المحتوى', {
        icon: '❌',
        style: { background: '#EF4444', color: '#ffffff', borderRadius: '8px', fontSize: '14px' }
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const lastModified = note.updatedAt || note.createdAt;
      printWindow.document.write(`
        <html>
          <head>
            <title>${note.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .content { line-height: 1.6; }
              .meta { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="title">${note.title}</div>
            <div class="meta">
              ${dayInfo ? `اليوم: ${getDayName(dayInfo.day)}` : ''}
              ${lastModified ? ` آخر تعديل: ${new Date(lastModified).toLocaleString('en-US')}` : ''}
            </div>
            <div class="content">${note.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!note) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'الملاحظة غير موجودة' : 'Note Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' ? 'الملاحظة التي تبحث عنها غير موجودة أو تم حذفها.' : 'The note you are looking for does not exist or has been deleted.'}
            </p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              {language === 'ar' ? 'العودة' : 'Go Back'}
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const lastModified = note.updatedAt || note.createdAt;

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
              <button onClick={handleEditNote} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={language === 'ar' ? 'تعديل' : 'Edit'}>
                <Edit2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20" title={language === 'ar' ? 'حذف' : 'Delete'}>
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>

          <div className="text-center">
            {/* From Plan: Day Title as button */}
            {dayInfo && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">{language === 'ar' ? 'من الخطة:' : 'From Plan:'}</span>
                <button
                  onClick={() => {
                    const idx = typeof dayInfo.dayIndex === 'number' && dayInfo.dayIndex >= 0 ? dayInfo.dayIndex + 1 : 1;
                    navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${idx}`);
                  }}
                  className="px-3 py-1 rounded border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {getDayName(dayInfo.day)}
                </button>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {note.title}
            </h1>
            
            {/* Meta Information: only Last Modified and Tags */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              {lastModified && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'} {formatGregorianDate(lastModified, language, true)}
                  </span>
                </div>
              )}
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>{note.tags.join(', ')}</span>
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
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </Card>
        </motion.div>

        {/* Removed Day Information card */}
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
            {language === 'ar' ? 'هل أنت متأكد من حذف هذه الملاحظة؟' : 'Are you sure you want to delete this note?'}
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
              onClick={handleDeleteNote}
            >
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}