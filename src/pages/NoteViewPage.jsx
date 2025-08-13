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

export default function NoteViewPage() {
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const { notes, deleteNote, plan } = useSimpleApp();
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    localizationData = { language: 'ar', direction: 'rtl', isRTL: true };
  }
  const { language, direction } = localizationData;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // البحث عن الملاحظة في جميع الملاحظات
  const note = React.useMemo(() => {
    if (!notes || !noteId) return null;
    
    // البحث في مصفوفة الملاحظات
    const foundNote = notes.find(n => n.id === parseInt(noteId));
    if (foundNote) {
      return foundNote;
    }
    
    return null;
  }, [notes, noteId]);

  // البحث عن اليوم المرتبط بالملاحظة
  const dayInfo = React.useMemo(() => {
    // 1. التأكد من وجود البيانات المطلوبة
    if (!note?.weekId || !note?.dayKey || !plan) return null;
    
    // 2. البحث عن الأسبوع المطابق في الخطة
    const week = plan.find(w => w.week === note.weekId);
    
    if (week) {
      // 3. البحث عن اليوم المطابق داخل الأسبوع
      const day = week.days?.find(d => d.key === note.dayKey);
      // 4. حساب فهرس اليوم داخل الأسبوع
      const dayIndex = Array.isArray(week.days) ? week.days.findIndex(d => d.key === note.dayKey) : -1;
      
      // 5. إرجاع كائن يحتوي على معلومات الأسبوع واليوم مع الفهرس
      return { week, day, dayIndex };
    }
    return null;
  }, [note, plan]);

  // دالة مساعدة لعرض اسم اليوم باللغة المطلوبة
  const getDayName = (day) => {
    if (!day?.day) return language === 'ar' ? 'اليوم' : 'Day';
    return day.day[language] || day.day.ar || day.day.en || (language === 'ar' ? 'اليوم' : 'Day');
  };

  // دالة مساعدة لعرض موضوع اليوم باللغة المطلوبة
  const getDayTopic = (day) => {
    if (!day?.topic) return null;
    return day.topic[language] || day.topic.ar || day.topic.en;
  };

  const handleDeleteNote = async () => {
    try {
      await deleteNote(parseInt(noteId));
      toast.success('✓ تم حذف الملاحظة بنجاح', {
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
      console.error('Error deleting note:', error);
      toast.error('✕ فشل في حذف الملاحظة', {
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

  const handleEditNote = () => {
    navigate(`/notes/${noteId}/edit`);
  };

  const handleCopyContent = async () => {
    try {
      // نسخ العنوان والمحتوى
      const contentToCopy = `${note.title}\n\n${note.content.replace(/<[^>]*>/g, '')}`;
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
              ${note.createdAt ? `تاريخ الإنشاء: ${new Date(note.createdAt).toLocaleDateString('ar-SA')}` : ''}
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
            <Button
              variant="ghost"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`} style={{zIndex:2}}>
              <Button
                variant="outline"
                icon={<Copy className="w-4 h-4" />}
                onClick={handleCopyContent}
              >
                {language === 'ar' ? 'نسخ' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                {language === 'ar' ? 'طباعة' : 'Print'}
              </Button>
              <Button
                variant="outline"
                icon={<Edit2 className="w-4 h-4" />}
                onClick={handleEditNote}
              >
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {note.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              {dayInfo && (
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {getDayName(dayInfo.day)}
                  </span>
                </div>
              )}
              {note.createdAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'} {formatDate(note.createdAt, language)}
                  </span>
                </div>
              )}
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'} {formatDate(note.updatedAt, language)}
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

        {/* قسم عرض معلومات اليوم المرتبط بالملاحظة */}
        {dayInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {language === 'ar' ? 'معلومات اليوم' : 'Day Information'}
                  </h3>
                </div>
                {/* زر الانتقال لصفحة اليوم في الخطة */}
                <Button
                  variant="outline"
                  onClick={() => navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${dayInfo.day.key}`)}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
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
                {note.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}</span> {formatDate(note.createdAt, language)}
                  </p>
                )}
                {note.updatedAt && note.updatedAt !== note.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'}</span> {formatDate(note.updatedAt, language)}
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