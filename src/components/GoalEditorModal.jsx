import React, { useEffect, useState, useMemo } from 'react';
import Modal from './ui/Modal';

const GoalEditorModal = ({ goalEditor, setGoalEditor, language, onSave, plan = [] }) => {
  const isOpen = !!goalEditor;
  const isEdit = !!goalEditor?.id && goalEditor.id !== 0;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [weekId, setWeekId] = useState('');
  const [dayKey, setDayKey] = useState('');
  const [taskId, setTaskId] = useState('');

  const phases = useMemo(() => plan || [], [plan]);
  const weeks = useMemo(() => {
    if (!phaseId) return [];
    return phases.filter(w => String(w.phase) === String(phaseId));
  }, [phases, phaseId]);
  const days = useMemo(() => {
    if (!weekId) return [];
    const week = phases.find(w => String(w.week) === String(weekId));
    return week?.days || [];
  }, [phases, weekId]);
  const tasks = useMemo(() => {
    if (!dayKey) return [];
    const week = phases.find(w => String(w.week) === String(weekId));
    const day = week?.days?.find(d => d.key === dayKey);
    return day?.tasks || [];
  }, [phases, weekId, dayKey]);

  useEffect(() => {
    if (goalEditor) {
      setTitle(goalEditor.title || '');
      setDescription(goalEditor.description || '');
      setTargetDate(goalEditor.targetDate ? goalEditor.targetDate.slice(0, 10) : '');
      setPhaseId(goalEditor.linked?.phaseId || '');
      setWeekId(goalEditor.linked?.weekId || '');
      setDayKey(goalEditor.linked?.dayKey || '');
      setTaskId(goalEditor.linked?.taskId || '');
    }
  }, [goalEditor]);

  useEffect(() => {
    // reset dependent fields when upper selection changes
    setWeekId('');
    setDayKey('');
    setTaskId('');
  }, [phaseId]);

  useEffect(() => {
    setDayKey('');
    setTaskId('');
  }, [weekId]);

  useEffect(() => {
    setTaskId('');
  }, [dayKey]);

  const handleClose = () => setGoalEditor(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: isEdit ? goalEditor.id : undefined,
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
      linked: phaseId && weekId && dayKey && taskId ? { phaseId: Number(phaseId), weekId: Number(weekId), dayKey, taskId: Number(taskId) } : null,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {language === 'ar' ? 'ربط بمهمة من الخطة (اختياري)' : 'Link to Plan Task (optional)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select value={phaseId} onChange={(e) => setPhaseId(e.target.value)} className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">{language === 'ar' ? 'اختر المرحلة' : 'Select Phase'}</option>
                {Array.from(new Set(phases.map(w => w.phase))).map(pid => (
                  <option key={pid} value={pid}>{language === 'ar' ? `المرحلة ${pid}` : `Phase ${pid}`}</option>
                ))}
              </select>
              <select value={weekId} onChange={(e) => setWeekId(e.target.value)} disabled={!phaseId} className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">{language === 'ar' ? 'اختر الأسبوع' : 'Select Week'}</option>
                {weeks.map(w => (
                  <option key={w.week} value={w.week}>{language === 'ar' ? `الأسبوع ${w.week}` : `Week ${w.week}`}</option>
                ))}
              </select>
              <select value={dayKey} onChange={(e) => setDayKey(e.target.value)} disabled={!weekId} className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white col-span-2">
                <option value="">{language === 'ar' ? 'اختر اليوم' : 'Select Day'}</option>
                {days.map(d => (
                  <option key={d.key} value={d.key}>{d.title?.[language] || d.title?.en || d.key}</option>
                ))}
              </select>
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={!dayKey} className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white col-span-2">
                <option value="">{language === 'ar' ? 'اختر المهمة' : 'Select Task'}</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.description?.[language] || t.description?.en || `Task ${t.id}`}</option>
                ))}
              </select>
            </div>
          </div>
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