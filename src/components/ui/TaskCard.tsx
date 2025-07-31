// Unified Task Card Component
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Edit, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Button from './Button';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  weekId: number;
  dayKey: string;
  variant?: 'default' | 'compact' | 'detailed';
  showNotes?: boolean;
  onNoteClick?: () => void;
  className?: string;
}

const taskTypeColors = {
  'Blue Team': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '🛡️' },
  'Red Team': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🔥' },
  'Soft Skills': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: '💡' },
  'Practical': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '⚡' }
};

export default function TaskCard({
  task,
  weekId,
  dayKey,
  variant = 'default',
  showNotes = true,
  onNoteClick,
  className = ''
}: TaskCardProps) {
  const { progress, updateProgress, plan } = useApp();
  const { t } = useLocalization();
  
  const colors = taskTypeColors[task.type] || taskTypeColors['Blue Team'];
  const isCompleted = progress.some(p => 
    p.weekId === weekId && p.dayKey === dayKey && p.taskId === task.id && p.done
  );

  // التحقق من إمكانية إكمال المهمة (نظام القفل)
  const canCompleteTask = () => {
    const currentWeek = plan?.find(w => w.week === weekId);
    if (!currentWeek) return false;
    
    const currentDay = currentWeek.days?.find(d => d.key === dayKey);
    if (!currentDay) return false;
    
    const currentTaskIndex = currentDay.tasks?.findIndex(t => t.id === task.id);
    if (currentTaskIndex === undefined || currentTaskIndex === -1) return false;
    
    // إذا كانت المهمة الأولى، يمكن إكمالها
    if (currentTaskIndex === 0) return true;
    
    // التحقق من إكمال جميع المهام السابقة
    for (let i = 0; i < currentTaskIndex; i++) {
      const previousTask = currentDay.tasks?.[i];
      if (!previousTask) continue;
      
      const isPreviousCompleted = progress.some(p => 
        p.weekId === weekId && p.dayKey === dayKey && p.taskId === previousTask.id && p.done
      );
      
      if (!isPreviousCompleted) {
        return false;
      }
    }
    
    return true;
  };

  const isLocked = !canCompleteTask() && !isCompleted;

  const handleToggleComplete = () => {
    if (isLocked) return;
    updateProgress(weekId, dayKey, task.id, !isCompleted);
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: isLocked ? 1 : 1.01 }}
        className={`p-3 rounded-lg border transition-all duration-200 ${
          isCompleted ? 'bg-gray-50 border-gray-200' : 
          isLocked ? 'bg-gray-100 border-gray-300 opacity-60' : 
          colors.bg + ' ' + colors.border
        } ${className}`}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleComplete}
            className={`flex-shrink-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isLocked}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isLocked ? (
              <Circle className="w-5 h-5 text-gray-300" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              isCompleted ? 'text-gray-500 line-through' : 
              isLocked ? 'text-gray-400' : 
              'text-gray-900 dark:text-gray-100'
            }`}>
              {task.description[useApp().lang]}
              {isLocked && (
                <span className="ml-2 text-xs text-gray-400">
                  🔒 {t('locked')}
                </span>
              )}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">{colors.icon}</span>
              <span className="text-xs text-gray-500">{task.duration} {t('minutes')}</span>
            </div>
          </div>

          {showNotes && onNoteClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNoteClick}
              className="flex-shrink-0 p-1"
              icon={<MessageSquare size={16} />}
            />
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        whileHover={{ scale: isLocked ? 1 : 1.02 }}
        className={`p-6 rounded-xl border-2 transition-all duration-200 shadow-lg ${
          isCompleted ? 'bg-gray-50 border-gray-200' : 
          isLocked ? 'bg-gray-100 border-gray-300 opacity-60' : 
          colors.bg + ' ' + colors.border
        } ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleComplete}
              className={`flex-shrink-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isLocked}
            >
              {isCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : isLocked ? (
                <Circle className="w-8 h-8 text-gray-300" />
              ) : (
                <Circle className="w-8 h-8 text-gray-400 hover:text-gray-600" />
              )}
            </button>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{colors.icon}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.bg}`}>
                  {task.type}
                </span>
              </div>
              <h3 className={`text-lg font-semibold ${
                isCompleted ? 'text-gray-500 line-through' : 
                isLocked ? 'text-gray-400' : 
                'text-gray-900 dark:text-gray-100'
              }`}>
                {task.description[useApp().lang]}
                {isLocked && (
                  <span className="ml-2 text-sm text-gray-400">
                    🔒 {t('locked')}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{task.duration} {t('minutes')}</span>
            </div>
            
            {showNotes && onNoteClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNoteClick}
                icon={<MessageSquare size={16} />}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>ID:</span>
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {task.id}
              </code>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {isCompleted ? t('completed') : t('pending')}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.01 }}
      className={`p-4 rounded-lg border transition-all duration-200 ${
        isCompleted ? 'bg-gray-50 border-gray-200' : 
        isLocked ? 'bg-gray-100 border-gray-300 opacity-60' : 
        colors.bg + ' ' + colors.border
      } ${className}`}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 mt-1 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isLocked}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : isLocked ? (
            <Circle className="w-5 h-5 text-gray-300" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{colors.icon}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors.text} ${colors.bg}`}>
              {task.type}
            </span>
          </div>
          
          <p className={`text-sm ${
            isCompleted ? 'text-gray-500 line-through' : 
            isLocked ? 'text-gray-400' : 
            'text-gray-900 dark:text-gray-100'
          }`}>
            {task.description[useApp().lang]}
            {isLocked && (
              <span className="ml-2 text-xs text-gray-400">
                🔒 {t('locked')}
              </span>
            )}
          </p>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{task.duration} {t('minutes')}</span>
            </div>
            
            {showNotes && onNoteClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNoteClick}
                className="p-1"
                icon={<MessageSquare size={14} />}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}