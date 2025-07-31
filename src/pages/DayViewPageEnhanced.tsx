// Day View Page - Enhanced with Resource Modal
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Target, Plus, ExternalLink, MessageSquare, Calendar, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import TaskCard from '../components/ui/TaskCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { animations } from '../constants/theme';

const ResourceModal = React.memo(({ resource, open, onClose }) => (
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

export default function DayViewPageEnhanced() {
  const { weekId = "1", dayIndex = "0" } = useParams();
  const { plan, progress, addNote, lang } = useApp();
  const { t } = useLocalization();
  
  // UI State
  const [resourceModal, setResourceModal] = useState({ open: false, resource: null });
  
  // Data
  const safePlan = plan || [];
  const week = useMemo(() => safePlan.find(w => w.week === parseInt(weekId)), [safePlan, weekId]);
  const day = useMemo(() => week?.days?.[parseInt(dayIndex)], [week, dayIndex]);
  
  // Notes (dummy for demo)
  const notes = useMemo(() => [
    { id: '1', title: 'ملاحظة مهمة', content: 'هذه ملاحظة مهمة حول اليوم.' },
    { id: '2', title: 'مفهوم أساسي', content: 'شرح مختصر لمفهوم أساسي.' }
  ], []);
  
  // Render
  if (!week || !day) return <PageLayout title={t('loading')}><div className="py-12 text-center">{t('loadingDayContent')}</div></PageLayout>;
  
  return (
    <PageLayout title={`${t('week')} ${week.week} - ${day.day?.[lang] || 'Unknown Day'}`} subtitle={t('dailyTasksAndResources')} showHeader={true}>
      
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
              <TaskCard task={task} weekId={week.week} dayKey={day.key} variant="detailed" />
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
                  <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4" />} 
                    onClick={e => { e.stopPropagation(); window.open(resource.url, '_blank'); }}>
                    {t('open')}
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noResources')}</p>
                <p className="text-sm">{t('addResourcesToGetStarted')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      
      {/* Resource Modal */}
      <ResourceModal 
        resource={resourceModal.resource} 
        open={resourceModal.open} 
        onClose={() => setResourceModal({ open: false, resource: null })} 
      />
      
      {/* Notes Section - Simple Style */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }} className="mb-8">
        <Card title={t('notes')} subtitle={t('yourNotesAndReflections')}>
          <div className="space-y-4">
            {notes.length > 0 ? notes.map(note => (
              <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{note.title}</h4>
                <p className="text-gray-700 dark:text-gray-200 text-sm">{note.content}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noNotes')}</p>
                <p className="text-sm">{t('addNotesToTrackYourLearning')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}