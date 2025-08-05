import React from 'react';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import RichTextEditor from '../editors/RichTextEditor';

interface JournalForm {
  title: string;
  content: string;
  tags: string[];
}

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any | null;
  journalForm: JournalForm;
  setJournalForm: (form: JournalForm) => void;
  onSave: () => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  t: (key: string) => string;
  isSaving?: boolean;
}

const JournalModal = React.memo(({
  isOpen,
  onClose,
  entry,
  journalForm,
  setJournalForm,
  onSave,
  addTag,
  removeTag,
  t,
  isSaving = false
}: JournalModalProps) => {
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      const tag = input.value.trim();
      if (tag) {
        addTag(tag);
        input.value = '';
      }
    }
  };

  const handleAddTagButton = () => {
    const input = document.getElementById('journal-tag-input') as HTMLInputElement;
    const tag = input.value.trim();
    if (tag) {
      addTag(tag);
      input.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? t('editJournalEntry') : t('addJournalEntry')}
      size="xl"
    >
      <div className="space-y-4 pb-20">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('entryTitle')}
          </label>
          <input
            type="text"
            value={journalForm.title}
            onChange={(e) => setJournalForm({ ...journalForm, title: e.target.value })}
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
              {journalForm.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-blue-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                id="journal-tag-input"
                type="text"
                placeholder={t('addTag')}
                onKeyPress={handleAddTag}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTagButton}
              >
                {t('add')}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('entryContent')}
          </label>
          <RichTextEditor
            content={journalForm.content}
            onChange={(content) => setJournalForm({ ...journalForm, content })}
            placeholder={t('writeJournalEntry')}
            lang={t}
            minHeight="400px"
          />
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t z-20 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!journalForm.title.trim() || !journalForm.content.trim() || isSaving}
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('saving')}</span>
              </div>
            ) : (
              entry ? t('updateEntry') : t('saveEntry')
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

export default JournalModal;