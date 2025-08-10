import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, Clock,
  Shield, Bug, Target, Users, FileText, Star, Activity,
  BookOpen, MessageSquare, Plus, ExternalLink, Edit2, Trash2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import planData from '../data/PlanData.json';
import phasesData from '../data/phases.json';

const DayViewPage = () => {
  const { weekId, dayIndex } = useParams();
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { 
    progress, 
    addOrUpdateProgress, 
    taskEvaluations, 
    addOrUpdateTaskEvaluation,
    notes,
    addNote,
    deleteNote,
    resources,
    addResource,
    deleteResource,
    journalEntries,
    addJournalEntry,
    deleteJournalEntry
  } = useApp();

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, taskId: '' });
  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null });
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: [] });
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'article' });
  const [journalForm, setJournalForm] = useState({ title: '', content: '', tags: [] });

  // Find current week and day
  useEffect(() => {
    const week = planData.find(w => w.week === parseInt(weekId));
    setSelectedWeek(week);
    if (week && week.days) {
      setSelectedDay(week.days[parseInt(dayIndex)]);
    }
  }, [weekId, dayIndex]);

  // Determine current phase
  const getCurrentPhase = () => {
    return phasesData.find(phase => phase.weeks.includes(parseInt(weekId)));
  };

  const currentPhase = getCurrentPhase();

  // Navigation functions
  const goToNextDay = () => {
    if (selectedWeek && parseInt(dayIndex) < selectedWeek.days.length - 1) {
      navigate(`/day/${weekId}/${parseInt(dayIndex) + 1}`);
    }
  };

  const goToPreviousDay = () => {
    if (parseInt(dayIndex) > 0) {
      navigate(`/day/${weekId}/${parseInt(dayIndex) - 1}`);
    }
  };

  const goToDayList = () => {
    navigate(`/week/${weekId}`);
  };

  // Task type configurations
  const taskTypeConfig = {
    'Blue Team': {
      icon: Shield,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    'Red Team': {
      icon: Bug,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400'
    },
    'Particular': {
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    'Soft Skills': {
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    'Policies': {
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  };

  // Task Evaluation Widget
  const TaskEvaluationWidget = ({ taskId, weekId, language, summaryOnly = false, isTaskCompleted = false }) => {
    const [rating, setRating] = useState(0);
    const [understanding, setUnderstanding] = useState('');
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const evalObj = taskEvaluations.find(e => e.taskId === taskId && e.weekId === weekId);
    const isRTL = language === 'ar';

    useEffect(() => {
      if (evalObj) {
        setRating(evalObj.rating);
        setUnderstanding(evalObj.difficulty || '');
      } else {
        setRating(0);
        setUnderstanding('');
      }
    }, [evalObj, taskId, weekId]);

    const handleSave = () => {
      addOrUpdateTaskEvaluation({ taskId, weekId, rating, difficulty: understanding || undefined, note: undefined });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1200);
    };

    // Summary view
    const summary = evalObj && evalObj.rating ? (
      <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(star => (
            <span key={star} className={star <= evalObj.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          ))}
        </span>
        {evalObj.difficulty ? (
          <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
            evalObj.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
            evalObj.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {language === 'ar'
              ? evalObj.difficulty === 'easy' ? 'مفهوم' : evalObj.difficulty === 'medium' ? 'متوسط' : 'صعب'
              : evalObj.difficulty === 'easy' ? 'Understood' : evalObj.difficulty === 'medium' ? 'Medium' : 'Hard'}
          </span>
        ) : null}
      </span>
    ) : null;

    if (summaryOnly) return summary;

    // Cannot evaluate task before completion
    if (!isTaskCompleted) {
      return (
        <div className="mt-2 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed text-xs font-semibold"
            title={language === 'ar' ? 'أكمل المهمة أولاً لتتمكن من تقييمها' : 'Complete the task first to evaluate it'}
          >
            <Star className="w-4 h-4 text-gray-400" />
            {language === 'ar' ? 'تقييم' : 'Rate'}
          </button>
        </div>
      );
    }

    if (!open) {
      return (
        <div className="mt-2 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
          >
            <Star className="w-4 h-4" />
            {language === 'ar' ? 'تقييم المهمة' : 'Rate Task'}
          </button>
          {summary}
        </div>
      );
    }

    return (
      <div className="mt-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            {language === 'ar' ? 'تقييم المهمة:' : 'Task Rating:'}
          </span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                <span className={star <= rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>★</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'درجة الفهم:' : 'Understanding Level:'}
          </span>
          <select 
            value={understanding} 
            onChange={e => setUnderstanding(e.target.value)} 
            className="rounded px-2 py-1 text-sm border dark:bg-gray-900"
          >
            <option value="">{language === 'ar' ? 'اختر' : 'Select'}</option>
            <option value="easy">{language === 'ar' ? 'مفهوم' : 'Understood'}</option>
            <option value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</option>
            <option value="hard">{language === 'ar' ? 'صعب' : 'Hard'}</option>
          </select>
        </div>
        <div className="flex justify-end items-center gap-2 mt-2">
          {saved && (
            <span className="text-green-600 text-xs font-semibold transition-all">
              {language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved!'}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {language === 'ar' ? 'حفظ التقييم' : 'Save Rating'}
          </Button>
        </div>
      </div>
    );
  };

  // Task Card Component
  const TaskCard = ({ task, weekId, dayKey, variant = 'simple', showNotes = false, onNoteClick }) => {
    const typeInfo = taskTypeConfig[task.type] || taskTypeConfig['Blue Team'];
    const TypeIcon = typeInfo.icon;
    const taskProgress = progress.find(p => p.taskId === task.id && p.weekId === weekId && p.dayKey === dayKey);
    const isCompleted = taskProgress?.done || false;

    const handleToggleTask = () => {
      addOrUpdateProgress({
        taskId: task.id,
        weekId: weekId,
        dayKey: dayKey,
        done: !isCompleted
      });
    };

    return (
      <Card className={`p-4 ${variant === 'detailed' ? 'hover:shadow-lg' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
            <TypeIcon className={`w-5 h-5 ${typeInfo.textColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white mb-1">
                  {task.description[language]}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{task.duration} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    task.type === 'Blue Team' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    task.type === 'Red Team' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    task.type === 'Soft Skills' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {task.type}
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleTask}
                className={`p-2 rounded-lg transition-colors ${
                  isCompleted 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-green-600 dark:text-green-400' : ''}`} />
              </button>
            </div>
            {showNotes && (
              <button
                onClick={onNoteClick}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: (delay = 0) => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay }
    })
  };

  if (!selectedWeek || !selectedDay) {
    return (
      <PageLayout title="خطأ" subtitle="اليوم غير موجود" showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'اليوم غير موجود' : 'Day not found'}
          </h3>
          <Button onClick={goToDayList} variant="primary">
            {language === 'ar' ? 'العودة لأيام الأسبوع' : 'Back to Week Days'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBottomBar={true}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div {...animations.fadeIn} className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              icon={<ArrowLeft />}
              onClick={goToDayList}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span>{language === 'ar' ? 'العودة لأيام الأسبوع' : 'Back to Week Days'}</span>
            </Button>
          </div>

          {/* Day Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
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
            
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 drop-shadow-lg">
                {selectedDay.name?.[language] || selectedDay.name?.ar}
              </h1>
              {selectedDay.topic?.[language] && (
                <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 font-medium mb-2">
                  {selectedDay.topic[language]}
                </p>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <motion.div {...animations.fadeIn} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'مهام اليوم' : 'Today\'s Tasks'}
              </h2>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 
                    `${(selectedDay.tasks || []).length} مهام` :
                    `${(selectedDay.tasks || []).length} tasks`
                  }
                </span>
              </div>
            </div>

            {/* Group tasks by type */}
            {(() => {
              const tasksByType = (selectedDay.tasks || []).reduce((acc, task) => {
                const type = task.type || 'Technical Skills';
                if (!acc[type]) acc[type] = [];
                acc[type].push(task);
                return acc;
              }, {});

              return Object.entries(tasksByType).map(([type, tasks]) => {
                const typeInfo = taskTypeConfig[type] || taskTypeConfig['Blue Team'];
                const TypeIcon = typeInfo?.icon || Shield;
                
                return (
                  <Card key={type} className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${typeInfo.bgColor} shadow-sm`}>
                          <TypeIcon className={`w-6 h-6 ${typeInfo.textColor}`} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-lg font-semibold ${typeInfo.textColor}`}>
                          {type}
                        </h3>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                          {tasks?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {tasks?.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <TaskCard
                            task={task}
                            weekId={selectedWeek.week}
                            dayKey={selectedDay.key}
                            variant="detailed"
                            showNotes={true}
                            onNoteClick={() => setNoteModal({ isOpen: true, taskId: task.id })}
                          />
                          <TaskEvaluationWidget 
                            taskId={task.id} 
                            weekId={selectedWeek.week} 
                            language={language} 
                            isTaskCompleted={progress.some(p => p.weekId === selectedWeek.week && p.dayKey === selectedDay.key && p.taskId === task.id && p.done)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                );
              });
            })()}
          </motion.div>

          {/* Navigation Footer */}
          <motion.div {...animations.fadeIn} transition={{ delay: 0.6 }}>
            <Card>
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<ChevronLeft />}
                    onClick={goToPreviousDay}
                    disabled={parseInt(dayIndex) <= 0}
                    className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500"
                  >
                    {language === 'ar' ? 'اليوم السابق' : 'Previous Day'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<ChevronRight />}
                    onClick={goToNextDay}
                    disabled={parseInt(dayIndex) >= (selectedWeek.days?.length || 0) - 1}
                    className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500"
                  >
                    {language === 'ar' ? 'اليوم التالي' : 'Next Day'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Note Modal */}
      <Modal
        isOpen={noteModal.isOpen}
        onClose={() => {
          setNoteModal({ isOpen: false, taskId: '' });
          setNoteForm({ title: '', content: '', tags: [] });
        }}
        title={language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان الملاحظة' : 'Note Title'}
            </label>
            <input
              type="text"
              value={noteForm.title}
              onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'أدخل عنوان الملاحظة' : 'Enter note title'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'محتوى الملاحظة' : 'Note Content'}
            </label>
            <textarea
              value={noteForm.content}
              onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setNoteModal({ isOpen: false, taskId: '' });
                setNoteForm({ title: '', content: '', tags: [] });
              }}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                addNote({
                  title: noteForm.title,
                  content: noteForm.content,
                  tags: noteForm.tags,
                  taskId: noteModal.taskId,
                  weekId: selectedWeek.week,
                  dayKey: selectedDay.key
                });
                setNoteModal({ isOpen: false, taskId: '' });
                setNoteForm({ title: '', content: '', tags: [] });
              }}
              disabled={!noteForm.title.trim() || !noteForm.content.trim()}
            >
              {language === 'ar' ? 'حفظ الملاحظة' : 'Save Note'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default DayViewPage;