// Notes Page - Refactored with Components and Hooks
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Modal from '../components/ui/Modal';
import { animations } from '../constants/theme';
import NotesSearchBar from '../components/notes/NotesSearchBar';
import NotesList from '../components/notes/NotesList';
import NoteModal from '../components/notes/NoteModal';
import { useNotes, type Note, type NoteForm } from '../hooks/useNotes';
import toast from 'react-hot-toast';
// ErrorBoundary removed - using simple error handling

function NotesErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">حدث خطأ في صفحة الملاحظات</h2>
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
        <NotesErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function NotesPage() {
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
    filteredAndSortedNotes,
    availableTags,
    getDayTitle,
    handleSaveNote,
    handleDeleteNote
  } = useNotes();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, note: null as Note | null });
  const [noteForm, setNoteForm] = useState<NoteForm>({
    title: '',
    content: '',
    tags: [],
    weekId: 1,
    dayKey: 'general',
    taskId: 'general'
  });

  // Initialize note form when opening modal for new note
  useEffect(() => {
    if (noteModal.isOpen && !noteModal.note) {
      setNoteForm({
        title: '',
        content: '',
        tags: ['ملاحظة عامة'], // Auto-add general note tag
        weekId: 1,
        dayKey: 'general',
        taskId: 'general'
      });
    }
  }, [noteModal.isOpen, noteModal.note]);

  const handleNoteClick = (noteId: number) => {
    window.location.href = `/note/${noteId}`;
  };

  const handleEditNote = (note: Note) => {
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      weekId: note.weekId,
      dayKey: note.dayKey,
      taskId: note.taskId
    });
    setNoteModal({ isOpen: true, note });
  };

  const handleDeleteNoteClick = async (noteId: number) => {
    if (window.confirm(t('confirmDeleteNote'))) {
      const success = await handleDeleteNote(noteId);
      if (success) {
        toast.success(t('noteDeleted'));
        setSelectedNote(null);
      } else {
        toast.error(t('deleteError'));
      }
    }
  };

  const handleSaveNoteClick = async () => {
    const success = await handleSaveNote(noteForm, noteModal.note);
    if (success) {
      toast.success(noteModal.note ? t('noteUpdated') : t('noteSaved'));
      setNoteForm({ title: '', content: '', tags: [] });
      setNoteModal({ isOpen: false, note: null });
    } else {
      toast.error(t('saveError'));
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !noteForm.tags.includes(tag.trim())) {
      setNoteForm(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNoteForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  return (
    <ErrorBoundary FallbackComponent={NotesErrorFallback}>
      <PageLayout 
        title={t('notes')}
        headerAction={
          <motion.button
            onClick={() => setNoteModal({ isOpen: true, note: null })}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">{t('addNote')}</span>
          </motion.button>
        }
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animations.page}
          className="space-y-6"
        >
        {/* Search and Filter Bar */}
        <NotesSearchBar
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

        {/* Notes List */}
        <NotesList
          notes={filteredAndSortedNotes}
          onNoteClick={handleNoteClick}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNoteClick}
          getDayTitle={getDayTitle}
          language={language}
        />

        {/* Note Detail Modal */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                    <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedNote.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(selectedNote.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                        <span>
                          {t('updated')}: {new Date(selectedNote.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      handleEditNote(selectedNote);
                      setSelectedNote(null);
                    }}
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    title={t('editNote')}
                  >
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteNoteClick(selectedNote.id)}
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                    title={t('deleteNote')}
                  >
                    <Plus className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={t('close')}
                  >
                    <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag: string, index: number) => (
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
                  <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Note Modal */}
        <NoteModal
          isOpen={noteModal.isOpen}
          onClose={() => setNoteModal({ isOpen: false, note: null })}
          note={noteModal.note}
          noteForm={noteForm}
          setNoteForm={setNoteForm}
          onSave={handleSaveNoteClick}
          addTag={addTag}
          removeTag={removeTag}
          t={t}
          isSaving={isSaving}
                  />
        </motion.div>
      </PageLayout>
    </ErrorBoundary>
  );
}