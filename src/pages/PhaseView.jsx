import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
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
  SkipForward,
  Trophy,
  Award,
  Users,
  Calendar,
  BookOpen as BookOpenIcon,
  Lightbulb,
  Zap
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { getPlanData } from "../services/dataService";
import WeekCard from "../components/plan/WeekCard";
import { useCyberPlan } from "../hooks/useCyberPlan";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ProgressBar from "../components/ui/ProgressBar";

function Breadcrumbs({ phaseTitle, phaseId }) {
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
        <li className="font-semibold text-light-accent dark:text-dark-accent">
          {phaseTitle}
        </li>
      </ol>
    </motion.nav>
  );
}

function PhaseHeader({ phase, phaseProgress, onStartPhase, onPausePhase }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const phaseTitle = phase.name?.[i18n.language] || phase.name?.ar || phase.name?.en || phase.name;
  const phaseDescription = phase.description?.[i18n.language] || phase.description?.ar || phase.description?.en || phase.description;
  
  const totalWeeks = phaseProgress?.totalWeeks || 0;
  const completedWeeks = phaseProgress?.completedWeeks || 0;
  const totalTasks = phaseProgress?.totalTasks || 0;
  const completedTasks = phaseProgress?.completedTasks || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPhaseIcon = (phaseId) => {
    switch (phaseId) {
      case 1: return <BookOpenIcon className="w-8 h-8" />;
      case 2: return <Lightbulb className="w-8 h-8" />;
      case 3: return <Zap className="w-8 h-8" />;
      default: return <Target className="w-8 h-8" />;
    }
  };

  const getPhaseColor = (phaseId) => {
    switch (phaseId) {
      case 1: return "text-blue-600 dark:text-blue-400";
      case 2: return "text-green-600 dark:text-green-400";
      case 3: return "text-purple-600 dark:text-purple-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="text-center mb-6">
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${getPhaseColor(phase.id)}`}>
          {getPhaseIcon(phase.id)}
          {phaseTitle}
        </h1>
        {phaseDescription && (
          <p className="text-light-textSecondary dark:text-dark-textSecondary max-w-3xl mx-auto">
            {phaseDescription}
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
                {t("totalWeeks", "إجمالي الأسابيع")}
              </span>
            </div>
            <div className="text-2xl font-bold text-light-accent dark:text-dark-accent">
              {totalWeeks}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                {t("completedWeeks", "الأسابيع المكتملة")}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedWeeks}
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

      {/* Phase Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Button
          onClick={onStartPhase}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {t("startPhase", "بدء المرحلة")}
        </Button>
        
        <Button
          variant="outline"
          onClick={onPausePhase}
          className="flex items-center gap-2"
        >
          <Pause className="w-4 h-4" />
          {t("pausePhase", "إيقاف مؤقت")}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate("/cyberplan")}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {t("viewPlan", "عرض الخطة")}
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

function DaySummaryCard({ day, lang, weekId, onDayClick, color = "amber" }) {
  const colorMap = {
    amber: {
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300"
    },
    blue: {
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300"
    },
    emerald: {
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300"
    },
    violet: {
      border: "border-violet-200 dark:border-violet-800",
      text: "text-violet-700 dark:text-violet-300"
    },
    pink: {
      border: "border-pink-200 dark:border-pink-800",
      text: "text-pink-700 dark:text-pink-300"
    },
    stone: {
      border: "border-stone-200 dark:border-stone-700",
      text: "text-stone-700 dark:text-stone-300"
    }
  };
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${colorMap[color]?.border || colorMap.amber.border}`}
        onClick={onDayClick}
      >
        <div className="text-center">
          <span className="font-bold text-base text-slate-800 dark:text-slate-100 drop-shadow-sm block mb-1">
            {day.day?.[lang] || day.day?.ar || day.day?.en}
          </span>
          <span className={`text-sm font-semibold opacity-90 ${colorMap[color]?.text || colorMap.amber.text}`}>
            {day.topic?.[lang] || day.topic?.ar || day.topic?.en}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

export default function PhaseView() {
  const { t, i18n } = useTranslation();
  const { lang, appState } = useApp();
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phaseProgress, setPhaseProgress] = useState(null);
  const { plan, progress } = useApp();
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    async function fetchPhase() {
      try {
        setLoading(true);
        const planData = await getPlanData();
        // استخرج جميع الأسابيع التابعة للمرحلة
        const phaseWeeks = planData.filter(w => String(w.phase) === String(phaseId));
        setWeeks(phaseWeeks);
        
        // بيانات المرحلة (من أول أسبوع)
        if (phaseWeeks.length > 0) {
          setPhase({
            id: phaseWeeks[0].phase,
            name: phaseWeeks[0].phaseTitle || phaseWeeks[0].title,
            description: phaseWeeks[0].phaseDescription || phaseWeeks[0].objective || ""
          });
        }
        
        console.log("PhaseView - phaseId:", phaseId);
        console.log("PhaseView - phaseWeeks found:", phaseWeeks.length);
        
        // Calculate phase progress
        if (phaseWeeks.length > 0) {
          const totalWeeks = phaseWeeks.length;
          const totalTasks = phaseWeeks.reduce((sum, week) => 
            sum + (week.days?.reduce((daySum, day) => 
              daySum + (day.tasks?.length || 0), 0) || 0), 0);
          
          const completedTasks = phaseWeeks.reduce((sum, week) => {
            const weekCompleted = week.days?.reduce((daySum, day) => {
              const dayCompleted = day.tasks?.filter(task => {
                const taskId = String(task.id);
                return appState.progress[week.week]?.[day.key]?.[taskId];
              }).length || 0;
              return daySum + dayCompleted;
            }, 0) || 0;
            return sum + weekCompleted;
          }, 0);
          
          const completedWeeks = phaseWeeks.filter(week => {
            const weekTasks = week.days?.reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
            const weekCompleted = week.days?.reduce((sum, day) => {
              const dayCompleted = day.tasks?.filter(task => {
                const taskId = String(task.id);
                return appState.progress[week.week]?.[day.key]?.[taskId];
              }).length || 0;
              return sum + dayCompleted;
            }, 0) || 0;
            return weekCompleted === weekTasks && weekTasks > 0;
          }).length;
          
          setPhaseProgress({
            totalWeeks,
            completedWeeks,
            totalTasks,
            completedTasks
          });
        }
      } catch (error) {
        console.error('Error fetching phase data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPhase();
  }, [phaseId, appState.progress]);

  const handleStartPhase = () => {
    // Implementation for starting the phase
    console.log('Starting phase:', phaseId);
  };

  const handlePausePhase = () => {
    // Implementation for pausing the phase
    console.log('Pausing phase:', phaseId);
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
            {t("loadingPhase", "جاري تحميل بيانات المرحلة...")}
          </p>
        </div>
      </div>
    );
  }

  if (!phase) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t("phaseNotFound", "المرحلة غير موجودة")}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {t("phaseNotFoundDescription", "لم يتم العثور على المرحلة المطلوبة")}
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
        phaseTitle={phase.name?.[lang] || phase.name?.ar || phase.name?.en || phase.name} 
        phaseId={phaseId}
      />
      
      <PhaseHeader 
        phase={phase} 
        phaseProgress={phaseProgress}
        onStartPhase={handleStartPhase}
        onPausePhase={handlePausePhase}
      />
      
      {/* Weeks Grid */}
      <motion.div 
        className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1"}`}
        variants={itemVariants}
      >
        {weeks.map((week, idx) => {
          // حساب نسبة الإنجاز للأسبوع بناءً على progress
          const allTasks = (week.days || []).flatMap(day => day.tasks || []);
          const doneCount = allTasks.filter(task => progress.find(p => p.taskId === task.id && p.done)).length;
          const percent = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
          
          // لون المرحلة والأسابيع
          let phaseColor = "blue";
          if (phase.id === 2) phaseColor = "emerald";
          if (phase.id === 3) phaseColor = "violet";
          
          return (
            <motion.div
              key={week.week}
              variants={itemVariants}
              custom={idx}
            >
              <WeekCard
                week={week}
                lang={lang}
                progress={percent}
                color={phaseColor}
                DaySummaryCard={DaySummaryCard}
                dayColor="stone"
                expanded={expandedWeek === week.week}
                onExpand={w => setExpandedWeek(w === expandedWeek ? null : w)}
                navigate={navigate}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}