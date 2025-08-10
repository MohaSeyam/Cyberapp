import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Save, ArrowLeft, Calendar, Smile, Meh, Frown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/editors/RichTextEditor';

const JournalEditPage = () => {
  const navigate = useNavigate();
  const { entryId } = useParams();
  
  // Safe access to useLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;
  const isRTL = language === 'ar';

  // Safe access to useApp
  let appData;
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useApp:', error);
    appData = {
      journalEntries: [],
      addJournalEntry: async () => 0,
      updateJournalEntry: async () => {}
    };
  }
  const { journalEntries, addJournalEntry, updateJournalEntry } = appData;

  // Ensure data is available
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral',
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
        mood: existingEntry.mood || 'neutral',
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
        await updateJournalEntry({
          ...existingEntry,
          title: formData.title,
          content: formData.content,
          mood: formData.mood,
          date: formData.date,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addJournalEntry({
          title: formData.title,
          content: formData.content,
          mood: formData.mood,
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

  const moodOptions = [
    { value: 'happy', label: { ar: 'سعيد', en: 'Happy' }, icon: <Smile className="w-5 h-5 text-green-500" /> },
    { value: 'neutral', label: { ar: 'عادي', en: 'Neutral' }, icon: <Meh className="w-5 h-5 text-yellow-500" /> },
    { value: 'sad', label: { ar: 'حزين', en: 'Sad' }, icon: <Frown className="w-5 h-5 text-red-500" /> }
  ];

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

          {/* Date and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date */}
            <div>
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

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'المزاج' : 'Mood'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {moodOptions.map(mood => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                      formData.mood === mood.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {mood.icon}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mood.label[language]}
                    </span>
                  </button>
                ))}
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