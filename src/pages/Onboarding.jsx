import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Target,
  Trophy,
  Calendar,
  BarChart3,
  Settings,
  BookOpen as BookOpenIcon,
  Target as TargetIcon,
  Trophy as TrophyIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLocalization } from "../hooks/useLocalization";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const onboardingSteps = [
  {
    id: "welcome",
    title: {
      ar: "مرحباً بك في رحلة الأمن السيبراني",
      en: "Welcome to Cyber Security Journey"
    },
    description: {
      ar: "ابدأ رحلتك التعليمية مع خطة منظمة ومتدرجة",
      en: "Start your learning journey with an organized and progressive plan"
    },
    icon: BookOpenIcon,
    color: "blue"
  },
  {
    id: "plan",
    title: {
      ar: "خطة تعليمية شاملة",
      en: "Comprehensive Learning Plan"
    },
    description: {
      ar: "50 أسبوع من المحتوى التعليمي المنظم في 3 مراحل",
      en: "50 weeks of organized educational content in 3 phases"
    },
    icon: TargetIcon,
    color: "green"
  },
  {
    id: "progress",
    title: {
      ar: "تتبع تقدمك",
      en: "Track Your Progress"
    },
    description: {
      ar: "راقب إنجازاتك واحصل على شارات التقدم",
      en: "Monitor your achievements and earn progress badges"
    },
    icon: TrophyIcon,
    color: "purple"
  },
  {
    id: "customize",
    title: {
      ar: "خصص تجربتك",
      en: "Customize Your Experience"
    },
    description: {
      ar: "اضبط الإعدادات حسب تفضيلاتك",
      en: "Adjust settings according to your preferences"
    },
    icon: SettingsIcon,
    color: "orange"
  }
];

const features = [
  {
    icon: BookOpen,
    title: {
      ar: "خطة تعليمية منظمة",
      en: "Organized Learning Plan"
    },
    description: {
      ar: "50 أسبوع من المحتوى التعليمي المتدرج",
      en: "50 weeks of progressive educational content"
    }
  },
  {
    icon: Target,
    title: {
      ar: "تتبع التقدم",
      en: "Progress Tracking"
    },
    description: {
      ar: "راقب إنجازاتك وتقدمك في الوقت الفعلي",
      en: "Monitor your achievements and progress in real-time"
    }
  },
  {
    icon: Trophy,
    title: {
      ar: "نظام الإنجازات",
      en: "Achievement System"
    },
    description: {
      ar: "احصل على شارات ومكافآت لإنجازاتك",
      en: "Earn badges and rewards for your achievements"
    }
  },
  {
    icon: Calendar,
    title: {
      ar: "جدولة المهام",
      en: "Task Scheduling"
    },
    description: {
      ar: "نظم مهامك اليومية والأسبوعية",
      en: "Organize your daily and weekly tasks"
    }
  },
  {
    icon: BarChart3,
    title: {
      ar: "تحليلات مفصلة",
      en: "Detailed Analytics"
    },
    description: {
      ar: "احصل على إحصائيات وتحليلات شاملة",
      en: "Get comprehensive statistics and analytics"
    }
  },
  {
    icon: Settings,
    title: {
      ar: "إعدادات مرنة",
      en: "Flexible Settings"
    },
    description: {
      ar: "خصص التطبيق حسب احتياجاتك",
      en: "Customize the app according to your needs"
    }
  }
];

export default function Onboarding() {
  const { t } = useLocalization();
  const { lang, updateSettings } = useApp();
  const navigate = useNavigate();
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
      await updateSettings({ onboardingCompleted: true });
      navigate("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {lang === 'ar' ? 'التقدم' : 'Progress'}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentStep + 1} / {onboardingSteps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              {/* Step Icon */}
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`inline-flex p-4 rounded-full bg-${currentStepData.color}-100 dark:bg-${currentStepData.color}-900`}
                >
                  <currentStepData.icon className={`w-12 h-12 text-${currentStepData.color}-600 dark:text-${currentStepData.color}-400`} />
                </motion.div>
              </div>

              {/* Step Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {currentStepData.title[lang]}
              </h1>

              {/* Step Description */}
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {currentStepData.description[lang]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="text-center p-6">
                  <div className="mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title[lang]}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description[lang]}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {lang === 'ar' ? 'السابق' : 'Previous'}
            </Button>

            <div className="flex gap-4">
              <Button
                onClick={handleSkip}
                variant="ghost"
                disabled={loading}
              >
                {lang === 'ar' ? 'تخطي' : 'Skip'}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {currentStep === onboardingSteps.length - 1 
                  ? (lang === 'ar' ? 'ابدأ الرحلة' : 'Start Journey')
                  : (lang === 'ar' ? 'التالي' : 'Next')
                }
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
