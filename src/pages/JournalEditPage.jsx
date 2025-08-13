import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Save, ArrowLeft, Calendar, X, Tag
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/editors/RichTextEditor';

const JournalEditPage = () => {
  const navigate = useNavigate();
  const { id: entryId } = useParams();
  
  const { language } = useSimpleLocalization();
  const { journalEntries, addJournalEntry, updateJournalEntry } = useSimpleApp();
  const isRTL = language === 'ar';

  // Ensure data is available
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Find existing entry if editing
  const existingEntry = entryId && entryId !== 'new' ? safeJournalEntries.find(e => e.id === parseInt(entryId)) : null;

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        title: existingEntry.title || '',
        content: existingEntry.content || '',
        date: existingEntry.date || new Date().toISOString().split('T')[0],
        tags: existingEntry.tags || []
      });
    }
  }, [existingEntry]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // تحديد نوع المدونة تلقائياً
      const journalData = {
        title: formData.title,
        content: formData.content,
        date: formData.date,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // إذا كانت المدونة من صفحة المدونات (غير مرتبطة بيوم)، لا نضيف weekId و dayKey
      // إذا كانت من صفحة اليوم، سيتم إضافة weekId و dayKey تلقائياً من السياق

      if (existingEntry) {
        await updateJournalEntry(existingEntry.id, journalData);
      } else {
        await addJournalEntry(journalData);
      }
      navigate('/journal');
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    }
  };

  return (
    <PageLayout
      title={existingEntry ? (language === 'ar' ? 'تعديل المدونة' : 'Edit Journal Entry') : (language === 'ar' ? 'مدونة جديدة' : 'New Journal Entry')}
      showBottomBar={false}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={() => navigate('/journal')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {language === 'ar' ? 'العودة للمدونات' : 'Back to Journal'}
          </Button>
          <Button
            variant="primary"
            icon={<Save />}
            onClick={handleSave}
            loading={isLoading}
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            {language === 'ar' ? 'حفظ المدونة' : 'Save Entry'}
          </Button>
        </div>

        {/* Journal Form */}
        <Card className="p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان المدونة' : 'Entry Title'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
              placeholder={language === 'ar' ? 'أدخل عنوان المدونة...' : 'Enter entry title...'}
            />
          </div>

          {/* Date فقط */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'التاريخ' : 'Date'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'التاقات (اختياري)' : 'Tags (Optional)'}
            </label>
            <div className="space-y-3">
              {/* Existing Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder={language === 'ar' ? 'أضف تاق جديد...' : 'Add new tag...'}
                />
                <Button
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'محتوى المدونة' : 'Journal Content'}
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder={language === 'ar' ? 'اكتب أفكارك ومشاعرك هنا...' : 'Write your thoughts and feelings here...'}
              lang={language}
              minHeight="400px"
            />
          </div>

          {/* Meta Information */}
          {existingEntry && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {language === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(existingEntry.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  {existingEntry.updatedAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(existingEntry.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </PageLayout>
  );
};

export default JournalEditPage;