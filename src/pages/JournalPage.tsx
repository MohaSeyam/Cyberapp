// Journal Page - Unified Design
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, Calendar, Tag, FileText, Edit2, Trash2, X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { VirtualList } from '../components/ui/VirtualList';
import { animations } from '../constants/theme';
import type { JournalEntry } from '../types';
import toast from 'react-hot-toast';

export default function JournalPage() {
  const { appState, addJournalEntry, updateJournalEntry, deleteJournalEntry, plan } = useApp();
  const journal = appState?.journal || {};
  const { t, lang } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };


  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null as JournalEntry | null });
  const [showFullEntry, setShowFullEntry] = useState(false);
  const [journalForm, setJournalForm] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  // جمع جميع المدونات مع معلومات اليوم
  const allJournalEntries = useMemo(() => {
    const entriesArray: any[] = [];
    
    Object.keys(journal).forEach(dayKey => {
      const dayEntries = journal[dayKey] || [];
      dayEntries.forEach((entry: any) => {
        const weekKey = dayKey.split('-')[0];
        const week = plan?.weeks?.find(w => w.key === weekKey);
        const day = week?.days?.find(d => d.key === dayKey);
        
        entriesArray.push({
          ...entry,
          dayKey,
          dayInfo: { week, day }
        });
      });
    });
    
    return entriesArray;
  }, [journal, plan]);

  // فلترة وترتيب المدونات
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = allJournalEntries;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب التاق
    if (selectedTag) {
      filtered = filtered.filter(entry => 
        entry.tags && entry.tags.includes(selectedTag)
      );
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title, 'ar');
        default:
          return 0;
      }
    });

    return filtered;
  }, [allJournalEntries, searchTerm, selectedTag, sortBy]);

  // جمع جميع التاقات المتاحة
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allJournalEntries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [allJournalEntries]);

  const getDayTitle = (dayKey: string, weekId: number) => {
    if (dayKey === 'general') return 'مدونة عامة';
    
    // Get day title from plan data
    const { plan } = useApp();
    const week = plan?.find(w => w.week === weekId);
    const day = week?.days?.find(d => d.key === dayKey);
    
    if (day?.name?.ar) {
      let title = day.name.ar;
      if (day.topic?.ar) {
        title += ` - ${day.topic.ar}`;
      }
      return title;
    }
    
    if (day?.name?.en) {
      let title = day.name.en;
      if (day.topic?.en) {
        title += ` - ${day.topic.en}`;
      }
      return title;
    }
    
    // Fallback to day name
    const dayNames: { [key: string]: string } = {
      sat: 'السبت',
      sun: 'الأحد',
      mon: 'الاثنين',
      tue: 'الثلاثاء',
      wed: 'الأربعاء',
      thu: 'الخميس',
      fri: 'الجمعة'
    };
    return dayNames[dayKey] || dayKey;
  };

  const renderJournalItem = (entry: any, index: number) => (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => {
        // فتح المدونة في نفس الصفحة
        window.location.href = `/journal-entry/${entry.id}`;
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
              {entry.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-white line-clamp-2">
              {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-white">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(entry.createdAt).toLocaleDateString('en-US')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{entry.dayKey === 'general' ? getDayTitle(entry.dayKey, entry.weekId) : getDayTitle(entry.dayKey, entry.weekId)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-gray-400" />
                <div className="flex space-x-1">
                  {entry.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{entry.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/journal-entry/${entry.id}/edit`, '_blank');
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="تعديل"
              >
                <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEntry(entry.id);
                }}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                title="حذف"
              >
                <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const handleSaveEntry = async () => {
    if (journalForm.title.trim() && journalForm.content.trim()) {
      try {
        if (journalModal.entry) {
          // Update existing entry
          await updateJournalEntry(journalModal.entry.id!, {
            title: journalForm.title,
            content: journalForm.content,
            tags: journalForm.tags
          });
        } else {
          // Add new entry
          await addJournalEntry({
            title: journalForm.title,
            content: journalForm.content,
            tags: journalForm.tags,
            weekId: 1,
            dayKey: 'general'
          });
        }
        setJournalForm({ title: '', content: '', tags: [] });
        setJournalModal({ isOpen: false, entry: null });
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (window.confirm(t('confirmDeleteJournal'))) {
      try {
        await deleteJournalEntry(entryId);
        setSelectedEntry(null);
      } catch (error) {
        console.error('Error deleting journal entry:', error);
      }
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !journalForm.tags.includes(tag.trim())) {
      setJournalForm(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setJournalForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };



  return (
    <PageLayout 
      title={safeT('journal')}
      subtitle={safeT('learningJournal')}
      showBottomBar={true}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={animations.page}
        className="space-y-6"
      >


        {/* Search and Filter Bar */}
        <motion.div 
          className="mb-6 space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المدونات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>فلترة</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="title">حسب العنوان</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div 
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    فلترة حسب التاق
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag('')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTag === '' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      الكل
                    </button>
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedTag === tag 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Journal Entries List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              المدونات ({filteredAndSortedEntries.length})
            </h2>
          </div>

          {filteredAndSortedEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedTag ? 'لا توجد نتائج للبحث' : 'لا توجد مدونات'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.href = `/journal-entry/${entry.id}`;
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>
                          {new Date(entry.createdAt).toLocaleDateString('en-US')}
                        </span>
                        {entry.dayInfo?.day && (
                          <span className="text-purple-600 dark:text-purple-400">
                            {getDayTitle(entry.dayKey, entry.dayInfo.week?.id || 0)}
                          </span>
                        )}
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {entry.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {entry.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{entry.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Journal Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedEntry.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedEntry.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {selectedEntry.updatedAt && selectedEntry.updatedAt !== selectedEntry.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Edit2 className="w-4 h-4" />
                          <span>تم التحديث: {new Date(selectedEntry.updatedAt).toLocaleDateString('en-US')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setJournalForm({
                        title: selectedEntry.title,
                        content: selectedEntry.content,
                        tags: selectedEntry.tags || []
                      });
                      setJournalModal({ isOpen: true, entry: selectedEntry });
                      setSelectedEntry(null);
                    }}
                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                    title="تعديل المدونة"
                  >
                    <Edit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                    title="حذف المدونة"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag: string, index: number) => (
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
                
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-purple-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white">
                  <div dangerouslySetInnerHTML={{ __html: selectedEntry.content }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Journal Modal */}
        <Modal
          isOpen={journalModal.isOpen}
          onClose={() => setJournalModal({ isOpen: false, entry: null })}
          title={journalModal.entry ? t('editJournalEntry') : t('addJournalEntry')}
          size="xl"
        >
          <div className="space-y-4 pb-20">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('journalTitle')}
              </label>
              <input
                type="text"
                value={journalForm.title}
                onChange={(e) => setJournalForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('enterTitle')}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tags')}
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {journalForm.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={t('addTag')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addTag(input.value);
                      input.value = '';
                    }}
                  >
                    {t('add')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('journalContent')}
              </label>
              <RichTextEditor
                content={journalForm.content}
                onChange={(content) => setJournalForm(prev => ({ ...prev, content }))}
                placeholder={t('writeJournalEntry')}
                lang="ar"
                minHeight="400px"
              />
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t z-20 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setJournalModal({ isOpen: false, entry: null })}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEntry}
                disabled={!journalForm.title.trim() || !journalForm.content.trim()}
              >
                {journalModal.entry ? t('updateEntry') : t('saveEntry')}
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageLayout>
  );
}