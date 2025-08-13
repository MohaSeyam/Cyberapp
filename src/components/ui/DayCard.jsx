import React from 'react';
import ProgressBar from './ProgressBar';
import { getDayCompletion } from '../../utils/progress';

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
  const { completed, total, percentage } = getDayCompletion(weekNumber, day.key, progress);

  const dayName = day.day?.[language] || day.day?.ar || day.key;
  const dayTopic = day.topic?.[language] || day.topic?.ar || '';
  const firstTaskDesc = day.tasks?.[0]?.description?.[language] || day.tasks?.[0]?.description?.ar || '';
  const brief = (firstTaskDesc || weekObjective || '').toString();
  const briefShort = brief.length > 120 ? brief.slice(0, 117) + '...' : brief;
  const isCompleted = percentage === 100;

  return (
    <div
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
      onClick={onClick}
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

      {/* شريط التقدم والنِسَب */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">{language === 'ar' ? 'التقدم' : 'Progress'}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{percentage}%</span>
        </div>
        <ProgressBar percentage={percentage} color={isCompleted ? 'bg-green-500' : 'bg-blue-500'} />
      </div>

      {/* عدد المهام */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{completed}/{total} {language === 'ar' ? 'مهام' : 'tasks'}</span>
      </div>
    </div>
  );
};

export default DayCard;