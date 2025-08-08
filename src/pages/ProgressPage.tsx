import React, { useState } from 'react';
import { BarChart3, Zap, LineChart, Download, Lightbulb } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const TABS = [
  {
    id: 'overview',
    label: { ar: 'نظرة عامة', en: 'Overview' },
    icon: BarChart3,
    color: 'blue',
    description: { ar: 'ملخص شامل للتقدم', en: 'Comprehensive progress summary' }
  },
  {
    id: 'smart',
    label: { ar: 'التحليل الذكي', en: 'Smart Analytics' },
    icon: Zap,
    color: 'green',
    description: { ar: 'تحليل ذكي للأداء', en: 'Smart performance analytics' }
  },
  {
    id: 'analytics',
    label: { ar: 'التحليلات', en: 'Analytics' },
    icon: LineChart,
    color: 'purple',
    description: { ar: 'رسوم بيانية مفصلة', en: 'Detailed charts and graphs' }
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
      {activeTab === 'overview' && <PlaceholderCard title={language === 'ar' ? 'نظرة عامة' : 'Overview'} language={language} />}
      {activeTab === 'smart' && <PlaceholderCard title={language === 'ar' ? 'التحليل الذكي' : 'Smart Analytics'} language={language} />}
      {activeTab === 'analytics' && <PlaceholderCard title={language === 'ar' ? 'التحليلات' : 'Analytics'} language={language} />}
      {activeTab === 'reports' && <PlaceholderCard title={language === 'ar' ? 'التقارير' : 'Reports'} language={language} />}
      {activeTab === 'suggestions' && <PlaceholderCard title={language === 'ar' ? 'الاقتراحات' : 'Suggestions'} language={language} />}
    </PageLayout>
  );
}
