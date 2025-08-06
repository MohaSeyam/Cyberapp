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

export default function JournalViewPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { appState, deleteJournalEntry, plan } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // البحث عن المدونة في جميع الأيام
  const journalEntry = React.useMemo(() => {
    if (!appState?.journal || !entryId) return null;
    
    for (const [dayKey, entries] of Object.entries(appState.journal)) {
      const foundEntry = entries.find(e => e.id === parseInt(entryId));
      if (foundEntry) {
        return { ...foundEntry, dayKey };
      }
    }
    return null;
  }, [appState?.journal, entryId]);

  // البحث عن اليوم المرتبط بالمدونة
  const dayInfo = React.useMemo(() => {
    if (!journalEntry?.dayKey || !plan) return null;
    
    const [weekId, dayKey] = journalEntry.dayKey.split('-');
    const week = plan.find(w => w.week === parseInt(weekId));
    if (week) {
      const day = week.days?.find(d => d.key === dayKey);
      return { week, day };
    }
    return null;
  }, [journalEntry, plan]);

  const handleDeleteJournalEntry = async () => {
    try {
      await deleteJournalEntry(parseInt(entryId!));
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
    navigate(`/journal-entry/${entryId}/edit`);
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
    try {
      if (typeof window !== 'undefined' && window.open) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${journalEntry?.title || 'Journal Entry'}</title>
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
                  <h1>${journalEntry?.title || 'Journal Entry'}</h1>
                  <p><strong>Created:</strong> ${new Date(journalEntry?.createdAt || Date.now()).toLocaleString()}</p>
                  <p><strong>Updated:</strong> ${new Date(journalEntry?.updatedAt || Date.now()).toLocaleString()}</p>
                </div>
                <div class="content">${journalEntry?.content || ''}</div>
                ${journalEntry?.tags && journalEntry.tags.length > 0 ? `
                  <div class="tags">
                    <strong>Tags:</strong>
                    ${journalEntry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
      toast.error('فشل في الطباعة', {
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

  if (!journalEntry) {
    return (
      <PageLayout title="مدونة غير موجودة">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            المدونة غير موجودة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            قد تكون المدونة قد تم حذفها أو الرابط غير صحيح
          </p>
          <Button onClick={() => navigate(-1)} variant="primary">
            العودة للصفحة السابقة
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={journalEntry.title}>
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
              onClick={handleEditJournalEntry}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="تعديل المدونة"
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
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              title="طباعة المدونة"
            >
              <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="حذف المدونة"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Journal Entry Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card>
            <div className="space-y-8">
              {/* Journal Entry Header - Enhanced */}
              <motion.div 
                className="text-center border-b border-gray-200 dark:border-gray-700 pb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  {journalEntry.title}
                </h1>
                
                {/* Enhanced Day/Subject Info */}
                {dayInfo && dayInfo.day && (
                  <motion.div 
                    className="inline-block bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl px-6 py-4 mb-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-200"
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
                    <div className="flex items-center justify-center space-x-3 text-purple-700 dark:text-purple-300">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        {dayInfo.day.name?.ar || dayInfo.day.name?.en || 'اليوم'}
                      </span>
                      {dayInfo.day.topic?.ar && (
                        <>
                          <span className="text-purple-500 dark:text-purple-400">-</span>
                          <span className="text-purple-600 dark:text-purple-400">
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
                                              {new Date(journalEntry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(journalEntry.createdAt).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Tags */}
              {journalEntry.tags && journalEntry.tags.length > 0 && (
                <motion.div 
                  className="flex items-center justify-center space-x-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {journalEntry.tags.map((tag: string, index: number) => (
                      <motion.span
                        key={index}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full font-medium shadow-sm"
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

              {/* Enhanced Journal Entry Content */}
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
                  dangerouslySetInnerHTML={{ __html: journalEntry.content }} 
                />
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteJournalEntry}
        title="حذف المدونة"
        message="هل أنت متأكد من حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isConfirmModal={true}
      />
    </PageLayout>
  );
}