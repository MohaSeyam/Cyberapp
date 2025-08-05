import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, BarChart3, FileText, BookOpen } from 'lucide-react';
import Card from '../ui/Card';

interface QuickAction {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  variant: 'primary' | 'secondary' | 'outline';
  action: () => void;
  gradient: string;
  bg: string;
  iconPosition: 'left' | 'right';
}

interface QuickActionsProps {
  actions: QuickAction[];
  t: (key: string) => string;
}

const QuickActions = React.memo(({ actions, t }: QuickActionsProps) => {
  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {t('quickActions')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card
              variant="elevated"
              hover
              onClick={action.action}
              className="h-48 flex flex-col justify-center items-center text-center cursor-pointer group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className={`p-4 rounded-full ${action.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.subtitle}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

export default QuickActions;