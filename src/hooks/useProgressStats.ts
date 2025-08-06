import { useMemo } from 'react';
import { Target, CheckCircle, Clock, Flame } from 'lucide-react';

const useProgressStats = (plan, progress, streaks) => {
  return useMemo(() => {
    // Early return if no data
    if (!plan || !progress || !Array.isArray(plan) || !Array.isArray(progress)) {
      return {
        allTasks: [],
        totalTasks: 0,
        completedTasksCount: 0,
        completionRate: 0,
        completedDuration: 0,
        totalDuration: 0,
        blueTeamTasks: 0,
        redTeamTasks: 0,
        practicalTasks: 0,
        theoreticalTasks: 0,
        policiesTasks: 0,
        streaks: streaks || { current: 0, longest: 0 },
        icons: {
          completion: Target,
          completed: CheckCircle,
          time: Clock,
          streak: Flame
        }
      };
    }

    // Optimized task processing
    const allTasks = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []);
    if (allTasks.length === 0) {
      return {
        allTasks: [],
        totalTasks: 0,
        completedTasksCount: 0,
        completionRate: 0,
        completedDuration: 0,
        totalDuration: 0,
        blueTeamTasks: 0,
        redTeamTasks: 0,
        practicalTasks: 0,
        theoreticalTasks: 0,
        policiesTasks: 0,
        streaks: streaks || { current: 0, longest: 0 },
        icons: {
          completion: Target,
          completed: CheckCircle,
          time: Clock,
          streak: Flame
        }
      };
    }

    // Create task map for faster lookups
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    const totalTasks = taskMap.size;
    
    // Filter completed progress once
    const completedProgress = progress.filter(p => p.done);
    const completedTasksCount = completedProgress.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    
    // Calculate durations efficiently
    const completedDuration = completedProgress.reduce((total, p) => {
      const task = taskMap.get(p.taskId);
      return total + (task?.duration || 0);
    }, 0);
    
    const totalDuration = allTasks.reduce((total, task) => total + (task?.duration || 0), 0);
    
    // Count task types efficiently
    const taskTypeCounts = { 'Blue Team': 0, 'Red Team': 0, 'Practical': 0, 'Theoretical': 0, 'Policies': 0 };
    
    completedProgress.forEach(p => {
      const task = taskMap.get(p.taskId);
      if (task?.type && taskTypeCounts.hasOwnProperty(task.type)) {
        taskTypeCounts[task.type]++;
      }
    });

    return {
      allTasks,
      totalTasks,
      completedTasksCount,
      completionRate,
      completedDuration,
      totalDuration,
      blueTeamTasks: taskTypeCounts['Blue Team'],
      redTeamTasks: taskTypeCounts['Red Team'],
      practicalTasks: taskTypeCounts['Practical'],
      theoreticalTasks: taskTypeCounts['Theoretical'],
      policiesTasks: taskTypeCounts['Policies'],
      streaks: streaks || { current: 0, longest: 0 },
      icons: {
        completion: Target,
        completed: CheckCircle,
        time: Clock,
        streak: Flame
      }
    };
  }, [plan, progress, streaks]);
};

export default useProgressStats;