import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Rocket, Star, TrendingUp, Users, Globe } from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';

interface HomeHeroProps {
  language: string;
  t: (key: string) => string;
  navigate: (path: string) => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ language, t, navigate }) => {
  const isRTL = language === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 mb-12"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-600/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, delay: 1 }}
          className="absolute top-20 right-20 w-16 h-16 bg-purple-200/30 dark:bg-purple-600/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, delay: 2 }}
          className="absolute bottom-10 left-1/3 w-24 h-24 bg-indigo-200/30 dark:bg-indigo-600/20 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
          >
            {t('welcomeToCyberSecurity')}
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {t('heroSubtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/day/1/0')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
          >
            <Rocket className="w-6 h-6" />
            {t('startLearning')}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/progress')}
            className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 border border-gray-200 dark:border-gray-700"
          >
            <TrendingUp className="w-6 h-6" />
            {t('viewProgress')}
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: Users, label: 'activeLearners', value: '2.5K+', color: 'text-blue-600' },
            { icon: Star, label: 'successRate', value: '95%', color: 'text-green-600' },
            { icon: Globe, label: 'countries', value: '50+', color: 'text-purple-600' },
            { icon: TrendingUp, label: 'completionRate', value: '87%', color: 'text-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5 }}
              className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t(stat.label)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomeHero;