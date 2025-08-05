import React from 'react';
import Card from '../ui/Card';

const EnhancedSkillsTab = React.memo(({ stats, language }) => {
  // مثال: عرض المهارات
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.skills.map((skill, i) => (
        <Card key={skill.id} className="p-6 flex flex-col items-start">
          <div className="text-lg font-bold mb-2">{language === 'ar' ? skill.name.ar : skill.name.en}</div>
          <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? skill.category.ar : skill.category.en}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-gray-200 rounded px-2 py-1">{language === 'ar' ? 'المستوى' : 'Level'}: {skill.level}</span>
            <span className="text-xs bg-gray-100 rounded px-2 py-1">{language === 'ar' ? 'اللون' : 'Color'}: {skill.color}</span>
          </div>
          <div className="text-xs text-gray-400">{skill.description}</div>
        </Card>
      ))}
    </div>
  );
});

export default EnhancedSkillsTab;