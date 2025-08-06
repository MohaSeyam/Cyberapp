import Card from '../ui/Card';
import React from 'react';
import { BarChart3, TrendingUp, PieChart, LineChart, Activity, Target, Clock, Users, CheckCircle } from 'lucide-react';

const EnhancedAnalyticsTab = React.memo(({ plan, progress, stats, language, colorClassMap }) => {
  // Calculate analytics data
  const analyticsData = React.useMemo(() => {
    if (!plan || !progress) return null;

    const totalTasks = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length;
    const completedTasks = progress.filter(p => p.done).length;
    const totalDuration = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).reduce((sum, task) => sum + (task.duration || 0), 0);
    const completedDuration = progress.filter(p => p.done).reduce((sum, p) => {
      const task = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
      return sum + (task?.duration || 0);
    }, 0);

    // Task type distribution
    const taskTypes = {};
    plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).forEach(task => {
      taskTypes[task.type] = (taskTypes[task.type] || 0) + 1;
    });

    // Weekly progress
    const weeklyProgress = plan.map((week, index) => {
      const weekTasks = week.days.flatMap(day => day.tasks);
      const completedWeekTasks = progress.filter(p => 
        p.done && weekTasks.some(task => task.id === p.taskId)
      ).length;
      
      return {
        week: `Week ${week.week}`,
        completed: completedWeekTasks,
        total: weekTasks.length,
        percentage: weekTasks.length > 0 ? (completedWeekTasks / weekTasks.length) * 100 : 0
      };
    });

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalDuration,
      completedDuration,
      timeEfficiency: totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0,
      taskTypes,
      weeklyProgress
    };
  }, [plan, progress]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'ar' ? 'جاري تحليل البيانات...' : 'Analyzing data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">{language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{analyticsData.completionRate.toFixed(1)}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">{language === 'ar' ? 'كفاءة الوقت' : 'Time Efficiency'}</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{analyticsData.timeEfficiency.toFixed(1)}%</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">{language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{analyticsData.completedTasks}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">{language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}</p>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{analyticsData.totalTasks}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Task Type Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'توزيع أنواع المهام' : 'Task Type Distribution'}
          </h3>
          <PieChart className="w-6 h-6 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analyticsData.taskTypes).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{type}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {((count / analyticsData.totalTasks) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'التقدم الأسبوعي' : 'Weekly Progress'}
          </h3>
          <TrendingUp className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-4">
          {analyticsData.weeklyProgress.map((week, index) => (
            <div key={week.week} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{week.week}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {week.completed} / {week.total} {language === 'ar' ? 'مهمة' : 'tasks'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${week.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
                  {week.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

export default EnhancedAnalyticsTab;