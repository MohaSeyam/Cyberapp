// Day View Page - Unified Design
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Target, BookOpen, MessageSquare,
  ExternalLink, Plus, CheckCircle, Circle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import TaskCard from '../components/ui/TaskCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { animations } from '../constants/theme';
import type { Week, Day, Task, Resource } from '../types';

interface DayViewPageProps {
  weekId?: string;
  dayIndex?: string;
}

export default function DayViewPage({ weekId = "1", dayIndex = "0" }: DayViewPageProps) {
  const { plan, progress, addNote, addResource, lang } = useApp();
  const { t } = useLocalization();
  
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, taskId: '' });
  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null as Resource | null });
  const [noteContent, setNoteContent] = useState('');
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'video' as const });

  // Find current week and day
  useEffect(() => {
    const week = plan.find(w => w.week === parseInt(weekId));
    if (week) {
      setSelectedWeek(week);
      const day = week.days[parseInt(dayIndex)];
      if (day) {
        setSelectedDay(day);
      }
    }
  }, [plan, weekId, dayIndex]);

  const handleAddNote = async () => {
    if (noteContent.trim() && selectedWeek && selectedDay) {
      try {
        await addNote({
          title: `ملاحظة على المهمة`,
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

  return (
    <PageLayout
      title={`${t('week')} ${selectedWeek.week} - ${selectedDay.day[lang]}`}
      subtitle={selectedDay.topic[lang]}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedDay.day[lang]}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {selectedDay.topic[lang]}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{selectedDay.tasks.reduce((total, task) => total + task.duration, 0)} {t('minutes')}</span>
          </div>
        </div>
      }
    >
      {/* Tasks Section */}
      <motion.div
        {...animations.fadeIn}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('todayTasks')}
          </h2>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDay.tasks.length} {t('tasks')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedDay.tasks.map((task, index) => (
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
                <BookOpen className="w-5 h-5 text-blue-600" />
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
            {selectedDay.resources.length > 0 ? (
              selectedDay.resources.map((resource, index) => (
                <motion.div
                  key={index}
                  {...animations.stagger(0.3 + index * 0.1)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resource.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    {t('open')}
                  </Button>
                </motion.div>
              ))
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
            title={selectedDay.notes_prompt.title[lang]}
            subtitle={t('eveningJournaling')}
          >
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                  {t('journalingPoints')}:
                </h4>
                <ul className="space-y-2">
                  {selectedDay.notes_prompt.points.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-200">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>{point[lang]}</span>
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
        title={t('addResource')}
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
              onClick={handleAddResource}
              disabled={!resourceForm.title.trim() || !resourceForm.url.trim()}
            >
              {t('addResource')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}