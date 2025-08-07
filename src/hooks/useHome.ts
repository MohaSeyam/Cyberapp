import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Target, TrendingUp, Award, Rocket, BarChart3, FileText, BookOpen } from 'lucide-react';

export const useHome = () => {
  console.log("🏠 useHome hook starting...");
  
  const { plan, progress } = useApp();
  
  console.log("📊 useHome: AppContext data:", { 
    planLength: plan?.length, 
    progressLength: progress?.length,
    planType: typeof plan,
    progressType: typeof progress
  });

  // Comprehensive safety checks for data
  const safePlan = Array.isArray(plan) ? plan : [];
  const safeProgress = Array.isArray(progress) ? progress : [];
  
  console.log("🔒 useHome: Safe data:", { 
    safePlanLength: safePlan.length, 
    safeProgressLength: safeProgress.length 
  });

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

  console.log("📈 useHome: Calculated stats:", { 
    totalWeeks, 
    totalTasks, 
    completedTasks, 
    completionRate 
  });

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
      title: 'comprehensiveLearning',
      description: 'structuredPathDescription',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: 'Globe',
      title: 'multilingualSupport',
      description: 'arabicEnglishSupport',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: 'Bookmark',
      title: 'progressTracking',
      description: 'detailedProgressDescription',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: 'Settings',
      title: 'personalizedExperience',
      description: 'customizableInterfaceDescription',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ], []);

  const result = {
    data: {
      totalTasks,
      completedTasks,
      completionRate,
      currentWeek,
      stats,
      quickActions,
      features
    },
    isLoading: false,
    error: null
  };

  console.log("✅ useHome: Returning result:", { 
    hasData: !!result.data, 
    isLoading: result.isLoading, 
    hasError: !!result.error 
  });

  return result;
};