import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Activity, BookOpen, Target, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';

const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>{icon}</div>
      </div>
    </Card>
  </motion.div>
);

const ProgressBar = ({ progress, label, color = 'blue' }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`} style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export default function OverviewTab({ language, progressStats, phaseProgressList, filteredProgress, safePlan }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
          title={language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
          value={`${progressStats.completedCount}/${progressStats.totalCount}`}
          subtitle={`${Math.round(progressStats.completionRate)}% ${language === 'ar' ? 'مكتمل' : 'complete'}`}
          color="green"
        />
        <StatCard
          icon={<Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
          title={language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
          value={progressStats.averageRating > 0 ? progressStats.averageRating.toFixed(1) : '0.0'}
          subtitle={language === 'ar' ? 'من 5 نجوم' : 'out of 5 stars'}
          color="yellow"
        />
        <StatCard
          icon={<Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          title={language === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activity'}
          value={progressStats.currentStreak}
          subtitle={language === 'ar' ? 'مهمة مكتملة هذا الأسبوع' : 'tasks completed this week'}
          color="blue"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          title={language === 'ar' ? 'المحتوى المنشأ' : 'Content Created'}
          value={progressStats.notesCount + progressStats.journalCount}
          subtitle={`${progressStats.notesCount} ${language === 'ar' ? 'ملاحظة' : 'notes'}, ${progressStats.journalCount} ${language === 'ar' ? 'مدونة' : 'entries'}`}
          color="purple"
        />
      </div>

      {/* Phase Progress */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'تقدم المراحل' : 'Phase Progress'}</h2>
        </div>
        <div className="space-y-6">
          {phaseProgressList.map((phase, index) => (
            <motion.div key={phase.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{phase.title?.[language] || phase.title?.en || `Phase ${phase.id}`}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{phase.completedTasks}/{phase.totalTasks} {language === 'ar' ? 'مهمة' : 'tasks'}</span>
                </div>
                <ProgressBar progress={phase.progress} label="" color={phase.progress >= 100 ? 'green' : phase.progress >= 50 ? 'yellow' : 'blue'} />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}</h2>
        </div>
        <div className="space-y-4">
          {filteredProgress.filter(p => p.done).slice(0, 5).map((progressItem, index) => {
            const week = safePlan.find(w => String(w.week) === String(progressItem.weekId));
            const day = week?.days?.find(d => d.key === progressItem.dayKey);
            const task = day?.tasks?.find(t => String(t.id) === String(progressItem.taskId));
            return (
              <motion.div key={progressItem.id || `${progressItem.weekId}-${progressItem.dayKey}-${progressItem.taskId}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task?.description?.[language] || task?.description?.en || `Task ${progressItem.taskId}`}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'ar' ? 'مكتمل' : 'Completed'}</p>
                </div>
              </motion.div>
            );
          })}

          {filteredProgress.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{language === 'ar' ? 'لا توجد مهام مكتملة بعد' : 'No completed tasks yet'}</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}