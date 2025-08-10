import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, Download, Lightbulb, CheckCircle, Calendar, Flame, Clock, Zap } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const TABS = [
  {
    id: 'overview',
    label: { ar: 'نظرة عامة', en: 'Overview' },
    icon: BarChart3,
    color: 'blue',
    description: { ar: 'ملخص التقدم', en: 'Progress summary' }
  }
];

function TabBar({ tabs, activeTab, setActiveTab, language }) {
  return (
    <div className="w-full overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-6">
      <div className="flex gap-2 px-2 py-2 min-w-[200px]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center flex-1 min-w-[80px] px-2 py-2 rounded-lg transition-all duration-200
                ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              style={{ outline: isActive ? '2px solid #3B82F6' : 'none' }}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="text-xs whitespace-nowrap">{language === 'ar' ? tab.label.ar : tab.label.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MinimalOverview({ language }) {
  const { plan, progress, appState } = useApp();
  // Count tasks by type
  const typeLabels = {
    'Blue Team': language === 'ar' ? 'الفريق الأزرق' : 'Blue',
    'Red Team': language === 'ar' ? 'الفريق الأحمر' : 'Red',
    'Career': language === 'ar' ? 'المسار المهني' : 'Career',
    'Soft Skills': language === 'ar' ? 'مهارات ناعمة' : 'Soft',
    'Practical': language === 'ar' ? 'عملي' : 'Practical',
    'Policies': language === 'ar' ? 'سياسات' : 'Policies',
  };
  const typeOrder = ['Blue Team', 'Red Team', 'Career', 'Soft Skills', 'Practical', 'Policies'];
  const allTasks = plan?.flatMap(week => week.days.flatMap(day => day.tasks.map(task => ({...task, week: week.week, day: day.day}))));
  const completedTasks = allTasks?.filter(task => progress?.some(p => p.taskId === task.id && p.done));
  const typeCounts = typeOrder.map(type => ({
    type,
    label: typeLabels[type],
    count: completedTasks?.filter(task => task.type === type).length || 0
  }));
  // Totals
  const notesCount = Object.values(appState?.notes || {}).flat().length;
  const journalCount = Object.values(appState?.journal || {}).flat().length;
  // Combine plan resources and user-added resources, avoid duplicates by url+title
  const planResources = plan?.flatMap(week => week.days.flatMap(day => day.resources || [])) || [];
  const userResources = Object.values(appState?.resources || {}).flat();
  const allResources = [...planResources, ...userResources];
  const uniqueResources = Array.from(new Map(allResources.map(r => [r.url + '|' + r.title, r])).values());
  const resourcesCount = uniqueResources.length;
  // Main stats
  const totalTasks = allTasks?.length || 0;
  const completedTasksCount = completedTasks?.length || 0;
  const totalWeeks = plan?.length || 0;
  const completedWeeks = plan?.filter(week => {
    const weekTasks = week.days.reduce((s, d) => s + (d.tasks?.length || 0), 0);
    const weekProgress = progress?.filter(p => Number(p.weekId) === Number(week.week));
    const weekDone = weekProgress?.filter(p => p.done).length || 0;
    return weekTasks > 0 && weekDone === weekTasks;
  }).length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
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
      {/* جدول أنواع المهام */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2 text-center">{language === 'ar' ? 'المهام المنجزة حسب النوع' : 'Completed Tasks by Type'}</h4>
        <div className="flex flex-wrap justify-center gap-4">
          {typeCounts.map(({ type, label, count }) => (
            <div key={type} className="flex flex-col items-center min-w-[70px]">
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{count}</span>
              <span className="text-xs text-gray-500 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </Card>
      {/* إجماليات الملاحظات والمدونات والمراجع */}
      <Card className="p-4 flex flex-wrap justify-center gap-6 text-center">
        <div>
          <div className="text-xl font-bold text-purple-600">{notesCount}</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'إجمالي الملاحظات' : 'Total Notes'}</div>
        </div>
        <div>
          <div className="text-xl font-bold text-orange-600">{journalCount}</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'إجمالي المدونات' : 'Total Journals'}</div>
        </div>
        <div>
          <div className="text-xl font-bold text-blue-600">{resourcesCount}</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'إجمالي المراجع' : 'Total Resources'}</div>
        </div>
      </Card>
    </div>
  );
}

export default function ProgressPage() {
  const language = document.documentElement.dir === 'rtl' ? 'ar' : 'en';
  return (
    <PageLayout
      title={language === 'ar' ? 'التقدم' : 'Progress'}
      subtitle={language === 'ar' ? 'ملخص التقدم في الخطة' : 'Plan progress summary'}
      showBottomBar={true}
    >
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <Link
          to="/resources"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all"
        >
          📚 {language === 'ar' ? 'مستودع المراجع' : 'Resources Repository'}
        </Link>
      </div>
      <MinimalOverview language={language} />
    </PageLayout>
  );
}
