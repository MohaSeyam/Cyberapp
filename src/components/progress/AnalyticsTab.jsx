import React from 'react';
import { motion } from 'framer-motion';
import { Target, Star, Zap, Clock, FileText, BookOpen, Users, ChevronUp, ChevronDown } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AnalyticsTab({ language, selectedPeriod, setSelectedPeriod, analytics, isExpanded, toggleExpanded }) {
  const getMetricColor = (value, threshold = 70) => {
    if (value >= threshold) return 'text-green-600 dark:text-green-400';
    if (value >= threshold * 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="week">{language === 'ar' ? 'الأسبوع' : 'Week'}</option>
          <option value="month">{language === 'ar' ? 'الشهر' : 'Month'}</option>
          <option value="year">{language === 'ar' ? 'السنة' : 'Year'}</option>
          <option value="all">{language === 'ar' ? 'كل الوقت' : 'All Time'}</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className={`text-sm font-medium ${getMetricColor(analytics.completionRate)}`}>{analytics.completionRate}%</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{analytics.totalTasks}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm font-medium ${getMetricColor(analytics.averageRating, 4)}`}>{analytics.averageRating}/5</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{analytics.averageRating}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'متوسط التقييم' : 'Avg Rating'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className={`text-sm font-medium ${getMetricColor(analytics.streak, 7)}`}>{analytics.streak}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{analytics.streak}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'أيام متتالية' : 'Day Streak'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{Math.round(analytics.totalStudyTime / 60)}h</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{Math.round(analytics.totalStudyTime / 60)}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'ساعات الدراسة' : 'Study Hours'}</p>
        </div>
      </div>

      {/* Content Analytics */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'المحتوى' : 'Content'}</h2>
          <button onClick={() => toggleExpanded('content')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            {isExpanded.content ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /><span className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'الملاحظات' : 'Notes'}</span></div>
            <span className="font-semibold text-gray-900 dark:text-white">{analytics.totalNotes}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-purple-500" /><span className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'المدونات' : 'Journals'}</span></div>
            <span className="font-semibold text-gray-900 dark:text-white">{analytics.totalJournals}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-green-500" /><span className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'الموارد' : 'Resources'}</span></div>
            <span className="font-semibold text-gray-900 dark:text-white">{analytics.totalResources}</span>
          </div>
        </div>
      </Card>

      {/* Patterns */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'ar' ? 'أنماط الدراسة' : 'Study Patterns'}</h2>
          <button onClick={() => toggleExpanded('patterns')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            {isExpanded.patterns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><span className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'أيام الدراسة' : 'Study Days'}</span><span className="font-semibold text-gray-900 dark:text-white">{analytics.studyDays}</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'متوسط المهام/يوم' : 'Avg Tasks/Day'}</span><span className="font-semibold text-gray-900 dark:text-white">{analytics.averageTasksPerDay}</span></div>
          <div className="flex items-center justify_between"><span className="text-gray-700 dark:text-gray-300">{language === 'ar' ? 'متوسط الفهم' : 'Avg Understanding'}</span><span className="font-semibold text-gray-900 dark:text-white">{analytics.averageUnderstanding}/5</span></div>
        </div>
      </Card>
    </motion.div>
  );
}