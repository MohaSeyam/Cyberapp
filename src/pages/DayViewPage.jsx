import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, CheckCircle, Clock,
  Shield, Bug, Target, Users, FileText, Star, Activity,
  BookOpen, MessageSquare, Plus, ExternalLink, Edit2, Trash2,
  X, Tag, Calendar, Eye, Download
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

  // Safe access to useSimpleApp
  let appData;
  try {
    appData = useSimpleApp();
  } catch (error) {
    console.error('Error accessing useSimpleApp:', error);
    appData = {
      progress: [],
      addOrUpdateProgress: async () => {},
      taskEvaluations: [],
      addOrUpdateTaskEvaluation: async () => {},
      notes: [],
      addNote: async () => 0,
      deleteNote: async () => {},
      resources: [],
      addResource: async () => {},
      deleteResource: async () => {},
      updateResource: async () => {},
      journalEntries: [],
      addJournalEntry: async () => {},
      deleteJournalEntry: async () => {},
      updateJournalEntry: async () => {}
    };
  }
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
    updateResource,
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    updateJournalEntry
  } = appData;

  // Ensure data is available
  const safeProgress = Array.isArray(progress) ? progress : [];
  const safeTaskEvaluations = Array.isArray(taskEvaluations) ? taskEvaluations : [];
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null });
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: [] });
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'article', description: '', category: '' });
  const [journalForm, setJournalForm] = useState({ title: '', content: '', tags: [] });
  const [journalContent, setJournalContent] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [expandedJournal, setExpandedJournal] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});
  const noteEditorRef = React.useRef(null);

  useEffect(() => {
    if (showNoteEditor && noteEditorRef.current) {
      noteEditorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showNoteEditor]);

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
    
    console.log('useEffect for journal content triggered:', {
      selectedWeek: selectedWeek?.week,
      selectedDay: selectedDay?.key,
      phaseId: selectedWeek?.phase,
      safeJournalEntries: safeJournalEntries.length
    });
    
    const entry = safeJournalEntries.find(e =>
      e.weekId === selectedWeek.week &&
      e.dayKey === selectedDay.key &&
      e.phaseId === selectedWeek.phase
    );
    
    console.log('Found entry in useEffect:', entry);
    setJournalContent(entry ? entry.content : '');
  }, [selectedWeek, selectedDay, safeJournalEntries]);

  const handleSaveJournal = async () => {
    if (!selectedWeek || !selectedDay || !journalForm.title.trim() || !journalForm.content.trim()) return;
    
    try {
      setIsSavingJournal(true);
      
      // البحث عن مدونة موجودة لهذا اليوم
      const existingEntry = safeJournalEntries.find(e =>
        e.weekId === selectedWeek.week &&
        e.dayKey === selectedDay.key &&
        e.phaseId === selectedWeek.phase
      );
      
      if (existingEntry) {
        // تحديث المدونة الموجودة
        await updateJournalEntry(existingEntry.id, { 
          title: journalForm.title,
          content: journalForm.content,
          tags: journalForm.tags
        });
      } else {
        // إضافة مدونة جديدة
        await addJournalEntry({
          title: journalForm.title,
          content: journalForm.content,
          weekId: selectedWeek.week,
          dayKey: selectedDay.key,
          phaseId: selectedWeek.phase,
          tags: journalForm.tags
        });
      }
      
      // إعادة تعيين النموذج وإغلاق المحرر
      setJournalForm({ title: '', content: '', tags: [] });
      setShowJournalEditor(false);
      
      // تحديث journalContent لعرض المدونة المحفوظة
      const updatedEntry = safeJournalEntries.find(e =>
        e.weekId === selectedWeek.week &&
        e.dayKey === selectedDay.key &&
        e.phaseId === selectedWeek.phase
      );
      if (updatedEntry) {
        setJournalContent(updatedEntry.content);
      }
      
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleDeleteJournal = async () => {
    if (!selectedWeek || !selectedDay) return;
    
    console.log('handleDeleteJournal called', { selectedWeek, selectedDay });
    
    const existingEntry = safeJournalEntries.find(e =>
      e.weekId === selectedWeek.week &&
      e.dayKey === selectedDay.key &&
      e.phaseId === selectedWeek.phase
      );
    
    console.log('existingEntry found:', existingEntry);
    
    if (existingEntry) {
      try {
        console.log('Deleting journal entry with ID:', existingEntry.id);
        await deleteJournalEntry(existingEntry.id);
        console.log('Journal entry deleted successfully');
        
        // إغلاق محرر المدونة وإعادة تعيين الحالة
        setShowJournalEditor(false);
        setJournalForm({
          title: '',
          content: '',
          tags: []
        });
        // تحديث journalContent أيضاً
        setJournalContent('');
        
        console.log('State updated after deletion');
      } catch (error) {
        console.error('Error deleting journal:', error);
      }
    } else {
      console.log('No existing entry found to delete');
    }
  };

  // إضافة مورد جديد
  const handleAddResource = async () => {
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) return;
    
    try {
      await addResource({
        title: resourceForm.title.trim(),
        url: resourceForm.url?.startsWith('http') ? resourceForm.url : `https://${resourceForm.url}`,
        type: resourceForm.type,
        weekId: selectedWeek.week,
        dayKey: selectedDay.key,
        phaseId: selectedWeek.phase,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setResourceModal({ isOpen: false, resource: null });
      setResourceForm({ title: '', url: '', type: 'article' });
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  // تحديث مورد موجود
  const handleUpdateResource = async () => {
    if (!resourceModal.resource || !resourceForm.title.trim() || !resourceForm.url.trim()) return;
    
    try {
      await updateResource(resourceModal.resource.id, {
        title: resourceForm.title.trim(),
        url: resourceForm.url?.startsWith('http') ? resourceForm.url : `https://${resourceForm.url}`,
        type: resourceForm.type,
        updatedAt: new Date().toISOString(),
      });
      setResourceModal({ isOpen: false, resource: null });
      setResourceForm({ title: '', url: '', type: 'article' });
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  // حذف مورد
  const handleDeleteResource = async (resourceId) => {
    try {
      await deleteResource(resourceId);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  // فتح نافذة تعديل المورد
  const openEditResource = (resource) => {
    // إذا كان المورد من الخطة، لا يمكن تعديله
    if (resource.isPlanResource) {
      alert(language === 'ar' ? 'لا يمكن تعديل الموارد من الخطة. يمكنك إضافة مورد جديد بدلاً من ذلك.' : 'Cannot edit resources from the plan. You can add a new resource instead.');
      return;
    }
    
    setResourceForm({
      title: resource.title || '',
      url: resource.url || '',
      type: resource.type || 'article',
      description: resource.description || '',
      category: resource.category || ''
    });
    setResourceModal({ isOpen: true, resource });
  };

  // فتح نافذة إضافة مورد جديد
  const openAddResource = () => {
    setResourceForm({ title: '', url: '', type: 'article' });
    setResourceModal({ isOpen: true, resource: null });
  };

  // الحصول على الموارد المرتبطة باليوم
  const getDayResources = () => {
    // الموارد من ملف الخطة
    const planResources = (selectedDay?.resources || []).map(resource => ({
      ...resource,
      isPlanResource: true, // علامة لتحديد أنها من الخطة
      canEdit: false // لا يمكن تعديلها
    }));
    
    // الموارد المضافة من قبل المستخدم
    const userResources = safeResources.filter(r => 
      r.weekId === selectedWeek?.week && 
      r.dayKey === selectedDay?.key && 
      r.phaseId === selectedWeek?.phase
    ).map(resource => ({
      ...resource,
      isPlanResource: false, // علامة لتحديد أنها من المستخدم
      canEdit: true // يمكن تعديلها
    }));
    
    return [...planResources, ...userResources];
  };

  // الحصول على الملاحظات المرتبطة باليوم
  const getDayNotes = () => {
    return safeNotes.filter(note => 
      note.weekId === selectedWeek?.week && 
      note.dayKey === selectedDay?.key
    );
  };

  // الحصول على مدونة اليوم
  const getDayJournal = () => {
    if (!selectedWeek || !selectedDay) return null;
    
    const entry = safeJournalEntries.find(e =>
      e.weekId === selectedWeek.week &&
      e.dayKey === selectedDay.key &&
      e.phaseId === selectedWeek.phase
    );
    
    console.log('getDayJournal called:', {
      selectedWeek: selectedWeek?.week,
      selectedDay: selectedDay?.key,
      phaseId: selectedWeek?.phase,
      safeJournalEntries: safeJournalEntries.length,
      foundEntry: entry
    });
    
    return entry;
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
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleSave = async () => {
      if (rating === 0) {
        alert(language === 'ar' ? 'يرجى تحديد درجة الفهم' : 'Please select an understanding rating');
        return;
      }
      
      setIsSubmitting(true);
      try {
        await addOrUpdateTaskEvaluation({ 
          taskId, 
          weekId, 
          rating, 
          difficulty: understanding || undefined, 
          note: undefined 
        });
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          setOpen(false);
        }, 1500);
      } catch (error) {
        console.error('Error saving evaluation:', error);
        alert(language === 'ar' ? 'حدث خطأ أثناء حفظ التقييم' : 'Error saving evaluation');
      } finally {
        setIsSubmitting(false);
      }
    };

    // Summary view
    const summary = evalObj && evalObj.rating ? (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500 dark:text-gray-400 mr-1">
            {language === 'ar' ? 'الفهم:' : 'Understanding:'}
          </span>
          {[1,2,3,4,5].map(idx => (
            <span key={idx} className={`w-3 h-3 rounded-full transition-colors ${idx <= evalObj.rating ? 'bg-blue-500 dark:bg-blue-300' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
          ))}
        </div>
        {evalObj.difficulty && (
          <span className={`rounded px-2 py-1 text-xs font-semibold ${
            evalObj.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
            evalObj.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {language === 'ar'
              ? evalObj.difficulty === 'easy' ? 'سهل' : evalObj.difficulty === 'medium' ? 'متوسط' : 'صعب'
              : evalObj.difficulty === 'easy' ? 'Easy' : evalObj.difficulty === 'medium' ? 'Medium' : 'Hard'}
          </span>
        )}
      </div>
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
            {language === 'ar' ? 'تقييم المهمة' : 'Rate Task'}
          </button>
          {summary}
        </div>
      );
    }

    return (
      <div className="mt-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            {language === 'ar' ? 'درجة الفهم:' : 'Understanding:'}
          </span>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(idx => (
              <button 
                key={idx} 
                onClick={() => setRating(idx)} 
                className="focus:outline-none hover:scale-110 transition-transform"
                title={language === 'ar' ? `مستوى ${idx}` : `Level ${idx}`}
              >
                <span className={`w-5 h-5 rounded-full transition-all duration-200 ${idx <= rating ? 'bg-blue-500 dark:bg-blue-300 shadow-lg' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}></span>
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {rating > 0 && (language === 'ar' ? `(${rating}/5)` : `(${rating}/5)`)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {language === 'ar' ? 'درجة الصعوبة:' : 'Difficulty:'}
          </span>
          <select 
            value={understanding} 
            onChange={e => setUnderstanding(e.target.value)} 
            className="rounded px-2 py-1 text-sm border dark:bg-gray-900"
          >
            <option value="">{language === 'ar' ? 'اختر' : 'Select'}</option>
            <option value="easy">{language === 'ar' ? 'سهل' : 'Easy'}</option>
            <option value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</option>
            <option value="hard">{language === 'ar' ? 'صعب' : 'Hard'}</option>
          </select>
        </div>
        <div className="flex justify-end items-center gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          {saved && (
            <span className="text-green-600 text-sm font-semibold transition-all flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {language === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved successfully!'}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave}
            disabled={isSubmitting || rating === 0}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
              </span>
            ) : (
              language === 'ar' ? 'حفظ التقييم' : 'Save Rating'
            )}
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
                  disabled={parseInt(dayKey) <= 1}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={parseInt(dayKey) >= (selectedWeek.days?.length || 0)}
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
                            onNoteClick={() => setShowNoteEditor(true)}
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

          {/* قسم الموارد */}
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200">
                  {language === 'ar' ? 'موارد اليوم' : 'Day Resources'}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={openAddResource}
              >
                {language === 'ar' ? 'إضافة مورد' : 'Add Resource'}
              </Button>
            </div>
            <div className="space-y-4">
              {getDayResources().length > 0 ? (
                getDayResources().map((resource, idx) => (
                  <Card key={idx} className="p-3 border-blue-200 dark:border-blue-700 cursor-pointer" onClick={() => window.open(resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`,'_blank')} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`,'_blank'); } }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <ExternalLink className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <a 
                            href={resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-700 dark:text-blue-300 hover:underline font-semibold block"
                          >
                            {resource.title}
                          </a>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              {resource.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {resource.canEdit && ( // الموارد القابلة للتعديل
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Edit2 className="w-4 h-4" />}
                              onClick={(e) => { e.stopPropagation(); openEditResource(resource); }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Trash2 className="w-4 h-4" />}
                              onClick={(e) => { e.stopPropagation(); handleDeleteResource(resource.id); }}
                            />
                          </>
                        )}
                        {resource.isPlanResource && ( // الموارد من الخطة
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {language === 'ar' ? 'من الخطة' : 'From Plan'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-4">
                  {language === 'ar' ? 'لا توجد موارد لهذا اليوم.' : 'No resources for this day.'}
                </div>
              )}
            </div>
          </Card>

          {/* قسم ملاحظات اليوم */}
          <Card className="mb-8" ref={noteEditorRef}>
                          <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200">
                    {language === 'ar' ? 'ملاحظات اليوم' : 'Day Notes'}
                  </h2>
                </div>
              </div>
            
            {/* عرض الملاحظات المرتبطة بهذا اليوم */}
            {showNoteEditor ? (
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
                    {language === 'ar' ? 'التاجات (اختياري)' : 'Tags (Optional)'}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={noteForm.tags.join(' ')}
                      onChange={(e) => setNoteForm(prev => ({ 
                        ...prev, 
                        tags: e.target.value.split(/\s+/).map(tag => tag.trim()).filter(tag => tag) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={language === 'ar' ? 'أدخل التاجات مفصولة بمسافات' : 'Enter tags separated by spaces'}
                    />
                    {noteForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {noteForm.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center gap-2">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setNoteForm(prev => ({
                                ...prev,
                                tags: prev.tags.filter((_, i) => i !== index)
                              }))}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <RichTextEditor
                  content={noteForm.content}
                  onChange={val => setNoteForm(prev => ({ ...prev, content: val }))}
                  placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                  lang={language}
                  showToolbar={true}
                  minHeight="150px"
                />
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNoteEditor(false);
                      setNoteForm({ title: '', content: '', tags: [] });
                    }}
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // إضافة تاج "ملاحظة عامة" تلقائياً إذا لم يتم تحديد يوم
                      const tags = [...noteForm.tags];
                      if (!selectedWeek?.week || !selectedDay?.key) {
                        const generalTag = language === 'ar' ? 'ملاحظة عامة' : 'General Note';
                        if (!tags.includes(generalTag)) {
                          tags.push(generalTag);
                        }
                      }
                      
                      addNote({
                        title: noteForm.title,
                        content: noteForm.content,
                        tags: tags,
                        weekId: selectedWeek?.week || null,
                        dayKey: selectedDay?.key || null,
                        phaseId: selectedWeek?.phase || null
                      });
                      setShowNoteEditor(false);
                      setNoteForm({ title: '', content: '', tags: [] });
                    }}
                    disabled={!noteForm.title.trim() || !noteForm.content.trim()}
                  >
                    {language === 'ar' ? 'حفظ الملاحظة' : 'Save Note'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {getDayNotes().map(note => (
                  <Card key={note.id} className="p-3 border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedNotes(prev => ({ ...prev, [note.id]: !prev[note.id] }))}>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{note.title}</h3>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {!expandedNotes[note.id] && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                            {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={expandedNotes[note.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation(); setExpandedNotes(prev => ({ ...prev, [note.id]: !prev[note.id] })); }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation(); setNoteForm({
                            title: note.title,
                            content: note.content,
                            tags: note.tags || []
                          });
                          setShowNoteEditor(true); }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation(); if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الملاحظة؟' : 'Are you sure you want to delete this note?')) {
                            deleteNote(note.id);
                          } }}
                        />
                      </div>
                    </div>
                    {expandedNotes[note.id] && (
                      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
                    )}
                  </Card>
                ))}
                {getDayNotes().length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-blue-300" />
                    <p>{language === 'ar' ? 'لا توجد ملاحظات لهذا اليوم. اضغط على "إضافة ملاحظة" لبدء الكتابة.' : 'No notes for this day. Click "Add Note" to start writing.'}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* قسم التدوين اليومي من ملف الخطة */}


          {/* قسم المدونة */}
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-200">
                  {language === 'ar' ? 'مدونة اليوم' : 'Day Journal'}
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowJournalEditor(true)}
              >
                {language === 'ar' ? 'إضافة مدونة' : 'Add Journal'}
              </Button>
            </div>

            {selectedDay?.notes_prompt && (
              <div className="mb-4 p-4 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-300" />
                  <h3 className="font-semibold text-green-700 dark:text-green-200">
                    {selectedDay.notes_prompt.title?.[language] || selectedDay.notes_prompt.title?.ar || 'مهمة التدوين المسائية'}
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedDay.notes_prompt.points?.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {point[language] || point.ar}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* عرض المدونة الموجودة */}
            {showJournalEditor ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'عنوان المدونة' : 'Journal Title'}
                  </label>
                  <input
                    type="text"
                    value={journalForm.title}
                    onChange={(e) => setJournalForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder={language === 'ar' ? 'أدخل عنوان المدونة' : 'Enter journal title'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'التاجات (اختياري)' : 'Tags (Optional)'}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={journalForm.tags.join(' ')}
                      onChange={(e) => setJournalForm(prev => ({ 
                        ...prev, 
                        tags: e.target.value.split(/\s+/).map(tag => tag.trim()).filter(tag => tag) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder={language === 'ar' ? 'أدخل التاجات مفصولة بمسافات' : 'Enter tags separated by spaces'}
                    />
                    {journalForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {journalForm.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full flex items-center gap-2">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setJournalForm(prev => ({
                                ...prev,
                                tags: prev.tags.filter((_, i) => i !== index)
                              }))}
                              className="text-purple-500 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <RichTextEditor
                  content={journalForm.content}
                  onChange={val => setJournalForm(prev => ({ ...prev, content: val }))}
                  placeholder={language === 'ar' ? 'اكتب مدونتك هنا...' : 'Write your journal here...'}
                  lang={language}
                  showToolbar={true}
                  minHeight="200px"
                />
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowJournalEditor(false);
                      setJournalForm({ title: '', content: '', tags: [] });
                    }}
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    variant="primary"
                    loading={isSavingJournal}
                    onClick={handleSaveJournal}
                    disabled={isSavingJournal || !journalForm.title.trim() || !journalForm.content.trim()}
                  >
                    {language === 'ar' ? 'حفظ المدونة' : 'Save Journal'}
                  </Button>
                </div>
              </div>
            ) : (
              getDayJournal() ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedJournal(!expandedJournal)}>
                        <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                          {getDayJournal().title || (language === 'ar' ? 'مدونة اليوم' : 'Day Journal')}
                        </h3>
                        {getDayJournal().tags && getDayJournal().tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getDayJournal().tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {!expandedJournal && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                            {getDayJournal().content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={expandedJournal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation(); setExpandedJournal(!expandedJournal); }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation();
                            setJournalForm({
                              title: getDayJournal().title || '',
                              content: getDayJournal().content || '',
                              tags: getDayJournal().tags || []
                            });
                            setShowJournalEditor(true);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation();
                            if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المدونة؟' : 'Are you sure you want to delete this journal?')) {
                              handleDeleteJournal();
                            }
                          }}
                        />
                      </div>
                    </div>
                    {expandedJournal && (
                      <>
                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: getDayJournal().content }} />
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/journal/${getDayJournal().id}`)}
                          >
                            {language === 'ar' ? 'عرض كامل المدونة' : 'View Full Journal'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                  <p>{language === 'ar' ? 'لا توجد مدونة لهذا اليوم. اضغط على "إضافة مدونة" لبدء الكتابة.' : 'No journal entry for this day. Click "Add Journal" to start writing.'}</p>
                </div>
              )
            )}
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
                    disabled={parseInt(dayKey) <= 1}
                    className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500"
                  >
                    {language === 'ar' ? 'اليوم السابق' : 'Previous Day'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<ChevronRight />}
                    onClick={goToNextDay}
                    disabled={parseInt(dayKey) >= (selectedWeek.days?.length || 0)}
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

      



            {/* Resource Modal */}
      <Modal
        isOpen={resourceModal.isOpen}
        onClose={() => {
          setResourceModal({ isOpen: false, resource: null });
          setResourceForm({ title: '', url: '', type: 'article' });
        }}
        title={resourceModal.resource ? (language === 'ar' ? 'تعديل المورد' : 'Edit Resource') : (language === 'ar' ? 'إضافة مورد جديد' : 'Add New Resource')}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان المورد *' : 'Resource Title *'}
            </label>
            <input
              type="text"
              value={resourceForm.title}
              onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'أدخل عنوان المورد' : 'Enter resource title'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'رابط المورد *' : 'Resource URL *'}
            </label>
            <input
              type="url"
              value={resourceForm.url}
              onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'أدخل رابط المورد' : 'Enter resource URL'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'نوع المورد *' : 'Resource Type *'}
            </label>
            <select
              value={resourceForm.type}
              onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="article">{language === 'ar' ? 'مقال' : 'Article'}</option>
              <option value="video">{language === 'ar' ? 'فيديو' : 'Video'}</option>
              <option value="book">{language === 'ar' ? 'كتاب' : 'Book'}</option>
              <option value="tool">{language === 'ar' ? 'أداة' : 'Tool'}</option>
              <option value="course">{language === 'ar' ? 'دورة' : 'Course'}</option>
              <option value="link">{language === 'ar' ? 'رابط' : 'Link'}</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setResourceModal({ isOpen: false, resource: null });
                setResourceForm({ title: '', url: '', type: 'article' });
              }}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={resourceModal.resource ? handleUpdateResource : handleAddResource}
              disabled={!resourceForm.title.trim() || !resourceForm.url.trim()}
            >
              {resourceModal.resource ? (language === 'ar' ? 'تحديث المورد' : 'Update Resource') : (language === 'ar' ? 'إضافة المورد' : 'Add Resource')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default DayViewPage;