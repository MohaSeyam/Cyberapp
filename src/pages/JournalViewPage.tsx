import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Tag, Calendar, Clock, Target } from 'lucide-react';
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
        toast.success('تم حذف المدونة بنجاح');
        navigate(-1);
      } catch (error) {
        console.error('Error deleting journal entry:', error);
        toast.error('فشل في حذف المدونة');
      }
    }
  };

  const handleEditJournalEntry = () => {
    // فتح صفحة التعديل في نفس الصفحة
    navigate(`/journal-entry/${entryId}/edit`);
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
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="رجوع"
            aria-label="رجوع"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditJournalEntry}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="تعديل المدونة"
            >
              <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
          <div className="space-y-6">
            {/* Journal Entry Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {journalEntry.title}
              </h1>
              
                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
              {dayInfo && (
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {dayInfo.day.name?.ar}
                  </span>
                  {dayInfo.day.topic?.ar && (
                    <span className="text-gray-500 dark:text-gray-400">
                      - {dayInfo.day.topic.ar}
                    </span>
                  )}
                </div>
              )}
            </div>
            </div>

            {/* Tags */}
            {journalEntry.tags && journalEntry.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {journalEntry.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Journal Entry Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-purple-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white">
              <div 
                className="break-words overflow-wrap-anywhere"
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