// Journal Page - Refactored with Components and Hooks
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import { animations } from '../constants/theme';
import JournalSearchBar from '../components/journal/JournalSearchBar';
import JournalList from '../components/journal/JournalList';
import { useJournal, type JournalEntry, type JournalForm } from '../hooks/useJournal';
import toast from 'react-hot-toast';
// ErrorBoundary removed - using simple error handling

function JournalErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">حدث خطأ في صفحة المدونة</h2>
      <p>{error?.message || 'يرجى إعادة تحميل الصفحة أو المحاولة لاحقًا.'}</p>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent ?
        <this.props.FallbackComponent error={this.state.error} /> :
        <JournalErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function JournalPage() {
  const { t, language } = useLocalization();
  const {
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    isSaving,
    filteredAndSortedEntries,
    availableTags,
    getDayTitle,
    handleSaveEntry,
    handleDeleteEntry
  } = useJournal();

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleEntryClick = (entryId: number) => {
    window.location.href = `/journal-entry/${entryId}`;
  };

  const handleEditEntry = (entry: JournalEntry) => {
    window.location.href = `/journal-entry/${entry.id}/edit`;
  };

  const handleDeleteEntryClick = async (entryId: number) => {
    if (window.confirm(t('confirmDeleteJournalEntry'))) {
      const success = await handleDeleteEntry(entryId);
      if (success) {
        toast.success(t('entryDeleted'));
        setSelectedEntry(null);
      } else {
        toast.error(t('deleteError'));
      }
    }
  };



  return (
    <ErrorBoundary FallbackComponent={JournalErrorFallback}>
      <PageLayout 
        title={t('journal')}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animations.page}
          className="space-y-6"
        >
          {/* Search and Filter Bar */}
          <JournalSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            availableTags={availableTags}
            language={language}
          />

          {/* Journal List */}
          <JournalList
            entries={filteredAndSortedEntries}
            onEntryClick={handleEntryClick}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntryClick}
            getDayTitle={getDayTitle}
            language={language}
          />

          {/* Journal Detail Modal */}
          {selectedEntry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                      <span className="w-6 h-6 text-blue-600 dark:text-blue-400">📝</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedEntry.title}
                      </h2>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(selectedEntry.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {selectedEntry.updatedAt && selectedEntry.updatedAt !== selectedEntry.createdAt && (
                          <span>
                            {t('updated')}: {new Date(selectedEntry.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleEditEntry(selectedEntry);
                        setSelectedEntry(null);
                      }}
                      className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                      title={t('editEntry')}
                    >
                      <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntryClick(selectedEntry.id)}
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                      title={t('deleteEntry')}
                    >
                      <Plus className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title={t('close')}
                    >
                      <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Plus className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white">
                    <div dangerouslySetInnerHTML={{ __html: selectedEntry.content }} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </PageLayout>
    </ErrorBoundary>
  );
}