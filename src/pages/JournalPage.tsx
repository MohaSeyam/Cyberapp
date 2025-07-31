// Journal Page - Unified Design
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Plus, Edit, Trash2,
  Calendar, Clock, MessageSquare, Star, TrendingUp, Tag, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { animations } from '../constants/theme';
import type { JournalEntry } from '../types';

export default function JournalPage() {
  const { appState, addJournalEntry, updateJournalEntry, deleteJournalEntry, lang } = useApp();
  const { t } = useLocalization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null as JournalEntry | null });
  const [journalForm, setJournalForm] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  // Get all journal entries from appState
  const allEntries = Object.values(appState.journal).flat();
  const filteredEntries = allEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = !selectedWeek || entry.weekId.toString() === selectedWeek;
    const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
    return matchesSearch && matchesWeek && matchesTag;
  });

  // Get unique weeks
  const weeks = Array.from(new Set(allEntries.map(entry => entry.weekId))).sort();

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
            weekId: parseInt(selectedWeek) || 1,
            dayKey: 'sat'
          });
        }
        setJournalForm({ title: '', content: '', tags: [] });
        setJournalModal({ isOpen: false, entry: null });
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setJournalForm({
      title: entry.title,
      content: entry.content,
      tags: entry.tags
    });
    setJournalModal({ isOpen: true, entry });
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (confirm(t('confirmDeleteJournal'))) {
      try {
        await deleteJournalEntry(entryId);
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

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
  };

  // Get unique tags
  const allTags = Array.from(new Set(allEntries.flatMap(entry => entry.tags)));

  // Calculate statistics
  const totalEntries = allEntries.length;
  const thisWeekEntries = allEntries.filter(entry => entry.weekId === 1).length; // Current week
  const totalWords = allEntries.reduce((sum, entry) => 
    sum + entry.content.replace(/<[^>]*>/g, '').split(' ').length, 0
  );

  const stats = [
    {
      icon: BookOpen,
      label: t('totalEntries'),
      value: totalEntries,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      label: t('thisWeekEntries'),
      value: thisWeekEntries,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: MessageSquare,
      label: t('totalWords'),
      value: totalWords,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <PageLayout
      title={t('journal')}
      subtitle={t('yourLearningJourney')}
      showHeader={true}
    >
      {/* Add Entry Button */}
      <motion.div
        {...animations.fadeIn}
        className="mb-6 flex justify-end"
      >
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setJournalModal({ isOpen: true, entry: null })}
        >
          {t('addEntry')}
        </Button>
      </motion.div>

      {/* Statistics */}
      <motion.div
        {...animations.fadeIn}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            {...animations.stagger(index * 0.1)}
          >
            <Card
              variant="elevated"
              className="text-center"
            >
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full ${stat.bg} mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchJournal')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Week Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('allWeeks')}</option>
                {weeks.map(week => (
                  <option key={week} value={week}>{t('week')} {week}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="w-4 h-4 mr-2" />
              {filteredEntries.length} {t('entries')}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Journal Entries */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            {...animations.stagger(index * 0.1)}
          >
            <Card
              variant="elevated"
              hover
              onClick={() => handleEditEntry(entry)}
              className="cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {entry.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{t('week')} {entry.weekId}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(entry.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEntry(entry);
                      }}
                      className="p-1"
                      icon={<Edit className="w-3 h-3" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry.id!);
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                      icon={<Trash2 className="w-3 h-3" />}
                    />
                  </div>
                </div>

                <div 
                  className="text-gray-700 dark:text-gray-300 line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{entry.content.replace(/<[^>]*>/g, '').split(' ').length} {t('words')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('journalEntry')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.4 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || selectedWeek ? t('noEntriesFound') : t('noJournalEntries')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedWeek ? t('tryDifferentSearch') : t('startYourJournal')}
          </p>
          {!searchTerm && !selectedWeek && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setJournalModal({ isOpen: true, entry: null })}
            >
              {t('addEntry')}
            </Button>
          )}
        </motion.div>
      )}

      {/* Journal Entry Modal */}
      <Modal
        isOpen={journalModal.isOpen}
        onClose={() => setJournalModal({ isOpen: false, entry: null })}
        title={journalModal.entry ? t('editJournalEntry') : t('addJournalEntry')}
        size="xl"
      >
        <div className="space-y-4">
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

          {/* Week Selection (for new entries) */}
          {!journalModal.entry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('week')}
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('selectWeek')}</option>
                {weeks.map(week => (
                  <option key={week} value={week}>{t('week')} {week}</option>
                ))}
              </select>
            </div>
          )}

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
              {t('journalContent')}
            </label>
            <RichTextEditor
              content={journalForm.content}
              onChange={(content) => setJournalForm(prev => ({ ...prev, content }))}
              placeholder={t('writeJournalEntry')}
              lang={lang}
              minHeight="400px"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
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
    </PageLayout>
  );
}