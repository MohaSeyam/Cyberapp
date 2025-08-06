import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Tag, Calendar, Clock, Target, FileText, Copy, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function NoteViewPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { appState, deleteNote, plan } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // البحث عن الملاحظة في جميع الأيام
  const note = React.useMemo(() => {
    if (!appState?.notes || !noteId) return null;
    
    for (const [dayKey, notes] of Object.entries(appState.notes)) {
      const foundNote = notes.find(n => n.id === parseInt(noteId));
      if (foundNote) {
        return { ...foundNote, dayKey };
      }
    }
    return null;
  }, [appState?.notes, noteId]);

  // البحث عن اليوم المرتبط بالملاحظة
  const dayInfo = React.useMemo(() => {
    if (!note?.dayKey || !plan) return null;
    
    const [weekId, dayKey] = note.dayKey.split('-');
    const week = plan.find(w => w.week === parseInt(weekId));
    if (week) {
      const day = week.days?.find(d => d.key === dayKey);
      return { week, day };
    }
    return null;
  }, [note, plan]);

  const handleDeleteNote = async () => {
    try {
      await deleteNote(parseInt(noteId!));
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
    try {
      if (typeof window !== 'undefined' && window.open) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${note?.title || 'Note'}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                  .content { line-height: 1.6; }
                  .tags { margin-top: 20px; }
                  .tag { background: #f0f0f0; padding: 2px 8px; margin: 2px; border-radius: 12px; display: inline-block; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>${note?.title || 'Note'}</h1>
                  <p><strong>Created:</strong> ${new Date(note?.createdAt || Date.now()).toLocaleString()}</p>
                  <p><strong>Updated:</strong> ${new Date(note?.updatedAt || Date.now()).toLocaleString()}</p>
                </div>
                <div class="content">${note?.content || ''}</div>
                ${note?.tags && note.tags.length > 0 ? `
                  <div class="tags">
                    <strong>Tags:</strong>
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                  </div>
                ` : ''}
              </body>
            </html>
          `;
          
          try {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
          } catch (error) {
            console.warn('Error writing to print window:', error);
            printWindow.close();
          }
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error(language === 'ar' ? 'فشل في الطباعة' : 'Failed to print');
    }
  };

  if (!note) {
    return (
      <PageLayout title="ملاحظة غير موجودة">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            الملاحظة غير موجودة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            قد تكون الملاحظة قد تم حذفها أو الرابط غير صحيح
          </p>
          <Button onClick={() => navigate(-1)} variant="primary">
            العودة للصفحة السابقة
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={note.title}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="رجوع"
              aria-label="رجوع"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditNote}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="تعديل الملاحظة"
            >
              <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleCopyContent}
              className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
              title="نسخ المحتوى"
            >
              <Copy className="w-5 h-5 text-green-600 dark:text-green-400" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              title="طباعة الملاحظة"
            >
              <Printer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="حذف الملاحظة"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Note Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card>
            <div className="space-y-8">
              {/* Note Header - Enhanced */}
              <motion.div 
                className="text-center border-b border-gray-200 dark:border-gray-700 pb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {note.title}
                </h1>
                
                {/* Enhanced Day/Subject Info */}
                {dayInfo && dayInfo.day && (
                  <motion.div 
                    className="inline-block bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl px-6 py-4 mb-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    onClick={() => {
                      if (dayInfo.week && dayInfo.day) {
                        // البحث عن فهرس اليوم في الأسبوع
                        const dayIndex = dayInfo.week.days?.findIndex(d => d.key === dayInfo.day.key);
                        if (dayIndex !== undefined && dayIndex !== -1) {
                          navigate(`/day/${dayInfo.week.week}/${dayIndex}`);
                        }
                      }
                    }}
                    title="انقر للانتقال إلى هذا اليوم"
                  >
                    <div className="flex items-center justify-center space-x-3 text-blue-700 dark:text-blue-300">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        {dayInfo.day.name?.ar || dayInfo.day.name?.en || 'اليوم'}
                      </span>
                      {dayInfo.day.topic?.ar && (
                        <>
                          <span className="text-blue-500 dark:text-blue-400">-</span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {dayInfo.day.topic.ar}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Date/Time Info */}
                <motion.div 
                  className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                                              {new Date(note.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(note.createdAt).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Tags */}
              {note.tags && note.tags.length > 0 && (
                <motion.div 
                  className="flex items-center justify-center space-x-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {note.tags.map((tag: string, index: number) => (
                      <motion.span
                        key={index}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium shadow-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Enhanced Note Content */}
              <motion.div 
                className="content-display"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div 
                  className="break-words overflow-wrap-anywhere leading-relaxed"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: note.content }} 
                />
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteNote}
        title="حذف الملاحظة"
        message="هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isConfirmModal={true}
      />
    </PageLayout>
  );
}