import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Calendar, BookOpen, Edit, Trash2, Eye, Smile, Meh, Frown, Target, Clock
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const JournalPage = () => {
  const navigate = useNavigate();
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
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
      deleteJournalEntry: async () => {}
    };
  }
  const { journalEntries, deleteJournalEntry } = appData;

  // Ensure data is available
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // البحث عن معلومات اليوم المرتبط بالمدونة
  const getDayInfo = (entry) => {
    if (!entry?.weekId || !entry?.dayKey || !plan) return null;
    
    try {
      const week = plan.find(w => w.week === entry.weekId);
      if (week) {
        const day = week.days?.find(d => d.key === entry.dayKey);
        return { week, day };
      }
    } catch (error) {
      console.error('Error getting day info:', error);
    }
    return null;
  };

  // تنسيق التاريخ باللغة العربية
  const formatDate = (dateString, language) => {
    try {
      const date = new Date(dateString);
      if (language === 'ar') {
        return date.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Filter entries based on search and mood
  const filteredEntries = useMemo(() => {
    return safeJournalEntries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMood = !selectedMood || entry.mood === selectedMood;
      return matchesSearch && matchesMood;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [safeJournalEntries, searchTerm, selectedMood]);

  const handleDelete = async (entryId) => {
    try {
      await deleteJournalEntry(entryId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'happy':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'sad':
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getMoodLabel = (mood) => {
    switch (mood) {
      case 'happy':
        return language === 'ar' ? 'سعيد' : 'Happy';
      case 'sad':
        return language === 'ar' ? 'حزين' : 'Sad';
      default:
        return language === 'ar' ? 'عادي' : 'Neutral';
    }
  };

  const moodOptions = [
    { value: '', label: { ar: 'جميع المزاجات', en: 'All Moods' } },
    { value: 'happy', label: { ar: 'سعيد', en: 'Happy' } },
    { value: 'neutral', label: { ar: 'عادي', en: 'Neutral' } },
    { value: 'sad', label: { ar: 'حزين', en: 'Sad' } }
  ];

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  };

  return (
    <PageLayout
      title={language === 'ar' ? 'المدونات' : 'Journal'}
      subtitle={language === 'ar' ? 'سجل أفكارك ومشاعرك اليومية' : 'Record your daily thoughts and feelings'}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'المدونات' : 'Journal'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'ar' 
                ? `${safeJournalEntries.length} مدونة إجمالاً`
                : `${safeJournalEntries.length} total entries`
              }
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'البحث في المدونات...' : 'Search journal entries...'}
              />
            </div>

            {/* Mood Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                {moodOptions.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label[language]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Journal Entries List */}
        <motion.div {...animations.stagger} className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد مدونات' : 'No journal entries found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'لا توجد مدونات متاحة حالياً'
                  : 'No journal entries available at the moment'
                }
              </p>
            </Card>
          ) : (
            filteredEntries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => navigate(`/journal/${entry.id}`)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/journal/${entry.id}`); } }} tabIndex={0} role="button" aria-label={language === 'ar' ? `عرض المدونة ${entry.title}` : `View journal ${entry.title}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                            {entry.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            {/* معلومات اليوم */}
                            {(() => {
                              const dayInfo = getDayInfo(entry);
                              return dayInfo ? (
                                <div className="flex items-center space-x-1">
                                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                                    {dayInfo.day.day?.[language] || dayInfo.day.day?.ar}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                            
                            {/* تاريخ الإنشاء */}
                            {entry.createdAt && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDate(entry.createdAt, language)}
                                </span>
                              </div>
                            )}
                            
                            {/* تاريخ التعديل */}
                            {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {language === 'ar' ? 'تم التعديل:' : 'Modified:'} {formatDate(entry.updatedAt, language)}
                                </span>
                              </div>
                            )}
                            
                            {/* المزاج */}
                            <div className="flex items-center space-x-1">
                              {getMoodIcon(entry.mood)}
                              <span>{getMoodLabel(entry.mood)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {entry.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                        {entry.content.replace(/<[^>]*>/g, '').length > 200 && '...'}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-2">

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit />}
                          onClick={(e) => { e.stopPropagation(); navigate(`/journal/${entry.id}/edit`); }}
                        >
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 />}
                          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(entry.id); }}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this journal entry? This action cannot be undone.'
              }
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(null)}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteModal)}
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageLayout>
  );
};

export default JournalPage;