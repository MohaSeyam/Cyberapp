import React, { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Activity, Target, 
  Clock, Users, Award, Star, Zap, BarChart3 
} from 'lucide-react';
import Card from '../ui/Card';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  averageTimePerTask: number;
  totalTimeSpent: number;
  weeklyProgress: any[];
  taskTypeDistribution: any[];
  categoryDistribution: any[];
}

interface AdvancedDashboardProps {
  data: AnalyticsData;
  language: string;
  onPeriodChange?: (period: string) => void;
  selectedPeriod?: string;
}

const AdvancedDashboard = memo(({ 
  data, 
  language, 
  onPeriodChange, 
  selectedPeriod = 'all' 
}: AdvancedDashboardProps) => {
  
  const dashboardMetrics = useMemo(() => [
    {
      id: 'completion',
      title: language === 'ar' ? 'معدل الإكمال' : 'Completion Rate',
      value: `${data.completionRate}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'streak',
      title: language === 'ar' ? 'المسار الحالي' : 'Current Streak',
      value: `${data.currentStreak} ${language === 'ar' ? 'أيام' : 'days'}`,
      change: '+2',
      trend: 'up',
      icon: Activity,
      color: 'orange'
    },
    {
      id: 'efficiency',
      title: language === 'ar' ? 'متوسط الوقت' : 'Avg Time/Task',
      value: `${data.averageTimePerTask} ${language === 'ar' ? 'دقيقة' : 'min'}`,
      change: '-3.1%',
      trend: 'down',
      icon: Clock,
      color: 'green'
    },
    {
      id: 'productivity',
      title: language === 'ar' ? 'الإنتاجية' : 'Productivity',
      value: `${Math.round((data.completedTasks / data.totalTasks) * 100)}%`,
      change: '+8.7%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    }
  ], [data, language]);

  const handlePeriodChange = useCallback((period: string) => {
    onPeriodChange?.(period);
  }, [onPeriodChange]);

  const periods = useMemo(() => [
    { id: 'week', label: language === 'ar' ? 'أسبوع' : 'Week' },
    { id: 'month', label: language === 'ar' ? 'شهر' : 'Month' },
    { id: 'quarter', label: language === 'ar' ? 'ربع سنة' : 'Quarter' },
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All' }
  ], [language]);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'لوحة التحليلات المتقدمة' : 'Advanced Analytics Dashboard'}
        </h2>
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => handlePeriodChange(period.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
            orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
            green: 'text-green-600 bg-green-100 dark:bg-green-900',
            purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900'
          };
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {metric.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <Card title={language === 'ar' ? 'نظرة عامة على التقدم' : 'Progress Overview'}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.completedTasks} / {data.totalTasks}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${data.completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{language === 'ar' ? '0%' : '0%'}</span>
              <span>{language === 'ar' ? '100%' : '100%'}</span>
            </div>
          </div>
        </Card>

        {/* Time Analytics */}
        <Card title={language === 'ar' ? 'تحليل الوقت' : 'Time Analytics'}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'إجمالي الوقت المستغرق' : 'Total Time Spent'}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(data.totalTimeSpent / 60)} {language === 'ar' ? 'ساعة' : 'hours'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'متوسط الوقت لكل مهمة' : 'Average Time per Task'}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.averageTimePerTask} {language === 'ar' ? 'دقيقة' : 'minutes'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'أطول مسار' : 'Longest Streak'}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.longestStreak} {language === 'ar' ? 'أيام' : 'days'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card title={language === 'ar' ? 'رؤى الأداء' : 'Performance Insights'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.completionRate > 80 ? 'ممتاز' : data.completionRate > 60 ? 'جيد' : 'يحتاج تحسين'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {language === 'ar' ? 'مستوى الأداء' : 'Performance Level'}
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.currentStreak > data.longestStreak * 0.8 ? 'مستقر' : 'متقلب'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {language === 'ar' ? 'نمط النشاط' : 'Activity Pattern'}
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.averageTimePerTask < 30 ? 'سريع' : data.averageTimePerTask < 60 ? 'متوسط' : 'بطيء'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {language === 'ar' ? 'سرعة الإنجاز' : 'Completion Speed'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

AdvancedDashboard.displayName = 'AdvancedDashboard';

export default AdvancedDashboard;