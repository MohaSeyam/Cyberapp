import React from 'react';
import Card from '../ui/Card';
import { motion } from 'framer-motion';

const EnhancedOverviewTab = React.memo(({ stats, language, safeT, colorClassMap, gradientClassMap }) => {
  const overviewMetrics = [
    {
      label: language === 'ar' ? 'معدل الإكمال' : 'Completion Rate',
      value: stats.completionRate + '%',
      icon: stats.icons.completion,
      color: 'blue',
      progress: stats.completionRate,
      description: language === 'ar' ? 'نسبة المهام المكتملة' : 'Percentage of completed tasks',
    },
    {
      label: language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks',
      value: stats.completedTasksCount,
      icon: stats.icons.completed,
      color: 'green',
      progress: 100,
      description: language === 'ar' ? 'عدد المهام المنتهية' : 'Number of finished tasks',
    },
    {
      label: language === 'ar' ? 'الوقت المستغرق' : 'Time Spent',
      value: stats.completedDuration + ' دقيقة',
      icon: stats.icons.time,
      color: 'purple',
      progress: Math.min(100, Math.round((stats.completedDuration / stats.totalDuration) * 100)),
      description: language === 'ar' ? 'الوقت المستغرق في التعلم' : 'Time spent learning',
    },
    {
      label: language === 'ar' ? 'المسار الحالي' : 'Current Streak',
      value: stats.streaks.current,
      icon: stats.icons.streak,
      color: 'orange',
      progress: Math.min(100, Math.round((stats.streaks.current / stats.streaks.longest) * 100)),
      description: language === 'ar' ? 'أيام التعلم المتتالية' : 'Consecutive learning days',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewMetrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientClassMap[metric.color]} opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
              {/* Content */}
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${colorClassMap[metric.color]?.bg100} ${colorClassMap[metric.color]?.bg800} rounded-full`}>
                    <Icon className={`w-6 h-6 ${colorClassMap[metric.color]?.text600} dark:${colorClassMap[metric.color]?.text400}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {metric.label}
                    </div>
                  </div>
                </div>
                {/* Progress Ring */}
                <div className="relative w-16 h-16 mx-auto">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200 dark:text-gray-700"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={colorClassMap[metric.color]?.text500}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${metric.progress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {Math.round(metric.progress)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {metric.description}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
});

export default EnhancedOverviewTab;