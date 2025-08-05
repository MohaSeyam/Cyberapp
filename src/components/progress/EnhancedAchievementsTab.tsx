import React from 'react';
import { Card } from '../ui/Card';

const EnhancedAchievementsTab = React.memo(({ stats, language }) => {
  // مثال: عرض الإنجازات
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.achievements.map((ach, i) => (
        <Card key={ach.id} className="p-6 flex flex-col items-start">
          <div className="text-lg font-bold mb-2">{language === 'ar' ? ach.title.ar : ach.title.en}</div>
          <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? ach.category.ar : ach.category.en}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-yellow-200 rounded px-2 py-1">{language === 'ar' ? 'النقاط' : 'Points'}: {ach.points}</span>
          </div>
          <div className="text-xs text-gray-400">{ach.description}</div>
        </Card>
      ))}
    </div>
  );
});

export default EnhancedAchievementsTab;