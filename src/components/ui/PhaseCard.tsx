// Unified Phase Card Component
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Target, Calendar, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import type { Week } from '../../types';

interface PhaseCardProps {
  phase: number;
  weeks: Week[];
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const phaseColors = {
  1: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'bg-blue-100' },
  2: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'bg-green-100' },
  3: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'bg-purple-100' },
  4: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'bg-orange-100' },
  5: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'bg-red-100' },
  6: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: 'bg-indigo-100' }
};

const phaseIcons = {
  1: '🛡️',
  2: '🔍',
  3: '⚔️',
  4: '🛠️',
  5: '🎯',
  6: '🏆'
};

export default function PhaseCard({
  phase,
  weeks,
  isActive = false,
  onClick,
  variant = 'default',
  className = ''
}: PhaseCardProps) {
  const { lang } = useApp();
  const { t } = useLocalization();
  
  // Safety checks
  const safeWeeks = Array.isArray(weeks) ? weeks : [];
  const safePhase = typeof phase === 'number' ? phase : 1;
  
  const colors = phaseColors[safePhase as keyof typeof phaseColors] || phaseColors[1];
  const icon = phaseIcons[safePhase as keyof typeof phaseIcons] || '📚';
  
  const phaseWeeks = safeWeeks.filter(week => week && week.phase === safePhase);
  const totalTasks = phaseWeeks.reduce((total, week) => {
    if (!week || !Array.isArray(week.days)) return total;
    return total + week.days.filter(day => day.key !== 'fri').reduce((dayTotal, day) => {
      if (!day || !Array.isArray(day.tasks)) return dayTotal;
      return dayTotal + day.tasks.length;
    }, 0);
  }, 0);

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
          isActive ? 'ring-2 ring-blue-500' : ''
        } ${colors.bg} ${colors.border} ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className={`font-semibold ${colors.text}`}>
                {t('phase')} {safePhase}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {phaseWeeks.length} {t('week')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 shadow-lg ${
          isActive ? 'ring-2 ring-blue-500 shadow-xl' : ''
        } ${colors.bg} ${colors.border} ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colors.icon}`}>
              <span className="text-3xl">{icon}</span>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${colors.text}`}>
                {t('phase')} {safePhase}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {phaseWeeks.length} {t('weeks')} • {totalTasks} {t('tasks')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('totalWeeks')}</span>
            <span className="font-semibold">{phaseWeeks.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('totalTasks')}</span>
            <span className="font-semibold">{totalTasks}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('estimatedTime')}</span>
            <span className="font-semibold">{Math.round(totalTasks * 30 / 60)} {t('hours')}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Target className="w-4 h-4" />
            <span>{t('phaseDescription')}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500' : ''
      } ${colors.bg} ${colors.border} ${className}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className={`font-semibold ${colors.text}`}>
            {t('phase')} {safePhase}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {phaseWeeks.length} {t('weeks')} • {totalTasks} {t('tasks')}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );
}