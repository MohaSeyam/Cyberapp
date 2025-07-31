import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Tag, Edit2, Trash2, BookOpen, MessageSquare, Star, Filter, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import RichTextEditor from '../editors/RichTextEditor';
import { animations } from '../../constants/theme';

const NOTE_CATEGORIES = [
  { id: 'general', label: 'عام', icon: MessageSquare, color: 'blue' },
  { id: 'concept', label: 'مفهوم', icon: BookOpen, color: 'green' },
  { id: 'important', label: 'مهم', icon: Star, color: 'red' },
  { id: 'question', label: 'سؤال', icon: MessageSquare, color: 'yellow' },
  { id: 'tip', label: 'نصيحة', icon: Star, color: 'purple' }
];

const NoteCard = React.memo(({ note, onEdit, onDelete, onToggleFavorite }) => {
  const category = NOTE_CATEGORIES.find(cat => cat.id === note.category);
  const IconComponent = category?.icon || MessageSquare;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg bg-${category?.color}-100 dark:bg-${category?.color}-900`}>
              <IconComponent className={`w-4 h-4 text-${category?.color}-600 dark:text-${category?.color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={note.favorite ? <Star className="w-4 h-4 fill-yellow-400" /> : <Star className="w-4 h-4" />}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {note.content}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${category?.color}-100 text-${category?.color}-800 dark:bg-${category?.color}-900 dark:text-${category?.color}-200`}>
                  {category?.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export default function AdvancedNotesSystem() {
  const { t } = useLocalization();
  const { addNote, updateNote, deleteNote } = useApp();
  
  // State
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'مفهوم أساسي في الأمن السيبراني',
      content: 'الأمن السيبراني هو حماية الأنظمة والشبكات والبرامج من الهجمات الرقمية.',
      category: 'concept',
      favorite: true,
      createdAt: new Date().toISOString(),
      tags: ['أمن', 'مفهوم']
    },
    {
      id: '2',
      title: 'نصيحة مهمة للتعلم',
      content: 'احرص على التدرب العملي مع كل مفهوم تتعلمه.',
      category: 'tip',
      favorite: false,
      createdAt: new Date().toISOString(),
      tags: ['نصيحة', 'تعلم']
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  
  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      const matchesFavorite = !showFavoritesOnly || note.favorite;
      
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [notes, searchQuery, selectedCategory, showFavoritesOnly]);
  
  // Handlers
  const handleAddNote = useCallback(() => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      category: 'general',
      tags: []
    });
    setIsModalOpen(true);
  }, []);
  
  const handleEditNote = useCallback((note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags || []
    });
    setIsModalOpen(true);
  }, []);
  
  const handleSaveNote = useCallback(() => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    
    const noteData = {
      ...noteForm,
      id: editingNote?.id || Date.now().toString(),
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      favorite: editingNote?.favorite || false
    };
    
    if (editingNote) {
      setNotes(prev => prev.map(note => note.id === editingNote.id ? noteData : note));
    } else {
      setNotes(prev => [...prev, noteData]);
    }
    
    setIsModalOpen(false);
    setEditingNote(null);
  }, [noteForm, editingNote]);
  
  const handleDeleteNote = useCallback((noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);
  
  const handleToggleFavorite = useCallback((noteId) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, favorite: !note.favorite } : note
    ));
  }, []);
  
  const handleAddTag = useCallback((tag) => {
    if (tag && !noteForm.tags.includes(tag)) {
      setNoteForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  }, [noteForm.tags]);
  
  const handleRemoveTag = useCallback((tagToRemove) => {
    setNoteForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('advancedNotes')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('organizeYourLearningNotes')}</p>
        </div>
        <Button icon={<Plus />} onClick={handleAddNote}>{t('addNote')}</Button>
      </div>
      
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('searchNotes')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('filter')}:</span>
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">{t('allCategories')}</option>
              {NOTE_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
            
            {/* Favorites Filter */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                showFavoritesOnly 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-yellow-400' : ''}`} />
              <span>{t('favorites')}</span>
            </button>
          </div>
        </div>
      </Card>
      
      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedCategory !== 'all' || showFavoritesOnly ? t('noNotesFound') : t('noNotesYet')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all' || showFavoritesOnly ? t('tryAdjustingFilters') : t('startAddingNotes')}
          </p>
          {!searchQuery && selectedCategory === 'all' && !showFavoritesOnly && (
            <Button icon={<Plus />} onClick={handleAddNote}>{t('addFirstNote')}</Button>
          )}
        </motion.div>
      )}
      
      {/* Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? t('editNote') : t('addNote')}
        size="lg"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('title')}
            </label>
            <input
              type="text"
              value={noteForm.title}
              onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('noteTitle')}
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('category')}
            </label>
            <select
              value={noteForm.category}
              onChange={(e) => setNoteForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {NOTE_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('content')}
            </label>
            <RichTextEditor
              value={noteForm.content}
              onChange={(content) => setNoteForm(prev => ({ ...prev, content }))}
              placeholder={t('writeYourNote')}
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
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
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
                      e.preventDefault();
                      handleAddTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="' + t('addTag') + '"]');
                    if (input && input.value.trim()) {
                      handleAddTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  {t('add')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveNote} disabled={!noteForm.title.trim() || !noteForm.content.trim()}>
              {editingNote ? t('update') : t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}