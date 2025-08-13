// دوال حساب التقدم (اليوم والأسبوع) بشكل عام وقابل لإعادة الاستخدام

/**
 * حساب تقدم اليوم
 * @param {number} weekNumber
 * @param {string} dayKey
 * @param {Array} progress - سجل التقدم
 * @returns {{completed: number, total: number, percentage: number}}
 */
export function getDayCompletion(weekNumber, dayKey, progress) {
  const dayProgress = progress.filter(p => Number(p.weekId) === Number(weekNumber) && p.dayKey === dayKey);
  const completedTasks = dayProgress.filter(p => p.done).length;
  const totalTasks = dayProgress.length;
  return {
    completed: completedTasks,
    total: totalTasks,
    percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}

/**
 * حساب تقدم الأسبوع
 * @param {number} weekNumber
 * @param {Array} plan - بيانات الخطة
 * @param {Array} progress - سجل التقدم
 * @returns {{completed: number, total: number, percentage: number}}
 */
export function getWeekCompletion(weekNumber, plan, progress) {
  const week = plan.find(w => w.week === weekNumber);
  if (!week) return { completed: 0, total: 0, percentage: 0 };
  const totalTasks = week.days?.filter(day => day.key !== 'fri').reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
  const weekProgress = progress.filter(p => Number(p.weekId) === Number(weekNumber));
  const completedTasks = weekProgress.filter(p => p.done).length;
  return {
    completed: completedTasks,
    total: totalTasks,
    percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}