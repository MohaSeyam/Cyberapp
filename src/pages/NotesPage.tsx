// Notes Page - Unified Design
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { VirtualList, useVirtualSearch } from '../components/ui/VirtualList';
import { animations } from '../constants/theme';
import { useDebounce } from '../hooks/useDebounce';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const { t, lang } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'important'>('all');

  // Flatten notes for virtual scrolling
  const allNotes = useMemo(() => {
    const flattened = Object.values(notes).flat();
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
  }, [notes, sortBy, sortOrder]);

  // Apply filters
  const filteredNotes = useMemo(() => {
    let filtered = allNotes;
    
    if (filterType === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(note => note.createdAt > oneWeekAgo);
    } else if (filterType === 'important') {
      filtered = filtered.filter(note => note.tags?.includes('important'));
    }

    return filtered;
  }, [allNotes, filterType]);

  // Use virtual search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchableNotes = useVirtualSearch(
    filteredNotes,
    debouncedSearchTerm,
    ['title', 'content', 'tags']
  );

  const renderNoteItem = (note: any, index: number) => (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {note.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {note.content}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Week {note.weekId}</span>
            <span>•</span>
            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            {note.tags && note.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{note.tags.join(', ')}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditNote(note)}
          >
            {t('edit')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteNote(note.id)}
          >
            {t('delete')}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const handleEditNote = (note: any) => {
    // Implement edit functionality
    console.log('Edit note:', note);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (window.confirm(t('confirmDeleteNote'))) {
      try {
        await deleteNote(noteId);
        // Note will be automatically removed from the list
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <PageLayout title={t('notes')}>
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
                placeholder={t('searchNotes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('allNotes')}</option>
                <option value="recent">{t('recentNotes')}</option>
                <option value="important">{t('importantNotes')}</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">{t('sortByDate')}</option>
                <option value="title">{t('sortByTitle')}</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                icon={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              >
                {sortOrder === 'asc' ? t('ascending') : t('descending')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Notes List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('notes')} ({searchableNotes.length})
            </h2>
            <button
              className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              style={{ fontSize: 32 }}
              onClick={() => {/* Implement add note */}}
              aria-label={t('addNote')}
            >
              <Plus className="w-10 h-10" />
            </button>
          </div>

          {/* Virtual List for Notes */}
          <VirtualList
            items={searchableNotes}
            height={600}
            itemHeight={120}
            renderItem={renderNoteItem}
            overscan={10}
            emptyMessage={t('noNotesFound')}
            className="border border-gray-200 dark:border-gray-700 rounded-lg"
          />
        </Card>
      </motion.div>
    </PageLayout>
  );
}