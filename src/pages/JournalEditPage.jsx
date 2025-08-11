import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Save, ArrowLeft, Calendar
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
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  // Find existing entry if editing
  const existingEntry = entryId && entryId !== 'new' ? safeJournalEntries.find(e => e.id === parseInt(entryId)) : null;

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        title: existingEntry.title || '',
        content: existingEntry.content || '',
        date: existingEntry.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [existingEntry]);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      if (existingEntry) {
        await updateJournalEntry(existingEntry.id, {
          title: formData.title,
          content: formData.content,
          date: formData.date
        });
      } else {
        await addJournalEntry({
          title: formData.title,
          content: formData.content,
          date: formData.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
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