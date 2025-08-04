import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import ProgressChart from '../charts/ProgressChart';
import PieChartComponent from '../charts/PieChart';
import { animations } from '../../constants/theme';

export default function ProgressAnalytics() {
  const { plan, progress, appState } = useApp();
  const { language } = useLocalization();

  const progressData = useMemo(() => {
    if (!plan || !progress) return [];
    
    const data = [];
    plan.forEach(week => {
      week.days.forEach(day => {
        const dayProgress = progress.filter(p => p.dayKey === day.dayKey);
        const completed = dayProgress.filter(p => p.done).length;
        const total = day.tasks.length;
        
        data.push({
          day: language === 'ar' ? day.day.ar : day.day.en,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        });
      });
    });
    
    return data;
  }, [plan, progress, language]);

  const pieData = useMemo(() => {
    if (!plan) return [];
    
    const taskTypes = {};
    plan.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach(task => {
          taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
        });
      });
    });
    
    return Object.entries(taskTypes).map(([type, count]) => ({
      name: type,
      value: count,
      color: getTaskTypeColor(type)
    }));
  }, [plan]);

  const getTaskTypeColor = (type: string) => {
    switch(type) {
      case 'Blue Team': return '#3B82F6';
      case 'Red Team': return '#EF4444';
      case 'Soft Skills': return '#F59E0B';
      case 'Practical': return '#10B981';
      default: return '#6B7280';
    }
  };

  const safeT = (key: string) => {
    const translations = {
      analytics: { ar: 'التحليلات', en: 'Analytics' },
      taskTypesDistribution: { ar: 'توزيع أنواع المهام', en: 'Task Types Distribution' },
      distributionOfCompletedTasks: { ar: 'توزيع المهام المكتملة', en: 'Distribution of completed tasks' },
      blueteam: { ar: 'الفريق الأزرق', en: 'Blue Team' },
      redteam: { ar: 'الفريق الأحمر', en: 'Red Team' },
      practical: { ar: 'عملي', en: 'Practical' },
      theoretical: { ar: 'نظري', en: 'Theoretical' },
      policies: { ar: 'السياسات', en: 'Policies' }
    };
    return translations[key]?.[language] || key;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {safeT('analytics')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {safeT('trackYourLearning')}
        </p>
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Progress Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {safeT('progress')}
            </h3>
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="h-64">
            <ProgressChart data={progressData} />
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {safeT('taskTypesDistribution')}
            </h3>
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="h-64">
            <PieChartComponent data={pieData} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}