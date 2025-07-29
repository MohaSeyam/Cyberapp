import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Settings, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Star,
  Users,
  Calendar,
  BarChart3,
  Play,
  SkipForward,
  Home,
  BookOpen as BookOpenIcon,
  Target as TargetIcon,
  Trophy as TrophyIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const onboardingSteps = [
  {
    id: "welcome",
    title: "مرحباً بك في خطة التعلم",
    description: "ابدأ رحلتك التعليمية مع خطة منظمة ومتدرجة",
    icon: BookOpenIcon,
    color: "blue"
  },
  {
    id: "plan",
    title: "خطة تعليمية شاملة",
    description: "50 أسبوع من المحتوى التعليمي المنظم في 3 مراحل",
    icon: TargetIcon,
    color: "green"
  },
  {
    id: "progress",
    title: "تتبع تقدمك",
    description: "راقب إنجازاتك واحصل على شارات التقدم",
    icon: TrophyIcon,
    color: "purple"
  },
  {
    id: "customize",
    title: "خصص تجربتك",
    description: "اضبط الإعدادات حسب تفضيلاتك",
    icon: SettingsIcon,
    color: "orange"
  }
];

const features = [
  {
    icon: BookOpen,
    title: "خطة تعليمية منظمة",
    description: "50 أسبوع من المحتوى التعليمي المتدرج"
  },
  {
    icon: Target,
    title: "تتبع التقدم",
    description: "راقب إنجازاتك وتقدمك في الوقت الفعلي"
  },
  {
    icon: Trophy,
    title: "نظام الإنجازات",
    description: "احصل على شارات ومكافآت لإنجازاتك"
  },
  {
    icon: Calendar,
    title: "جدولة المهام",
    description: "نظم مهامك اليومية والأسبوعية"
  },
  {
    icon: BarChart3,
    title: "تحليلات مفصلة",
    description: "احصل على إحصائيات وتحليلات شاملة"
  },
  {
    icon: Settings,
    title: "إعدادات مرنة",
    description: "خصص التطبيق حسب احتياجاتك"
  }
];

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { updateSettings } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Mark onboarding as completed
      await updateSettings({ onboardingCompleted: true });
      
      // Navigate to dashboard
      navigate("/");
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
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

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("completingSetup", "جاري إكمال الإعداد...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div className="absolute top-4 right-4" variants={itemVariants}>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="flex items-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          {t("skip", "تخطي")}
        </Button>
      </motion.div>

      {/* Progress Bar */}
      <motion.div className="absolute top-4 left-4 right-20" variants={itemVariants}>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                  onboardingSteps[currentStep].color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  onboardingSteps[currentStep].color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                  onboardingSteps[currentStep].color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                  'bg-orange-100 dark:bg-orange-900/20'
                }`}>
                  {React.createElement(onboardingSteps[currentStep].icon, {
                    className: `w-12 h-12 ${
                      onboardingSteps[currentStep].color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      onboardingSteps[currentStep].color === 'green' ? 'text-green-600 dark:text-green-400' :
                      onboardingSteps[currentStep].color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`
                  })}
                </div>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
                variants={itemVariants}
              >
                {onboardingSteps[currentStep].title}
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
                variants={itemVariants}
              >
                {onboardingSteps[currentStep].description}
              </motion.p>

              {/* Features Grid for specific steps */}
              {currentStep === 1 && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  variants={itemVariants}
                >
                  {features.slice(0, 3).map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      custom={index}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card className="h-full">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                            <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                  variants={itemVariants}
                >
                  {features.slice(3).map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      custom={index}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card className="h-full">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
                            <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div 
            className="flex items-center justify-between max-w-md mx-auto"
            variants={itemVariants}
          >
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("previous", "السابق")}
            </Button>

            <div className="flex gap-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-blue-500' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  {t("getStarted", "ابدأ")}
                  <Play className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t("next", "التالي")}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
