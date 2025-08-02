// Notes Page - Unified Design
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Calendar, Tag, FileText, ArrowLeft, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { VirtualList } from '../components/ui/VirtualList';
import { animations } from '../constants/theme';

export default function NotesPage() {
  const { appState, addNote, updateNote, deleteNote, plan } = useApp();
  const notes = appState?.notes || {};
  const { t, lang } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, note: null as any });
  const [showFullNote, setShowFullNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    weekId: 1,
    dayKey: 'general',
    taskId: 'general'
  });

  // جمع جميع الملاحظات مع معلومات اليوم
  const allNotes = useMemo(() => {
    const notesArray: any[] = [];
    
    Object.keys(notes).forEach(dayKey => {
      const dayNotes = notes[dayKey] || [];
      dayNotes.forEach((note: any) => {
        const weekKey = dayKey.split('-')[0];
        const week = plan?.weeks?.find(w => w.key === weekKey);
        const day = week?.days?.find(d => d.key === dayKey);
        
        notesArray.push({
          ...note,
          dayInfo: { week, day }
        });
      });
    });
    
    return notesArray;
  }, [notes, plan]);

  // فلترة وترتيب الملاحظات
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = allNotes;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب التاق
    if (selectedTag) {
      filtered = filtered.filter(note => 
        note.tags && note.tags.includes(selectedTag)
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
  }, [allNotes, searchTerm, selectedTag, sortBy]);

  // جمع جميع التاقات المتاحة
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allNotes.forEach(note => {
      if (note.tags) {
        note.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [allNotes]);

  const getDayTitle = (dayKey: string, weekId: number) => {
    if (dayKey === 'general') return 'ملاحظة عامة';
    
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

  const renderNoteItem = (note: any, index: number) => (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => {
        // فتح الملاحظة في نفس الصفحة
        window.location.href = `/note/${note.id}`;
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
              {note.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-white line-clamp-2">
              {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-white">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(note.createdAt).toLocaleDateString('en-US')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{note.dayKey === 'general' ? getDayTitle(note.dayKey, note.weekId) : getDayTitle(note.dayKey, note.weekId)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-gray-400" />
                <div className="flex space-x-1">
                  {note.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/note/${note.id}/edit`, '_blank');
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="تعديل"
              >
                <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
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

  const handleSaveNote = async () => {
    if (noteForm.title.trim() && noteForm.content.trim()) {
      try {
        // Add automatic tag for general notes
        let finalTags = [...noteForm.tags];
        if (noteForm.dayKey === 'general' && !finalTags.includes('ملاحظة عامة')) {
          finalTags.push('ملاحظة عامة');
        }

        if (noteModal.note) {
          // Update existing note
          await updateNote(noteModal.note.id!, {
            title: noteForm.title,
            content: noteForm.content,
            tags: finalTags
          });
        } else {
          // Add new note
          await addNote({
            title: noteForm.title,
            content: noteForm.content,
            tags: finalTags,
            weekId: noteForm.weekId,
            dayKey: noteForm.dayKey,
            taskId: noteForm.taskId
          });
        }
        setNoteForm({ title: '', content: '', tags: [] });
        setNoteModal({ isOpen: false, note: null });
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (window.confirm(t('confirmDeleteNote'))) {
      try {
        await deleteNote(noteId);
        setSelectedNote(null);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
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

  return (
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
          <span className="font-medium">إضافة ملاحظة</span>
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
              placeholder="البحث في الملاحظات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                          ? 'bg-blue-500 text-white' 
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
                            ? 'bg-blue-500 text-white' 
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

        {/* Notes List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              الملاحظات ({filteredAndSortedNotes.length})
            </h2>
          </div>

          {filteredAndSortedNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedTag ? 'لا توجد نتائج للبحث' : 'لا توجد ملاحظات'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.href = `/note/${note.id}`;
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {note.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>
                          {new Date(note.createdAt).toLocaleDateString('en-US')}
                        </span>
                        {note.dayInfo?.day && (
                          <span className="text-blue-600 dark:text-blue-400">
                            {getDayTitle(note.dayKey, note.dayInfo.week?.id || 0)}
                          </span>
                        )}
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {note.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{note.tags.length - 2}
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

        {/* Note Detail Modal */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                    <ArrowLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedNote.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedNote.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Edit2 className="w-4 h-4" />
                          <span>تم التحديث: {new Date(selectedNote.updatedAt).toLocaleDateString('en-US')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setNoteForm({
                        title: selectedNote.title,
                        content: selectedNote.content,
                        tags: selectedNote.tags || []
                      });
                      setNoteModal({ isOpen: true, note: selectedNote });
                      setSelectedNote(null);
                    }}
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    title="تعديل الملاحظة"
                  >
                    <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-gray-400" />
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
        <Modal
          isOpen={noteModal.isOpen}
          onClose={() => setNoteModal({ isOpen: false, note: null })}
          title={noteModal.note ? t('editNote') : t('addNote')}
          size="xl"
        >
          <div className="space-y-4 pb-20">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('noteTitle')}
              </label>
              <input
                type="text"
                value={noteForm.title}
                onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
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
                  {noteForm.tags.map(tag => (
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
                {t('noteContent')}
              </label>
              <RichTextEditor
                content={noteForm.content}
                onChange={(content) => setNoteForm(prev => ({ ...prev, content }))}
                placeholder={t('writeNote')}
                lang={t}
                minHeight="400px"
              />
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t z-20 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setNoteModal({ isOpen: false, note: null })}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveNote}
                disabled={!noteForm.title.trim() || !noteForm.content.trim()}
              >
                {noteModal.note ? t('updateNote') : t('saveNote')}
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageLayout>
  );
}