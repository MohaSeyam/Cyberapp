import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Calendar, BookOpen, Edit, Trash2, Eye, Target, Clock
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { formatGregorianDate } from '../utils/date';

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
  const { journalEntries, deleteJournalEntry, plan } = appData;

  // Ensure data is available
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // البحث عن معلومات اليوم المرتبط بالمدونة
  const getDayInfo = (entry) => {
    if (!entry?.weekId || !entry?.dayKey || !Array.isArray(plan)) return null;
    
    try {
      const week = plan.find(w => String(w.week) === String(entry.weekId));
      if (week && Array.isArray(week.days)) {
        const day = week.days.find(d => String(d.key) === String(entry.dayKey));
        return day ? { week, day } : null;
      }
    } catch (error) {
      console.error('Error getting day info:', error);
    }
    return null;
  };

  // Filter entries based on search and tags
  const filteredEntries = useMemo(() => {
    try {
      return safeJournalEntries.filter(entry => {
        if (!entry || typeof entry !== 'object') return false;
        const title = entry.title || '';
        const content = entry.content || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (Array.isArray(entry.tags) && entry.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
        return matchesSearch;
      }).sort((a, b) => {
        const dateA = new Date(b.updatedAt || b.createdAt || b.date || 0);
        const dateB = new Date(a.updatedAt || a.createdAt || a.date || 0);
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Error filtering journal entries:', error);
      return [];
    }
  }, [safeJournalEntries, searchTerm]);

  const handleDelete = async (entryId) => {
    try {
      await deleteJournalEntry(entryId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

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
        {/* Header removed (title handled by PageLayout) */}

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

            {/* Tags Filter (replacing moods) */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'فلترة بالتاقات (اكتب التاق)...' : 'Filter by tags (type tag)...'}
              />
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
                                    {dayInfo?.day?.day?.[language] || dayInfo?.day?.day?.ar || ''}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                            
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

                      {/* Footer: Last Modified */}
                      {(entry.updatedAt || entry.createdAt) && (
                        <div className="mt-4 pt-3 border-top border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {language === 'ar' ? 'آخر تعديل:' : 'Last Modified:'} {formatGregorianDate(entry.updatedAt || entry.createdAt, language, true)}
                          </span>
                        </div>
                      )}
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