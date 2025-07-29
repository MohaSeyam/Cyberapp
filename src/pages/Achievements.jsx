import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  TrendingUp, 
  Calendar,
  Star,
  Award,
  Zap,
  Crown,
  Medal,
  ChevronRight,
  Download,
  Share2,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { Bar, Pie, Radar, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler 
} from "chart.js";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import jsPDF from "jspdf";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler
);

// Enhanced Progress Circle with animations
const ProgressCircle = ({ percent = 85, size = "lg", showCrown = true }) => {
  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-20 h-20 text-xl", 
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-3xl"
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${sizeClasses[size]} rounded-full border-8 border-blue-400 flex items-center justify-center font-bold bg-white/80 dark:bg-gray-800/80 relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: percent / 100 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ transformOrigin: 'left' }}
        />
        <span className="relative z-10 text-white">{percent}%</span>
      </div>
      {showCrown && percent === 100 && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -top-2"
        >
          <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Enhanced Stats Summary
const StatsSummary = () => {
  const { t } = useTranslation();
  const { plan, progress, journal } = useApp();
  
  // Calculate achievements
  const totalTasks = plan.reduce((acc, week) => 
    acc + (week.days || []).reduce((a, d) => a + ((d.tasks || []).length || 0), 0);
  const doneTasks = (progress || []).filter(p => p.done).length;
  const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  // Calculate learning hours
  const totalMinutes = (progress || []).reduce((sum, p) => sum + (p.duration || 0), 0);
  const learningHours = Math.round(totalMinutes / 60);
  
  // Calculate streak
  const daysSet = new Set((progress || []).map(p => new Date(p.date).toDateString()));
  let streak = 0, maxStreak = 0;
  let prev = null;
  Array.from(daysSet).sort().forEach(dateStr => {
    const date = new Date(dateStr);
    if (prev) {
      const diff = (date - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }
    maxStreak = Math.max(maxStreak, streak);
    prev = date;
  });

  // Calculate badges earned
  const badgesEarned = Math.floor(percent / 10) + Math.floor(learningHours / 5) + Math.floor(maxStreak / 3);

  const stats = [
    {
      icon: Target,
      title: t("planProgress", "تقدم الخطة"),
      value: percent,
      unit: "%",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: t("learningHours", "ساعات التعلم"),
      value: learningHours,
      unit: "h",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Flame,
      title: t("maxStreak", "أطول سلسلة"),
      value: maxStreak,
      unit: "يوم",
      color: "orange",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Trophy,
      title: t("badgesEarned", "الشارات المكتسبة"),
      value: badgesEarned,
      unit: "",
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <Card className="relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative flex flex-col items-center justify-center p-6">
              <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20 mb-4`}>
                <stat.icon className={`w-8 h-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {stat.value}{stat.unit}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Enhanced Tabs Component
const Tabs = ({ tabs, active, onTab }) => (
  <div className="mb-6">
    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab, i) => (
        <motion.button
          key={tab}
          className={`px-6 py-3 font-semibold text-lg transition-all duration-200 relative ${
            active === i 
              ? "text-light-accent dark:text-dark-accent" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
          onClick={() => onTab(i)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab}
          {active === i && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-light-accent dark:bg-dark-accent"
              layoutId="activeTab"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  </div>
);

// Enhanced Analytics Component
const DeepDiveAnalytics = () => {
  const [tab, setTab] = useState(0);
  const { t } = useTranslation();
  const { plan, progress } = useApp();
  
  const allTasks = plan.flatMap(week => (week.days || []).flatMap(day => day.tasks || []));
  const doneTasks = allTasks.filter(task => (progress || []).find(p => p.taskId === task.id && p.done));
  
  const skillTypes = ["Blue Team", "Red Team", "Soft Skills", "Practical"];
  const skillColors = ["#3b82f6", "#ef4444", "#f59e42", "#10b981"];
  const skillsData = skillTypes.map(type => (doneTasks || []).filter(t => t.type === type).length);

  const chartData = {
    bar: {
      labels: skillTypes,
      datasets: [{
        label: t("completedTasks", "المهام المكتملة"),
        data: skillsData,
        backgroundColor: skillColors,
        borderColor: skillColors,
        borderWidth: 1
      }]
    },
    pie: {
      labels: skillTypes,
      datasets: [{
        data: skillsData,
        backgroundColor: skillColors,
        borderColor: skillColors,
        borderWidth: 2
      }]
    },
    radar: {
      labels: skillTypes,
      datasets: [{
        label: t("skillProgress", "تقدم المهارات"),
        data: skillsData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6'
      }]
    }
  };

  const tabs = [
    { name: t("skillBreakdown", "توزيع المهارات"), icon: BarChart3 },
    { name: t("skillDistribution", "توزيع المهارات"), icon: PieChart },
    { name: t("skillRadar", "رادار المهارات"), icon: Activity }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs 
        tabs={tabs.map(tab => tab.name)} 
        active={tab} 
        onTab={setTab} 
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-80 flex items-center justify-center"
          >
            {tab === 0 && <Bar data={chartData.bar} options={{ maintainAspectRatio: false }} />}
            {tab === 1 && <Pie data={chartData.pie} options={{ maintainAspectRatio: false }} />}
            {tab === 2 && <Radar data={chartData.radar} options={{ maintainAspectRatio: false }} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Enhanced Badges Component
const Badges = ({ plan, progress, journal, streak }) => {
  const { t } = useTranslation();
  
  const badges = [
    {
      id: "first_task",
      name: t("firstTask", "المهمة الأولى"),
      description: t("firstTaskDesc", "أكمل أول مهمة في الخطة"),
      icon: Target,
      color: "blue",
      condition: (progress || []).length > 0
    },
    {
      id: "week_complete",
      name: t("weekComplete", "أسبوع مكتمل"),
      description: t("weekCompleteDesc", "أكمل جميع مهام أسبوع واحد"),
      icon: Calendar,
      color: "emerald",
      condition: (progress || []).filter(p => p.done).length >= 7
    },
    {
      id: "streak_3",
      name: t("streak3", "سلسلة 3 أيام"),
      description: t("streak3Desc", "درس لمدة 3 أيام متتالية"),
      icon: Flame,
      color: "orange",
      condition: streak >= 3
    },
    {
      id: "journal_writer",
      name: t("journalWriter", "كاتب اليوميات"),
      description: t("journalWriterDesc", "اكتب 5 مدونات"),
      icon: Star,
      color: "yellow",
      condition: (journal || []).length >= 5
    },
    {
      id: "skill_master",
      name: t("skillMaster", "سيد المهارات"),
      description: t("skillMasterDesc", "أكمل مهام من جميع أنواع المهارات"),
      icon: Crown,
      color: "purple",
      condition: (progress || []).filter(p => p.done).length >= 20
    }
  ];

  const earnedBadges = badges.filter(badge => badge.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        {t("badges", "الشارات والإنجازات")}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className={`relative overflow-hidden transition-all duration-300 ${
              badge.condition 
                ? 'ring-2 ring-yellow-400 shadow-lg' 
                : 'opacity-50 grayscale'
            }`}>
              <div className="flex items-center gap-4 p-4">
                <div className={`p-3 rounded-full ${
                  badge.condition 
                    ? `bg-${badge.color}-100 dark:bg-${badge.color}-900/20` 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <badge.icon className={`w-6 h-6 ${
                    badge.condition 
                      ? `text-${badge.color}-600 dark:text-${badge.color}-400` 
                      : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {badge.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </p>
                </div>
                {badge.condition && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {t("badgesEarned", "الشارات المكتسبة")}: {(earnedBadges || []).length} / {(badges || []).length}
        </p>
      </div>
    </motion.div>
  );
};

// Enhanced Report Generator
const ReportGenerator = () => {
  const { t } = useTranslation();
  const { plan, progress, journal } = useApp();
  
  const generateReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(t("achievementReport", "تقرير الإنجازات"), 20, 20);
    
    // Add stats
    doc.setFontSize(12);
    const totalTasks = plan.reduce((acc, week) => 
      acc + (week.days || []).reduce((a, d) => a + ((d.tasks || []).length || 0), 0);
    const doneTasks = (progress || []).filter(p => p.done).length;
    const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    
    doc.text(`${t("planProgress", "تقدم الخطة")}: ${percent}%`, 20, 40);
    doc.text(`${t("completedTasks", "المهام المكتملة")}: ${doneTasks}`, 20, 50);
    doc.text(`${t("journalEntries", "مدونات")}: ${(journal || []).length}`, 20, 60);
    
    // Save the PDF
    doc.save('achievement-report.pdf');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{t("generateReport", "توليد التقرير")}</h3>
          <Button onClick={generateReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t("downloadPDF", "تحميل PDF")}
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("reportDescription", "قم بتحميل تقرير مفصل عن إنجازاتك وتقدمك في التعلم")}
        </p>
      </Card>
    </motion.div>
  );
};

export default function Achievements() {
  const { t } = useTranslation();
  const { plan, progress, journal, lang, loading } = useApp();
  if (loading || !plan || plan.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-light-accent dark:text-dark-accent mb-4 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10" />
          {t("achievements", "الإنجازات")}
        </h1>
        <p className="text-xl text-light-textSecondary dark:text-dark-textSecondary">
          {t("achievementsDescription", "احتفل بإنجازاتك وتتبع تقدمك في رحلة التعلم")}
        </p>
      </motion.div>

      {/* Stats Summary */}
      <StatsSummary />

      {/* Analytics */}
      <motion.div className="mb-8">
        <DeepDiveAnalytics />
      </motion.div>

      {/* Badges */}
      <motion.div className="mb-8">
        <Badges plan={plan} progress={progress} journal={journal} streak={5} />
      </motion.div>

      {/* Report Generator */}
      <motion.div>
        <ReportGenerator />
      </motion.div>
    </motion.div>
  );
}
