import React from 'react';
import { Card } from '../ui/Card';

const EnhancedSuggestionsTab = React.memo(({ stats, language }) => {
  // مثال: عرض الاقتراحات
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.suggestions.map((sugg, i) => (
        <Card key={sugg.id} className="p-6 flex flex-col items-start">
          <div className="text-lg font-bold mb-2">{language === 'ar' ? sugg.title.ar : sugg.title.en}</div>
          <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? sugg.category.ar : sugg.category.en}</div>
          <div className="text-xs text-gray-400">{sugg.description}</div>
        </Card>
      ))}
    </div>
  );
});

export default EnhancedSuggestionsTab;