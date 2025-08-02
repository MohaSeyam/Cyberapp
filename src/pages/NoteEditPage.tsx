import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/editors/RichTextEditor';
import toast from 'react-hot-toast';

export default function NoteEditPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { appState, updateNote, plan } = useApp();

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

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  // تحميل بيانات الملاحظة عند تحميل الصفحة
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags || []
      });
    }
  }, [note]);

  const handleSave = async () => {
    if (!note || !formData.title.trim() || !formData.content.trim()) {
      toast.error('يرجى ملء العنوان والمحتوى');
      return;
    }

    try {
      await updateNote(note.id, {
        ...note,
        title: formData.title.trim(),
        content: formData.content,
        tags: formData.tags,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('تم حفظ الملاحظة بنجاح');
      navigate(`/note/${noteId}`);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('فشل في حفظ الملاحظة');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
    <PageLayout title={`تعديل: ${note.title}`}>
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
          
          <Button
            onClick={handleSave}
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            حفظ التغييرات
          </Button>
        </div>

        {/* Edit Form */}
        <Card>
          <div className="space-y-6">
            {/* Day Info */}
            {dayInfo && dayInfo.day && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <span className="font-medium">اليوم:</span>
                  <span>{dayInfo.day.name?.ar || dayInfo.day.name?.en || 'اليوم'}</span>
                  {dayInfo.day.topic?.ar && (
                    <>
                      <span>-</span>
                      <span>{dayInfo.day.topic.ar}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان الملاحظة
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
                placeholder="أدخل عنوان الملاحظة"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                التاقات
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="أضف تاق جديد"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                محتوى الملاحظة
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="اكتب ملاحظتك هنا..."
                lang="ar"
                minHeight="500px"
              />
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}