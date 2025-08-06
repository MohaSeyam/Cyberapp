import Card from '../ui/Card';
import React from 'react';
import { Trophy, Award, Star, Medal, Crown, Target, CheckCircle, Zap } from 'lucide-react';

const EnhancedAchievementsTab = React.memo(({ stats, language }) => {
  const achievements = [
    {
      id: 'first-task',
      title: language === 'ar' ? 'أول مهمة' : 'First Task',
      description: language === 'ar' ? 'أكمل أول مهمة في رحلتك' : 'Complete your first task',
      icon: CheckCircle,
      color: 'green',
      unlocked: stats.completedTasksCount > 0,
      progress: stats.completedTasksCount > 0 ? 100 : 0
    },
    {
      id: 'streak-7',
      title: language === 'ar' ? 'أسبوع من التعلم' : 'Week of Learning',
      description: language === 'ar' ? 'تعلم لمدة 7 أيام متتالية' : 'Learn for 7 consecutive days',
      icon: Zap,
      color: 'yellow',
      unlocked: stats.streaks.current >= 7,
      progress: Math.min(100, (stats.streaks.current / 7) * 100)
    },
    {
      id: 'completion-50',
      title: language === 'ar' ? 'نصف الطريق' : 'Halfway There',
      description: language === 'ar' ? 'أكمل 50% من المهام' : 'Complete 50% of tasks',
      icon: Target,
      color: 'blue',
      unlocked: stats.completionRate >= 50,
      progress: Math.min(100, stats.completionRate)
    },
    {
      id: 'time-master',
      title: language === 'ar' ? 'سيد الوقت' : 'Time Master',
      description: language === 'ar' ? 'اقضِ 10 ساعات في التعلم' : 'Spend 10 hours learning',
      icon: Clock,
      color: 'purple',
      unlocked: stats.completedDuration >= 600,
      progress: Math.min(100, (stats.completedDuration / 600) * 100)
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الإنجازات' : 'Achievements'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? `${unlockedCount} من ${achievements.length} إنجاز مفتوح` : `${unlockedCount} of ${achievements.length} achievements unlocked`}
            </p>
          </div>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card
              key={achievement.id}
              className={`p-6 transition-all duration-300 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${
                  achievement.unlocked
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    achievement.unlocked
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {achievement.description}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                      <span>{Math.round(achievement.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                {achievement.unlocked && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

export default EnhancedAchievementsTab;