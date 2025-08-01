// Journal Page - Unified Design
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Plus, Edit2, Trash2,
  Calendar, Clock, MessageSquare, Star, TrendingUp, Tag, X, FileText, ArrowLeft,
  SortAsc, SortDesc
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { VirtualList, useVirtualSearch } from '../components/ui/VirtualList';
import { animations } from '../constants/theme';
import { useDebounce } from '../hooks/useDebounce';
import type { JournalEntry } from '../types';

export default function JournalPage() {
  const { appState, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();
  const journal = appState?.journal || {};
  const { t } = useLocalization();
  
  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'important'>('all');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null as JournalEntry | null });
  const [showFullEntry, setShowFullEntry] = useState(false);
  const [journalForm, setJournalForm] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  // Get all journal entries and flatten them
  const allEntries = useMemo(() => {
    if (!journal || typeof journal !== 'object') {
      return [];
    }
    const flattened = Object.values(journal).flat();
    return flattened.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? a.createdAt - b.createdAt 
          : b.createdAt - a.createdAt;
      } else {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
  }, [journal, sortBy, sortOrder]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    let filtered = allEntries;
    
    if (filterType === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(entry => entry.createdAt > oneWeekAgo);
    } else if (filterType === 'important') {
      filtered = filtered.filter(entry => entry.tags?.includes('important'));
    }

    return filtered;
  }, [allEntries, filterType]);

  // Use virtual search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchableEntries = useVirtualSearch(
    filteredEntries,
    debouncedSearchTerm,
    ['title', 'content', 'tags']
  );

  const getDayTitle = (dayKey: string, weekId: number) => {
    if (dayKey === 'general') return 'مدونة عامة';
    
    // Get day title from plan data
    const { plan } = useApp();
    const week = plan?.find(w => w.week === weekId);
    const day = week?.days?.find(d => d.key === dayKey);
    
    if (day?.day?.ar) {
      return day.day.ar;
    }
    
    if (day?.day?.en) {
      return day.day.en;
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
        setSelectedEntry(entry);
        setShowFullEntry(true);
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
              {entry.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-100 line-clamp-2">
              {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-100">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(entry.createdAt).toLocaleDateString('en-US')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{entry.dayKey === 'general' ? getDayTitle(entry.dayKey, entry.weekId) : `الأسبوع ${entry.weekId} - ${getDayTitle(entry.dayKey, entry.weekId)}`}</span>
            </div>
          </div>
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <div className="flex space-x-1">
                {entry.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
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

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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
        {/* Search and Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('searchJournal')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">جميع المدونات</option>
                  <option value="recent">المدونات الحديثة</option>
                  <option value="important">المدونات المهمة</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <SortAsc className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="date">ترتيب حسب التاريخ</option>
                  <option value="title">ترتيب حسب العنوان</option>
                </select>
                
                <button
                  onClick={toggleSortOrder}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={sortOrder === 'asc' ? 'ترتيب تصاعدي' : 'ترتيب تنازلي'}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Journal Entries List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('journal')} ({searchableEntries.length})
            </h2>
          </div>

          {/* Virtual List for Journal Entries */}
          <VirtualList
            items={searchableEntries}
            height={600}
            itemHeight={140}
            renderItem={renderJournalItem}
            overscan={10}
            emptyMessage={t('noJournalEntries')}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          />
        </Card>

        {/* Full Journal Entry View */}
        {showFullEntry && selectedEntry && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto my-8 px-4 py-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10 rounded-t-xl">
                <div className="px-2 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setShowFullEntry(false);
                        setSelectedEntry(null);
                      }}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="العودة للمدونات"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedEntry.title}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedEntry.dayKey === 'general' ? getDayTitle(selectedEntry.dayKey, selectedEntry.weekId) : `الأسبوع ${selectedEntry.weekId} - ${getDayTitle(selectedEntry.dayKey, selectedEntry.weekId)}`}
                      </p>
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
                        setShowFullEntry(false);
                        setSelectedEntry(null);
                      }}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="تعديل المدونة"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      title="حذف المدونة"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="py-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-100">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedEntry.createdAt).toLocaleDateString('en-US')}</span>
                    </div>
                  </div>
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-purple-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white">
                    <div dangerouslySetInnerHTML={{ __html: selectedEntry.content }} />
                  </div>
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