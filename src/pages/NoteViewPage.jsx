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
  const { language } = useSimpleLocalization();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    if (!note?.weekId || !note?.dayKey || !plan) return null;
    
    const week = plan.find(w => w.week === note.weekId);
    if (week) {
      const day = week.days?.find(d => d.key === note.dayKey);
      return { week, day };
    }
    return null;
  }, [note, plan]);

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
    // فتح صفحة التعديل في نفس الصفحة
    navigate(`/note/${noteId}/edit`);
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
              ${dayInfo ? `اليوم: ${dayInfo.day.day?.[language] || dayInfo.day.day?.ar}` : ''}
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
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <div className="flex items-center space-x-2">
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
                  <Calendar className="w-4 h-4" />
                  <span>{dayInfo.day.day?.[language] || dayInfo.day.day?.ar}</span>
                </div>
              )}
              {note.createdAt && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(note.createdAt).toLocaleDateString('ar-SA')}</span>
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

        {/* Related Day Info */}
        {dayInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {language === 'ar' ? 'معلومات اليوم' : 'Day Information'}
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{language === 'ar' ? 'الأسبوع:' : 'Week:'}</span> {dayInfo.week.week}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{language === 'ar' ? 'اليوم:' : 'Day:'}</span> {dayInfo.day.day?.[language] || dayInfo.day.day?.ar}
                </p>
                {dayInfo.day.topic && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{language === 'ar' ? 'الموضوع:' : 'Topic:'}</span> {dayInfo.day.topic[language] || dayInfo.day.topic.ar}
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