import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Filter, X, Search, Calendar, Target, Clock } from "lucide-react";

export default function AdvancedFilters({ onFiltersChange, filters = {} }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    phase: filters.phase || "all",
    taskType: filters.taskType || "all",
    duration: filters.duration || "all",
    status: filters.status || "all",
    search: filters.search || ""
  });

  const phases = [
    { id: "all", name: "جميع المراحل" },
    { id: "1", name: "المرحلة الأولى (1-17)" },
    { id: "2", name: "المرحلة الثانية (18-37)" },
    { id: "3", name: "المرحلة الثالثة (38-50)" }
  ];

  const taskTypes = [
    { id: "all", name: "جميع الأنواع" },
    { id: "Blue Team", name: "الفريق الأزرق" },
    { id: "Red Team", name: "الفريق الأحمر" },
    { id: "Purple Team", name: "الفريق الأرجواني" },
    { id: "Practical", name: "عملي" },
    { id: "Soft Skills", name: "مهارات ناعمة" },
    { id: "Career", name: "مهني" }
  ];

  const durations = [
    { id: "all", name: "جميع المدد" },
    { id: "short", name: "قصيرة (15-30 دقيقة)" },
    { id: "medium", name: "متوسطة (45-60 دقيقة)" },
    { id: "long", name: "طويلة (90+ دقيقة)" }
  ];

  const statuses = [
    { id: "all", name: "جميع الحالات" },
    { id: "completed", name: "مكتملة" },
    { id: "pending", name: "قيد الانتظار" },
    { id: "in-progress", name: "قيد التنفيذ" }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      phase: "all",
      taskType: "all",
      duration: "all",
      status: "all",
      search: ""
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== "all" && value !== "");

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Filter className="w-4 h-4" />
          {t("advancedFilters", "تصفية متقدمة")}
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            {t("clearFilters", "مسح التصفية")}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  {t("search", "بحث")}
                </label>
                <input
                  type="text"
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder={t("searchPlaceholder", "ابحث في المهام والمواضيع...")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Phase Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t("phase", "المرحلة")}
                </label>
                <select
                  value={localFilters.phase}
                  onChange={(e) => handleFilterChange("phase", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {phases.map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Type Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("taskType", "نوع المهمة")}
                </label>
                <select
                  value={localFilters.taskType}
                  onChange={(e) => handleFilterChange("taskType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {taskTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t("duration", "المدة")}
                </label>
                <select
                  value={localFilters.duration}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {durations.map(duration => (
                    <option key={duration.id} value={duration.id}>
                      {duration.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("status", "الحالة")}
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(localFilters).map(([key, value]) => {
                    if (value === "all" || value === "") return null;
                    
                    let label = "";
                    switch (key) {
                      case "phase":
                        label = phases.find(p => p.id === value)?.name;
                        break;
                      case "taskType":
                        label = taskTypes.find(t => t.id === value)?.name;
                        break;
                      case "duration":
                        label = durations.find(d => d.id === value)?.name;
                        break;
                      case "status":
                        label = statuses.find(s => s.id === value)?.name;
                        break;
                      case "search":
                        label = `بحث: ${value}`;
                        break;
                      default:
                        label = value;
                    }
                    
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {label}
                        <button
                          onClick={() => handleFilterChange(key, key === "search" ? "" : "all")}
                          className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}