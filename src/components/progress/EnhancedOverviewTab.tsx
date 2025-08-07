import React from 'react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { 
  TrendingUp, CheckCircle, Clock, Flame, 
  Target, Award, Star, Zap, Activity
} from 'lucide-react';

const EnhancedOverviewTab = React.memo(({ stats, language, safeT, colorClassMap, gradientClassMap }) => {
  const metrics = [
    {
      label: language === 'ar' ? 'معدل الإكمال' : 'Completion Rate',
      value: stats.completionRate + '%',
      icon: TrendingUp,
      color: 'blue',
      progress: stats.completionRate,
      description: language === 'ar' ? 'نسبة المهام المكتملة' : 'Percentage of completed tasks',
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      label: language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks',
      value: stats.completedTasksCount,
      icon: CheckCircle,
      color: 'green',
      progress: 100,
      description: language === 'ar' ? 'عدد المهام المنتهية' : 'Number of finished tasks',
      trend: '+5',
      trendDirection: 'up'
    },
    {
      label: language === 'ar' ? 'الوقت المستغرق' : 'Time Spent',
      value: stats.completedDuration + ' دقيقة',
      icon: Clock,
      color: 'purple',
      progress: Math.min(100, Math.round((stats.completedDuration / stats.totalDuration) * 100)),
      description: language === 'ar' ? 'الوقت المستغرق في التعلم' : 'Time spent learning',
      trend: '+45min',
      trendDirection: 'up'
    },
    {
      label: language === 'ar' ? 'المسار الحالي' : 'Current Streak',
      value: stats.streaks.current,
      icon: Flame,
      color: 'orange',
      progress: Math.min(100, Math.round((stats.streaks.current / stats.streaks.longest) * 100)),
      description: language === 'ar' ? 'أيام التعلم المتتالية' : 'Consecutive learning days',
      trend: '+2',
      trendDirection: 'up'
    },
  ];

  const achievements = [
    {
      title: language === 'ar' ? 'أول أسبوع مكتمل' : 'First Week Complete',
      description: language === 'ar' ? 'أكملت أسبوعك الأول بنجاح' : 'Successfully completed your first week',
      icon: Star,
      color: 'yellow',
      unlocked: stats.completedTasksCount >= 10
    },
    {
      title: language === 'ar' ? 'متعلم نشط' : 'Active Learner',
      description: language === 'ar' ? 'تعلمت لمدة 7 أيام متتالية' : 'Learned for 7 consecutive days',
      icon: Zap,
      color: 'blue',
      unlocked: stats.streaks.current >= 7
    },
    {
      title: language === 'ar' ? 'معدل إكمال عالي' : 'High Completion Rate',
      description: language === 'ar' ? 'حقق معدل إكمال 80% أو أكثر' : 'Achieved 80% or higher completion rate',
      icon: Award,
      color: 'green',
      unlocked: stats.completionRate >= 80
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClassMap[metric.color]} opacity-10 group-hover:opacity-20 transition-all duration-500`} />
                
                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${colorClassMap[metric.color]?.bg100} ${colorClassMap[metric.color]?.bg800} rounded-xl shadow-lg`}>
                      <Icon className={`w-6 h-6 ${colorClassMap[metric.color]?.text600} dark:${colorClassMap[metric.color]?.text400}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {metric.label}
                      </div>
                      {metric.trend && (
                        <div className={`text-xs font-medium mt-1 ${
                          metric.trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {metric.trend}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Ring */}
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className={colorClassMap[metric.color]?.text500}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${metric.progress}, 100` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {Math.round(metric.progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <motion.h3 
          className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {language === 'ar' ? 'الإنجازات' : 'Achievements'}
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                }`}>
                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                        ? `${colorClassMap[achievement.color]?.bg100} ${colorClassMap[achievement.color]?.bg800}` 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        achievement.unlocked 
                          ? `${colorClassMap[achievement.color]?.text600} dark:${colorClassMap[achievement.color]?.text400}` 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </div>
                    
                    <h4 className={`text-lg font-bold mb-2 ${
                      achievement.unlocked 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h4>
                    
                    <p className={`text-sm ${
                      achievement.unlocked 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.unlocked && (
                      <motion.div 
                        className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        {language === 'ar' ? 'مفتوح' : 'Unlocked'}
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default EnhancedOverviewTab;