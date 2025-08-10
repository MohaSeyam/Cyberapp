import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, ArrowLeft, Search, AlertTriangle
} from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();
  
  // Safe access to useLocalization
  let localizationData;
  try {
    localizationData = useLocalization();
  } catch (error) {
    console.error('Error accessing useLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;
  const safeLanguage = language || 'ar';
  const isRTL = safeLanguage === 'ar';

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    bounce: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { 
        duration: 0.6,
        type: "spring",
        stiffness: 200
      }
    }
  };

  return (
    <PageLayout
      title={safeLanguage === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
      showBottomBar={false}
    >
      <motion.div {...animations.fadeIn} className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          {/* 404 Icon */}
          <motion.div {...animations.bounce} className="mb-6">
            <div className="relative">
              <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">404</span>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {safeLanguage === 'ar' ? 'عذراً!' : 'Oops!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {safeLanguage === 'ar' 
                ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
                : 'The page you are looking for does not exist or has been moved.'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {safeLanguage === 'ar' 
                ? 'تحقق من الرابط أو جرب البحث في الموقع.'
                : 'Check the link or try searching the site.'
              }
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-3"
          >
            <Button
              variant="primary"
              icon={<Home />}
              onClick={() => navigate('/')}
              className="w-full"
            >
              {safeLanguage === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
            </Button>
            
            <Button
              variant="outline"
              icon={<ArrowLeft />}
              onClick={() => navigate(-1)}
              className="w-full"
            >
              {safeLanguage === 'ar' ? 'العودة للصفحة السابقة' : 'Go Back'}
            </Button>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {safeLanguage === 'ar' ? 'أو جرب هذه الصفحات:' : 'Or try these pages:'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/phases')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {safeLanguage === 'ar' ? 'المراحل' : 'Phases'}
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {safeLanguage === 'ar' ? 'التقدم' : 'Progress'}
              </button>
              <button
                onClick={() => navigate('/notes')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {safeLanguage === 'ar' ? 'الملاحظات' : 'Notes'}
              </button>
              <button
                onClick={() => navigate('/journal')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {safeLanguage === 'ar' ? 'المدونات' : 'Journal'}
              </button>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </PageLayout>
  );
};

export default NotFound;
