import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  Edit, 
  TrendingUp, 
  Calendar, 
  Layers, 
  CheckCircle, 
  ListChecks,
  Target,
  Award,
  Trophy,
  Star,
  ArrowRight,
  Home,
  BookOpen,
  BarChart3,
  Users,
  Clock,
  Zap,
  Lightbulb,
  BookOpen as BookOpenIcon
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ProgressBar from "../components/ui/ProgressBar";

const PHASE_NAMES = {
  1: "المرحلة التأسيسية",
  2: "المرحلة المتوسطة", 
  3: "المرحلة النهائية"
};

const PHASE_DESCRIPTIONS = {
  1: "بناء الأساسيات والمفاهيم الأساسية",
  2: "تطوير المهارات المتقدمة والتطبيق العملي",
  3: "التخصص والاحترافية في المجال"
};

const PHASE_COLORS = {
  1: "blue",
  2: "emerald", 
  3: "violet"
};

const PHASE_ICONS = {
  1: <BookOpenIcon className="w-8 h-8" />,
  2: <Lightbulb className="w-8 h-8" />,
  3: <Zap className="w-8 h-8" />
};

const PHASE_RANGES = {
  1: "من الأسبوع 1 إلى 17",
  2: "من الأسبوع 18 إلى 37", 
  3: "من الأسبوع 38 إلى 50"
};

export default function PlanPhases() {
  const { t, i18n } = useTranslation();
  const { plan, loading, progress, appState } = useApp();
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loadingPlan", "جاري تحميل الخطة...")}
          </p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(plan) || plan.length === 0) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t("noPlanAvailable", "لا توجد خطة متاحة")}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {t("noPlanDescription", "لم يتم العثور على خطة تعليمية")}
          </p>
          <Button onClick={() => navigate("/")}>
            {t("goBack", "العودة")}
          </Button>
        </div>
      </motion.div>
    );
  }

  // استخرج أرقام المراحل الفريدة فقط
  const phases = Array.from(new Set(plan.map(week => week.phase).filter(Boolean))).sort((a, b) => a - b);
  
  console.log("PlanPhases - plan length:", plan.length);
  console.log("PlanPhases - phases found:", phases);
  
  if (phases.length === 0) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t("noPhasesAvailable", "لا توجد مراحل متاحة")}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {t("noPhasesDescription", "لم يتم العثور على مراحل في الخطة")}
          </p>
          <Button onClick={() => navigate("/")}>
            {t("goBack", "العودة")}
          </Button>
        </div>
      </motion.div>
    );
  }

  // استخراج اسم الخطة (إذا وجد)
  const planName = plan.find(w => w.planName)?.planName || t("plan", "الخطة");

  // حساب بيانات كل مرحلة
  const phaseStats = phases.map(phase => {
    const phaseWeeks = plan.filter(w => w.phase === phase);
    const weeksCount = phaseWeeks.length;
    const allTasks = phaseWeeks.flatMap(w => (w.days || []).flatMap(d => d.tasks || []));
    const tasksCount = allTasks.length;
    const doneCount = allTasks.filter(task => progress.find(p => p.taskId === task.id && p.done)).length;
    const percent = tasksCount ? Math.round((doneCount / tasksCount) * 100) : 0;
    
    // Calculate additional stats
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
    
    return { 
      phase, 
      weeksCount, 
      tasksCount, 
      doneCount, 
      percent, 
      completedWeeks,
      name: PHASE_NAMES[phase],
      description: PHASE_DESCRIPTIONS[phase],
      range: PHASE_RANGES[phase],
      color: PHASE_COLORS[phase],
      icon: PHASE_ICONS[phase]
    };
  });

  // إحصائيات عامة
  const totalWeeks = plan.length;
  const totalTasks = plan.flatMap(w => (w.days || []).flatMap(d => d.tasks || [])).length;
  const totalDone = plan.flatMap(w => (w.days || []).flatMap(d => d.tasks || [])).filter(task => progress.find(p => p.taskId === task.id && p.done)).length;
  const totalPercent = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

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

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-light-accent dark:text-dark-accent mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8" />
          {planName}
        </h1>
        <p className="text-lg text-light-textSecondary dark:text-dark-textSecondary opacity-90 font-medium max-w-2xl mx-auto">
          {t("planDescription", "استعرض تقدمك في جميع مراحل الخطة التعليمية")}
        </p>
      </motion.div>

      {/* Overall Progress */}
      <motion.div className="mb-8" variants={itemVariants}>
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              {t("overallProgress", "التقدم العام")}
            </h2>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalPercent}%
            </div>
            <ProgressBar 
              progress={totalPercent} 
              size="lg" 
              variant="primary"
              showLabel={false}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  {t("totalPhases", "إجمالي المراحل")}
                </span>
              </div>
              <div className="text-2xl font-bold text-light-accent dark:text-dark-accent">
                {phases.length}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  {t("totalWeeks", "إجمالي الأسابيع")}
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalWeeks}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  {t("totalTasks", "إجمالي المهام")}
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {totalTasks}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Phases Grid */}
      <motion.div 
        className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1"}`}
        variants={itemVariants}
      >
        {phaseStats.map((phaseData, idx) => (
          <motion.div
            key={phaseData.phase}
            variants={itemVariants}
            custom={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={`/phase/${phaseData.phase}`} className="block">
              <Card 
                className={`h-full transition-all duration-200 hover:shadow-lg ${
                  phaseData.color === 'blue' ? 'hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800' :
                  phaseData.color === 'emerald' ? 'hover:ring-2 hover:ring-emerald-200 dark:hover:ring-emerald-800' :
                  'hover:ring-2 hover:ring-violet-200 dark:hover:ring-violet-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      phaseData.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      phaseData.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                      'bg-violet-100 dark:bg-violet-900/20'
                    }`}>
                      {phaseData.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {phaseData.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                        phaseData.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' :
                        phaseData.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' :
                        'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200'
                      }`}>
                        {t("phase", "المرحلة")} {phaseData.phase}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-4">
                  {phaseData.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-textSecondary dark:text-dark-textSecondary">
                      {t("weeks", "الأسابيع")}: {phaseData.completedWeeks}/{phaseData.weeksCount}
                    </span>
                    <span className="text-light-textSecondary dark:text-dark-textSecondary">
                      {phaseData.range}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-light-textSecondary dark:text-dark-textSecondary">
                      {t("tasks", "المهام")}: {phaseData.doneCount}/{phaseData.tasksCount}
                    </span>
                    <span className={`font-medium ${
                      phaseData.percent === 100 ? 'text-green-600 dark:text-green-400' :
                      phaseData.percent > 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {phaseData.percent}%
                    </span>
                  </div>
                </div>
                
                <ProgressBar 
                  progress={phaseData.percent} 
                  size="sm" 
                  variant={phaseData.percent === 100 ? "success" : phaseData.percent > 50 ? "warning" : "default"}
                  showLabel={false}
                />
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="mt-8 text-center" variants={itemVariants}>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/cyberplan")}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {t("viewFullPlan", "عرض الخطة كاملة")}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/achievements")}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            {t("viewAchievements", "عرض الإنجازات")}
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
    </motion.div>
  );
}