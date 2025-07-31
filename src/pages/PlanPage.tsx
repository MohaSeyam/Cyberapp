import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Calendar, BookOpen, Target, Clock, CheckCircle } from 'lucide-react';

export default function PlanPage() {
  const { plan, lang } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  // استخراج المراحل
  const phases = Array.from(new Set((plan || []).map(week => week?.phase).filter(Boolean))).sort();

  // تبديل توسيع المرحلة
  const togglePhase = (phase: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  // تبديل توسيع الأسبوع
  const toggleWeek = (week: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(week)) {
      newExpanded.delete(week);
    } else {
      newExpanded.add(week);
    }
    setExpandedWeeks(newExpanded);
  };

  // الحصول على أسابيع المرحلة
  const getWeeksForPhase = (phase: number) => {
    return (plan || []).filter(week => week.phase === phase);
  };

  // الحصول على أيام الأسبوع
  const getDaysForWeek = (weekNumber: number) => {
    return (plan || []).find(week => week.week === weekNumber)?.days || [];
  };

  // التحقق من أن اليوم نشط
  const isDayActive = (weekNumber: number, dayIndex: number) => {
    return location.pathname === `/day/${weekNumber}/${dayIndex}`;
  };

  // الحصول على عنوان المرحلة
  const getPhaseTitle = (phase: number) => {
    const phaseTitles: { [key: number]: string } = {
      1: lang === 'ar' ? 'أساسيات الأمن السيبراني' : 'Cybersecurity Fundamentals',
      2: lang === 'ar' ? 'الشبكات والأمان' : 'Networking & Security',
      3: lang === 'ar' ? 'البرمجة والاختراق الأخلاقي' : 'Programming & Ethical Hacking',
      4: lang === 'ar' ? 'الدفاع والحماية' : 'Defense & Protection',
      5: lang === 'ar' ? 'التحليل الجنائي' : 'Digital Forensics',
      6: lang === 'ar' ? 'الأمن السحابي' : 'Cloud Security',
      7: lang === 'ar' ? 'أمن التطبيقات' : 'Application Security',
      8: lang === 'ar' ? 'إدارة الأمن' : 'Security Management'
    };
    return phaseTitles[phase] || `${t('phase')} ${phase}`;
  };

  // الحصول على وصف المرحلة
  const getPhaseDescription = (phase: number) => {
    const phaseDescriptions: { [key: number]: string } = {
      1: lang === 'ar' ? 'تعلم المفاهيم الأساسية' : 'Learn fundamental concepts',
      2: lang === 'ar' ? 'فهم الشبكات والحماية' : 'Understand networks & protection',
      3: lang === 'ar' ? 'البرمجة والاختراق' : 'Programming & hacking',
      4: lang === 'ar' ? 'تقنيات الدفاع' : 'Defense techniques',
      5: lang === 'ar' ? 'التحليل الجنائي الرقمي' : 'Digital forensics analysis',
      6: lang === 'ar' ? 'أمن الحوسبة السحابية' : 'Cloud computing security',
      7: lang === 'ar' ? 'أمان التطبيقات' : 'Application security',
      8: lang === 'ar' ? 'إدارة الأمن السيبراني' : 'Cybersecurity management'
    };
    return phaseDescriptions[phase] || '';
  };

  // الحصول على عنوان الأسبوع
  const getWeekTitle = (week: number) => {
    const weekTitles: { [key: number]: string } = {
      1: lang === 'ar' ? 'مقدمة في الأمن السيبراني' : 'Introduction to Cybersecurity',
      2: lang === 'ar' ? 'التهديدات والهجمات' : 'Threats & Attacks',
      3: lang === 'ar' ? 'أدوات الحماية' : 'Protection Tools',
      4: lang === 'ar' ? 'أفضل الممارسات' : 'Best Practices',
      5: lang === 'ar' ? 'المراقبة والكشف' : 'Monitoring & Detection',
      6: lang === 'ar' ? 'الاستجابة للحوادث' : 'Incident Response',
      7: lang === 'ar' ? 'التقييم والتحسين' : 'Assessment & Improvement',
      8: lang === 'ar' ? 'التطبيق العملي' : 'Practical Application'
    };
    return weekTitles[week] || `${t('week')} ${week}`;
  };

  // الحصول على وصف الأسبوع
  const getWeekDescription = (week: number) => {
    const weekDescriptions: { [key: number]: string } = {
      1: lang === 'ar' ? 'أساسيات ومفاهيم' : 'Basics & concepts',
      2: lang === 'ar' ? 'أنواع التهديدات' : 'Types of threats',
      3: lang === 'ar' ? 'أدوات وتقنيات' : 'Tools & techniques',
      4: lang === 'ar' ? 'ممارسات آمنة' : 'Safe practices',
      5: lang === 'ar' ? 'المراقبة المستمرة' : 'Continuous monitoring',
      6: lang === 'ar' ? 'الاستجابة السريعة' : 'Quick response',
      7: lang === 'ar' ? 'التقييم المستمر' : 'Continuous assessment',
      8: lang === 'ar' ? 'التطبيق العملي' : 'Practical application'
    };
    return weekDescriptions[week] || '';
  };

  return (
    <PageLayout title={t('plan')} subtitle={t('planSubtitle')} showHeader={true}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('plan')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('planDescription')}
          </p>
        </div>

        {/* Plan Tree */}
        <div className="space-y-4">
          {phases.map(phase => {
            const weeks = getWeeksForPhase(phase);
            const isExpanded = expandedPhases.has(phase);
            
            return (
              <Card key={phase} className="overflow-hidden">
                {/* Phase Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => togglePhase(phase)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('phase')} {phase}: {getPhaseTitle(phase)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {weeks.length} {t('weeks')} • {getPhaseDescription(phase)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {weeks.length} {t('weeks')}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Weeks */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {weeks.map(week => {
                      const days = getDaysForWeek(week.week);
                      const isWeekExpanded = expandedWeeks.has(week.week);
                      
                      return (
                        <div key={week.week} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                          {/* Week Header */}
                          <div 
                            className="flex items-center justify-between p-4 pl-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => toggleWeek(week.week)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {t('week')} {week.week}: {getWeekTitle(week.week)}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {days.length} {t('days')} • {getWeekDescription(week.week)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {days.length} {t('days')}
                              </span>
                              {isWeekExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Days */}
                          {isWeekExpanded && (
                            <div className="bg-gray-50 dark:bg-gray-900">
                              {days.map((day, dayIndex) => (
                                <div 
                                  key={day.key}
                                  className={`flex items-center justify-between p-3 pl-12 cursor-pointer transition-colors ${
                                    isDayActive(week.week, dayIndex)
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                  onClick={() => navigate(`/day/${week.week}/${dayIndex}`)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-lg ${
                                      isDayActive(week.week, dayIndex)
                                        ? 'bg-blue-200 dark:bg-blue-800'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                      <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <span className={`font-medium ${
                                      isDayActive(week.week, dayIndex)
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {day.day?.[lang] || day.key}
                                    </span>
                                  </div>
                                  {isDayActive(week.week, dayIndex) && (
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {phases.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noPlanData')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('noPlanDataDescription')}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}