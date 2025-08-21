import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';

const GoalEditorModal = ({ goalEditor, setGoalEditor, language, onSave }) => {
  const isOpen = !!goalEditor;
  const isEdit = !!goalEditor?.id && goalEditor.id !== 0;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (goalEditor) {
      setTitle(goalEditor.title || '');
      setDescription(goalEditor.description || '');
      setTargetDate(goalEditor.targetDate ? goalEditor.targetDate.slice(0, 10) : '');
    }
  }, [goalEditor]);

  const handleClose = () => setGoalEditor(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: isEdit ? goalEditor.id : undefined,
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={language === 'ar' ? (isEdit ? 'تعديل هدف' : 'إضافة هدف') : (isEdit ? 'Edit Goal' : 'Add Goal')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {language === 'ar' ? 'العنوان' : 'Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {language === 'ar' ? 'الوصف' : 'Description'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {language === 'ar' ? 'تاريخ الاستهداف' : 'Target Date'}
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {language === 'ar' ? 'حفظ' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalEditorModal;