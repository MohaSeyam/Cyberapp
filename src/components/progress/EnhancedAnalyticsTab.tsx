import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import PieChart from '../charts/PieChart';

const EnhancedAnalyticsTab = React.memo(({ plan, progress, stats, language, colorClassMap }) => {
  // مثال: حساب بيانات الرسم البياني
  const pieData = useMemo(() => {
    const taskTypes = {};
    plan.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach(task => {
          const type = task.type;
          if (!taskTypes[type]) taskTypes[type] = 0;
          if (progress.some(p => p.taskId === task.id && p.done)) taskTypes[type]++;
        });
      });
    });
    return Object.entries(taskTypes).map(([type, count], i) => ({
      id: type,
      label: type,
      value: count,
      color: Object.keys(colorClassMap)[i % Object.keys(colorClassMap).length],
    }));
  }, [plan, progress, colorClassMap]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">{language === 'ar' ? 'توزيع أنواع المهام' : 'Task Types Distribution'}</h3>
        <PieChart data={pieData} title={language === 'ar' ? 'أنواع المهام' : 'Task Types'} />
      </Card>
      {/* يمكن إضافة المزيد من التحليلات هنا */}
    </div>
  );
});

export default EnhancedAnalyticsTab;