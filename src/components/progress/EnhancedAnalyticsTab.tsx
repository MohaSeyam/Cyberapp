import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import PieChart from '../charts/PieChart';
import { 
  TrendingUp, Calendar, Clock, Target, 
  CheckCircle, Activity, BarChart3, LineChart, Trophy, Flame
} from 'lucide-react';

const EnhancedAnalyticsTab = React.memo(({ plan, progress, stats, language, colorClassMap }) => {
  // Task Types Distribution
  const pieData = useMemo(() => {
    const taskTypes = {};
    plan.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach(task => {
          const type = task.type;
          if (!taskTypes[type]) taskTypes[type] = 0;
          if (progress.some(p => p.taskId === task.id && p.done)) taskTypes[type]++;
        });
      });
    });
    return Object.entries(taskTypes).map(([type, count], i) => ({
      id: type,
      label: type,
      value: count,
      color: Object.keys(colorClassMap)[i % Object.keys(colorClassMap).length],
    }));
  }, [plan, progress, colorClassMap]);

  // Weekly Progress Data
  const weeklyProgress = useMemo(() => {
    return plan.map((week, index) => {
      const totalTasks = week.days.reduce((sum, day) => sum + (day.tasks?.length || 0), 0);
      const completedTasks = week.days.reduce((sum, day) => {
        return sum + (day.tasks?.filter(task => 
          progress.some(p => p.taskId === task.id && p.done)
        ).length || 0);
      }, 0);
      
      return {
        week: week.week,
        total: totalTasks,
        completed: completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    });
  }, [plan, progress]);

  // Learning Streak Analysis
  const streakAnalysis = useMemo(() => {
    const sortedProgress = progress
      .filter(p => p.done)
      .sort((a, b) => new Date(a.dayKey) - new Date(b.dayKey));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;
    
    sortedProgress.forEach(p => {
      const currentDate = new Date(p.dayKey);
      if (lastDate) {
        const diffDays = (currentDate - lastDate) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      lastDate = currentDate;
    });
    
    currentStreak = tempStreak;
    
    return {
      current: currentStreak,
      longest: longestStreak,
      average: Math.round(sortedProgress.length / Math.max(1, sortedProgress.length / 7))
    };
  }, [progress]);

  // Performance Metrics
  const performanceMetrics = [
    {
      title: language === 'ar' ? 'معدل الإكمال الأسبوعي' : 'Weekly Completion Rate',
      value: `${Math.round(weeklyProgress.reduce((sum, week) => sum + week.percentage, 0) / weeklyProgress.length)}%`,
      icon: TrendingUp,
      color: 'blue',
      trend: '+5%',
      description: language === 'ar' ? 'متوسط الإكمال الأسبوعي' : 'Average weekly completion'
    },
    {
      title: language === 'ar' ? 'أفضل أسبوع' : 'Best Week',
      value: `Week ${weeklyProgress.reduce((best, week) => week.percentage > best.percentage ? week : best).week}`,
      icon: Trophy,
      color: 'green',
      trend: '100%',
      description: language === 'ar' ? 'أعلى معدل إكمال' : 'Highest completion rate'
    },
    {
      title: language === 'ar' ? 'المسار الحالي' : 'Current Streak',
      value: `${streakAnalysis.current} ${language === 'ar' ? 'يوم' : 'days'}`,
      icon: Flame,
      color: 'orange',
      trend: `+${streakAnalysis.current - streakAnalysis.longest}`,
      description: language === 'ar' ? 'أيام التعلم المتتالية' : 'Consecutive learning days'
    },
    {
      title: language === 'ar' ? 'المتوسط اليومي' : 'Daily Average',
      value: `${streakAnalysis.average} ${language === 'ar' ? 'مهمة' : 'tasks'}`,
      icon: Activity,
      color: 'purple',
      trend: '+2',
      description: language === 'ar' ? 'متوسط المهام اليومية' : 'Average daily tasks'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${colorClassMap[metric.color]?.bg100} ${colorClassMap[metric.color]?.bg800} rounded-xl shadow-lg`}>
                      <Icon className={`w-6 h-6 ${colorClassMap[metric.color]?.text600} dark:${colorClassMap[metric.color]?.text400}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {metric.trend}
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {metric.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {metric.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'توزيع أنواع المهام' : 'Task Types Distribution'}
              </h3>
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <PieChart data={pieData} title={language === 'ar' ? 'أنواع المهام' : 'Task Types'} />
          </Card>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'التقدم الأسبوعي' : 'Weekly Progress'}
              </h3>
              <LineChart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-4">
              {weeklyProgress.slice(0, 8).map((week, index) => (
                <div key={week.week} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? `الأسبوع ${week.week}` : `Week ${week.week}`}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {week.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${
                        week.percentage >= 80 ? 'bg-green-500' :
                        week.percentage >= 60 ? 'bg-yellow-500' :
                        week.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${week.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {week.completed}/{week.total} {language === 'ar' ? 'مهمة' : 'tasks'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Streak Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تحليل المسار' : 'Streak Analysis'}
            </h3>
            <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {streakAnalysis.current}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'ar' ? 'المسار الحالي' : 'Current Streak'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {streakAnalysis.longest}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'ar' ? 'أطول مسار' : 'Longest Streak'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {streakAnalysis.average}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'ar' ? 'المتوسط اليومي' : 'Daily Average'}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
});

export default EnhancedAnalyticsTab;