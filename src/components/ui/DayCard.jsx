import React from 'react';

/**
 * مكون كرت اليوم
 * @param {object} day - بيانات اليوم
 * @param {number} weekNumber - رقم الأسبوع
 * @param {Array} progress - سجل التقدم
 * @param {function} onClick - دالة عند النقر على الكرت
 * @param {string} language - اللغة الحالية (اختياري)
 * @param {string} weekObjective - وصف بديل من هدف الأسبوع (اختياري)
 */
const DayCard = ({ day, weekNumber, progress, onClick, language = 'ar', weekObjective }) => {
  // إجمالي المهام من الخطة مباشرة
  const total = Array.isArray(day?.tasks) ? day.tasks.length : 0;
  // المهام المنجزة من سجل التقدم
  const completed = Array.isArray(progress)
    ? progress.filter(p => Number(p.weekId) === Number(weekNumber) && p.dayKey === day.key && p.done).length
    : 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const dayName = day.day?.[language] || day.day?.ar || day.key;
  const dayTopic = day.topic?.[language] || day.topic?.ar || '';
  const firstTaskDesc = day.tasks?.[0]?.description?.[language] || day.tasks?.[0]?.description?.ar || '';
  const brief = (firstTaskDesc || weekObjective || '').toString();
  const briefShort = brief.length > 120 ? brief.slice(0, 117) + '...' : brief;
  const isCompleted = percentage === 100;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const containerClasses = [
    'p-5',
    'rounded-xl',
    'border',
    'cursor-pointer',
    'transition-all',
    'hover:shadow-md',
    'bg-white',
    'dark:bg-gray-800',
    isCompleted ? 'border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'
  ].join(' ');

  return (
    <div
      className={containerClasses}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* العنوان وملخص اليوم */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{dayName}</h3>
        {dayTopic && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">{dayTopic}</p>
        )}
        {briefShort && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug">{briefShort}</p>
        )}
      </div>

      {/* عدد المهام */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{completed}/{total} {language === 'ar' ? 'مهام' : 'tasks'}</span>
        {isCompleted && (
          <span className="text-green-600 dark:text-green-400 font-medium">{language === 'ar' ? 'مكتمل' : 'Done'}</span>
        )}
      </div>
    </div>
  );
};

export default DayCard;