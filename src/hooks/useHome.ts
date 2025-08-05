import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Target, TrendingUp, Award, Rocket, BarChart3, FileText, BookOpen } from 'lucide-react';

export const useHome = () => {
  const { plan, progress } = useApp();

  // Comprehensive safety checks for data
  const safePlan = Array.isArray(plan) ? plan : [];
  const safeProgress = Array.isArray(progress) ? progress : [];

  // Calculate statistics with comprehensive safety checks
  const totalWeeks = 50; // Total weeks from phases.json
  const totalTasks = safePlan.reduce((total, week) => {
    if (!week || !Array.isArray(week.days)) return total;
    return total + week.days.filter(day => day.key !== 'fri').reduce((dayTotal, day) => {
      if (!day || !Array.isArray(day.tasks)) return dayTotal;
      return dayTotal + day.tasks.length;
    }, 0);
  }, 0);
  
  const completedTasks = safeProgress.filter(p => p && p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get current week (you can implement your own logic)
  const currentWeek = 1; // This should be calculated based on user progress

  const stats = useMemo(() => [
    {
      icon: Calendar,
      label: 'totalWeeks',
      value: totalWeeks,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Target,
      label: 'totalTasks',
      value: totalTasks,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      label: 'completionRate',
      value: `${completionRate}%`,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Award,
      label: 'completedTasks',
      value: completedTasks,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      gradient: 'from-orange-500 to-orange-600'
    }
  ], [totalWeeks, totalTasks, completionRate, completedTasks]);

  const quickActions = useMemo(() => [
    {
      icon: Rocket,
      title: 'startLearning',
      subtitle: 'beginYourJourney',
      variant: 'primary' as const,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconPosition: 'left' as const
    },
    {
      icon: BarChart3,
      title: 'viewProgress',
      subtitle: 'trackYourProgress',
      variant: 'secondary' as const,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconPosition: 'left' as const
    },
    {
      icon: FileText,
      title: 'manageNotes',
      subtitle: 'organizeYourNotes',
      variant: 'outline' as const,
      gradient: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconPosition: 'left' as const
    },
    {
      icon: BookOpen,
      title: 'learningJournal',
      subtitle: 'reflectOnLearning',
      variant: 'outline' as const,
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconPosition: 'left' as const
    }
  ], []);

  const features = useMemo(() => [
    {
      icon: 'Shield',
      title: 'الأمان السيبراني',
      description: 'تعلم أساسيات الأمان السيبراني وحماية الأنظمة',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: 'Globe',
      title: 'الشبكات العالمية',
      description: 'فهم الشبكات والاتصالات العالمية',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: 'Zap',
      title: 'التقنيات المتقدمة',
      description: 'استكشاف أحدث التقنيات في مجال الأمن السيبراني',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: 'Heart',
      title: 'التعلم المستمر',
      description: 'نهج التعلم المستمر والتطوير المهني',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ], []);

  return {
    // Data
    totalWeeks,
    totalTasks,
    completedTasks,
    completionRate,
    currentWeek,
    stats,
    quickActions,
    features,
    
    // Safe data
    safePlan,
    safeProgress
  };
};