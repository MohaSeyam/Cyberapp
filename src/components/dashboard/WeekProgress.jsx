import { useTranslation } from "react-i18next";
import { useCyberPlan } from "../../hooks/useCyberPlan";
import { useEffect, useState } from "react";
import { getPlanData } from "../../services/dataService";
import ProgressBar from "../ui/ProgressBar";
import { motion } from "framer-motion";

function getCurrentWeekNumber() {
  // احسب رقم الأسبوع الحالي بناءً على التاريخ (بسيط: الأسبوع الأول هو الحالي)
  // يمكن تطويره لاحقًا ليحسب فعليًا الأسبوع حسب التقدم
  return 1;
}

export default function WeekProgress() {
  const { t } = useTranslation();
  const { plan, loading } = useCyberPlan();
  const [progress, setProgress] = useState(0);
  const [weekInfo, setWeekInfo] = useState({ week: 1, totalTasks: 0, completedTasks: 0 });

  useEffect(() => {
    async function calcProgress() {
      const weekNum = getCurrentWeekNumber();
      const planData = await getPlanData();
      const week = planData.find(w => w.week === weekNum);
      if (!week) return setProgress(0);
      
      const allTasks = (week.days || []).flatMap(day => day.tasks || []);
      if (!allTasks.length) return setProgress(0);
      
      // حالة الإنجاز من db.plan
      const doneMap = {};
      plan.forEach(w => {
        (w.tasks || []).forEach(t => {
          if (t.id && t.done) doneMap[t.id] = true;
        });
      });
      
      const completedTasks = allTasks.filter(task => doneMap[task.id]).length;
      const progressPercent = Math.round((completedTasks / allTasks.length) * 100);
      
      setProgress(progressPercent);
      setWeekInfo({
        week: weekNum,
        totalTasks: allTasks.length,
        completedTasks
      });
    }
    calcProgress();
  }, [plan]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-light-accent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">{t("loading", "جاري التحميل...")}</span>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Circular Progress */}
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
          <circle 
            cx="40" 
            cy="40" 
            r="32" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="6" 
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="40" 
            cy="40" 
            r="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 32}
            strokeDashoffset={2 * Math.PI * 32 * (1 - progress / 100)}
            strokeLinecap="round"
            className="text-light-accent dark:text-dark-accent transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-light-accent dark:text-dark-accent">
            {progress}%
          </span>
        </div>
      </div>
      
      {/* Progress Info */}
      <div className="text-center space-y-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {t("weekProgress", "التقدم الأسبوعي")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {weekInfo.completedTasks} من {weekInfo.totalTasks} مهمة مكتملة
        </p>
      </div>
      
      {/* Linear Progress Bar */}
      <div className="w-full max-w-xs">
        <ProgressBar 
          progress={progress} 
          size="sm" 
          variant="primary" 
          showLabel={false}
        />
      </div>
    </motion.div>
  );
}
