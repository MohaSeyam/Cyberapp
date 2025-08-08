import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, Download, Lightbulb, CheckCircle, Calendar, Flame, Clock, Zap, PieChart } from 'lucide-react';
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
  const { plan, progress } = useApp();
  const totalTasks = useMemo(() => plan?.reduce((sum, w) => sum + w.days.reduce((s, d) => s + (d.tasks?.length || 0), 0), 0) || 0, [plan]);
  const completedTasks = useMemo(() => progress?.filter(p => p.done).length || 0, [progress]);
  const totalWeeks = plan?.length || 0;
  const completedWeeks = useMemo(() => plan?.filter(week => {
    const weekTasks = week.days.reduce((s, d) => s + (d.tasks?.length || 0), 0);
    const weekProgress = progress?.filter(p => Number(p.weekId) === Number(week.week));
    const weekDone = weekProgress?.filter(p => p.done).length || 0;
    return weekTasks > 0 && weekDone === weekTasks;
  }).length || 0, [plan, progress]);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
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
          {completedTasks} / {totalTasks} {language === 'ar' ? 'مهمة مكتملة' : 'Tasks Completed'}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-6">
        <Card className="flex flex-col items-center p-4">
          <CheckCircle className="w-7 h-7 text-green-500 mb-2" />
          <div className="text-2xl font-bold">{completedTasks}</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}</div>
        </Card>
        <Card className="flex flex-col items-center p-4">
          <Calendar className="w-7 h-7 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{completedWeeks}</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'الأسابيع المكتملة' : 'Completed Weeks'}</div>
        </Card>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('overview');
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
          📚 {language === 'ar' ? 'مستودع الموارد' : 'Resources Repository'}
        </Link>
      </div>
      <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
      <MinimalOverview language={language} />
    </PageLayout>
  );
}
