import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Tag, Calendar, FileText, Edit, Trash2, Eye, Target, Clock
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const NotesPage = () => {
  const navigate = useNavigate();
  
  // Safe access to contexts with error handling
  let localizationData;
  let appData;
  
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useSimpleApp:', error);
    appData = {
      notes: [],
      deleteNote: async () => {}
    };
  }
  
  const { language } = localizationData;
  const { notes, deleteNote, plan } = appData;
  
  // Ensure data is available with additional safety
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeLanguage = language || 'ar';
  const isRTL = safeLanguage === 'ar';

  // Debug logging to help identify React #130 issues
  console.log('NotesPage render data:', {
    notesLength: safeNotes.length,
    language: safeLanguage,
    isRTL
  });

  // Additional safety checks for React #130
  if (!safeNotes) {
    console.error('NotesPage: Invalid notes data detected, using empty array');
    return (
      <PageLayout
        title={safeLanguage === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        subtitle={safeLanguage === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
        showBottomBar={true}
      >
        <div className="max-w-4xl mx-auto py-10">
          <div className="text-center">
            <p>{safeLanguage === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // البحث عن معلومات اليوم المرتبط بالملاحظة
  const getDayInfo = (note) => {
    if (!note?.weekId || !note?.dayKey || !Array.isArray(plan)) return null;
    
    try {
      const week = plan.find(w => String(w.week) === String(note.weekId));
      if (week && Array.isArray(week.days)) {
        const day = week.days.find(d => String(d.key) === String(note.dayKey));
        return day ? { week, day } : null;
      }
    } catch (error) {
      console.error('Error getting day info:', error);
    }
    return null;
  };

  // تنسيق التاريخ باللغة العربية
  const formatDate = (dateString, language) => {
    try {
      const date = new Date(dateString);
      if (language === 'ar') {
        return date.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Get all unique tags with safety checks
  const allTags = useMemo(() => {
    try {
      const tags = new Set();
      safeNotes.forEach(note => {
        if (note && note.tags && Array.isArray(note.tags)) {
          note.tags.forEach(tag => {
            if (typeof tag === 'string' && tag.trim()) {
              tags.add(tag.trim());
            }
          });
        }
      });
      return Array.from(tags).sort();
    } catch (error) {
      console.error('Error processing tags:', error);
      return [];
    }
  }, [safeNotes]);

  // Filter notes based on search and tag with safety checks
  const filteredNotes = useMemo(() => {
    try {
      return safeNotes.filter(note => {
        if (!note || typeof note !== 'object') return false;
        
        const title = note.title || '';
        const content = note.content || '';
        const tags = note.tags || [];
        
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = !selectedTag || tags.includes(selectedTag);
        
        return matchesSearch && matchesTag;
      }).sort((a, b) => {
        const dateA = new Date(b.updatedAt || b.createdAt || 0);
        const dateB = new Date(a.updatedAt || a.createdAt || 0);
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Error filtering notes:', error);
      return [];
    }
  }, [safeNotes, searchTerm, selectedTag]);

  const handleDelete = async (noteId) => {
    try {
      if (deleteNote && typeof deleteNote === 'function') {
        await deleteNote(noteId);
      }
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleNavigation = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = path;
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
      title={safeLanguage === 'ar' ? 'الملاحظات' : 'Notes'}
      subtitle={safeLanguage === 'ar' ? 'إدارة ملاحظاتك الشخصية' : 'Manage your personal notes'}
      showBottomBar={true}
    >
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        <motion.div {...animations.fadeIn}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {safeLanguage === 'ar' ? 'الملاحظات' : 'Notes'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {safeLanguage === 'ar' 
                  ? `${safeNotes.length} ملاحظة إجمالاً`
                  : `${safeNotes.length} total notes`
                }
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus />}
              onClick={() => handleNavigation('/notes/new')}
            >
              {safeLanguage === 'ar' ? 'ملاحظة جديدة' : 'New Note'}
            </Button>
          </div>

          {/* Search and Filter */}
          <Card className="p-4 mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={safeLanguage === 'ar' ? 'البحث في الملاحظات...' : 'Search notes...'}
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
                    {safeLanguage === 'ar' ? 'جميع التاقات' : 'All Tags'}
                  </option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Notes List */}
          <motion.div {...animations.stagger} className="space-y-4 mt-6">
            {filteredNotes.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {safeLanguage === 'ar' ? 'لا توجد ملاحظات' : 'No notes found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {safeLanguage === 'ar' 
                    ? 'ابدأ بإنشاء ملاحظتك الأولى'
                    : 'Start by creating your first note'
                  }
                </p>
                <Button
                  variant="primary"
                  icon={<Plus />}
                  onClick={() => handleNavigation('/notes/new')}
                >
                  {safeLanguage === 'ar' ? 'إنشاء ملاحظة' : 'Create Note'}
                </Button>
              </Card>
            ) : (
              filteredNotes.map(note => {
                // Additional safety check for each note
                if (!note || typeof note !== 'object') return null;
                
                const safeTitle = note.title || '';
                const safeContent = note.content || '';
                const safeTags = Array.isArray(note.tags) ? note.tags : [];
                const safeDate = note.updatedAt || note.createdAt || new Date().toISOString();
                
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => handleNavigation(`/notes/${note.id}`)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigation(`/notes/${note.id}`); } }} tabIndex={0} role="button" aria-label={safeLanguage === 'ar' ? `عرض الملاحظة ${safeTitle}` : `View note ${safeTitle}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                            {safeTitle}
                          </h3>

                          {/* Preview */}
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {safeContent.replace(/<[^>]*>/g, '').substring(0, 150)}
                            {safeContent.replace(/<[^>]*>/g, '').length > 150 && '...'}
                          </p>

                          {/* Meta Information */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              {/* معلومات اليوم */}
                              {(() => {
                                const dayInfo = getDayInfo(note);
                                return dayInfo ? (
                                  <div className="flex items-center space-x-1">
                                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                      {dayInfo?.day?.day?.[safeLanguage] || dayInfo?.day?.day?.ar || ''}
                                    </span>
                                  </div>
                                ) : null;
                              })()}
                              
                              {/* تاريخ الإنشاء */}
                              {note.createdAt && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {formatDate(note.createdAt, safeLanguage)}
                                  </span>
                                </div>
                              )}
                              
                              {/* تاريخ التعديل */}
                              {note.updatedAt && note.updatedAt !== note.createdAt && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {safeLanguage === 'ar' ? 'تم التعديل:' : 'Modified:'} {formatDate(note.updatedAt, safeLanguage)}
                                  </span>
                                </div>
                              )}
                              
                              {/* عدد التاقات */}
                              {safeTags.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Tag className="w-4 h-4" />
                                  <span>{safeTags.length}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">

                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Edit />}
                                onClick={(e) => { e.stopPropagation(); handleNavigation(`/notes/${note.id}/edit`); }}
                              >
                                {safeLanguage === 'ar' ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 />}
                                onClick={(e) => { e.stopPropagation(); setShowDeleteModal(note.id); }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                {safeLanguage === 'ar' ? 'حذف' : 'Delete'}
                              </Button>
                            </div>
                          </div>

                          {/* Tags */}
                          {safeTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {safeTags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {safeTags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                  +{safeTags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={!!showDeleteModal}
            onClose={() => setShowDeleteModal(null)}
            title={safeLanguage === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {safeLanguage === 'ar' 
                  ? 'هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this note? This action cannot be undone.'
                }
              </p>
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteModal(null)}
                >
                  {safeLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(showDeleteModal)}
                >
                  {safeLanguage === 'ar' ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </div>
          </Modal>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default NotesPage;