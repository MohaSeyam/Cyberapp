import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPhases, getWeeksByPhase, searchPlanData } from "../services/dataService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen,
  Calendar,
  Target,
  Clock,
  Star,
  ArrowRight,
  Home
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhaseCard from "../components/plan/PhaseCard";
import WeekCard from "../components/plan/WeekCard";
import DayCard from "../components/plan/DayCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function CyberPlan() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [phases, setPhases] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filterType, setFilterType] = useState("all"); // all, completed, pending

  useEffect(() => {
    async function loadPhases() {
      try {
        setLoading(true);
        const data = await getPhases();
        setPhases(data);
      } catch (error) {
        console.error('Error loading phases:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPhases();
  }, []);

  useEffect(() => {
    if (selectedPhase) {
      async function loadWeeks() {
        try {
          setLoading(true);
          const data = await getWeeksByPhase(selectedPhase.id);
          setWeeks(data);
        } catch (error) {
          console.error('Error loading weeks:', error);
        } finally {
          setLoading(false);
        }
      }
      loadWeeks();
    }
  }, [selectedPhase]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const performSearch = async () => {
        try {
          const results = await searchPlanData(searchQuery, i18n.language);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      };
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, i18n.language]);

  const handlePhase = (phase) => {
    setSelectedPhase(phase);
    setSelectedWeek(null);
    setSearchQuery("");
  };

  const handleWeek = (week) => {
    setSelectedWeek(week);
    setSearchQuery("");
  };

  const handleBackToPhases = () => {
    setSelectedPhase(null);
    setSelectedWeek(null);
    setSearchQuery("");
  };

  const handleBackToWeeks = () => {
    setSelectedWeek(null);
    setSearchQuery("");
  };

  const handleSearchResultClick = (result) => {
    if (result.type === 'week') {
      // Navigate to week view
      navigate(`/week/${result.id}`);
    } else if (result.type === 'task') {
      // Navigate to day view with task focus
      navigate(`/day/${result.week}/${result.day}`, { 
        state: { focusTask: result.id } 
      });
    }
  };

  const breadcrumbs = [
    { label: "الرئيسية", onClick: () => navigate("/"), icon: Home },
    ...(selectedPhase ? [{ 
      label: selectedPhase.name, 
      onClick: handleBackToPhases,
      icon: BookOpen 
    }] : []),
    ...(selectedWeek ? [{ 
      label: selectedWeek.title?.[i18n.language] || selectedWeek.title?.ar || selectedWeek.title?.en, 
      onClick: handleBackToWeeks,
      icon: Calendar 
    }] : [])
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

  return (
    <motion.div 
      className="max-w-7xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-2">
              {t("cyberPlanTitle", "خطة الأمن السيبراني المطور")}
            </h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              {t("planDescription", "استكشف مراحل التعلم وأسابيع الدراسة والمهام اليومية")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400" />}
              <button
                onClick={crumb.onClick}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                <crumb.icon className="w-4 h-4" />
                {crumb.label}
              </button>
            </div>
          ))}
        </nav>
      </motion.div>

      {/* Search Bar */}
      <motion.div className="mb-6" variants={itemVariants}>
        <SearchInput
          placeholder={t("searchPlaceholder", "البحث في المهام والمراجع...")}
          onSearch={setSearchQuery}
          className="max-w-md"
        />
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                نتائج البحث ({searchResults.length})
              </h3>
              <div className="space-y-2">
                {searchResults.slice(0, 5).map((result) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.type === 'week' ? (
                          <Calendar className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Target className="w-4 h-4 text-green-500" />
                        )}
                        <span className="font-medium">{result.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t("loading", "جاري التحميل...")}
            </p>
          </div>
        </div>
      )}

      {/* Phases View */}
      <AnimatePresence mode="wait">
        {!selectedPhase && !loading && (
          <motion.div
            key="phases"
            variants={itemVariants}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
              {phases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePhase(phase)}
                  className="cursor-pointer"
                >
                  <PhaseCard 
                    phase={phase} 
                    selected={false}
                    className={viewMode === "list" ? "flex items-center gap-4" : ""}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weeks View */}
      <AnimatePresence mode="wait">
        {selectedPhase && !selectedWeek && !loading && (
          <motion.div
            key="weeks"
            variants={itemVariants}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-violet-700 dark:text-violet-400">
                {t("weeksOfPhase", { phase: selectedPhase.name, defaultValue: `أسابيع ${selectedPhase.name}` })}
              </h2>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                {selectedPhase.description}
              </p>
            </div>
            
            <div className={`grid gap-4 ${viewMode === "grid" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
              {weeks.map((week, index) => (
                <motion.div
                  key={week.week}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleWeek(week)}
                  className="cursor-pointer"
                >
                  <WeekCard 
                    week={week} 
                    selected={false}
                    className={viewMode === "list" ? "flex items-center gap-4" : ""}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Days View */}
      <AnimatePresence mode="wait">
        {selectedWeek && (
          <motion.div
            key="days"
            variants={itemVariants}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-400">
                {selectedWeek.title?.[i18n.language] || selectedWeek.title?.ar || selectedWeek.title?.en}
              </h2>
              <p className="text-light-textSecondary dark:text-dark-textSecondary">
                {selectedWeek.objective?.[i18n.language] || selectedWeek.objective?.ar || selectedWeek.objective?.en}
              </p>
            </div>
            
            <div className="space-y-6">
              {(selectedWeek.days || []).map((day, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <DayCard day={day} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}