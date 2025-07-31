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
  
  const colors = phaseColors[phase as keyof typeof phaseColors] || phaseColors[1];
  const icon = phaseIcons[phase as keyof typeof phaseIcons] || '📚';
  
  const phaseWeeks = weeks.filter(week => week.phase === phase);
  const totalTasks = phaseWeeks.reduce((total, week) => 
    total + week.days.reduce((dayTotal, day) => dayTotal + day.tasks.length, 0), 0
  );

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
                {t('phase')} {phase}
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
                {t('phase')} {phase}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {phaseWeeks[0]?.title?.[lang] || `Phase ${phase} Title`}
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 mt-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {phaseWeeks.length}
            </div>
            <div className="text-xs text-gray-500">{t('week')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {totalTasks}
            </div>
            <div className="text-xs text-gray-500">{t('tasks')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {phaseWeeks.length * 7}
            </div>
            <div className="text-xs text-gray-500">{t('days')}</div>
          </div>
        </div>

        <div className="space-y-2">
          {phaseWeeks.slice(0, 3).map((week, index) => (
            <div key={week.week} className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${colors.icon.replace('bg-', 'bg-').replace('-100', '-500')}`} />
              <span className="text-gray-700 dark:text-gray-300">
                {t('week')} {week.week}: {week.title?.[lang]}
              </span>
            </div>
          ))}
          {phaseWeeks.length > 3 && (
            <div className="text-xs text-gray-500">
              +{phaseWeeks.length - 3} {t('moreWeeks')}
            </div>
          )}
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
      className={`cursor-pointer p-5 rounded-lg border-2 transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500' : ''
      } ${colors.bg} ${colors.border} ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className={`font-semibold text-lg ${colors.text}`}>
              {t('phase')} {phase}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {phaseWeeks[0]?.title?.[lang] || `Phase ${phase} Title`}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {phaseWeeks.length} {t('week')}
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          {totalTasks} {t('tasks')}
        </span>
      </div>
    </motion.div>
  );
}