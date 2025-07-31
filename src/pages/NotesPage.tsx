// Notes Page - Unified Design
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Filter, Plus, Edit, Trash2,
  Tag, Calendar, Clock, MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { animations } from '../constants/theme';
import type { Note } from '../types';

export default function NotesPage() {
  const { appState, addNote, updateNote, deleteNote, lang } = useApp();
  const { t } = useLocalization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [noteModal, setNoteModal] = useState({ isOpen: false, note: null as Note | null });
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    keywords: '',
    tags: [] as string[]
  });

  // Get all notes from appState
  const allNotes = Object.values(appState.notes).flat();
  const filteredNotes = allNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.keywords?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Get unique tags
  const allTags = Array.from(new Set(allNotes.flatMap(note => note.tags)));

  const handleSaveNote = async () => {
    if (noteForm.title.trim() && noteForm.content.trim()) {
      try {
        if (noteModal.note) {
          // Update existing note
          await updateNote(noteModal.note.id!, {
            title: noteForm.title,
            content: noteForm.content,
            keywords: noteForm.keywords,
            tags: noteForm.tags
          });
        } else {
          // Add new note
          await addNote({
            title: noteForm.title,
            content: noteForm.content,
            keywords: noteForm.keywords,
            tags: noteForm.tags,
            weekId: 1, // Default week
            dayKey: 'sat', // Default day
            taskId: 'general' // General note
          });
        }
        setNoteForm({ title: '', content: '', keywords: '', tags: [] });
        setNoteModal({ isOpen: false, note: null });
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  const handleEditNote = (note: Note) => {
    setNoteForm({
      title: note.title,
      content: note.content,
      keywords: note.keywords || '',
      tags: note.tags
    });
    setNoteModal({ isOpen: true, note });
  };

  const handleDeleteNote = async (noteId: number) => {
    if (confirm(t('confirmDeleteNote'))) {
      try {
        await deleteNote(noteId);
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

  return (
    <PageLayout
      title={t('notes')}
      subtitle={t('manageYourNotes')}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('notes')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('manageYourNotes')}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setNoteModal({ isOpen: true, note: null })}
          >
            {t('addNote')}
          </Button>
        </div>
      }
    >
      {/* Search and Filters */}
      <motion.div
        {...animations.fadeIn}
        className="mb-8"
      >
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchNotes')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('allTags')}</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4 mr-2" />
              {filteredNotes.length} {t('notes')}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notes Grid */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredNotes.map((note, index) => (
          <motion.div
            key={note.id}
            {...animations.stagger(index * 0.1)}
          >
            <Card
              variant="elevated"
              hover
              onClick={() => handleEditNote(note)}
              className="h-full"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNote(note);
                      }}
                      className="p-1"
                      icon={<Edit className="w-3 h-3" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id!);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                      icon={<Trash2 className="w-3 h-3" />}
                    />
                  </div>
                </div>

                <div 
                  className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />

                {note.keywords && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    <span className="font-medium">{t('keywords')}:</span> {note.keywords}
                  </div>
                )}

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(note.createdAt!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(note.updatedAt!).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || selectedTag ? t('noNotesFound') : t('noNotesYet')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedTag ? t('tryDifferentSearch') : t('createYourFirstNote')}
          </p>
          {!searchTerm && !selectedTag && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setNoteModal({ isOpen: true, note: null })}
            >
              {t('addNote')}
            </Button>
          )}
        </motion.div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={noteModal.isOpen}
        onClose={() => setNoteModal({ isOpen: false, note: null })}
        title={noteModal.note ? t('editNote') : t('addNote')}
        size="xl"
      >
        <div className="space-y-4">
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

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('keywords')}
            </label>
            <input
              type="text"
              value={noteForm.keywords}
              onChange={(e) => setNoteForm(prev => ({ ...prev, keywords: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('enterKeywords')}
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
                      ×
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
              placeholder={t('writeHere')}
              lang={lang}
              minHeight="300px"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
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
    </PageLayout>
  );
}