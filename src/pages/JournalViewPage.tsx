import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Tag, Calendar, Clock, Target, FileText, Copy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function JournalViewPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { appState, deleteJournalEntry, plan } = useApp();

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
    if (window.confirm('هل أنت متأكد من حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء.')) {
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
            <button
              onClick={() => navigate('/journal')}
              className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
              title="العودة لقائمة المدونات"
              aria-label="العودة لقائمة المدونات"
            >
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
              onClick={handleDeleteJournalEntry}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="حذف المدونة"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Journal Entry Content */}
        <Card>
          <div className="space-y-8">
            {/* Journal Entry Header - Enhanced */}
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {journalEntry.title}
              </h1>
              
              {/* Enhanced Day/Subject Info */}
              {dayInfo && dayInfo.day && (
                <div className="inline-block bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl px-6 py-4 mb-4">
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
                </div>
              )}

              {/* Enhanced Date/Time Info */}
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(journalEntry.createdAt).toLocaleDateString('ar-SA', {
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
              </div>
            </div>

            {/* Enhanced Tags */}
            {journalEntry.tags && journalEntry.tags.length > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap justify-center gap-2">
                  {journalEntry.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full font-medium shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Journal Entry Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-purple-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white">
              <div 
                className="break-words overflow-wrap-anywhere leading-relaxed"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: journalEntry.content }} 
              />
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}