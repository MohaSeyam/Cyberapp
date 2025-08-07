// Enhanced Home Page - Refactored with Components and Hooks
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, BookOpen, Calendar,
  CheckCircle, Clock, Star, FileText,
  Zap, Globe, Bookmark, Settings,
  BarChart3, Lightbulb, Rocket, Heart
} from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { useHome } from '../hooks/useHome';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import HomeHero from '../components/home/HomeHero';
import HomeStats from '../components/home/HomeStats';
import QuickActions from '../components/home/QuickActions';

// --- Fallback Components ---

function LoadingComponent() {
  console.log("⏳ HomePage: Loading component rendered");
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl font-semibold">جاري التحميل...</div>
    </div>
  );
}

function ErrorComponent({ message }: { message?: string }) {
  console.log("❌ HomePage: Error component rendered with message:", message);
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">حدث خطأ ما</h2>
      <p>{message || 'لم نتمكن من تحميل بيانات الصفحة الرئيسية. يرجى المحاولة مرة أخرى.'}</p>
    </div>
  );
}

// --- Main Home Page Component ---

export default function HomePage() {
  console.log("🏠 HomePage component starting...");
  
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  // Assume useHome returns an object with data, isLoading, and error states
  const { data: homeData, isLoading, error } = useHome();
  
  console.log("📊 HomePage: useHome result:", { 
    hasData: !!homeData, 
    isLoading, 
    hasError: !!error,
    dataKeys: homeData ? Object.keys(homeData) : [],
    errorMessage: error?.message 
  });

  // 1. Handle Loading State
  if (isLoading) {
    console.log("⏳ HomePage: Showing loading state");
    return <LoadingComponent />;
  }

  // 2. Handle Error State
  if (error || !homeData) {
    console.log("❌ HomePage: Showing error state", { error, hasData: !!homeData });
    return <ErrorComponent message={error?.message} />;
  }
  
  console.log("✅ HomePage: Rendering main content");
  
  // 3. Success State: Destructure data only when it's available
  const {
    totalTasks,
    completedTasks,
    completionRate,
    currentWeek,
    stats,
    quickActions,
    features
  } = homeData;

  console.log("📈 HomePage: Data extracted:", { 
    totalTasks, 
    completedTasks, 
    completionRate, 
    currentWeek,
    statsCount: stats?.length,
    actionsCount: quickActions?.length,
    featuresCount: features?.length
  });

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (e) {
      console.warn('Translation function not available:', e);
      return key;
    }
  };

  // --- Sub-components for better organization ---

  const ProgressSection = () => (
    <div {...animations.fadeIn} transition={{ delay: 0.2 }} className="mb-12">
      <Card
        title={safeT('currentProgress')}
        subtitle={`${safeT('week')} ${currentWeek} - ${completionRate}% ${safeT('completed')}`}
        onClick={() => navigate('/progress')}
        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="space-y-6">
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-4 rounded-full"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">{completedTasks} {safeT('completed')}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{totalTasks} {safeT('total')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const FeaturesSection = () => (
    <div {...animations.fadeIn} transition={{ delay: 0.5 }} className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">مميزات المنصة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            {...animations.stagger(0.6 + index * 0.1)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="elevated" className="text-center p-6 hover:shadow-xl transition-all duration-300">
              <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-4 inline-block">
                {feature.icon === 'Shield' && <Shield className={`w-8 h-8 ${feature.color}`} />}
                {feature.icon === 'Globe' && <Globe className={`w-8 h-8 ${feature.color}`} />}
                {/* Add other icons similarly */}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{safeT(feature.title)}</h3>
              <p className="text-gray-600 dark:text-gray-400">{safeT(feature.description)}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <PageLayout title={safeT('homePageTitle')} description={safeT('homePageDescription')}>
      <div className="space-y-12">
        <HomeHero />
        <ProgressSection />
        <HomeStats stats={stats} />
        <QuickActions actions={quickActions} />
        <FeaturesSection />
        <div {...animations.fadeIn} transition={{ delay: 0.8 }} className="text-center py-12">
          <Card variant="flat" className="bg-gray-50 dark:bg-gray-800/50">
            <Heart className="w-12 h-12 text-blue-500 mx-auto mb-4"/>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{safeT('ctaTitle')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">{safeT('ctaSubtitle')}</p>
            <Button size="lg" variant="primary" onClick={() => navigate('/register')} className="shadow-lg">
              <Rocket className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0"/>
              {safeT('ctaButton')}
            </Button>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
