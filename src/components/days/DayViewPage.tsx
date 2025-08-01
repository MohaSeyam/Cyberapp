// Day View Page - Unified Design with Week-Phase Integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Target, BookOpen, MessageSquare,
  ExternalLink, Plus, CheckCircle, Circle, Video, FileText, 
  Wrench, Mic, GraduationCap, Edit2, ChevronLeft, ChevronRight,
  ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useWeekPhaseData } from '../../hooks/useWeekPhaseData';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import TaskCard from '../ui/TaskCard';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import RichTextEditor from '../editors/RichTextEditor';
import { animations } from '../../constants/theme';
import type { Week, Day, Task, Resource } from '../../types';

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

export default function DayViewPage() {
  const { weekId = "1", dayIndex = "0" } = useParams<{ weekId: string; dayIndex: string }>();
  const navigate = useNavigate();
  const { plan, progress, addNote, addResource, lang, updateResource } = useApp();
  const { t } = useLocalization();
  const { getWeekData } = useWeekPhaseData();

  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, taskId: '' });
  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null as Resource | null });
  const [noteContent, setNoteContent] = useState('');
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'video' as const });

  // Safety check for plan
  const safePlan = plan || [];

  // Find current week and day with safety checks
  useEffect(() => {
    const week = safePlan.find(w => w.week === parseInt(weekId));
    if (week) {
      setSelectedWeek(week);
      const day = week.days?.[parseInt(dayIndex)];
      if (day) {
        setSelectedDay(day);
      }
    }
  }, [safePlan, weekId, dayIndex]);

  // Get week data from week-phase system
  const weekData = getWeekData(parseInt(weekId));

  const handleAddNote = async () => {
    if (noteContent.trim() && selectedWeek && selectedDay) {
      try {
        await addNote({
          title: `ملاحظة مهمة`,
          content: noteContent,
          keywords: '',
          tags: [],
          weekId: selectedWeek.week,
          dayKey: selectedDay.key,
          taskId: noteModal.taskId
        });
        setNoteContent('');
        setNoteModal({ isOpen: false, taskId: '' });
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const handleAddResource = async () => {
    if (resourceForm.title.trim() && resourceForm.url.trim() && selectedWeek && selectedDay) {
      try {
        await addResource({
          title: resourceForm.title,
          url: resourceForm.url,
          type: resourceForm.type,
          weekId: selectedWeek.week,
          dayIndex: parseInt(dayIndex)
        });
        setResourceForm({ title: '', url: '', type: 'video' });
        setResourceModal({ isOpen: false, resource: null });
      } catch (error) {
        console.error('Error adding resource:', error);
      }
    }
  };

  // Navigation functions
  const goToNextDay = () => {
    if (selectedWeek && selectedWeek.days && parseInt(dayIndex) < selectedWeek.days.length - 1) {
      navigate(`/day/${weekId}/${parseInt(dayIndex) + 1}`);
    }
  };

  const goToPreviousDay = () => {
    if (parseInt(dayIndex) > 0) {
      navigate(`/day/${weekId}/${parseInt(dayIndex) - 1}`);
    }
  };

  const goToDayList = () => {
    navigate(`/days/${weekId}`);
  };

  if (!selectedWeek || !selectedDay) {
    return (
      <PageLayout title={t('loading')}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loadingDayContent')}</p>
        </div>
      </PageLayout>
    );
  }

  const resourceTypeIcons = {
    video: Video,
    article: FileText,
    book: BookOpen,
    tool: Wrench,
    podcast: Mic,
    course: GraduationCap
  };

  const DayIcon = dayIcons[selectedDay.key as keyof typeof dayIcons] || Calendar;

  return (
    <PageLayout
      title={`${selectedDay.day?.[lang] || 'Unknown Day'}`}
      subtitle={selectedDay.topic?.[lang] || 'No topic'}
      showHeader={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Day Header with Week Context */}
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
                    {selectedDay.day?.[lang]}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('week')} {selectedWeek.week} - {selectedDay.topic?.[lang]}
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
                disabled={parseInt(dayIndex) <= 0}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<ChevronRight />}
                onClick={goToNextDay}
                disabled={parseInt(dayIndex) >= (selectedWeek.days?.length || 0) - 1}
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
                {weekData?.weekData.objective[lang] || 'No objective'}
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
                {/* Calculate day completion */}
                {(() => {
                  const totalTasks = selectedDay.tasks?.length || 0;
                  const dayProgress = progress?.filter(p => 
                    p.weekId === (selectedWeek?.week?.toString() || '') && p.dayKey === selectedDay.key
                  ) || [];
                  const completedTasks = dayProgress.filter(p => p.done).length;
                  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                })()}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {/* Calculate completed/total tasks */}
                {(() => {
                  const totalTasks = selectedDay.tasks?.length || 0;
                  const dayProgress = progress?.filter(p => 
                    p.weekId === (selectedWeek?.week?.toString() || '') && p.dayKey === selectedDay.key
                  ) || [];
                  const completedTasks = dayProgress.filter(p => p.done).length;
                  return `${completedTasks} / ${totalTasks} ${t('tasks')}`;
                })()}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('phase')} {weekData?.phase || 'N/A'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weekData?.phaseData.title[lang] || 'No phase data'}
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
                {selectedDay.topic?.[lang] || 'No topic'}
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
                {selectedDay.topic?.[lang] || 'No specific focus for today'}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('weekContext')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {weekData?.weekData.objective[lang] || 'No week objective'}
              </p>
            </div>
          </div>
        </Card>

        {/* Tasks Section */}
        <motion.div {...animations.fadeIn} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('todayTasks')}
            </h2>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(selectedDay.tasks || []).length} {t('tasks')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(selectedDay.tasks || []).map((task, index) => (
              <motion.div
                key={task.id}
                {...animations.stagger(index * 0.1)}
              >
                <TaskCard
                  task={task}
                  weekId={selectedWeek.week}
                  dayKey={selectedDay.key}
                  variant="detailed"
                  onNoteClick={() => setNoteModal({ isOpen: true, taskId: task.id })}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resources Section */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card
            title={t('suggestedResources')}
            subtitle={t('resourcesForToday')}
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{t('suggestedResources')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setResourceModal({ isOpen: true, resource: null })}
                >
                  {t('addResource')}
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {(selectedDay.resources || []).length > 0 ? (
                (selectedDay.resources || []).map((resource, index) => {
                  const Icon = resourceTypeIcons[resource.type] || FileText;
                  return (
                    <motion.div
                      key={index}
                      {...animations.stagger(0.3 + index * 0.1)}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => setResourceModal({ isOpen: true, resource })}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {resource.title}
                            <Edit2 className="w-3 h-3 text-gray-400 inline-block ml-1" />
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {resource.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => { e.stopPropagation(); window.open(resource.url, '_blank'); }}
                      >
                        {t('open')}
                      </Button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('noResourcesYet')}</p>
                  <p className="text-sm">{t('addYourFirstResource')}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Evening Journaling */}
        {selectedDay.notes_prompt && (
          <motion.div
            {...animations.fadeIn}
            transition={{ delay: 0.3 }}
          >
            <Card
              title={selectedDay.notes_prompt.title?.[lang] || 'Journaling Prompt'}
              subtitle={t('eveningJournaling')}
            >
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    {t('journalingPoints')}:
                  </h4>
                  <ul className="space-y-2">
                    {(selectedDay.notes_prompt.points || []).map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-200">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{point?.[lang] || 'Point'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="primary"
                  icon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => setNoteModal({ isOpen: true, taskId: 'journal' })}
                >
                  {t('startJournaling')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

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
                  disabled={parseInt(dayIndex) <= 0}
                >
                  {t('previousDay')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={parseInt(dayIndex) >= (selectedWeek.days?.length || 0) - 1}
                >
                  {t('nextDay')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Note Modal */}
      <Modal
        isOpen={noteModal.isOpen}
        onClose={() => setNoteModal({ isOpen: false, taskId: '' })}
        title={t('addNote')}
        size="lg"
      >
        <div className="space-y-4">
          <RichTextEditor
            content={noteContent}
            onChange={setNoteContent}
            placeholder={t('writeTaskNote')}
            lang={lang}
            minHeight="200px"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setNoteModal({ isOpen: false, taskId: '' })}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!noteContent.trim()}
            >
              {t('saveNote')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resource Modal */}
      <Modal
        isOpen={resourceModal.isOpen}
        onClose={() => setResourceModal({ isOpen: false, resource: null })}
        title={resourceModal.resource ? t('editResource') : t('addResource')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('resourceTitle')}
            </label>
            <input
              type="text"
              value={resourceForm.title}
              onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('enterTitle')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('resourceUrl')}
            </label>
            <input
              type="url"
              value={resourceForm.url}
              onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('enterUrl')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('resourceType')}
            </label>
            <select
              value={resourceForm.type}
              onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="video">{t('video')}</option>
              <option value="article">{t('article')}</option>
              <option value="book">{t('book')}</option>
              <option value="tool">{t('tool')}</option>
              <option value="podcast">{t('podcast')}</option>
              <option value="course">{t('course')}</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setResourceModal({ isOpen: false, resource: null })}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (resourceForm.title.trim() && resourceForm.url.trim() && selectedWeek && selectedDay) {
                  try {
                    if (resourceModal.resource) {
                      // تعديل مرجع
                      await updateResource(resourceModal.resource.id!, {
                        title: resourceForm.title,
                        url: resourceForm.url,
                        type: resourceForm.type
                      });
                    } else {
                      // إضافة مرجع جديد
                      await addResource({
                        title: resourceForm.title,
                        url: resourceForm.url,
                        type: resourceForm.type,
                        weekId: selectedWeek.week,
                        dayIndex: parseInt(dayIndex)
                      });
                    }
                    setResourceForm({ title: '', url: '', type: 'video' });
                    setResourceModal({ isOpen: false, resource: null });
                  } catch (error) {
                    console.error('Error saving resource:', error);
                  }
                }
              }}
              disabled={!resourceForm.title.trim() || !resourceForm.url.trim()}
            >
              {resourceModal.resource ? t('updateResource') : t('addResource')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}