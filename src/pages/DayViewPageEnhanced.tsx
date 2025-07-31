// Day View Page - Enhanced with Focus Mode, Pomodoro, Resource Modal, Note Expansion, and Performance Optimizations
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Play, Pause, RotateCcw, BookOpen, Target, Plus, ExternalLink, Edit2, MessageSquare, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import TaskCard from '../components/ui/TaskCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import RichTextEditor from '../components/editors/RichTextEditor';
import { animations } from '../constants/theme';

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const ResourceModal = React.memo(({ resource, open, onClose }) => (
  <Modal isOpen={open} onClose={onClose} title={resource?.title || ''} size="lg">
    {resource && (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600">{resource.type}</span>
          <Button variant="ghost" size="sm" icon={<ExternalLink />} onClick={() => window.open(resource.url, '_blank')}>{'فتح'}</Button>
        </div>
        <div className="text-gray-700 dark:text-gray-200 break-words">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{resource.url}</a>
        </div>
      </div>
    )}
  </Modal>
));

const NoteCard = React.memo(({ note, expanded, onExpand, onEdit }) => (
  <Card className={`transition-all duration-300 ${expanded ? 'ring-2 ring-blue-400 scale-105' : ''} cursor-pointer`} onClick={onExpand}>
    <div className="flex items-center justify-between">
      <div className="font-semibold text-gray-900 dark:text-white">{note.title}</div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon={<Edit2 />} onClick={e => { e.stopPropagation(); onEdit(); }}>{'تعديل'}</Button>
        {expanded && <X className="w-4 h-4 cursor-pointer" onClick={e => { e.stopPropagation(); onExpand(); }} />}
      </div>
    </div>
    {expanded && (
      <div className="mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-line">
        {note.content}
      </div>
    )}
  </Card>
));

export default function DayViewPageEnhanced() {
  const { weekId = "1", dayIndex = "0" } = useParams();
  const { plan, progress, addNote, lang } = useApp();
  const { t } = useLocalization();
  
  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useLocalStorage('focusMode', false);
  
  // Pomodoro
  const [pomodoroTime, setPomodoroTime] = useLocalStorage('pomodoroTime', POMODORO_WORK);
  const [isPomodoroActive, setIsPomodoroActive] = useLocalStorage('pomodoroActive', false);
  const [pomodoroMode, setPomodoroMode] = useLocalStorage('pomodoroMode', 'work');
  
  // UI State
  const [resourceModal, setResourceModal] = useState({ open: false, resource: null });
  const [expandedNote, setExpandedNote] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  
  // Data
  const safePlan = plan || [];
  const week = useMemo(() => safePlan.find(w => w.week === parseInt(weekId)), [safePlan, weekId]);
  const day = useMemo(() => week?.days?.[parseInt(dayIndex)], [week, dayIndex]);
  
  // Pomodoro Timer Logic
  useEffect(() => {
    let interval;
    if (isPomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            if (pomodoroMode === 'work') {
              setPomodoroMode('break');
              setPomodoroTime(POMODORO_BREAK);
            } else {
              setPomodoroMode('work');
              setPomodoroTime(POMODORO_WORK);
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroTime, pomodoroMode, setPomodoroMode, setPomodoroTime]);
  
  // Handlers
  const togglePomodoro = useCallback(() => setIsPomodoroActive(a => !a), [setIsPomodoroActive]);
  const resetPomodoro = useCallback(() => { 
    setIsPomodoroActive(false); 
    setPomodoroTime(POMODORO_WORK); 
    setPomodoroMode('work'); 
  }, [setIsPomodoroActive, setPomodoroTime, setPomodoroMode]);
  const formatTime = useCallback((seconds) => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`, []);
  const toggleFocusMode = useCallback(() => setIsFocusMode(f => !f), [setIsFocusMode]);
  
  // Notes (dummy for demo)
  const notes = useMemo(() => [
    { id: '1', title: 'ملاحظة مهمة', content: 'هذه ملاحظة موسعة مع تفاصيل كثيرة.' },
    { id: '2', title: 'مفهوم أساسي', content: 'شرح مختصر لمفهوم أساسي.' }
  ], []);
  
  // Render
  if (!week || !day) return <PageLayout title={t('loading')}><div className="py-12 text-center">{t('loadingDayContent')}</div></PageLayout>;
  
  return (
    <PageLayout title={`${t('week')} ${week.week} - ${day.day?.[lang] || 'Unknown Day'}`} subtitle={t('dailyTasksAndResources')} showHeader={true}>
      {/* Focus Mode Controls */}
      <motion.div {...animations.fadeIn} className="mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <button onClick={toggleFocusMode} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isFocusMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
              {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isFocusMode ? t('exitFocusMode') : t('focusMode')}</span>
            </button>
            
            {/* Pomodoro Timer */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${pomodoroMode === 'work' ? 'text-red-600' : 'text-green-600'}`}>
                  {formatTime(pomodoroTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {pomodoroMode === 'work' ? t('workTime') : t('breakTime')}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={togglePomodoro} className={`p-2 rounded-lg transition-colors ${isPomodoroActive ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'}`}>
                  {isPomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={resetPomodoro} className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Tasks Section */}
      <motion.div {...animations.fadeIn} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('todayTasks')}</h2>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
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
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
                  onClick={() => setResourceModal({ open: true, resource })}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {resource.title}
                        <Edit2 className="w-3 h-3 text-gray-400" />
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
      
      {/* Notes Section */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }} className="mb-8">
        <Card title={t('notes')} subtitle={t('yourNotesAndReflections')}>
          <div className="space-y-4">
            {notes.length > 0 ? notes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                expanded={expandedNote === note.id} 
                onExpand={() => setExpandedNote(expandedNote === note.id ? null : note.id)} 
                onEdit={() => setEditNote(note)} 
              />
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
      
      {/* Note Edit Modal */}
      <Modal isOpen={!!editNote} onClose={() => setEditNote(null)} title={t('editNote')} size="lg">
        <div className="space-y-4">
          <RichTextEditor 
            value={noteContent} 
            onChange={setNoteContent} 
            placeholder={t('writeYourNote')} 
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditNote(null)}>{t('cancel')}</Button>
            <Button onClick={() => { /* handle save */ setEditNote(null); }}>{t('save')}</Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}