import React from 'react';
import { motion } from 'framer-motion';
import { useLocalization } from '../../hooks/useLocalization';

interface Stat {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  color: string;
  bg: string;
  gradient: string;
}

interface HomeStatsProps {
  stats: Stat[];
  t: (key: string) => string;
  navigate: (path: string) => void;
}

const HomeStats: React.FC<HomeStatsProps> = ({ stats, t, navigate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
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
          {t('learningStatistics')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {t('trackYourProgress')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group cursor-pointer"
            onClick={() => navigate('/progress')}
          >
            <div className={`
              relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl 
              transition-all duration-300 overflow-hidden
              ${stat.bg}
            `}>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Animated Background */}
              <motion.div
                animate={pulseAnimation}
                className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-current opacity-5 rounded-full -translate-y-10 translate-x-10"
              />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-r ${stat.gradient} shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Value */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {stat.value}
                </motion.div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                  className={`text-sm font-medium ${stat.color}`}
                >
                  {t(stat.label)}
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 1 }}
                  className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, 60 + index * 15)}%` }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 1.2 }}
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                  />
                </motion.div>
              </div>

              {/* Hover Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="text-center mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/progress')}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {t('viewDetailedStats')}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default HomeStats;