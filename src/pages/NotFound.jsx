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
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLocalization } from "../hooks/useLocalization";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function NotFound() {
  const { t } = useLocalization();
  const { lang } = useApp();
  const navigate = useNavigate();

  const quickLinks = [
    { name: t('home'), path: "/", icon: Home },
    { name: t('notes'), path: "/notes", icon: BookOpen },
    { name: t('journal'), path: "/journal", icon: Search },
    { name: t('settings'), path: "/settings", icon: Settings }
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
      dir={lang === "ar" ? "rtl" : "ltr"}
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {lang === 'ar' 
              ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر'
              : 'Sorry, the page you are looking for does not exist or has been moved'
            }
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="mb-8" variants={itemVariants}>
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
                variant="primary"
              >
                <Home className="w-4 h-4" />
                {t('home')}
              </Button>
              <Button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4" />
                {lang === 'ar' ? 'العودة' : 'Go Back'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.path}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => navigate(link.path)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {link.name}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {lang === 'ar' ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {lang === 'ar' 
                  ? 'يمكنك العودة إلى الصفحة الرئيسية أو تصفح الأقسام المتاحة'
                  : 'You can return to the home page or browse available sections'
                }
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => navigate("/")}
                  variant="primary"
                  size="sm"
                >
                  {t('home')}
                </Button>
                <Button
                  onClick={() => navigate("/settings")}
                  variant="outline"
                  size="sm"
                >
                  {t('settings')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
