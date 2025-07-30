import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { Target, TrendingUp, Calendar, Award } from "lucide-react";

export default function ProgressIndicator() {
  const { t } = useTranslation();
  const { plan, progress, lang } = useApp();
  
  if (!plan || !progress) return null;
  
  // حساب الإحصائيات
  const totalWeeks = plan.length;
  const completedWeeks = progress.completedWeeks?.length || 0;
  const currentWeek = progress.currentWeek || 1;
  const progressPercentage = (completedWeeks / totalWeeks) * 100;
  
  // تحديد المرحلة الحالية
  const getCurrentPhase = () => {
    if (currentWeek <= 17) return { phase: 1, name: "المرحلة الأولى", color: "blue" };
    if (currentWeek <= 37) return { phase: 2, name: "المرحلة الثانية", color: "purple" };
    return { phase: 3, name: "المرحلة الثالثة", color: "green" };
  };
  
  const currentPhase = getCurrentPhase();
  
  // حساب معدل الإنجاز الأسبوعي
  const weeklyProgress = completedWeeks > 0 ? (completedWeeks / currentWeek) * 100 : 0;
  
  // توقعات الإنجاز
  const estimatedCompletion = weeklyProgress > 0 ? Math.ceil((totalWeeks - completedWeeks) / (weeklyProgress / 100)) : 0;
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          {t("progressOverview", "نظرة عامة على التقدم")}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("completed", "مكتمل")}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{t("week", "أسبوع")} {currentWeek}</span>
          <span>{t("of", "من")} {totalWeeks}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Current Phase Indicator */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-${currentPhase.color}-500`}></div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {currentPhase.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("currentPhase", "المرحلة الحالية")} • {t("week", "أسبوع")} {currentWeek}
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {Math.round(weeklyProgress)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("weeklyRate", "معدل أسبوعي")}
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {estimatedCompletion}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("weeksToComplete", "أسابيع للإنجاز")}
          </div>
        </div>
      </div>
      
      {/* Achievement Badge */}
      {progressPercentage >= 25 && (
        <motion.div 
          className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center gap-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Award className="w-5 h-5 text-yellow-600" />
          <div className="text-sm">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {t("quarterComplete", "ربع الطريق مكتمل!")}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {t("keepGoing", "استمر في التقدم")}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}