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
 */
const DayCard = ({ day, weekNumber, progress, onClick, language = 'ar' }) => {
  const { completed, total, percentage } = getDayCompletion(weekNumber, day.key, progress);
  return (
    <div
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 mb-4">
        {/* اسم اليوم */}
        <span className="font-semibold text-lg text-gray-800 dark:text-white">
          {day.day?.[language] || day.day?.ar || day.key}
        </span>
        {/* عدد المهام المنجزة */}
        <div className="ml-auto flex flex-col items-end">
          <span className="text-xs text-gray-500 dark:text-gray-400">عدد المهام</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{completed}/{total}</span>
        </div>
      </div>
      {/* شريط التقدم */}
      <ProgressBar percentage={percentage} />
    </div>
  );
};

export default DayCard;