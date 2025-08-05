import { useMemo } from 'react';

const useProgressStats = (plan, progress, streaks) => {
  return useMemo(() => {
    const allTasks = plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []);
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    const totalTasks = taskMap.size;
    const completedProgress = progress.filter(p => p.done);
    const completedTasksCount = completedProgress.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    const completedDuration = completedProgress.reduce((total, p) => {
      const task = taskMap.get(p.taskId);
      return total + (task?.duration || 0);
    }, 0);
    const totalDuration = allTasks.reduce((total, task) => total + (task?.duration || 0), 0);
    const completedTaskTypes = completedProgress.map(p => taskMap.get(p.taskId)?.type).filter(Boolean);
    const blueTeamTasks = completedTaskTypes.filter(type => type === 'Blue Team').length;
    const redTeamTasks = completedTaskTypes.filter(type => type === 'Red Team').length;
    const practicalTasks = completedTaskTypes.filter(type => type === 'Practical').length;
    const theoreticalTasks = completedTaskTypes.filter(type => type === 'Theoretical').length;
    const policiesTasks = completedTaskTypes.filter(type => type === 'Policies').length;
    // skills, achievements, suggestions: افترض أنها تأتي من مكان آخر أو احسبها هنا إذا لزم الأمر
    return {
      allTasks,
      totalTasks,
      completedTasksCount,
      completionRate,
      completedDuration,
      totalDuration,
      blueTeamTasks,
      redTeamTasks,
      practicalTasks,
      theoreticalTasks,
      policiesTasks,
      streaks,
      // skills: [], achievements: [], suggestions: [], icons: {}
    };
  }, [plan, progress, streaks]);
};

export default useProgressStats;