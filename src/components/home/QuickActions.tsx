import React from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';

interface QuickAction {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  variant: 'primary' | 'secondary' | 'outline';
  gradient: string;
  bg: string;
  iconPosition: 'left' | 'right';
}

interface QuickActionsProps {
  actions: QuickAction[];
  t: (key: string) => string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions, t }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl';
      case 'outline':
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('quickActions')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {t('getStartedQuickly')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            variants={itemVariants}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
          >
            <div className={`
              relative p-6 rounded-2xl transition-all duration-300 overflow-hidden
              ${getVariantStyles(action.variant)}
              hover:shadow-2xl transform hover:-translate-y-1
            `}>
              {/* Animated Background */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
              />

              {/* Ripple Effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl"
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="text-lg font-semibold mb-2"
                  >
                    {t(action.title)}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="text-sm opacity-80"
                  >
                    {t(action.subtitle)}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.6 + index * 0.1, 
                    type: "spring", 
                    stiffness: 200 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                  className={`
                    p-3 rounded-xl shadow-lg
                    ${action.variant === 'outline' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-white/20 backdrop-blur-sm'
                    }
                  `}
                >
                  <action.icon className="w-6 h-6" />
                </motion.div>
              </div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, 70 + index * 10)}%` }}
                  transition={{ delay: 1 + index * 0.1, duration: 1.2 }}
                  className="h-full bg-white/60 rounded-full"
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('newFeatures')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('discoverLatestFeatures')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('exploreFeatures')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuickActions;