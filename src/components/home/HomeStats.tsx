import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, TrendingUp, Award } from 'lucide-react';
import Card from '../ui/Card';

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

const HomeStats = React.memo(({ stats, t, navigate }: HomeStatsProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            variant="elevated"
            className="text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
            onClick={() => {
              if (stat.label === t('totalTasks') || stat.label === t('completedTasks')) {
                navigate('/progress');
              } else if (stat.label === t('totalWeeks')) {
                navigate('/day/1/0');
              }
            }}
          >
            <div className="flex flex-col items-center p-6">
              <div className={`p-4 rounded-full ${stat.bg} mb-4 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`}></div>
                <stat.icon className={`w-8 h-8 ${stat.color} relative z-10`} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
});

export default HomeStats;