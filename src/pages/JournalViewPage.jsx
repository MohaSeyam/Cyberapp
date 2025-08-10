import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, Trash2, Calendar, Share2, Copy, Check, Smile, Meh, Frown
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const JournalViewPage = () => {
  const navigate = useNavigate();
  const { entryId } = useParams();
  
  // Safe access to useSimpleLocalization
  let localizationData;
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
  const { language } = localizationData;
  const isRTL = language === 'ar';

  // Safe access to useApp
  let appData;
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useApp:', error);
    appData = {
      journalEntries: [],
      deleteJournalEntry: async () => {}
    };
  }
  const { journalEntries, deleteJournalEntry } = appData;

  // Ensure data is available
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const entry = safeJournalEntries.find(e => e.id === parseInt(entryId));

  if (!entry) {
    return (
      <PageLayout title={language === 'ar' ? 'مدونة غير موجودة' : 'Journal Entry Not Found'}>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {language === 'ar' ? 'المدونة المطلوبة غير موجودة' : 'The requested journal entry was not found'}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/journal')}
          >
            {language === 'ar' ? 'العودة للمدونات' : 'Back to Journal'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteJournalEntry(entry.id);
      navigate('/journal');
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(entry.content);
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
          title: entry.title,
          text: entry.content,
        });
      } catch (error) {
        console.error('Error sharing journal entry:', error);
      }
    } else {
      handleCopyContent();
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'happy':
        return <Smile className="w-6 h-6 text-green-500" />;
      case 'sad':
        return <Frown className="w-6 h-6 text-red-500" />;
      default:
        return <Meh className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getMoodLabel = (mood) => {
    switch (mood) {
      case 'happy':
        return language === 'ar' ? 'سعيد' : 'Happy';
      case 'sad':
        return language === 'ar' ? 'حزين' : 'Sad';
      default:
        return language === 'ar' ? 'عادي' : 'Neutral';
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
      title={language === 'ar' ? 'عرض المدونة' : 'View Journal Entry'}
      showBottomBar={false}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft />}
            onClick={() => navigate('/journal')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {language === 'ar' ? 'العودة للمدونات' : 'Back to Journal'}
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
              onClick={() => navigate(`/journal/${entryId}/edit`)}
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

        {/* Journal Entry Content */}
        <Card className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {entry.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'التاريخ:' : 'Date:'} {new Date(entry.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {getMoodIcon(entry.mood)}
                  <span>{getMoodLabel(entry.mood)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div 
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>

          {/* Footer Meta */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(entry.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                {entry.updatedAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(entry.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
                ? 'هل أنت متأكد من حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this journal entry? This action cannot be undone.'
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

export default JournalViewPage;