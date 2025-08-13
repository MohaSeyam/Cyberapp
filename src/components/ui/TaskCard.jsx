import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, MessageSquare } from 'lucide-react';
import { useSimpleApp } from '../../context/SimpleAppContext';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import Button from './Button';

// ألوان وأنماط حسب نوع المهمة
const taskTypeColors = {
  'Blue Team': { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200', icon: '🛡️' },
  'Red Team': { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700', text: 'text-red-800 dark:text-red-200', icon: '🔥' },
  'Soft Skills': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200', icon: '💡' },
  'Practical': { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', text: 'text-green-800 dark:text-green-200', icon: '⚡' },
  'Policies': { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-200', icon: '📜' },
  'Career': { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-200', icon: '🚀' }
};

function TaskCard({
  task,
  weekId,
  dayKey,
  variant = 'default',
  showNotes = true,
  onNoteClick,
  className = '',
  dayTasks // اختياري: مصفوفة مهام اليوم كاملة لحساب القفل حسب الترتيب
}) {
  const { progress, updateProgress } = useSimpleApp();
  const { language } = useSimpleLocalization();

  const t = (key) => {
    const ar = {
      minutes: 'دقيقة',
      locked: 'مقفل',
      addNote: 'إضافة ملاحظة',
      completed: 'منجز',
      inProgress: 'قيد التنفيذ'
    };
    const en = {
      minutes: 'min',
      locked: 'Locked',
      addNote: 'Add Note',
      completed: 'Completed',
      inProgress: 'In Progress'
    };
    return (language === 'ar' ? ar[key] : en[key]) || key;
  };

  const colors = taskTypeColors[task.type] || taskTypeColors['Blue Team'];
  const isCompleted = Array.isArray(progress) && progress.some(p => 
    p.weekId === weekId && p.dayKey === dayKey && p.taskId === task.id && p.done
  );

  // حساب إمكانية الإكمال (القفل) اعتماداً على ترتيب المهمة ضمن dayTasks إن توفرت
  const canCompleteTask = () => {
    if (!Array.isArray(dayTasks) || dayTasks.length === 0) return true;
    const currentTaskIndex = dayTasks.findIndex(t => t.id === task.id);
    if (currentTaskIndex <= 0) return true;
    // يجب أن تكون جميع المهام السابقة مكتملة
    for (let i = 0; i < currentTaskIndex; i++) {
      const prev = dayTasks[i];
      const prevDone = Array.isArray(progress) && progress.some(p => p.weekId === weekId && p.dayKey === dayKey && p.taskId === prev.id && p.done);
      if (!prevDone) return false;
    }
    return true;
  };

  const isLocked = !canCompleteTask() && !isCompleted;
  const [glow, setGlow] = useState(false);

  const handleToggleComplete = () => {
    if (isLocked) return;
    updateProgress(weekId, dayKey, task.id, !isCompleted, task.phaseId);
    setGlow(true);
    setTimeout(() => setGlow(false), 800);
  };

  const BaseWrapper = ({ children, hoverScale = 1.01 }) => (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : hoverScale }}
      animate={isCompleted ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border transition-all duration-200 shadow-sm ${
        isCompleted ? 'bg-green-50 border-green-200 shadow' : 
        isLocked ? 'bg-gray-100 border-gray-300 opacity-60' : 
        `${colors.bg} ${colors.border}`
      } ${glow ? 'ring-2 ring-green-300' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );

  if (variant === 'compact') {
    return (
      <BaseWrapper hoverScale={1.01}>
        <div className="p-3 flex items-center gap-3">
          <button onClick={handleToggleComplete} className={`flex-shrink-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={isLocked}>
            {isCompleted ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-400" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-relaxed ${
              isCompleted ? 'text-gray-500 line-through' : isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'
            }`}>
              {task.description?.[language] || task.description?.ar || ''}
              {isLocked && <span className="ml-2 text-xs text-gray-400">🔒 {t('locked')}</span>}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{task.duration} {t('minutes')}</span>
            </div>
          </div>
          {showNotes && onNoteClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNoteClick}
              className="flex-shrink-0 p-1 border-2 border-blue-300 dark:border-yellow-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              icon={<MessageSquare size={16} className="text-blue-600 dark:text-yellow-300" />}
              title={t('addNote')}
            />
          )}
        </div>
      </BaseWrapper>
    );
  }

  if (variant === 'detailed') {
    return (
      <BaseWrapper hoverScale={1.02}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={handleToggleComplete} className={`flex-shrink-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={isLocked}>
                {isCompleted ? <CheckCircle className="w-8 h-8 text-green-600" /> : <Circle className="w-8 h-8 text-gray-400" />}
              </button>
              <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through' : isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {task.description?.[language] || task.description?.ar || ''}
                {isLocked && <span className="ml-2 text-sm text-gray-400">🔒 {t('locked')}</span>}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{task.duration} {t('minutes')}</span>
              </div>
              {showNotes && onNoteClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNoteClick}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-blue-300 dark:border-yellow-400"
                  icon={<MessageSquare size={18} className="text-blue-600 dark:text-yellow-300" />}
                  title={t('addNote')}
                />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>{isCompleted ? t('completed') : t('inProgress')}</div>
          </div>
        </div>
      </BaseWrapper>
    );
  }

  // Default
  return (
    <BaseWrapper hoverScale={1.01}>
      <div className="p-4 flex items-start gap-3">
        <button onClick={handleToggleComplete} className={`flex-shrink-0 mt-1 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={isLocked}>
          {isCompleted ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-400" />}
        </button>
        <div className="flex-1 min-w-0">

          <p className={`text-sm font-bold leading-relaxed tracking-wide ${isCompleted ? 'text-gray-500 line-through' : isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {task.description?.[language] || task.description?.ar || ''}
            {isLocked && <span className="ml-2 text-xs text-gray-400">🔒 {t('locked')}</span>}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{task.duration} {t('minutes')}</span>
            </div>
            {showNotes && onNoteClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNoteClick}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-blue-300 dark:border-yellow-400"
                icon={<MessageSquare size={16} className="text-blue-600 dark:text-yellow-300" />}
                title={t('addNote')}
              />
            )}
          </div>
        </div>
      </div>
    </BaseWrapper>
  );
}

const TaskCardWithMemo = memo(TaskCard);
export default TaskCardWithMemo;