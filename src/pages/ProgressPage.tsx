import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, Download, Lightbulb, CheckCircle, Calendar, Flame, Clock, Zap, PieChart } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const TABS = [
  {
    id: 'overview',
    label: { ar: 'نظرة عامة', en: 'Overview' },
    icon: BarChart3,
    color: 'blue',
    description: { ar: 'ملخص شامل للتقدم', en: 'Comprehensive progress summary' }
  },
  {
    id: 'analytics',
    label: { ar: 'التحليلات', en: 'Analytics' },
    icon: LineChart,
    color: 'purple',
    description: { ar: 'تحليل ذكي ورسوم بيانية', en: 'Smart analytics and charts' }
  },
  {
    id: 'reports',
    label: { ar: 'التقارير', en: 'Reports' },
    icon: Download,
    color: 'red',
    description: { ar: 'تصدير التقارير', en: 'Export reports' }
  },
  {
    id: 'suggestions',
    label: { ar: 'الاقتراحات', en: 'Suggestions' },
    icon: Lightbulb,
    color: 'orange',
    description: { ar: 'نصائح للتحسين', en: 'Improvement tips' }
  }
];

function TabBar({ tabs, activeTab, setActiveTab, language }) {
  return (
    <div className="w-full overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-6">
      <div className="flex gap-2 px-2 py-2 min-w-[400px]">
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
              <span className="text-[10px] text-gray-400 mt-1">{language === 'ar' ? tab.description.ar : tab.description.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SmartAnalyticsCard({ plan, progress, language }) {
  // حساب نقاط القوة والضعف
  const weekStats = useMemo(() => {
    if (!plan || !progress) return [];
    return plan.map(week => {
      const weekTasks = week.days.flatMap(day => day.tasks);
      const completed = progress.filter(p => p.done && weekTasks.some(task => task.id === p.taskId)).length;
      return {
        week: week.week,
        total: weekTasks.length,
        completed,
        completionRate: weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0
      };
    });
  }, [plan, progress]);
  // نقاط القوة: أعلى أسبوع إنجازاً
  const bestWeek = weekStats.reduce((best, curr) => curr.completionRate > (best?.completionRate || 0) ? curr : best, null);
  // نقاط الضعف: أقل أسبوع إنجازاً
  const worstWeek = weekStats.reduce((worst, curr) => curr.completionRate < (worst?.completionRate ?? 101) ? curr : worst, null);
  // اقتراحات بناءً على الأداء
  const suggestion = useMemo(() => {
    if (!bestWeek || !worstWeek) return '';
    if (worstWeek.completionRate < 50) {
      return language === 'ar'
        ? `ركز على تحسين إنجازك في الأسبوع ${worstWeek.week}. حاول إنهاء المهام المتبقية.`
        : `Focus on improving your completion in week ${worstWeek.week}. Try to finish the remaining tasks.`;
    } else if (bestWeek.completionRate === 100) {
      return language === 'ar'
        ? `أداء ممتاز في الأسبوع ${bestWeek.week}! استمر بهذا المستوى.`
        : `Excellent performance in week ${bestWeek.week}! Keep it up.`;
    } else {
      return language === 'ar'
        ? `حافظ على تقدمك ووازن بين جميع الأسابيع.`
        : `Maintain your progress and balance your effort across all weeks.`;
    }
  }, [bestWeek, worstWeek, language]);
  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">
          {language === 'ar' ? 'تحليل ذكي للتقدم' : 'Smart Progress Analytics'}
        </h2>
        <p className="text-gray-700 dark:text-gray-200">
          {language === 'ar' ? 'نقاط القوة:' : 'Strengths:'} {bestWeek ? `${language === 'ar' ? 'الأسبوع' : 'Week'} ${bestWeek.week} (${bestWeek.completionRate}%)` : '-'}<br />
          {language === 'ar' ? 'نقاط الضعف:' : 'Weaknesses:'} {worstWeek ? `${language === 'ar' ? 'الأسبوع' : 'Week'} ${worstWeek.week} (${worstWeek.completionRate}%)` : '-'}
        </p>
      </div>
      <div className="text-green-700 dark:text-green-300 font-semibold text-lg">
        {suggestion}
      </div>
    </Card>
  );
}

function AnalyticsTab({ language }) {
  const { plan, progress } = useApp();
  // بيانات رسم بياني تطور الإنجاز عبر الأسابيع
  const weeklyData = useMemo(() => plan?.map(week => {
    const weekTasks = week.days.reduce((s, d) => s + (d.tasks?.length || 0), 0);
    const weekProgress = progress?.filter(p => Number(p.weekId) === Number(week.week));
    const weekDone = weekProgress?.filter(p => p.done).length || 0;
    return {
      week: week.week,
      percent: weekTasks > 0 ? Math.round((weekDone / weekTasks) * 100) : 0
    };
  }) || [], [plan, progress]);
  // توزيع المهام حسب النوع
  const taskTypeStats = useMemo(() => {
    const stats = {};
    plan?.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach(task => {
          stats[task.type] = (stats[task.type] || 0) + 1;
        });
      });
    });
    return stats;
  }, [plan]);
  const taskTypeColors = {
    'Blue Team': 'bg-blue-400',
    'Red Team': 'bg-red-400',
    'Practical': 'bg-green-400',
    'Theoretical': 'bg-purple-400',
    'Policies': 'bg-orange-400'
  };
  return (
    <div className="space-y-8">
      <SmartAnalyticsCard plan={plan} progress={progress} language={language} />
      {/* رسم بياني تطور الإنجاز */}
      <Card className="p-6">
        <h4 className="font-semibold mb-2 flex items-center gap-2"><LineChart className="w-5 h-5 text-blue-500" />{language === 'ar' ? 'تطور الإنجاز عبر الأسابيع' : 'Weekly Progress Trend'}</h4>
        <div className="w-full h-32 flex items-end gap-2">
          {weeklyData.map((w, i) => (
            <div key={w.week} className="flex flex-col items-center flex-1">
              <div
                className="w-4 md:w-6 rounded-t bg-blue-400 dark:bg-blue-600 transition-all"
                style={{ height: `${w.percent * 1.2}px`, minHeight: '8px' }}
                title={`${language === 'ar' ? 'الأسبوع' : 'Week'} ${w.week}: ${w.percent}%`}
              />
              <span className="text-xs mt-1 text-gray-400">{w.week}</span>
            </div>
          ))}
        </div>
      </Card>
      {/* توزيع المهام حسب النوع */}
      <Card className="p-6">
        <h4 className="font-semibold mb-2 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" />{language === 'ar' ? 'توزيع المهام حسب النوع' : 'Task Type Distribution'}</h4>
        <div className="flex flex-wrap gap-4">
          {Object.keys(taskTypeStats).length === 0 && (
            <span className="text-gray-400">{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</span>
          )}
          {Object.entries(taskTypeStats).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded-full ${taskTypeColors[type] || 'bg-gray-300'}`}></span>
              <span className="text-sm font-semibold">{language === 'ar' ? translateType(type) : type}</span>
              <span className="text-xs text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReportsTab({ language }) {
  // Placeholder export logic
  const [format, setFormat] = useState('pdf');
  const [range, setRange] = useState('all');
  const formats = [
    { id: 'pdf', label: { ar: 'PDF', en: 'PDF' } },
    { id: 'csv', label: { ar: 'CSV', en: 'CSV' } },
    { id: 'json', label: { ar: 'JSON', en: 'JSON' } },
    { id: 'markdown', label: { ar: 'Markdown', en: 'Markdown' } }
  ];
  const ranges = [
    { id: 'all', label: { ar: 'كامل الخطة', en: 'Entire Plan' } },
    { id: 'week', label: { ar: 'أسبوع محدد', en: 'Specific Week' } },
    { id: 'phase', label: { ar: 'مرحلة محددة', en: 'Specific Phase' } }
  ];
  return (
    <Card className="p-8 max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">{language === 'ar' ? 'تصدير التقارير' : 'Export Reports'}</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <label className="flex-1">
          <span className="block mb-1 font-semibold text-sm">{language === 'ar' ? 'نوع التصدير:' : 'Export Format:'}</span>
          <select value={format} onChange={e => setFormat(e.target.value)} className="w-full border rounded px-3 py-2">
            {formats.map(f => <option key={f.id} value={f.id}>{f.label[language]}</option>)}
          </select>
        </label>
        <label className="flex-1">
          <span className="block mb-1 font-semibold text-sm">{language === 'ar' ? 'النطاق:' : 'Range:'}</span>
          <select value={range} onChange={e => setRange(e.target.value)} className="w-full border rounded px-3 py-2">
            {ranges.map(r => <option key={r.id} value={r.id}>{r.label[language]}</option>)}
          </select>
        </label>
      </div>
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded">
        <div className="font-semibold mb-2">{language === 'ar' ? 'ملخص البيانات:' : 'Data Summary:'}</div>
        <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
          <li>{language === 'ar' ? 'عدد المهام المكتملة، الملاحظات، الموارد...' : 'Number of completed tasks, notes, resources...'}</li>
          <li>{language === 'ar' ? 'تفاصيل الإنجاز حسب النطاق المختار' : 'Progress details for selected range'}</li>
        </ul>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-6 py-2 font-semibold shadow transition-all">
        {language === 'ar' ? 'تصدير' : 'Export'}
      </button>
    </Card>
  );
}

function translateType(type) {
  switch(type) {
    case 'Blue Team': return 'الفريق الأزرق';
    case 'Red Team': return 'الفريق الأحمر';
    case 'Practical': return 'عملي';
    case 'Theoretical': return 'نظري';
    case 'Policies': return 'سياسات';
    default: return type;
  }
}

function OverviewTab({ language }) {
  const { plan, progress } = useApp();
  // حساب الإحصائيات
  const totalTasks = useMemo(() => plan?.reduce((sum, w) => sum + w.days.reduce((s, d) => s + (d.tasks?.length || 0), 0), 0) || 0, [plan]);
  const completedTasks = useMemo(() => progress?.filter(p => p.done).length || 0, [progress]);
  const totalWeeks = plan?.length || 0;
  const completedWeeks = useMemo(() => plan?.filter(week => {
    const weekTasks = week.days.reduce((s, d) => s + (d.tasks?.length || 0), 0);
    const weekProgress = progress?.filter(p => Number(p.weekId) === Number(week.week));
    const weekDone = weekProgress?.filter(p => p.done).length || 0;
    return weekTasks > 0 && weekDone === weekTasks;
  }).length || 0, [plan, progress]);
  // سلسلة الإنجاز
  const streak = useMemo(() => {
    let current = 0, longest = 0, streak = 0;
    let lastDate = null;
    const sorted = [...(progress?.filter(p => p.done) || [])].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i].dayKey);
      if (lastDate && (date - lastDate) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
      } else {
        streak = 1;
      }
      if (streak > longest) longest = streak;
      lastDate = date;
    }
    current = streak;
    return { current, longest };
  }, [progress]);
  // الوقت الكلي المنجز (افتراضي: كل مهمة = 1 ساعة)
  const totalTime = completedTasks;
  // نسبة الإنجاز
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  // بيانات رسم بياني بسيط (تطور الإنجاز عبر الأسابيع)
  const weeklyData = useMemo(() => plan?.map(week => {
    const weekTasks = week.days.reduce((s, d) => s + (d.tasks?.length || 0), 0);
    const weekProgress = progress?.filter(p => Number(p.weekId) === Number(week.week));
    const weekDone = weekProgress?.filter(p => p.done).length || 0;
    return {
      week: week.week,
      percent: weekTasks > 0 ? Math.round((weekDone / weekTasks) * 100) : 0
    };
  }) || [], [plan, progress]);

  return (
    <div className="space-y-8">
      {/* شريط التقدم العام */}
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
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
        <Card className="flex flex-col items-center p-4">
          <Flame className="w-7 h-7 text-orange-500 mb-2" />
          <div className="text-2xl font-bold">{streak.current}</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'سلسلة الإنجاز الحالية' : 'Current Streak'}</div>
        </Card>
        <Card className="flex flex-col items-center p-4">
          <Clock className="w-7 h-7 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{totalTime}h</div>
          <div className="text-xs text-gray-500">{language === 'ar' ? 'الوقت الكلي المنجز' : 'Total Time (hrs)'}</div>
        </Card>
      </div>
      {/* رسم بياني بسيط لتطور الإنجاز */}
      <Card className="p-6">
        <h4 className="font-semibold mb-2">{language === 'ar' ? 'تطور الإنجاز عبر الأسابيع' : 'Weekly Progress Trend'}</h4>
        <div className="w-full h-32 flex items-end gap-2">
          {weeklyData.map((w, i) => (
            <div key={w.week} className="flex flex-col items-center flex-1">
              <div
                className="w-4 md:w-6 rounded-t bg-blue-400 dark:bg-blue-600 transition-all"
                style={{ height: `${w.percent * 1.2}px`, minHeight: '8px' }}
                title={`${language === 'ar' ? 'الأسبوع' : 'Week'} ${w.week}: ${w.percent}%`}
              />
              <span className="text-xs mt-1 text-gray-400">{w.week}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PlaceholderCard({ title, language }) {
  return (
    <Card className="p-8 my-8 text-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-500">{language === 'ar' ? 'هذا التبويب قيد التطوير...' : 'This tab is under construction...'}</p>
    </Card>
  );
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState('overview');
  // TODO: Replace with real localization
  const language = document.documentElement.dir === 'rtl' ? 'ar' : 'en';

  return (
    <PageLayout
      title={language === 'ar' ? 'التقدم' : 'Progress'}
      subtitle={language === 'ar' ? 'تابع تقدمك واطلع على تحليلات ذكية وتقارير مفصلة' : 'Track your progress, view smart analytics and detailed reports'}
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
      {activeTab === 'overview' && <OverviewTab language={language} />}
      {activeTab === 'analytics' && <AnalyticsTab language={language} />}
      {activeTab === 'reports' && <ReportsTab language={language} />}
      {activeTab === 'suggestions' && <PlaceholderCard title={language === 'ar' ? 'الاقتراحات' : 'Suggestions'} language={language} />}
    </PageLayout>
  );
}
