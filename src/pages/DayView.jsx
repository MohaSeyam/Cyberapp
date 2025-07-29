import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle,
  BookOpen,
  Target,
  TrendingUp,
  CalendarDays,
  ChevronRight,
  Home,
  List,
  Grid3X3,
  Filter,
  Search
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { getPlanData } from "../services/dataService";
import DayViewPage from "./DayView/DayViewPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ProgressBar from "../components/ui/ProgressBar";

function Breadcrumbs({ weekId, dayTitle, phaseId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <motion.nav 
      className="mb-6 text-sm" 
      aria-label="breadcrumb"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ol className="flex items-center gap-2 text-light-textSecondary dark:text-dark-textSecondary">
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-1 p-1"
          >
            <Home className="w-4 h-4" />
            {t("dashboardTitle", "لوحة التحكم")}
          </Button>
        </li>
        <ChevronRight className="w-4 h-4" />
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/week/${weekId}`)}
            className="p-1"
          >
            {t("week", "الأسبوع")} {weekId}
          </Button>
        </li>
        <ChevronRight className="w-4 h-4" />
        <li className="font-semibold text-light-accent dark:text-dark-accent">
          {dayTitle}
        </li>
      </ol>
    </motion.nav>
  );
}

function DayHeader({ day, weekId, phaseId, onTaskComplete }) {
  const { t, i18n } = useTranslation();
  const { appState } = useApp();
  const navigate = useNavigate();
  
  const dayTitle = day.day?.[lang] || day.day?.ar || day.day?.en;
  const dayDescription = day.description?.[lang] || day.description?.ar || day.description?.en;
  
  // Calculate progress
  const totalTasks = (day.tasks || []).length || 0;
  const completedTasks = (day.tasks || []).filter(task => {
    const taskId = String(task.id);
    return appState.progress[weekId]?.[day.key]?.[taskId];
  }).length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Navigation functions
  const goToPreviousDay = () => {
    // This would need to be implemented based on your navigation logic
    navigate(`/week/${weekId}/day/${day.key - 1}`);
  };

  const goToNextDay = () => {
    // This would need to be implemented based on your navigation logic
    navigate(`/week/${weekId}/day/${day.key + 1}`);
  };

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("previousDay", "اليوم السابق")}
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-2 flex items-center gap-3">
              <CalendarDays className="w-8 h-8" />
              {dayTitle}
            </h1>
            {dayDescription && (
              <p className="text-light-textSecondary dark:text-dark-textSecondary max-w-2xl">
                {dayDescription}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            className="flex items-center gap-2"
          >
            {t("nextDay", "اليوم التالي")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Summary */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("totalTasks", "إجمالي المهام")}
              </span>
            </div>
            <div className="text-2xl font-bold text-light-accent dark:text-dark-accent">
              {totalTasks}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("completedTasks", "المهام المكتملة")}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedTasks}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("progress", "التقدم")}
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <ProgressBar 
            progress={progressPercentage} 
            size="lg" 
            variant="primary"
            showLabel={false}
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/week/${weekId}`)}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          {t("viewWeek", "عرض الأسبوع")}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/phase/${phaseId}`)}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {t("viewPhase", "عرض المرحلة")}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/notebook")}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {t("addNotes", "إضافة ملاحظات")}
        </Button>
      </div>
    </motion.div>
  );
}

export default function DayView() {
  const { t, i18n } = useTranslation();
  const { lang: contextLang, appState } = useApp();
  const lang = contextLang || "ar";
  const { weekId, dayKey } = useParams();
  const [day, setDay] = useState(null);
  const [phaseId, setPhaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("all"); // all, completed, pending

  useEffect(() => {
    async function fetchDay() {
      try {
        setLoading(true);
        const planData = await getPlanData();
        const week = planData.find(w => String(w.week) === String(weekId));
        setPhaseId(week?.phase || null);
        const d = week?.days?.find(d => d.key === dayKey);
        setDay(d);
      } catch (error) {
        console.error('Error fetching day data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDay();
  }, [weekId, dayKey]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loadingDay", "جاري تحميل بيانات اليوم...")}
          </p>
        </div>
      </div>
    );
  }

  if (!day) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t("dayNotFound", "اليوم غير موجود")}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {t("dayNotFoundDescription", "لم يتم العثور على اليوم المطلوب")}
          </p>
          <Button onClick={() => window.history.back()}>
            {t("goBack", "العودة")}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <Breadcrumbs weekId={weekId} dayTitle={day.day?.[lang] || day.day?.ar || day.day?.en} phaseId={phaseId} />
      
      <DayHeader day={day} weekId={weekId} phaseId={phaseId} />
      
      {/* Filters and Search */}
      <motion.div className="mb-6" variants={itemVariants}>
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("searchTasks", "البحث في المهام...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              >
                <option value="all">{t("allTasks", "جميع المهام")}</option>
                <option value="completed">{t("completed", "مكتملة")}</option>
                <option value="pending">{t("pending", "قيد التنفيذ")}</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              >
                {viewMode === "list" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Day Content */}
      <motion.div variants={itemVariants}>
        <DayViewPage 
          day={day} 
          weekId={weekId} 
          phaseId={phaseId}
          viewMode={viewMode}
          searchQuery={searchQuery}
          filterCompleted={filterCompleted}
        />
      </motion.div>
    </motion.div>
  );
}
