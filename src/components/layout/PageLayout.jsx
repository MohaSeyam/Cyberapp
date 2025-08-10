import React from 'react';
import { motion } from 'framer-motion';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';

const PageLayout = ({
  children,
  title,
  subtitle,
  showHeader = true,
  showBottomBar = false,
  className = '',
  ...props
}) => {
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language, direction, isRTL } = localizationData;
  const safeLanguage = language || 'ar';

  return (
    <div 
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}
      dir={direction}
      style={{ direction }}
      {...props}
    >
      {/* Top Bar */}
      {showHeader && <TopBar />}

      {/* Main Content */}
      <main className={`pb-20 ${showHeader ? 'pt-20' : 'pt-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              {title && (
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation */}
      {showBottomBar && <BottomNavigation />}
    </div>
  );
};

export default PageLayout;