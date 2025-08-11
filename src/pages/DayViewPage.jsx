import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ArrowLeft, CheckCircle, Clock,
  Shield, Bug, Target, Users, FileText, Star, Activity,
  BookOpen, MessageSquare, Plus, ExternalLink, Edit2, Trash2,
  X, Tag
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import TaskCard from '../components/ui/TaskCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import planData from '../data/PlanData.json';
import phasesData from '../data/phases.json';
import RichTextEditor from '../components/editors/RichTextEditor';

const DayViewPage = () => {
  const { weekId, dayKey, phaseId } = useParams();
  const navigate = useNavigate();
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;

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
    deleteJournalEntry,
    updateJournalEntry
  } = useSimpleApp();

  // Ensure data is available
  const safeProgress = Array.isArray(progress) ? progress : [];
  const safeTaskEvaluations = Array.isArray(taskEvaluations) ? taskEvaluations : [];
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, taskId: '' });
  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null });
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: [] });
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'article' });
  const [journalForm, setJournalForm] = useState({ title: '', content: '', tags: [] });
  const [journalContent, setJournalContent] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  // Find current week and day
  useEffect(() => {
    const week = (planData || []).find(w => w.week === parseInt(weekId) && w.phase === parseInt(phaseId));
    setSelectedWeek(week);
    if (week && week.days) {
      // dayKey هو رقم اليوم في URL (يبدأ من 1)
      const dayIndexInArray = parseInt(dayKey) - 1;
      if (dayIndexInArray >= 0 && dayIndexInArray < week.days.length) {
        setSelectedDay(week.days[dayIndexInArray]);
      }
    }
  }, [weekId, dayKey, phaseId]);

  // جلب مدونة اليوم إذا كانت موجودة
  useEffect(() => {
    if (!selectedWeek || !selectedDay) return;
    const entry = safeJournalEntries.find(e =>
      e.weekId === selectedWeek.week &&
      e.dayKey === selectedDay.key &&
      e.phaseId === selectedWeek.phase
    );
    setJournalContent(entry ? entry.content : '');
  }, [selectedWeek, selectedDay, safeJournalEntries]);

  const handleSaveJournal = async () => {
    if (!selectedWeek || !selectedDay) return;
    setIsSavingJournal(true);
    // تحقق إذا كانت المدونة موجودة
    const existing = safeJournalEntries.find(e =>
      e.weekId === selectedWeek.week &&
      e.dayKey === selectedDay.key &&
      e.phaseId === selectedWeek.phase
    );
    if (existing) {
      await updateJournalEntry(existing.id, {
        content: journalContent,
        weekId: selectedWeek.week,
        dayKey: selectedDay.key,
        phaseId: selectedWeek.phase,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addJournalEntry({
        title: selectedDay.day?.[language] || selectedDay.day?.ar || 'مدونة اليوم',
        content: journalContent,
        weekId: selectedWeek.week,
        dayKey: selectedDay.key,
        phaseId: selectedWeek.phase,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setIsSavingJournal(false);
  };

  // Determine current phase
  const getCurrentPhase = () => {
    return (phasesData || []).find(phase => phase.weeks.includes(parseInt(weekId)));
  };

  const currentPhase = getCurrentPhase();

  // Navigation functions
  const goToNextDay = () => {
    if (selectedWeek && parseInt(dayKey) < selectedWeek.days.length) {
      if (currentPhase) {
        navigate(`/phases/${currentPhase.id}/weeks/${weekId}/days/${parseInt(dayKey) + 1}`);
      } else {
        navigate(`/phases/1/weeks/${weekId}/days/${parseInt(dayKey) + 1}`);
      }
    }
  };

  const goToPreviousDay = () => {
    if (parseInt(dayKey) > 1) {
      if (currentPhase) {
        navigate(`/phases/${currentPhase.id}/weeks/${weekId}/days/${parseInt(dayKey) - 1}`);
      } else {
        navigate(`/phases/1/weeks/${weekId}/days/${parseInt(dayKey) - 1}`);
      }
    }
  };

  const goToDayList = () => {
    if (currentPhase) {
      navigate(`/phases/${currentPhase.id}/weeks/${weekId}`);
    } else {
      navigate(`/phases/1/weeks/${weekId}`);
    }
  };

  // تعريف أيقونات وأنماط أنواع المهام
  const taskTypeConfig = {
    'Blue Team': {
      icon: Shield,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    'Red Team': {
      icon: Bug,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-700'
    },
    'Particular': {
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-700'
    },
    'Soft Skills': {
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    'Policies': {
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-700'
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

  // تم استبدال TaskCard بمكون موحد من ui ويدعم منطق القفل

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
                  disabled={parseInt(dayKey) <= 0}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={parseInt(dayKey) >= (selectedWeek.days?.length || 0) - 1}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 drop-shadow-lg">
                {selectedDay.day?.[language] || selectedDay.day?.ar}
              </h1>
              {selectedDay.topic?.[language] && (
                <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 font-medium mb-2">
                  {selectedDay.topic[language]}
                </p>
              )}
            </div>
          </div>

          {/* قسم المهام حسب النوع */}
          <motion.div {...animations.fadeIn} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'مهام اليوم' : 'Today\'s Tasks'}
              </h2>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? `${(selectedDay.tasks || []).length} مهام` : `${(selectedDay.tasks || []).length} tasks`}
                </span>
              </div>
            </div>
            {/* Group tasks by type */}
            {(() => {
              const tasksByType = (selectedDay.tasks || []).reduce((acc, task) => {
                const type = task.type || 'Blue Team';
                if (!acc[type]) acc[type] = [];
                acc[type].push(task);
                return acc;
              }, {});

              return Object.entries(tasksByType).map(([type, tasks]) => {
                const typeInfo = taskTypeConfig[type] || taskTypeConfig['Blue Team'];
                const TypeIcon = typeInfo?.icon || Shield;
                
                return (
                  <Card key={type} className={`mb-6 ${typeInfo.borderColor}`}>
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
                            dayTasks={selectedDay.tasks}
                          />
                          <TaskEvaluationWidget 
                            taskId={task.id} 
                            weekId={selectedWeek.week} 
                            language={language} 
                            isTaskCompleted={safeProgress.some(p => p.weekId === selectedWeek.week && p.dayKey === selectedDay.key && p.taskId === task.id && p.done)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                );
              });
            })()}
          </motion.div>

          {/* قسم المراجع */}
          <Card className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200">
                {language === 'ar' ? 'مراجع اليوم' : 'Day References'}
              </h2>
            </div>
            <div className="space-y-4">
              {(selectedDay.resources || []).length > 0 ? (
                selectedDay.resources.map((resource, idx) => (
                  <Card key={idx} className="p-3 border-blue-200 dark:border-blue-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-blue-500" />
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline font-semibold">{resource.title}</a>
                      <span className="text-xs text-gray-500">[{resource.type}]</span>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  {language === 'ar' ? 'لا توجد مراجع لهذا اليوم.' : 'No references for this day.'}
                </div>
              )}
            </div>
          </Card>

          {/* قسم المدونة */}
          <Card className="mb-8 border-purple-400 bg-purple-50 dark:bg-purple-900/30">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-200">
                {language === 'ar' ? 'مدونة اليوم' : 'Day Journal'}
              </h2>
            </div>
            <RichTextEditor
              content={journalContent}
              onChange={setJournalContent}
              placeholder={language === 'ar' ? 'اكتب مدونتك هنا...' : 'Write your journal here...'}
              lang={language}
              showToolbar={true}
              minHeight="180px"
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                loading={isSavingJournal}
                onClick={handleSaveJournal}
                disabled={isSavingJournal || !journalContent.trim()}
              >
                {language === 'ar' ? 'حفظ المدونة' : 'Save Journal'}
              </Button>
            </div>
          </Card>

          {/* قسم ملاحظات اليوم */}
          <Card className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200">
                {language === 'ar' ? 'ملاحظات اليوم' : 'Day Notes'}
              </h2>
            </div>
            {/* عرض الملاحظات المرتبطة بمهام هذا اليوم */}
            <div className="space-y-4">
              {safeNotes.filter(note =>
                note.weekId === selectedWeek.week &&
                note.dayKey === selectedDay.key
              ).map(note => (
                <Card key={note.id} className="p-3 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 dark:text-white">{note.title}</span>
                    <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: note.content }} />
                </Card>
              ))}
              {safeNotes.filter(note => note.weekId === selectedWeek.week && note.dayKey === selectedDay.key).length === 0 && (
                <div className="text-gray-500 text-sm text-center py-4">
                  {language === 'ar' ? 'لا توجد ملاحظات لهذا اليوم بعد.' : 'No notes for this day yet.'}
                </div>
              )}
            </div>
          </Card>

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
                    disabled={parseInt(dayKey) <= 0}
                    className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500"
                  >
                    {language === 'ar' ? 'اليوم السابق' : 'Previous Day'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<ChevronRight />}
                    onClick={goToNextDay}
                    disabled={parseInt(dayKey) >= (selectedWeek.days?.length || 0) - 1}
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
          <RichTextEditor
            content={noteForm.content}
            onChange={val => setNoteForm(prev => ({ ...prev, content: val }))}
            placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
            lang={language}
            showToolbar={true}
            minHeight="120px"
          />
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