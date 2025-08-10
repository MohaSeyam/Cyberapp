import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, Trash2, Tag, Calendar, Share2, Copy, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const NoteViewPage = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  
  // Safe access to useLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;
  const isRTL = language === 'ar';

  // Safe access to useApp
  let appData;
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useApp:', error);
    appData = {
      notes: [],
      deleteNote: async () => {}
    };
  }
  const { notes, deleteNote } = appData;

  // Ensure data is available
  const safeNotes = Array.isArray(notes) ? notes : [];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const note = safeNotes.find(n => n.id === parseInt(noteId));

  if (!note) {
    return (
      <PageLayout title={language === 'ar' ? 'ملاحظة غير موجودة' : 'Note Not Found'}>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {language === 'ar' ? 'الملاحظة المطلوبة غير موجودة' : 'The requested note was not found'}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/notes')}
          >
            {language === 'ar' ? 'العودة للملاحظات' : 'Back to Notes'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying content:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        });
      } catch (error) {
        console.error('Error sharing note:', error);
      }
    } else {
      handleCopyContent();
    }
  };

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    }
  };

  return (
    <PageLayout
      title={language === 'ar' ? 'عرض الملاحظة' : 'View Note'}
      showBottomBar={false}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={() => navigate('/notes')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {language === 'ar' ? 'العودة للملاحظات' : 'Back to Notes'}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              icon={copied ? <Check /> : <Copy />}
              onClick={handleCopyContent}
              className={copied ? 'text-green-600 dark:text-green-400' : ''}
            >
              {copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}
            </Button>
            <Button
              variant="outline"
              icon={<Share2 />}
              onClick={handleShare}
            >
              {language === 'ar' ? 'مشاركة' : 'Share'}
            </Button>
            <Button
              variant="outline"
              icon={<Edit />}
              onClick={() => navigate(`/notes/${noteId}/edit`)}
            >
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 />}
              onClick={() => setShowDeleteModal(true)}
            >
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Note Content */}
        <Card className="p-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {note.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(note.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                {note.updatedAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(note.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'التاقات:' : 'Tags:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div 
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
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
                onClick={() => setShowDeleteModal(false)}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
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

export default NoteViewPage;