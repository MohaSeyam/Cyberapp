import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronRight, Target, Home, Sun, Coffee, Zap, Heart, Brain, Shield, Bug, FileText, Users, Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';

// Day icons mapping
const dayIcons = {
  sat: Sun,
  sun: Sun,
  mon: Coffee,
  tue: Zap,
  wed: Heart,
  thu: Brain,
  fri: Star
};

// Breadcrumbs component (assuming it's a local component or imported)
function Breadcrumbs({ items }: { items: Array<{ label: string; onClick?: () => void; icon?: any }> }) {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Home className="w-4 h-4 mr-1" />
        الرئيسية
      </button>
      
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          {item.onClick ? (
            <button onClick={item.onClick} className="text-blue-600 dark:text-blue-400 hover:underline">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </button>
          ) : (
            <span className="text-gray-700 dark:text-gray-200 font-semibold">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function DaysPage() {
  const { plan, progress, refreshData } = useApp();
  const { t, lang } = useLocalization(); // Get lang for dynamic content
  const navigate = useNavigate();
  const { weekId } = useParams();

  // Safe translation function
  const safeT = (key: string, fallback: string) => {
    try {
      return t ? t(key) : fallback;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return fallback;
    }
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  const weekNumber = parseInt(weekId);
  const week = safePlan.find(w => w.week === weekNumber);

  const goToDayView = (dayIndex: number) => {
    navigate(`/day/${weekId}/${dayIndex}`);
  };

  const goToWeekView = () => {
    navigate('/phases');
  };

  if (!week) {
    return (
      <PageLayout title="خطأ" subtitle="الأسبوع غير موجود" showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            الأسبوع {weekNumber} غير موجود
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            قد تكون البيانات غير محملة بشكل صحيح. جرب تحديث البيانات.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={refreshData} variant="primary">
              تحديث البيانات
            </Button>
            <Button onClick={goToWeekView} variant="outline">
              العودة للمراحل
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBottomBar={true}>
      <motion.div {...animations.fadeIn} className="space-y-6">
        <div className="mb-4">
          <span className="text-base text-gray-500 dark:text-gray-400">
            {safeT('week', 'الأسبوع')} {weekNumber}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1 mb-2">
            {week.title?.[lang] || week.title?.ar}
          </h1>
        </div>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {safeT('daysOfWeek', 'أيام الأسبوع')}
          </h3>
          <div className="space-y-3">
            {week.days?.filter(day => day.key !== 'fri').map((day, dayIndex) => {
              const dayKey = day.key;
              const totalTasks = day.tasks?.length || 0;
              
              const completedTasks = (day.tasks || []).filter(task => {
                return safeProgress.some(p => 
                  p.weekId?.toString() === weekNumber?.toString() && 
                  p.dayKey === dayKey && 
                  p.taskId === task.id && 
                  p.done
                );
              }).length;

              const DayIcon = dayIcons[dayKey] || Calendar;
              
              return (
                <motion.div 
                  key={dayKey} 
                  {...animations.stagger(dayIndex * 0.1)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600`}
                  onClick={() => goToDayView(dayIndex)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900 shadow-sm">
                      <DayIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {day.name?.[lang] || day.day?.[lang] || day.name?.ar}
                      </h4>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        {day.topic?.[lang] || day.topic?.ar}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {safeT('tasksCount', 'عدد المهام')}
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {completedTasks}/{totalTasks}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                    <div 
                      className="h-3 rounded-full transition-all duration-300 bg-blue-500"
                      style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}

