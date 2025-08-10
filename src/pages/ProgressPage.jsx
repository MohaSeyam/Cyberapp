import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, CheckCircle, Clock, Target, BarChart3, 
  Award, BookOpen, Users, Star, Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../context/LocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const ProgressPage = () => {
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { 
    plan, 
    progress, 
    notes, 
    journalEntries,
    taskEvaluations,
    weekEvaluations
  } = useApp();
  const isRTL = language === 'ar';

  // Ensure data is available
  const safePlan = plan || [];
  const safeProgress = progress || [];
  const safeNotes = notes || [];
  const safeJournalEntries = journalEntries || [];
  const safeTaskEvaluations = taskEvaluations || [];
  const safeWeekEvaluations = weekEvaluations || [];

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const completedCount = safeProgress.length;
    const totalCount = safePlan.length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Calculate average rating
    const ratings = safeTaskEvaluations.map(evaluation => evaluation.rating).filter(rating => rating > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
    
    // Calculate phase progress
    const phaseProgress = safePlan.map(phase => {
      const phaseTasks = safePlan
        .filter(week => phase.weeks.includes(week.weekNumber))
        .flatMap(week => week.days)
        .flatMap(day => day.tasks);
      
      const completedPhaseTasks = phaseTasks.filter(task => 
        safeProgress.some(completed => completed.taskId === task.id)
      );
      
      return {
        ...phase,
        progress: phaseTasks.length > 0 ? (completedPhaseTasks.length / phaseTasks.length) * 100 : 0,
        completedTasks: completedPhaseTasks.length,
        totalTasks: phaseTasks.length
      };
    });

    // Calculate streak
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCompletions = safeProgress.filter(task => 
      new Date(task.completedAt) >= lastWeek
    );
    const currentStreak = recentCompletions.length;

    return {
      completionRate,
      averageRating,
      phaseProgress,
      currentStreak,
      completedCount,
      totalCount,
      notesCount: safeNotes.length,
      journalCount: safeJournalEntries.length
    };
  }, [safeProgress, safePlan, safeTaskEvaluations, safeNotes, safeJournalEntries]);

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600 dark:text-${color}-400` })}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const ProgressBar = ({ progress, label, color = "blue" }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <PageLayout
      title={language === 'ar' ? 'التقدم' : 'Progress'}
      subtitle={language === 'ar' ? 'تتبع تقدمك في التعلم' : 'Track your learning progress'}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle />}
            title={language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
            value={`${progressStats.completedCount}/${progressStats.totalCount}`}
            subtitle={`${Math.round(progressStats.completionRate)}% ${language === 'ar' ? 'مكتمل' : 'complete'}`}
            color="green"
          />
          <StatCard
            icon={<Star />}
            title={language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
            value={progressStats.averageRating > 0 ? progressStats.averageRating.toFixed(1) : '0.0'}
            subtitle={language === 'ar' ? 'من 5 نجوم' : 'out of 5 stars'}
            color="yellow"
          />
          <StatCard
            icon={<Activity />}
            title={language === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activity'}
            value={progressStats.currentStreak}
            subtitle={language === 'ar' ? 'مهمة مكتملة هذا الأسبوع' : 'tasks completed this week'}
            color="blue"
          />
          <StatCard
            icon={<BookOpen />}
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تقدم المراحل' : 'Phase Progress'}
            </h2>
          </div>
          
          <div className="space-y-6">
            {progressStats.phaseProgress.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {phase.title?.[language] || phase.title?.en || `Phase ${phase.id}`}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {phase.completedTasks}/{phase.totalTasks} {language === 'ar' ? 'مهمة' : 'tasks'}
                    </span>
                  </div>
                  <ProgressBar
                    progress={phase.progress}
                    label=""
                    color={phase.progress >= 100 ? "green" : phase.progress >= 50 ? "yellow" : "blue"}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
          </div>
          
          <div className="space-y-4">
            {safeProgress.slice(0, 5).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(task.completedAt).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US'
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {safeProgress.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'لا توجد مهام مكتملة بعد' : 'No completed tasks yet'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الإنجازات' : 'Achievements'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: language === 'ar' ? 'البداية' : 'Getting Started',
                description: language === 'ar' ? 'أكمل أول مهمة' : 'Complete your first task',
                achieved: progressStats.completedCount >= 1,
                icon: <CheckCircle className="w-6 h-6" />
              },
              {
                title: language === 'ar' ? 'المثابرة' : 'Perseverance',
                description: language === 'ar' ? 'أكمل 10 مهام' : 'Complete 10 tasks',
                achieved: progressStats.completedCount >= 10,
                icon: <Target className="w-6 h-6" />
              },
              {
                title: language === 'ar' ? 'الكاتب' : 'Writer',
                description: language === 'ar' ? 'أنشئ أول ملاحظة' : 'Create your first note',
                achieved: progressStats.notesCount >= 1,
                icon: <BookOpen className="w-6 h-6" />
              },
              {
                title: language === 'ar' ? 'المدون' : 'Journalist',
                description: language === 'ar' ? 'اكتب أول مدونة' : 'Write your first journal entry',
                achieved: progressStats.journalCount >= 1,
                icon: <Users className="w-6 h-6" />
              }
            ].map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  achievement.achieved
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.achieved
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {React.cloneElement(achievement.icon, {
                      className: `w-5 h-5 ${
                        achievement.achieved
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`
                    })}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      achievement.achieved
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.achieved
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
};

export default ProgressPage;