import { motion } from "framer-motion";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  MapPin,
  Navigation,
  BookOpen,
  Settings
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const quickLinks = [
    { name: t("dashboard", "لوحة التحكم"), path: "/", icon: Home },
    { name: t("cyberPlan", "الخطة التعليمية"), path: "/cyberplan", icon: BookOpen },
    { name: t("achievements", "الإنجازات"), path: "/achievements", icon: Search },
    { name: t("settings", "الإعدادات"), path: "/settings", icon: Settings }
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
      className="min-h-screen flex items-center justify-center py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-8xl md:text-9xl font-bold text-red-500 dark:text-red-400 mb-4"
            >
              404
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <AlertTriangle className="w-16 h-16 text-yellow-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-4">
            {t("pageNotFound", "الصفحة غير موجودة")}
          </h1>
          <p className="text-lg text-light-textSecondary dark:text-dark-textSecondary mb-6 max-w-md mx-auto">
            {t("pageNotFoundDescription", "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر")}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="mb-8" variants={itemVariants}>
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                {t("goHome", "العودة للصفحة الرئيسية")}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("goBack", "العودة للصفحة السابقة")}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" />
            {t("quickLinks", "روابط سريعة")}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.path}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center gap-2 justify-start"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div 
          className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {t("searchSuggestion", "هل تبحث عن شيء محدد؟")}
            </span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {t("searchSuggestionText", "جرب البحث في الخطة التعليمية أو الإنجازات للعثور على ما تبحث عنه")}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
