import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, TrendingUp, CheckCircle, 
  Play, Pause, Target, BookOpen, Users
} from 'lucide-react';
import Card from '../ui/Card';
import { phaseService } from '../../services/phaseService';
import { animations } from '../../constants/theme';

interface PhaseDetailsProps {
  phaseId: number;
  completedWeeks: number[];
  onBack: () => void;
  onWeekClick?: (weekNumber: number) => void;
  lang: string;
}

export default function PhaseDetails({ 
  phaseId, 
  completedWeeks, 
  onBack, 
  onWeekClick, 
  lang 
}: PhaseDetailsProps) {
  const phase = phaseService.getPhaseById(phaseId);
  const weeks = phaseService.getWeeksByPhase(phaseId);
  const stats = phaseService.getPhaseStats(phaseId, completedWeeks);
  const nextPhase = phaseService.getNextPhase(phaseId);
  const previousPhase = phaseService.getPreviousPhase(phaseId);

  if (!phase) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {lang === 'ar' ? 'المرحلة غير موجودة' : 'Phase not found'}
        </h3>
        <button
          onClick={onBack}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {lang === 'ar' ? 'العودة' : 'Go back'}
        </button>
      </div>
    );
  }

  const getWeekStatus = (weekNumber: number) => {
    if (completedWeeks.includes(weekNumber)) {
      return 'completed';
    }
    
    // Check if this week is the next available week
    const completedWeeksInPhase = phase.weeks.filter(w => completedWeeks.includes(w));
    const nextWeekIndex = completedWeeksInPhase.length;
    
    if (phase.weeks[nextWeekIndex] === weekNumber) {
      return 'available';
    }
    
    return 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'available':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'locked':
        return <Pause className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'available':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
      case 'locked':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...animations.fadeIn} className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{lang === 'ar' ? 'العودة للمراحل' : 'Back to phases'}</span>
        </button>
        
        <div className="flex items-center space-x-4">
          {previousPhase && (
            <button
              onClick={() => onBack()}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {lang === 'ar' ? 'السابق' : 'Previous'}
            </button>
          )}
          {nextPhase && (
            <button
              onClick={() => onBack()}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {lang === 'ar' ? 'التالي' : 'Next'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Phase Overview */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {phase.title[lang]}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {lang === 'ar' ? 'المرحلة' : 'Phase'} {phase.id} • {phase.duration} • {phase.difficulty}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.progress}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {lang === 'ar' ? 'مكتمل' : 'Complete'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stats.completedWeeks} / {stats.totalWeeks} {lang === 'ar' ? 'أسبوع' : 'weeks'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.remainingWeeks} {lang === 'ar' ? 'متبقي' : 'remaining'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-3 bg-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* Focus and Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  {lang === 'ar' ? 'التركيز' : 'Focus'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {phase.focus[lang]}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {lang === 'ar' ? 'المحتوى الرئيسي' : 'Main Content'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {phase.mainContent[lang]}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Weeks List */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
        <Card title={lang === 'ar' ? 'أسابيع المرحلة' : 'Phase Weeks'}>
          <div className="space-y-4">
            {weeks.map((week, index) => {
              const status = getWeekStatus(week.week);
              const isClickable = status === 'completed' || status === 'available';
              
              return (
                <motion.div
                  key={week.week}
                  {...animations.stagger(index * 0.1)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    getStatusColor(status)
                  } ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}`}
                  onClick={() => isClickable && onWeekClick ? onWeekClick(week.week) : null}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm">
                        {getStatusIcon(status)}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {lang === 'ar' ? 'الأسبوع' : 'Week'} {week.week}: {week.title[lang]}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {week.objective[lang]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {week.days?.length || 0} {lang === 'ar' ? 'يوم' : 'days'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {status === 'completed' && (lang === 'ar' ? 'مكتمل' : 'Completed')}
                        {status === 'available' && (lang === 'ar' ? 'متاح' : 'Available')}
                        {status === 'locked' && (lang === 'ar' ? 'مقفل' : 'Locked')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Navigation */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between">
          {previousPhase && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{previousPhase.title[lang]}</span>
            </button>
          )}
          
          {nextPhase && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>{nextPhase.title[lang]}</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}