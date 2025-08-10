import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Save, ArrowLeft, X, Tag, Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/editors/RichTextEditor';

const NoteEditPage = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { language } = useLocalization();
  const { notes, addNote, updateNote } = useApp();
  const isRTL = language === 'ar';

  // Ensure data is available
  const safeNotes = notes || [];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Find existing note if editing
  const existingNote = noteId && noteId !== 'new' ? safeNotes.find(n => n.id === parseInt(noteId)) : null;

  useEffect(() => {
    if (existingNote) {
      setFormData({
        title: existingNote.title || '',
        content: existingNote.content || '',
        tags: existingNote.tags || []
      });
    }
  }, [existingNote]);

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
      if (existingNote) {
        await updateNote({
          ...existingNote,
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addNote({
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      navigate('/notes');
    } catch (error) {
      console.error('Error saving note:', error);
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
      title={existingNote ? (language === 'ar' ? 'تعديل الملاحظة' : 'Edit Note') : (language === 'ar' ? 'ملاحظة جديدة' : 'New Note')}
      showBottomBar={false}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={() => navigate('/notes')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {language === 'ar' ? 'العودة للملاحظات' : 'Back to Notes'}
          </Button>
          <Button
            variant="primary"
            icon={<Save />}
            onClick={handleSave}
            loading={isLoading}
            disabled={!formData.title.trim() || !formData.content.trim()}
          >
            {language === 'ar' ? 'حفظ الملاحظة' : 'Save Note'}
          </Button>
        </div>

        {/* Note Form */}
        <Card className="p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان الملاحظة' : 'Note Title'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
              placeholder={language === 'ar' ? 'أدخل عنوان الملاحظة...' : 'Enter note title...'}
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'التاقات' : 'Tags'}
            </label>
            <div className="space-y-3">
              {/* Existing Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Add New Tag */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={language === 'ar' ? 'أضف تاق جديد...' : 'Add new tag...'}
                />
                <Button
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'محتوى الملاحظة' : 'Note Content'}
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder={language === 'ar' ? 'اكتب محتوى الملاحظة هنا...' : 'Write your note content here...'}
              lang={language}
              minHeight="400px"
            />
          </div>

          {/* Meta Information */}
          {existingNote && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {language === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(existingNote.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  {existingNote.updatedAt && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(existingNote.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
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

export default NoteEditPage;