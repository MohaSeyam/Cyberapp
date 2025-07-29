// Dashboard.jsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Star, 
  Zap,
  ArrowRight,
  Play,
  BookOpen,
  PenTool
} from "lucide-react";
import PhaseCard from "../components/plan/PhaseCard";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";
import WeekProgress from "../components/dashboard/WeekProgress";
import AchievementsSummary from "../components/dashboard/AchievementsSummary";
import { getPhases } from "../services/dataService";
import { useCyberPlan } from "../hooks/useCyberPlan";
import SkeletonCard from "../components/ui/SkeletonCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Dashboard() {
  console.log("Dashboard component rendering - START");
  const { t } = useTranslation();
  const { lang, addNotification } = useApp();
  const { plan, progress, loading } = useCyberPlan();
  const [phases, setPhases] = useState([]);
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();
  const isRTL = lang === "ar";

  console.log("Dashboard state:", { plan, progress, loading, phases, greeting });

  useEffect(() => {
    console.log("Dashboard useEffect running");
    async function loadDashboard() {
      try {
        const phasesData = await getPhases();
        console.log("Phases data loaded:", phasesData);
        setPhases(phasesData);
        
        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) {
          setGreeting("صباح الخير");
        } else if (hour < 18) {
          setGreeting("مساء الخير");
        } else {
          setGreeting("مساء الخير");
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        addNotification('error', 'خطأ في تحميل البيانات', 'فشل في تحميل بيانات لوحة التحكم');
      }
    }
    loadDashboard();
  }, [addNotification]);

  console.log("Dashboard before render check:", { loading, phases });

  if (loading) {
    console.log("Dashboard showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loading", "جاري تحميل لوحة التحكم...")}
          </p>
        </div>
      </div>
    );
  }

  console.log("Dashboard rendering main content - about to render quickActions");

  const quickActions = [
    {
      title: "بدء مهمة",
      description: "ابدأ مهمة جديدة",
      icon: Play,
      color: "blue",
      action: () => navigate("/plan")
    },
    {
      title: "إضافة ملاحظة",
      description: "سجل ملاحظاتك",
      icon: PenTool,
      color: "emerald",
      action: () => navigate("/notebook")
    },
    {
      title: "التدوين اليومي",
      description: "اكتب يومياتك",
      icon: BookOpen,
      color: "violet",
      action: () => navigate("/journal")
    }
  ];

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

  console.log("Dashboard about to return JSX");
  return (
    <motion.div 
      className={`max-w-7xl mx-auto py-8 px-4 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text font-tajawal ${isRTL ? "rtl" : "ltr"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="text-center mb-6">
          <motion.h1 
            className="text-4xl md:text-5xl font-extrabold text-light-accent dark:text-dark-accent mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {greeting} 👋
          </motion.h1>
          <motion.p 
            className="text-xl text-light-textSecondary dark:text-dark-textSecondary opacity-90 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t("welcomeMsg", "مرحبًا بعودتك! استكشف تقدمك وابدأ يومك بخطوة جديدة.")}
          </motion.p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">المهام المكتملة</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {progress?.filter(p => p.done).length || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">الأيام النشطة</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {new Set(progress?.map(p => p.weekId)).size || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-violet-600 dark:text-violet-400">الإنجازات</p>
                <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                  {phases.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">الوقت المستثمر</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {Math.floor((progress?.length || 0) * 0.5)}h
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="mb-8" variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-light-accent dark:text-dark-accent" />
          {t("quickActions", "إجراءات سريعة")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                interactive 
                className="cursor-pointer"
                onClick={action.action}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Phase Cards */}
      <motion.div className="mb-10" variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-light-accent dark:text-dark-accent" />
          {t("learningPhases", "مراحل التعلم")}
        </h2>
        
        <AnimatePresence>
          {phases.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <motion.div key={i} variants={itemVariants}>
                  <SkeletonCard />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {phases.slice(0, 3).map((phase, idx) => {
                const phaseWeeks = plan.filter(w => String(w.phase) === String(phase.id));
                const allTasks = phaseWeeks.flatMap(w => (w.days || []).flatMap(d => d.tasks || []));
                const doneCount = allTasks.filter(task => progress.find(p => p.taskId === task.id && p.done)).length;
                const percent = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
                
                return (
                  <motion.div
                    key={phase.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PhaseCard
                      phase={phase}
                      color={idx === 0 ? "blue" : idx === 1 ? "emerald" : "violet"}
                      progress={percent}
                      onClick={() => navigate(`/phase/${phase.id}`)}
                      className="cursor-pointer"
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Dashboard Grid */}
      <motion.div className="grid md:grid-cols-3 gap-6" variants={itemVariants}>
        {/* Upcoming Tasks */}
        <Card className="flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-light-text dark:text-dark-text flex items-center gap-2">
              <Target className="w-5 h-5 text-light-accent dark:text-dark-accent" />
              {t("upcomingTasks", "ماذا بعد؟")}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/plan")}
            >
              عرض الكل
            </Button>
          </div>
          <UpcomingTasks />
        </Card>

        {/* Week Progress */}
        <Card className="flex flex-col items-center justify-center min-h-[280px]">
          <h2 className="font-bold text-lg text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-light-accent dark:text-dark-accent" />
            {t("weekProgress", "التقدم الأسبوعي")}
          </h2>
          <WeekProgress />
        </Card>

        {/* Achievements Summary */}
        <Card className="flex flex-col items-center justify-center min-h-[280px]">
          <h2 className="font-bold text-lg text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-light-accent dark:text-dark-accent" />
            {t("achievementsSummary", "ملخص الإنجازات")}
          </h2>
          <AchievementsSummary />
        </Card>
      </motion.div>
    </motion.div>
  );
}
