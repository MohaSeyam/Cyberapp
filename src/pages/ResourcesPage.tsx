import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import Card from '../components/ui/Card';
import SearchInput from '../components/ui/SearchInput';
import { Resource } from '../types';

const RESOURCE_TYPES = [
  'video', 'article', 'book', 'tool', 'podcast', 'course', 'quiz', 'project', 'community', 'news', 'link'
];

const typeLabels = {
  video: { ar: 'فيديو', en: 'Video' },
  article: { ar: 'مقال', en: 'Article' },
  book: { ar: 'كتاب', en: 'Book' },
  tool: { ar: 'أداة', en: 'Tool' },
  podcast: { ar: 'بودكاست', en: 'Podcast' },
  course: { ar: 'دورة', en: 'Course' },
  quiz: { ar: 'اختبار', en: 'Quiz' },
  project: { ar: 'مشروع', en: 'Project' },
  community: { ar: 'مجتمع', en: 'Community' },
  news: { ar: 'خبر', en: 'News' },
  link: { ar: 'رابط', en: 'Link' }
};

export default function ResourcesPage() {
  const { plan } = useApp();
  const { language } = useLocalization();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  if (!plan || plan.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-gray-500 dark:text-gray-400">
        {language === 'ar' ? 'لا توجد خطة متاحة أو لم يتم تحميل البيانات بعد.' : 'No plan data available or not loaded yet.'}
      </div>
    );
  }

  let allResources: Resource[] = [];
  try {
    allResources = plan.flatMap(week =>
      (week.days || []).flatMap(day =>
        (day.resources || []).map(resource => ({ ...resource, weekId: week.week, dayIndex: day.key }))
      )
    );
  } catch (err) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-red-500 dark:text-red-400">
        {language === 'ar' ? 'حدث خطأ أثناء تحميل الموارد.' : 'An error occurred while loading resources.'}
      </div>
    );
  }

  const filteredResources = useMemo(() => {
    return allResources.filter(resource => {
      const matchesType = !typeFilter || resource.type === typeFilter;
      const matchesSearch = !search || (resource.title && resource.title.toLowerCase().includes(search.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [allResources, search, typeFilter]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 text-center">
        {language === 'ar' ? 'مستودع الموارد' : 'Resources Repository'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        {language === 'ar'
          ? 'تجد هنا جميع الموارد المضافة في الخطة، يمكنك البحث أو التصفية حسب النوع.'
          : 'Browse all resources added to your plan. You can search or filter by type.'}
      </p>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={language === 'ar' ? 'ابحث باسم المورد...' : 'Search by resource title...'}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">{language === 'ar' ? 'كل الأنواع' : 'All types'}</option>
          {RESOURCE_TYPES.map(type => (
            <option key={type} value={type}>
              {typeLabels[type]?.[language] || type}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
            {language === 'ar' ? 'لا توجد موارد مطابقة أو لم تتم إضافة أي موارد بعد.' : 'No matching resources or no resources have been added yet.'}
          </div>
        ) : (
          filteredResources.map(resource => {
            // Find the day label from the plan using weekId and dayIndex
            let dayLabel = '';
            if (resource.weekId && resource.dayIndex) {
              const weekObj = plan.find(w => w.week === resource.weekId);
              const dayObj = weekObj?.days?.find(d => d.key === resource.dayIndex);
              if (dayObj) {
                dayLabel = dayObj.day?.[language] || '';
              }
            }
            return (
              <Card key={(resource.id || resource.title) + resource.title} className="p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {typeLabels[resource.type]?.[language] || resource.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {resource.weekId ? `${language === 'ar' ? 'أسبوع' : 'Week'} ${resource.weekId}` : ''}
                  </span>
                  {dayLabel && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5">
                      {language === 'ar' ? `اليوم: ${dayLabel}` : `Day: ${dayLabel}`}
                    </span>
                  )}
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-lg text-blue-700 dark:text-blue-300 hover:underline"
                >
                  {resource.title}
                </a>
                {resource.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {resource.description}
                  </div>
                )}
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-gray-400">
                    {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}
                  </span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {language === 'ar' ? 'فتح المورد' : 'Open Resource'}
                  </a>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}