// Enhanced Home Page - Refactored with Components and Hooks
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, BookOpen, Calendar,
  CheckCircle, Clock, Star, FileText,
  Zap, Globe, Bookmark, Settings,
  BarChart3, Lightbulb, Rocket, Heart
} from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { useHome } from '../hooks/useHome';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';

import { ErrorBoundary } from 'react-error-boundary';

function HomeErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">{t('homePageError')}</h2>
      <p>{error?.message || t('reloadOrTryLater')}</p>
    </div>
  );
}

export default function HomePage() {
  const { t, language } = useLocalization();
  const { plan, progress, appState } = useHome();
  // Main stats
  const allTasks = plan?.flatMap(week => week.days.flatMap(day => day.tasks)) || [];
  const completedTasks = allTasks.filter(task => progress?.some(p => p.taskId === task.id && p.done));
  const totalTasks = allTasks.length;
  const completedTasksCount = completedTasks.length;
  const totalWeeks = plan?.length || 0;
  const completedWeeks = plan?.filter(week => {
    const weekTasks = week.days.reduce((s, d) => s + (d.tasks?.length || 0), 0);
    const weekProgress = progress?.filter(p => Number(p.weekId) === Number(week.week));
    const weekDone = weekProgress?.filter(p => p.done).length || 0;
    return weekTasks > 0 && weekDone === weekTasks;
  }).length || 0;
  const notesCount = Object.values(appState?.notes || {}).flat().length;
  const resourcesCount = (() => {
    const planResources = plan?.flatMap(week => week.days.flatMap(day => day.resources || [])) || [];
    const userResources = Object.values(appState?.resources || {}).flat();
    const allResources = [...planResources, ...userResources];
    const uniqueResources = Array.from(new Map(allResources.map(r => [r.url + '|' + r.title, r])).values());
    return uniqueResources.length;
  })();
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  return (
    <PageLayout
      title={language === 'ar' ? 'الرئيسية' : 'Home'}
      subtitle={language === 'ar' ? 'ملخص سريع لأهم تقدمك' : 'Quick summary of your main progress'}
      showBottomBar={true}
    >
      <div className="max-w-2xl mx-auto py-10 space-y-8">
        <Card className="p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold mb-2">{language === 'ar' ? 'نسبة التقدم الكلية' : 'Overall Progress'}</h3>
          <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {completedTasksCount} / {totalTasks} {language === 'ar' ? 'مهمة مكتملة' : 'Tasks Completed'}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-6">
          <Card className="flex flex-col items-center p-4">
            <CheckCircle className="w-7 h-7 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{completedTasksCount}</div>
            <div className="text-xs text-gray-500">{language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <Calendar className="w-7 h-7 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{completedWeeks}</div>
            <div className="text-xs text-gray-500">{language === 'ar' ? 'الأسابيع المكتملة' : 'Completed Weeks'}</div>
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Card className="flex flex-col items-center p-4">
            <FileText className="w-7 h-7 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{notesCount}</div>
            <div className="text-xs text-gray-500">{language === 'ar' ? 'إجمالي الملاحظات' : 'Total Notes'}</div>
          </Card>
          <Card className="flex flex-col items-center p-4">
            <Bookmark className="w-7 h-7 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{resourcesCount}</div>
            <div className="text-xs text-gray-500">{language === 'ar' ? 'إجمالي المراجع' : 'Total Resources'}</div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}