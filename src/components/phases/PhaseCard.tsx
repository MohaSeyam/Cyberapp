import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Server, Eye, Search, Cloud, Target, Zap, Trophy,
  Clock, TrendingUp, CheckCircle, ArrowRight
} from 'lucide-react';
import Card from '../ui/Card';
import { Phase } from '../../services/phaseService';
import { animations } from '../../constants/theme';

interface PhaseCardProps {
  phase: Phase & {
    stats: {
      totalWeeks: number;
      completedWeeks: number;
      progress: number;
      remainingWeeks: number;
    };
  };
  isActive?: boolean;
  onClick?: () => void;
  lang: string;
}

const getPhaseIcon = (iconName: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    shield: Shield,
    server: Server,
    eye: Eye,
    search: Search,
    cloud: Cloud,
    target: Target,
    zap: Zap,
    trophy: Trophy
  };
  
  return icons[iconName] || Shield;
};

const getPhaseColorClasses = (color: string) => {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
    green: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300',
    teal: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300',
    red: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
    pink: 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-700 dark:text-pink-300',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300'
  };
  
  return colorClasses[color] || 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 20) return 'bg-orange-500';
  return 'bg-gray-300';
};

export default function PhaseCard({ phase, isActive = false, onClick, lang }: PhaseCardProps) {
  const IconComponent = getPhaseIcon(phase.icon);
  const colorClasses = getPhaseColorClasses(phase.color);
  const progressColor = getProgressColor(phase.stats.progress);

  return (
    <motion.div
      {...animations.fadeIn}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-300 ${
          isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={onClick}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${colorClasses}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {phase.title[lang]}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lang === 'ar' ? 'المرحلة' : 'Phase'} {phase.id}
                </p>
              </div>
            </div>
            {isActive && (
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <span className="text-sm font-medium">
                  {lang === 'ar' ? 'نشط' : 'Active'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'التقدم' : 'Progress'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {phase.stats.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${phase.stats.progress}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-2 rounded-full ${progressColor}`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  {phase.stats.completedWeeks}/{phase.stats.totalWeeks}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {lang === 'ar' ? 'مكتمل' : 'Completed'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{phase.duration}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {lang === 'ar' ? 'المدة' : 'Duration'}
              </p>
            </div>
          </div>

          {/* Focus */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {lang === 'ar' ? 'التركيز' : 'Focus'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {phase.focus[lang]}
            </p>
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {phase.difficulty}
              </span>
            </div>
            {phase.stats.remainingWeeks > 0 && (
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {phase.stats.remainingWeeks} {lang === 'ar' ? 'أسبوع متبقي' : 'weeks left'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}