import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Tag, Calendar, Clock, Target, FileText, Copy } from 'lucide-react';
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
      toast.success('تم حذف الملاحظة بنجاح');
      setShowDeleteModal(false);
      navigate(-1);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('فشل في حذف الملاحظة');
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
      toast.success('تم نسخ المحتوى بنجاح');
    } catch (error) {
      console.error('Error copying content:', error);
      toast.error('فشل في نسخ المحتوى');
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
            <button
              onClick={() => navigate('/notes')}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              title="العودة لقائمة الملاحظات"
              aria-label="العودة لقائمة الملاحظات"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="حذف الملاحظة"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Note Content */}
        <Card>
          <div className="space-y-8">
            {/* Note Header - Enhanced */}
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {note.title}
              </h1>
              
              {/* Enhanced Day/Subject Info */}
              {dayInfo && dayInfo.day && (
                <div className="inline-block bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl px-6 py-4 mb-4">
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
                </div>
              )}

              {/* Enhanced Date/Time Info */}
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(note.createdAt).toLocaleDateString('ar-SA', {
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
              </div>
            </div>

            {/* Enhanced Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap justify-center gap-2">
                  {note.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Note Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white">
              <div 
                className="break-words overflow-wrap-anywhere leading-relaxed"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: note.content }} 
              />
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteNote}
        title="حذف الملاحظة"
        message="هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </PageLayout>
  );
}