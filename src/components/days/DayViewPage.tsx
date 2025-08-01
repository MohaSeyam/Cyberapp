import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Sun, Moon, Coffee, Zap, Heart, Brain, ExternalLink,
  MessageSquare, Plus, ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useWeekPhaseData } from '../../hooks/useWeekPhaseData';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TaskCard from '../ui/TaskCard';
import Modal from '../ui/Modal';
import { animations } from '../../constants/theme';

// Day icons mapping
const dayIcons = {
  sat: Sun,
  sun: Sun,
  mon: Coffee,
  tue: Zap,
  wed: Heart,
  thu: Brain,
  fri: Star
};

const ResourceModal = React.memo(({ resource, open, onClose, lang }: any) => (
  <Modal isOpen={open} onClose={onClose} title={resource?.title || ''} size="lg">
    {resource && (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400">{resource.type}</span>
          <Button variant="ghost" size="sm" icon={<ExternalLink />} onClick={() => window.open(resource.url, '_blank')}>
            {lang === 'ar' ? 'فتح' : 'Open'}
          </Button>
        </div>
        <div className="text-gray-700 dark:text-gray-200 break-words">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400">
            {resource.url}
          </a>
        </div>
      </div>
    )}
  </Modal>
));

export default function DayViewPage() {
  const { weekId = "1", dayIndex = "0" } = useParams();
  const navigate = useNavigate();
  const { plan, progress, addNote, lang } = useApp();
  const { t } = useLocalization();
  const { getWeekData } = useWeekPhaseData();
  
  const [resourceModal, setResourceModal] = useState({ open: false, resource: null });
  
  // Data
  const safePlan = plan || [];
  const weekNumber = parseInt(weekId);
  const dayIdx = parseInt(dayIndex);
  const week = useMemo(() => safePlan.find(w => w.week === weekNumber), [safePlan, weekNumber]);
  const day = useMemo(() => week?.days?.[dayIdx], [week, dayIdx]);
  const weekData = getWeekData(weekNumber);
  
  // Notes (dummy for demo)
  const notes = useMemo(() => [
    { id: '1', title: 'ملاحظة مهمة', content: 'هذه ملاحظة مهمة حول اليوم.' },
    { id: '2', title: 'مفهوم أساسي', content: 'شرح مختصر لمفهوم أساسي.' }
  ], []);

  // Calculate day completion
  const getDayCompletion = () => {
    if (!day || !day.tasks) return { completed: 0, total: 0, percentage: 0 };

    const totalTasks = day.tasks.length;
    const dayProgress = progress.filter(p => 
      p.weekId === weekNumber.toString() && p.dayKey === day.key
    );
    const completedTasks = dayProgress.filter(p => p.done).length;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Navigation functions
  const goToNextDay = () => {
    if (week && week.days && dayIdx < week.days.length - 1) {
      navigate(`/day/${weekId}/${dayIdx + 1}`);
    }
  };

  const goToPreviousDay = () => {
    if (dayIdx > 0) {
      navigate(`/day/${weekId}/${dayIdx - 1}`);
    }
  };

  const goToWeekView = () => {
    navigate(`/weeks/${weekId}`);
  };

  const goToDayList = () => {
    navigate(`/days/${weekId}`);
  };

  // Render
  if (!week || !day || !weekData) {
    return (
      <PageLayout title={t('loading')} showHeader={true}>
        <div className="py-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('loading')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loadingDayContent')}
          </p>
        </div>
      </PageLayout>
    );
  }

  const dayCompletion = getDayCompletion();
  const DayIcon = dayIcons[day.key as keyof typeof dayIcons] || Calendar;

  return (
    <PageLayout 
      title={`${day.day?.[lang] || 'Unknown Day'}`} 
      subtitle={day.topic?.[lang] || 'No topic'} 
      showHeader={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Day Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft />}
                onClick={goToDayList}
              />
              
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <DayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {day.day?.[lang]}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('week')} {weekNumber} - {day.topic?.[lang]}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronLeft />}
                onClick={goToPreviousDay}
                disabled={dayIdx <= 0}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight />}
                onClick={goToNextDay}
                disabled={dayIdx >= (week.days?.length || 0) - 1}
              />
            </div>
          </div>

          {/* Week and Day Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('weekObjective')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weekData.weekData.objective[lang]}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('dayProgress')}
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dayCompletion.percentage}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {dayCompletion.completed} / {dayCompletion.total} {t('tasks')}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('phase')} {weekData.phase}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weekData.phaseData.title[lang]}
              </p>
            </div>
          </div>
        </Card>

        {/* Day Topic and Objective */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('todayTopic')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {day.topic?.[lang] || 'No topic'}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('dayFocus')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {day.topic?.[lang] || 'No specific focus for today'}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('weekContext')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {weekData.weekData.objective[lang]}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Tasks Section */}
        <motion.div {...animations.fadeIn} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('todayTasks')}</h2>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(day.tasks || []).length} {t('tasks')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(day.tasks || []).map((task, index) => (
              <motion.div key={task.id} {...animations.stagger(index * 0.1)}>
                <TaskCard 
                  task={task} 
                  weekId={weekNumber} 
                  dayKey={day.key} 
                  variant="detailed" 
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Resources Section */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }} className="mb-8">
          <Card title={t('suggestedResources')} subtitle={t('resourcesForToday')}>
            <div className="space-y-4">
              {(day.resources || []).length > 0 ? (
                (day.resources || []).map((resource, index) => (
                  <motion.div key={index} {...animations.stagger(0.3 + index * 0.1)} 
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" 
                    onClick={() => setResourceModal({ open: true, resource })}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{resource.type}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t('noResourcesToday')}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Notes Section */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.4 }} className="mb-8">
          <Card title={t('dailyNotes')} subtitle={t('yourThoughtsAndReflections')}>
            <div className="space-y-4">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <motion.div key={note.id} {...animations.stagger(0.5 + index * 0.1)} 
                    className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {note.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {note.content}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noNotesYet')}</p>
                  <Button variant="outline" size="sm" icon={<Plus />}>
                    {t('addNote')}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Navigation Footer */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.6 }}>
          <Card>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={goToDayList}
                icon={<ArrowLeft />}
              >
                {t('backToDays')}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft />}
                  onClick={goToPreviousDay}
                  disabled={dayIdx <= 0}
                >
                  {t('previousDay')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={dayIdx >= (week.days?.length || 0) - 1}
                >
                  {t('nextDay')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Resource Modal */}
      <ResourceModal 
        resource={resourceModal.resource}
        open={resourceModal.open}
        onClose={() => setResourceModal({ open: false, resource: null })}
        lang={lang}
      />
    </PageLayout>
  );
}