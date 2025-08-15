import React from 'react';

/**
 * مكون شريط التقدم
 * @param {number} percentage - النسبة المئوية (0-100)
 * @param {string} color - لون الشريط (اختياري)
 */
const ProgressBar = ({ percentage, color = 'bg-blue-500' }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
    <div
      className={`h-3 rounded-full transition-all duration-300 ${color}`}
      style={{ width: `${percentage}%` }}
    />
  </div>
);

export default ProgressBar;