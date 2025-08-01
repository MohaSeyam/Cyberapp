import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Target, Calendar, Award, Clock, CheckCircle,
  BarChart3, PieChart, Activity, Star, Trophy, Zap,
  Lightbulb, BookOpen, Users, Rocket, Shield, Brain,
  Heart, Coffee, Flame, Crown, Medal, Gift, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useWeekPhaseData } from '../../hooks/useWeekPhaseData';
import Card from '../ui/Card';
import { animations } from '../../constants/theme';

export default function OverallProgressCard() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  const { getAllPhasesProgress, getCurrentPhase } = useWeekPhaseData();

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Calculate statistics with safety checks
  const totalWeeks = safePlan.length;
  const totalTasks = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
  );
  const completedTasks = safeProgress.filter(p => p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate total duration with safety checks
  const totalDuration = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => 
      dayTotal + (day.tasks || []).reduce((taskTotal, task) => taskTotal + (task.duration || 0), 0), 0
    ), 0
  );
  
  const completedDuration = safeProgress.reduce((total, p) => {
    const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
    return total + (task?.duration || 0);
  }, 0);

  // Calculate streak information
  const calculateStreak = () => {
    if (safeProgress.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const completedDates = safeProgress
      .filter(p => p.done)
      .map(p => new Date(p.updatedAt || 0).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (completedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    for (let i = 0; i < completedDates.length; i++) {
      const currentDate = new Date(completedDates[i]);
      const nextDate = i < completedDates.length - 1 ? new Date(completedDates[i + 1]) : null;
      
      if (nextDate) {
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
      } else {
        tempStreak++;
        
        // Check if this is today or yesterday for current streak
        if (currentDate.toDateString() === today || currentDate.toDateString() === yesterday) {
          currentStreak = tempStreak;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = calculateStreak();

  // Get phases progress with safety checks
  const phasesProgress = getAllPhasesProgress() || [];
  const currentPhase = getCurrentPhase();

  return (
    <motion.div {...animations.fadeIn} className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('overallProgress')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('trackYourLearningJourney')}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Main Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Completion Rate */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${completionRate}, 100`}
                  className="text-blue-600 dark:text-blue-400"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {completionRate}%
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {t('completionRate')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {completedTasks} / {totalTasks} {t('tasks')}
            </p>
          </div>

          {/* Total Duration */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {t('totalDuration')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(completedDuration / 60)} {t('hours')} {t('completed')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {Math.round(totalDuration / 60)} {t('hours')} {t('total')}
            </p>
          </div>

          {/* Current Streak */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {t('currentStreak')}
            </h3>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {currentStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t('days')}
            </p>
          </div>

          {/* Longest Streak */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {t('longestStreak')}
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {longestStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t('days')}
            </p>
          </div>
        </div>

        {/* Phases Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('phasesProgress')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phasesProgress.map((phase) => (
              <motion.div
                key={phase.phaseId}
                {...animations.stagger(phase.phaseId * 0.1)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  currentPhase?.id === phase.phaseId
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {phase.phaseTitle || `Phase ${phase.phaseId}`}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentPhase?.id === phase.phaseId
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {phase.progress || 0}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentPhase?.id === phase.phaseId
                          ? 'bg-blue-500'
                          : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                      style={{ width: `${phase.progress || 0}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{phase.completedWeeks || 0}/{phase.totalWeeks || 0} {t('weeks')}</span>
                    <span>{phase.remainingWeeks || 0} {t('remaining')}</span>
                  </div>
                </div>

                {/* Current Phase Indicator */}
                {currentPhase?.id === phase.phaseId && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}