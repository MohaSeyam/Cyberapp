import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, Calendar, Clock, Target, 
  Award, Zap, Brain, Heart, Coffee, Flame, Crown, Medal, Gift, Sparkles,
  Eye, Timer, Play, Pause, RotateCcw, Wrench, Mic, GraduationCap, Shield, BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import { animations } from '../../constants/theme';

interface LearningPattern {
  bestTime: string;
  averageSessionLength: number;
  preferredTaskType: string;
  completionRate: number;
  streakDays: number;
}

interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTaskTime: number;
  totalLearningHours: number;
  currentStreak: number;
  longestStreak: number;
  efficiencyScore: number;
}

interface TaskTypeDistribution {
  blueTeam: number;
  redTeam: number;
  practical: number;
  theoretical: number;
}

export default function AdvancedDashboard() {
  const { t } = useLocalization();
  const { plan, progress, lang } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Calculate comprehensive metrics
  const metrics = useMemo((): PerformanceMetrics => {
    const totalTasks = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length;
    const completedTasks = safeProgress.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate average task time (mock data for demo)
    const averageTaskTime = 45; // minutes
    const totalLearningHours = (completedTasks * averageTaskTime) / 60;
    
    // Calculate streaks
    const calculateStreak = () => {
      if (safeProgress.length === 0) return { current: 0, longest: 0 };
      
      const sortedProgress = [...safeProgress].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < sortedProgress.length; i++) {
        const currentDate = new Date(sortedProgress[i].completedAt);
        const nextDate = i < sortedProgress.length - 1 ? new Date(sortedProgress[i + 1].completedAt) : null;
        
        if (nextDate) {
          const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            tempStreak = 0;
          }
        } else {
          tempStreak++;
        }
      }
      
      currentStreak = tempStreak;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      
      return { current: currentStreak, longest: longestStreak };
    };
    
    const { current: currentStreak, longest: longestStreak } = calculateStreak();
    
    // Calculate efficiency score (based on completion rate, streak, and consistency)
    const efficiencyScore = Math.min(100, (completionRate * 0.4) + (currentStreak * 2) + (longestStreak * 1.5));
    
    return {
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTaskTime,
      totalLearningHours: Math.round(totalLearningHours * 100) / 100,
      currentStreak,
      longestStreak,
      efficiencyScore: Math.round(efficiencyScore)
    };
  }, [safePlan, safeProgress]);

  // Calculate task type distribution
  const taskDistribution = useMemo((): TaskTypeDistribution => {
    const allTasks = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []);
    const completedTaskIds = new Set(safeProgress.map(p => p.taskId));
    
    let blueTeam = 0, redTeam = 0, practical = 0, theoretical = 0;
    
    allTasks.forEach(task => {
      if (completedTaskIds.has(task.id)) {
        if (task.type === 'blue_team') blueTeam++;
        else if (task.type === 'red_team') redTeam++;
        else if (task.type === 'practical') practical++;
        else theoretical++;
      }
    });
    
    return { blueTeam, redTeam, practical, theoretical };
  }, [safePlan, safeProgress]);

  // Calculate learning patterns
  const learningPatterns = useMemo((): LearningPattern => {
    // Mock data for demo - in real app, this would be calculated from actual user behavior
    return {
      bestTime: '09:00 - 11:00',
      averageSessionLength: 75, // minutes
      preferredTaskType: 'practical',
      completionRate: metrics.completionRate,
      streakDays: metrics.currentStreak
    };
  }, [metrics.completionRate, metrics.currentStreak]);

  // Weekly performance data (mock data)
  const weeklyData = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, index) => ({
      week,
      completed: Math.floor(Math.random() * 20) + 5,
      total: 25,
      efficiency: Math.floor(Math.random() * 30) + 70
    }));
  }, []);

  // Recent achievements
  const recentAchievements = useMemo(() => [
    { id: '1', title: 'First Task', description: 'Completed your first task', icon: Target, earned: true },
    { id: '2', title: 'Streak Master', description: '7-day learning streak', icon: Flame, earned: metrics.currentStreak >= 7 },
    { id: '3', title: 'Efficiency Expert', description: '90%+ completion rate', icon: Zap, earned: metrics.completionRate >= 90 },
    { id: '4', title: 'Blue Team Pro', description: 'Completed 10 Blue Team tasks', icon: Shield, earned: taskDistribution.blueTeam >= 10 },
    { id: '5', title: 'Red Team Pro', description: 'Completed 10 Red Team tasks', icon: Target, earned: taskDistribution.redTeam >= 10 },
    { id: '6', title: 'Practical Master', description: 'Completed 15 practical tasks', icon: Wrench, earned: taskDistribution.practical >= 15 }
  ], [metrics.currentStreak, metrics.completionRate, taskDistribution]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('advancedDashboard')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('detailedAnalyticsAndInsights')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="week">{t('thisWeek')}</option>
            <option value="month">{t('thisMonth')}</option>
            <option value="year">{t('thisYear')}</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div {...animations.fadeIn} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('completionRate')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completionRate}%</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('currentStreak')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.currentStreak}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('longestStreak')}: {metrics.longestStreak}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('totalHours')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalLearningHours}h</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('avgTaskTime')}: {metrics.averageTaskTime}m
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('efficiencyScore')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.efficiencyScore}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${metrics.efficiencyScore}%` }}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Task Type Distribution */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
        <Card title={t('taskTypeDistribution')} subtitle={t('breakdownByTaskType')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{taskDistribution.blueTeam}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('blueTeamTasks')}</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-2 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{taskDistribution.redTeam}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('redTeamTasks')}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Wrench className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{taskDistribution.practical}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('practicalTasks')}</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{taskDistribution.theoretical}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('theoreticalTasks')}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Learning Patterns */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
        <Card title={t('learningPatterns')} subtitle={t('yourLearningBehavior')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('bestLearningTime')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{learningPatterns.bestTime}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('avgSessionLength')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{learningPatterns.averageSessionLength} {t('minutes')}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('preferredTaskType')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{learningPatterns.preferredTaskType}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('completionRate')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{learningPatterns.completionRate}%</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('currentStreak')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{learningPatterns.streakDays} {t('days')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('learningStyle')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('visualLearner')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Weekly Performance */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }}>
        <Card title={t('weeklyPerformance')} subtitle={t('performanceOverTime')}>
          <div className="space-y-4">
            {weeklyData.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{week.week}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {week.completed}/{week.total} {t('tasks')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {week.efficiency}%
                  </div>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        week.efficiency >= 90 ? 'bg-green-600' : 
                        week.efficiency >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${week.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.4 }}>
        <Card title={t('recentAchievements')} subtitle={t('yourAccomplishments')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAchievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  achievement.earned 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.earned 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <achievement.icon className={`w-4 h-4 ${
                      achievement.earned 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.earned 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.earned 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}