import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Tag, Calendar, FileText, Edit, Trash2, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const NotesPage = () => {
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { notes, deleteNote } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [notes]);

  // Filter notes based on search and tag
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [notes, searchTerm, selectedTag]);

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting note:', error);
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
      title={language === 'ar' ? 'الملاحظات' : 'Notes'}
      subtitle={language === 'ar' ? 'إدارة ملاحظاتك الشخصية' : 'Manage your personal notes'}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الملاحظات' : 'Notes'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'ar' 
                ? `${notes.length} ملاحظة إجمالاً`
                : `${notes.length} total notes`
              }
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={() => navigate('/notes/new')}
          >
            {language === 'ar' ? 'ملاحظة جديدة' : 'New Note'}
          </Button>
        </div>

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
                placeholder={language === 'ar' ? 'البحث في الملاحظات...' : 'Search notes...'}
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">
                  {language === 'ar' ? 'جميع التاقات' : 'All Tags'}
                </option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Notes List */}
        <motion.div {...animations.stagger} className="space-y-4">
          {filteredNotes.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد ملاحظات' : 'No notes found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {language === 'ar' 
                  ? 'ابدأ بإنشاء ملاحظتك الأولى'
                  : 'Start by creating your first note'
                }
              </p>
              <Button
                variant="primary"
                icon={<Plus />}
                onClick={() => navigate('/notes/new')}
              >
                {language === 'ar' ? 'إنشاء ملاحظة' : 'Create Note'}
              </Button>
            </Card>
          ) : (
            filteredNotes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {note.title}
                      </h3>

                      {/* Preview */}
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                        {note.content.replace(/<[^>]*>/g, '').length > 150 && '...'}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(note.updatedAt || note.createdAt).toLocaleDateString(
                                language === 'ar' ? 'ar-SA' : 'en-US'
                              )}
                            </span>
                          </div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{note.tags.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye />}
                            onClick={() => navigate(`/notes/${note.id}`)}
                          >
                            {language === 'ar' ? 'عرض' : 'View'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit />}
                            onClick={() => navigate(`/notes/${note.id}/edit`)}
                          >
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 />}
                            onClick={() => setShowDeleteModal(note.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
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
                ? 'هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this note? This action cannot be undone.'
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

export default NotesPage;