import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Circle,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronRight,
  BookOpen,
  Clock,
  Star,
  CalendarDays,
  BarChart3,
  Play,
  Pause,
  SkipForward
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { getPlanData } from "../services/dataService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ProgressBar from "../components/ui/ProgressBar";

function Breadcrumbs({ weekTitle, phaseId }) {
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
        {phaseId && (
          <>
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/phase/${phaseId}`)}
                className="p-1"
              >
                {t("phase", "المرحلة")} {phaseId}
              </Button>
            </li>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <li className="font-semibold text-light-accent dark:text-dark-accent">
          {weekTitle}
        </li>
      </ol>
    </motion.nav>
  );
}

function WeekHeader({ week, weekProgress, onStartWeek, onPauseWeek }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const weekTitle = week.title?.[i18n.language] || week.title?.ar || week.title?.en;
  const weekObjective = week.objective?.[i18n.language] || week.objective?.ar || week.objective?.en;
  const weekDescription = week.description?.[i18n.language] || week.description?.ar || week.description?.en;
  
  const totalDays = week.days?.length || 0;
  const completedDays = weekProgress?.completedDays || 0;
  const totalTasks = weekProgress?.totalTasks || 0;
  const completedTasks = weekProgress?.completedTasks || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-4 flex items-center justify-center gap-3">
          <CalendarDays className="w-8 h-8" />
          {weekTitle}
        </h1>
        {weekObjective && (
          <p className="text-lg text-light-textSecondary dark:text-dark-textSecondary mb-2">
            {weekObjective}
          </p>
        )}
        {weekDescription && (
          <p className="text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto">
            {weekDescription}
          </p>
        )}
      </div>

      {/* Progress Summary */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("totalDays", "إجمالي الأيام")}
              </span>
            </div>
            <div className="text-2xl font-bold text-light-accent dark:text-dark-accent">
              {totalDays}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("completedDays", "الأيام المكتملة")}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedDays}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("completedTasks", "المهام المكتملة")}
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {completedTasks}/{totalTasks}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("progress", "التقدم")}
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
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

      {/* Week Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Button
          onClick={onStartWeek}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {t("startWeek", "بدء الأسبوع")}
        </Button>
        
        <Button
          variant="outline"
          onClick={onPauseWeek}
          className="flex items-center gap-2"
        >
          <Pause className="w-4 h-4" />
          {t("pauseWeek", "إيقاف مؤقت")}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate(`/phase/${week.phase}`)}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {t("viewPhase", "عرض المرحلة")}
        </Button>
        
        <Button
          variant="outline"
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

function DaySummaryCard({ day, lang, weekId, weekProgress, onDayClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const dayTitle = day.day?.[lang] || day.day?.ar || day.day?.en;
  const dayTopic = day.topic?.[lang] || day.topic?.ar || day.topic?.en;
  const dayDescription = day.description?.[lang] || day.description?.ar || day.description?.en;
  
  // Calculate day progress
  const dayTasks = day.tasks || [];
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter(task => {
    const taskId = String(task.id);
    return weekProgress?.progress?.[weekId]?.[day.key]?.[taskId];
  }).length;
  const dayProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isCompleted = completedTasks === totalTasks && totalTasks > 0;
  const isInProgress = completedTasks > 0 && completedTasks < totalTasks;

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (isInProgress) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isCompleted) return t("completed", "مكتمل");
    if (isInProgress) return t("inProgress", "قيد التنفيذ");
    return t("notStarted", "لم يبدأ");
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isCompleted ? 'ring-2 ring-green-200 dark:ring-green-800' : 
          isInProgress ? 'ring-2 ring-yellow-200 dark:ring-yellow-800' : ''
        }`}
        onClick={onDayClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{dayTitle}</h3>
              {getStatusIcon()}
            </div>
            
            {dayTopic && (
              <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                {dayTopic}
              </p>
            )}
            
            {dayDescription && (
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary line-clamp-2">
                {dayDescription}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">
              {t("tasks", "المهام")}: {completedTasks}/{totalTasks}
            </span>
            <span className={`font-medium ${
              isCompleted ? 'text-green-600 dark:text-green-400' :
              isInProgress ? 'text-yellow-600 dark:text-yellow-400' :
              'text-gray-500 dark:text-gray-400'
            }`}>
              {getStatusText()}
            </span>
          </div>
          
          <ProgressBar 
            progress={dayProgress} 
            size="sm" 
            variant={isCompleted ? "success" : isInProgress ? "warning" : "default"}
            showLabel={false}
          />
        </div>
      </Card>
    </motion.div>
  );
}

export default function WeekView() {
  const { t, i18n } = useTranslation();
  const { lang, appState } = useApp();
  const { weekId } = useParams();
  const navigate = useNavigate();
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekProgress, setWeekProgress] = useState(null);

  useEffect(() => {
    async function fetchWeek() {
      try {
        setLoading(true);
        const planData = await getPlanData();
        const w = planData.find(w => String(w.week) === String(weekId));
        setWeek(w);
        
        // Calculate week progress
        if (w) {
          const totalTasks = w.days?.reduce((sum, day) => 
            sum + (day.tasks?.length || 0), 0) || 0;
          const completedTasks = w.days?.reduce((sum, day) => {
            const dayCompleted = day.tasks?.filter(task => {
              const taskId = String(task.id);
              return appState.progress[weekId]?.[day.key]?.[taskId];
            }).length || 0;
            return sum + dayCompleted;
          }, 0) || 0;
          const completedDays = w.days?.filter(day => {
            const dayTasks = day.tasks || [];
            const dayCompletedTasks = dayTasks.filter(task => {
              const taskId = String(task.id);
              return appState.progress[weekId]?.[day.key]?.[taskId];
            }).length;
            return dayCompletedTasks === dayTasks.length && dayTasks.length > 0;
          }).length || 0;
          
          setWeekProgress({
            totalTasks,
            completedTasks,
            completedDays,
            progress: appState.progress[weekId] || {}
          });
        }
      } catch (error) {
        console.error('Error fetching week data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWeek();
  }, [weekId, appState.progress]);

  const handleStartWeek = () => {
    // Implementation for starting the week
    console.log('Starting week:', weekId);
  };

  const handlePauseWeek = () => {
    // Implementation for pausing the week
    console.log('Pausing week:', weekId);
  };

  const handleDayClick = (day) => {
    navigate(`/day/${weekId}/${day.key}`);
  };

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
            {t("loadingWeek", "جاري تحميل بيانات الأسبوع...")}
          </p>
        </div>
      </div>
    );
  }

  if (!week) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t("weekNotFound", "الأسبوع غير موجود")}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {t("weekNotFoundDescription", "لم يتم العثور على الأسبوع المطلوب")}
          </p>
          <Button onClick={() => navigate("/")}>
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
      <Breadcrumbs 
        weekTitle={week.title?.[lang] || week.title?.ar || week.title?.en} 
        phaseId={week.phase}
      />
      
      <WeekHeader 
        week={week} 
        weekProgress={weekProgress}
        onStartWeek={handleStartWeek}
        onPauseWeek={handlePauseWeek}
      />
      
      {/* Days Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {(week.days || []).filter(day => day.key !== "fri").map((day, index) => (
          <motion.div
            key={day.key}
            variants={itemVariants}
            custom={index}
          >
            <DaySummaryCard
              day={day}
              lang={lang}
              weekId={week.week}
              weekProgress={weekProgress}
              onDayClick={() => handleDayClick(day)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
