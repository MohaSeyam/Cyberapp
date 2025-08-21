import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, CheckCircle, Clock,
  Shield, Bug, Target, Users, FileText, Star, Activity,
  BookOpen, MessageSquare, Plus, ExternalLink, Edit2, Trash2,
  X, Tag, Calendar, Eye, Download, HelpCircle
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
  const [isLoading, setIsLoading] = useState(true);

  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null });
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: [] });
  const [noteNewTag, setNoteNewTag] = useState('');
  const handleAddNoteTag = () => {
    const tag = noteNewTag.trim();
    if (tag && !noteForm.tags.includes(tag)) {
      setNoteForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNoteNewTag('');
    }
  };
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'article', description: '', category: '' });
  const [journalForm, setJournalForm] = useState({ title: '', content: '', tags: [] });
  const [journalNewTag, setJournalNewTag] = useState('');
  const handleAddJournalTag = () => {
    const tag = journalNewTag.trim();
    if (tag && !journalForm.tags.includes(tag)) {
      setJournalForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setJournalNewTag('');
    }
  };
  const [journalContent, setJournalContent] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [showJournalEditor, setShowJournalEditor] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [expandedJournal, setExpandedJournal] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const noteEditorRef = React.useRef(null);

  // Minimum swipe distance for navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextDay();
    } else if (isRightSwipe) {
      goToPreviousDay();
    }
  };

  // Add swipe event listeners
  useEffect(() => {
    const container = document.getElementById('day-view-container');
    if (container) {
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: true });
      container.addEventListener('touchend', onTouchEnd, { passive: true });

      return () => {
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [touchStart, touchEnd]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard shortcuts when not in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (parseInt(dayKey) > 1) {
            goToPreviousDay();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (parseInt(dayKey) < (selectedWeek?.days?.length || 0)) {
            goToNextDay();
          }
          break;
        case 'Escape':
          e.preventDefault();
          // Close any open modals
          if (resourceModal.isOpen) {
            setResourceModal({ isOpen: false, resource: null });
          }
          if (journalModal.isOpen) {
            setJournalModal({ isOpen: false, entry: null });
          }
          if (showNoteEditor) {
            setShowNoteEditor(false);
          }
          if (showJournalEditor) {
            setShowJournalEditor(false);
          }
          break;
        case 'n':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowNoteEditor(true);
          }
          break;
        case 'j':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowJournalEditor(true);
          }
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            openAddResource();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dayKey, selectedWeek, resourceModal.isOpen, journalModal.isOpen, showNoteEditor, showJournalEditor]);

  useEffect(() => {
    if (showNoteEditor && noteEditorRef.current) {
      noteEditorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showNoteEditor]);

  // Find current week and day
  useEffect(() => {
    setIsLoading(true);
    try {
      const week = (planData || []).find(w => w.week === parseInt(weekId) && w.phase === parseInt(phaseId));
      setSelectedWeek(week);
      if (week && week.days && Array.isArray(week.days)) {
        // dayKey هو رقم اليوم في URL (يبدأ من 1)
        const dayIndexInArray = parseInt(dayKey) - 1;
        if (dayIndexInArray >= 0 && dayIndexInArray < week.days.length) {
          setSelectedDay(week.days[dayIndexInArray]);
        } else {
          console.warn(`Day index ${dayIndexInArray} is out of range for week ${weekId}`);
          setSelectedDay(null);
        }
      } else {
        console.warn(`Week ${weekId} has no valid days array`);
        setSelectedDay(null);
      }
    } catch (error) {
      console.error('Error setting selected week and day:', error);
      setSelectedWeek(null);
      setSelectedDay(null);
    } finally {
      setIsLoading(false);
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
        const entryId = await addJournalEntry({
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

  // حذف مورد من الخطة (إخفاؤه من العرض)
  const handleDeletePlanResource = async (resource) => {
    try {
      const confirmMsg = language === 'ar' 
        ? `هل أنت متأكد من حذف المورد "${resource.title}" من الخطة؟\n\nملاحظة: سيتم إخفاؤه من العرض فقط، ويمكن استعادته لاحقاً.`
        : `Are you sure you want to delete the resource "${resource.title}" from the plan?\n\nNote: It will only be hidden from view and can be restored later.`;
      
      if (!window.confirm(confirmMsg)) return;
      
      // إضافة المورد إلى قائمة الموارد المحذوفة من الخطة
      const deletedPlanResources = JSON.parse(localStorage.getItem('deletedPlanResources') || '[]');
      const resourceKey = `${resource.title}-${resource.url}-${selectedWeek.week}-${selectedDay.key}-${selectedWeek.phase}`;
      
      if (!deletedPlanResources.includes(resourceKey)) {
        deletedPlanResources.push(resourceKey);
        localStorage.setItem('deletedPlanResources', JSON.stringify(deletedPlanResources));
      }
      
      // رسالة تأكيد
      alert(language === 'ar' 
        ? `تم حذف المورد "${resource.title}" من العرض بنجاح.`
        : `Resource "${resource.title}" has been successfully hidden from view.`
      );
      
      // إعادة تحميل الصفحة لتطبيق التغييرات
      window.location.reload();
    } catch (error) {
      console.error('Error hiding plan resource:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حذف المورد' : 'Error occurred while deleting the resource');
    }
  };

  // فتح نافذة تعديل المورد
  const openEditResource = async (resource) => {
    // إذا كان المورد من الخطة، نقوم بنسخه إلى قاعدة البيانات المحلية أولاً
    if (resource.isPlanResource || resource.source === 'plan') {
      const newResource = {
        title: resource.title,
        url: resource.url,
        type: resource.type,
        weekId: selectedWeek.week,
        dayKey: selectedDay.key,
        phaseId: selectedWeek.phase,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'plan-copied'
      };
      try {
        const newId = await addResource(newResource);
        const newResourceWithId = { ...newResource, id: newId };
        setResourceForm({
          title: newResourceWithId.title || '',
          url: newResourceWithId.url || '',
          type: newResourceWithId.type || 'article'
        });
        setResourceModal({ isOpen: true, resource: newResourceWithId });
      } catch (e) {
        console.error('Error copying plan resource for edit:', e);
      }
      return;
    }
    
    setResourceForm({
      title: resource.title || '',
      url: resource.url || '',
      type: resource.type || 'article'
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
    if (!selectedWeek || !selectedDay || !selectedDay.key) return [];
    
    // Get resources from plan data - selectedDay is already set correctly
    const planResources = selectedDay?.resources || [];
    
    // Get user-added resources
    const userResources = safeResources.filter(r => 
      r.weekId === selectedWeek.week && 
      r.dayKey === selectedDay.key
    );
    
    // Get deleted plan resources
    const deletedPlanResources = JSON.parse(localStorage.getItem('deletedPlanResources') || '[]');
    
    // Filter out deleted plan resources
    const filteredPlanResources = planResources.filter(r => 
      !deletedPlanResources.some(deleted => 
        deleted.weekId === selectedWeek.week && 
        deleted.dayKey === selectedDay.key && 
        deleted.title === r.title && 
        deleted.url === r.url
      )
    );
    
    // Combine all resources
    let allResources = [...filteredPlanResources, ...userResources];
    
    // Apply search filter
    if (resourceSearch.trim()) {
      allResources = allResources.filter(r => 
        r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        (r.url && r.url.toLowerCase().includes(resourceSearch.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (resourceTypeFilter) {
      allResources = allResources.filter(r => r.type === resourceTypeFilter);
    }
    
    return allResources;
  };

  // الحصول على الملاحظات المرتبطة باليوم
  const getDayNotes = () => {
    if (!selectedWeek?.week || !selectedDay?.key) return [];
    return safeNotes.filter(note => 
      note.weekId === selectedWeek.week && 
      note.dayKey === selectedDay.key
    );
  };

  // الحصول على مدونة اليوم
  const getDayJournal = () => {
    if (!selectedWeek || !selectedDay || !selectedDay.key) return null;
    
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
    try {
      return (phasesData || []).find(phase => 
        phase.weeks && Array.isArray(phase.weeks) && phase.weeks.includes(parseInt(weekId))
      );
    } catch (error) {
      console.error('Error getting current phase:', error);
      return null;
    }
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
    const [understanding, setUnderstanding] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [points, setPoints] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [difficulty, setDifficulty] = useState(0);
    const [showEvaluationSummary, setShowEvaluationSummary] = useState(false);

    // Get existing evaluation
    const existingEvaluation = safeTaskEvaluations.find(e => 
      e.taskId === taskId && e.weekId === weekId
    );

    useEffect(() => {
      if (existingEvaluation) {
        setRating(existingEvaluation.rating || 0);
        setUnderstanding(existingEvaluation.understanding || 0);
        setComment(existingEvaluation.comment || '');
        setPoints(existingEvaluation.points || 0);
        setAchievements(existingEvaluation.achievements || []);
        setDifficulty(existingEvaluation.difficulty || 0);
      }
    }, [existingEvaluation]);

    // Calculate points based on rating
    const calculatePoints = (rating) => {
      const basePoints = rating * 10;
      const bonusPoints = rating === 5 ? 25 : rating === 4 ? 15 : rating === 3 ? 5 : 0;
      return basePoints + bonusPoints;
    };

    // Get achievements based on rating and consistency
    const getAchievements = (rating, isConsistent) => {
      const newAchievements = [];
      
      if (rating === 5) newAchievements.push({ name: 'ممتاز', icon: '⭐', color: 'text-yellow-500' });
      if (rating >= 4) newAchievements.push({ name: 'جيد جداً', icon: '🎯', color: 'text-blue-500' });
      if (rating >= 3) newAchievements.push({ name: 'مقبول', icon: '✅', color: 'text-green-500' });
      if (isConsistent) newAchievements.push({ name: 'مستمر', icon: '🔥', color: 'text-orange-500' });
      
      return newAchievements;
    };



    const handleSave = async () => {
      if (!isTaskCompleted) {
        alert(language === 'ar' ? 'لا يمكن التقييم قبل إنجاز المهمة' : 'You cannot evaluate before completing the task');
        return;
      }
      if (rating <= 0) {
        alert(language === 'ar' ? 'يرجى اختيار تقييم للمهمة' : 'Please select a rating for the task');
        return;
      }

      setIsSubmitting(true);
      
      try {
        const calculatedPoints = calculatePoints(rating);
        const previousEvaluations = safeTaskEvaluations.filter(e => e.taskId === taskId);
        const previousRatings = previousEvaluations.map(e => e.rating);
        const newAchievements = getAchievements(rating, previousRatings.length > 0);
        
        const evaluationData = {
          taskId,
          weekId,
          rating,
          understanding,
          comment,
          points: calculatedPoints,
          achievements: newAchievements,
          difficulty,
          timestamp: new Date().toISOString(),
          reviewReminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        await addOrUpdateTaskEvaluation(evaluationData);
        
        setPoints(calculatedPoints);
        setAchievements(newAchievements);
        setShowSuccess(true);
        setShowModal(false);
        setShowEvaluationSummary(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        
        // Hide evaluation summary after 5 seconds
        setTimeout(() => {
          setShowEvaluationSummary(false);
        }, 5000);
         
       } catch (error) {
        console.error('Error saving evaluation:', error);
        alert(language === 'ar' ? 'حدث خطأ أثناء حفظ التقييم' : 'Error saving evaluation');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCancel = () => {
      if (existingEvaluation) {
        setRating(existingEvaluation.rating || 0);
        setUnderstanding(existingEvaluation.understanding || 0);
        setComment(existingEvaluation.comment || '');
      } else {
        setRating(0);
        setUnderstanding(0);
        setComment('');
      }
    };

    if (summaryOnly) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'التقييم' : 'Evaluation'}
            </h4>
            {existingEvaluation && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (existingEvaluation.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({existingEvaluation.rating || 0}/5)
                </span>
              </div>
            )}
          </div>
          
          {existingEvaluation && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'النقاط:' : 'Points:'}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {existingEvaluation.points || 0}
                </span>
              </div>
              


              {/* Understanding Display */}
              {existingEvaluation.understanding && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'الفهم:' : 'Understanding:'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${
                          level <= (existingEvaluation.understanding || 0)
                            ? 'bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {existingEvaluation.understanding}/5
                  </span>
                </div>
              )}

              {/* Difficulty Display */}
              {existingEvaluation.difficulty && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'الصعوبة:' : 'Difficulty:'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${
                          level <= (existingEvaluation.difficulty || 0)
                            ? 'bg-red-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {existingEvaluation.difficulty}/5
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowModal((o) => !o)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold"
              aria-expanded={showModal}
            >
              <Star className="w-4 h-4 text-yellow-400" />
              {language === 'ar' ? 'تقييم' : 'Rate'}
            </button>
            {showSuccess && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'تم الحفظ!' : 'Saved!'}
                </span>
              </div>
            )}
          </div>

          {showModal && (
          <>
            {/* Evaluation Summary Modal */}
            {showEvaluationSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-sm w-full mx-4 shadow-2xl">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                      {language === 'ar' ? 'تم الحفظ!' : 'Saved!'}
                    </h3>
                    
                    {/* Compact Rating, Understanding and Difficulty Display */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          {rating}/5
                        </span>
                      </div>

                      {/* Understanding */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full ${
                                level <= understanding
                                  ? 'bg-blue-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          {understanding}/5
                        </span>
                      </div>

                      {/* Difficulty */}
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full ${
                                level <= difficulty
                                  ? 'bg-red-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          {difficulty}/5
                        </span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mb-3">
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'النقاط' : 'Points'}
                      </p>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {points}
                      </p>
                    </div>

                    {/* Achievements */}
                    {achievements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'الإنجازات:' : 'Achievements:'}
                        </p>
                        <div className="flex justify-center gap-2">
                          {achievements.map((achievement, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${achievement.color}`}
                            >
                              {achievement.icon} {achievement.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowEvaluationSummary(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {language === 'ar' ? 'حسناً' : 'OK'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                {language === 'ar' ? 'التقييم' : 'Rating'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg border ${
                      star <= rating
                        ? 'text-yellow-500 bg-yellow-100 border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700'
                        : 'text-gray-400 border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                  ({rating}/5)
                </span>
              </div>
            </div>

            {/* Understanding Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                {language === 'ar' ? 'درجة الفهم' : 'Understanding Level'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setUnderstanding(level)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg border ${
                      level <= understanding
                        ? 'text-blue-500 bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700'
                        : 'text-gray-400 border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:text-blue-400'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">
                      {level}
                    </div>
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                  ({understanding}/5)
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {understanding === 1 && (language === 'ar' ? 'ضعيف جداً' : 'Very Poor')}
                {understanding === 2 && (language === 'ar' ? 'ضعيف' : 'Poor')}
                {understanding === 3 && (language === 'ar' ? 'متوسط' : 'Average')}
                {understanding === 4 && (language === 'ar' ? 'جيد' : 'Good')}
                {understanding === 5 && (language === 'ar' ? 'ممتاز' : 'Excellent')}
              </div>
            </div>

            {/* Difficulty Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                {language === 'ar' ? 'درجة الصعوبة' : 'Difficulty Level'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg border ${
                      level <= difficulty
                        ? 'text-red-500 bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700'
                        : 'text-gray-400 border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:text-red-400'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center font-bold text-sm">
                      {level}
                    </div>
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                  ({difficulty}/5)
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {difficulty === 1 && (language === 'ar' ? 'سهل جداً' : 'Very Easy')}
                {difficulty === 2 && (language === 'ar' ? 'سهل' : 'Easy')}
                {difficulty === 3 && (language === 'ar' ? 'متوسط' : 'Medium')}
                {difficulty === 4 && (language === 'ar' ? 'صعب' : 'Hard')}
                {difficulty === 5 && (language === 'ar' ? 'صعب جداً' : 'Very Hard')}
              </div>
            </div>

            {/* Comment Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                {language === 'ar' ? 'تعليق (اختياري)' : 'Comment (Optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                rows="3"
                placeholder={language === 'ar' ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={async () => { await handleSave(); setShowModal(false); }}
                disabled={isSubmitting || rating <= 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                  </div>
                ) : (
                  language === 'ar' ? 'حفظ التقييم' : 'Save Evaluation'
                )}
              </Button>
              
              <Button
                onClick={() => { handleCancel(); setShowModal(false); }}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>

        {/* Review Reminder */}
        {showReminder && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h6 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {language === 'ar' ? 'تذكير المراجعة' : 'Review Reminder'}
                </h6>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {language === 'ar' 
                    ? 'سيتم تذكيرك بمراجعة هذه المهمة خلال 7 أيام لتعزيز التعلم'
                    : 'You will be reminded to review this task in 7 days to reinforce learning'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowReminder(false)}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
          </>
          )}
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

  if (isLoading) {
    return (
      <PageLayout title="جاري التحميل..." subtitle="Loading..." showHeader={true}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'جاري تحميل اليوم...' : 'Loading day...'}
          </h3>
        </div>
      </PageLayout>
    );
  }

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
      <div 
        id="day-view-container"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        style={{ touchAction: 'pan-y' }}
      >
        <motion.div {...animations.fadeIn} className="space-y-6">
          {/* Back Button and Help */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              icon={<ArrowLeft />}
              onClick={goToDayList}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={language === 'ar' ? 'العودة لأيام الأسبوع' : 'Back to Week Days'}
            >
              <span>{language === 'ar' ? 'العودة لأيام الأسبوع' : 'Back to Week Days'}</span>
            </Button>
            
            {/* Keyboard Shortcuts Help */}
            <Button
              variant="outline"
              size="sm"
              icon={<HelpCircle className="w-4 h-4" />}
              onClick={() => setShowKeyboardHelp(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label={language === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}
            >
              <span className="hidden sm:inline">{language === 'ar' ? 'اختصارات' : 'Shortcuts'}</span>
              <span className="sm:hidden">?</span>
            </Button>
          </div>

          {/* Day Header */}
          <div className="text-center mb-8" role="banner" aria-label={language === 'ar' ? 'رأس اليوم' : 'Day Header'}>
            <div className="mb-6">
              <h1 
                className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 drop-shadow-lg"
                id="day-title"
                aria-label={language === 'ar' ? `عنوان اليوم: ${selectedDay.day?.[language] || selectedDay.day?.ar}` : `Day Title: ${selectedDay.day?.[language] || selectedDay.day?.ar}`}
              >
                {selectedDay.day?.[language] || selectedDay.day?.ar}
              </h1>
              {selectedDay.topic?.[language] && (
                <p 
                  className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 font-medium mb-2"
                  aria-label={language === 'ar' ? `موضوع اليوم: ${selectedDay.topic[language]}` : `Day Topic: ${selectedDay.topic[language]}`}
                >
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
                      <div className="flex items-center space-x-4">
                        <h3 className={`text-lg font-semibold ${typeInfo.textColor}`}>
                          {type}
                        </h3>
                                                  <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                              {tasks?.length || 0}
                            </span>
                          </div>
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
                          {/* Compact Rating and Understanding Chips below the card */}
                          {(() => {
                            const ev = safeTaskEvaluations.find(e => e.taskId === task.id && e.weekId === selectedWeek.week);
                            return ev ? (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-xs text-yellow-800 dark:text-yellow-200">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="font-medium">{language === 'ar' ? 'التقييم' : 'Rating'}: {ev.rating}/5</span>
                                </div>
                                {ev.understanding && (
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-xs text-blue-800 dark:text-blue-200">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                    <span className="font-medium">{language === 'ar' ? 'الفهم' : 'Understanding'}: {ev.understanding}/5</span>
                                  </div>
                                )}
                              </div>
                            ) : null;
                          })()}
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
          <Card className="mb-8 border-indigo-200 bg-indigo-50/60 dark:bg-indigo-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-200">
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
                  <Card key={idx} className="p-3 border-indigo-200 dark:border-indigo-700 cursor-pointer" onClick={() => window.open(resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`,'_blank')} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`,'_blank'); } }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <ExternalLink className="w-5 h-5 text-indigo-500" />
                        <div className="flex-1">
                          <a 
                            href={resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-700 dark:text-indigo-300 hover:underline font-semibold block"
                          >
                            {resource.title}
                          </a>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                              {resource.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* أزرار التعديل والحذف لجميع الموارد */}
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={(e) => { e.stopPropagation(); openEditResource(resource); }}
                          title={language === 'ar' ? 'تعديل المورد' : 'Edit Resource'}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (resource.isPlanResource) {
                              handleDeletePlanResource(resource);
                            } else {
                              handleDeleteResource(resource.id);
                            }
                          }}
                          title={language === 'ar' ? 'حذف المورد' : 'Delete Resource'}
                        />
                        {/* علامة مصدر المورد */}
                        {resource.isPlanResource && (
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteNewTag}
                        onChange={(e) => setNoteNewTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNoteTag(); } }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder={language === 'ar' ? 'أضف تاق جديد...' : 'Add new tag...'}
                      />
                      <Button variant="outline" onClick={handleAddNoteTag} disabled={!noteNewTag.trim()}>
                        {language === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
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
                    onClick={async () => {
                      // إضافة تاج "ملاحظة عامة" تلقائياً إذا لم يتم تحديد يوم
                      const tags = [...noteForm.tags];
                      if (!selectedWeek?.week || !selectedDay?.key) {
                        const generalTag = language === 'ar' ? 'ملاحظة عامة' : 'General Note';
                        if (!tags.includes(generalTag)) {
                          tags.push(generalTag);
                        }
                      }
                      
                      const noteId = await addNote({
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
                  <Card
                    key={note.id}
                    className="p-4 border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/notes/${note.id}`)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/notes/${note.id}`); } }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                          {note.title}
                        </h3>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {note.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                          {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={e => { e.stopPropagation(); setNoteForm({ title: note.title, content: note.content, tags: note.tags || [] }); setShowNoteEditor(true); }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={e => { e.stopPropagation(); if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الملاحظة؟' : 'Are you sure you want to delete this note?')) { deleteNote(note.id); } }}
                        />
                      </div>
                    </div>
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
          <Card className="mb-8 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
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
                <div className="mb-4 p-4 rounded-lg border border-purple-300 bg-purple-50 dark:bg-purple-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    <h3 className="font-semibold text-purple-700 dark:text-purple-200">
                      {selectedDay.notes_prompt.title?.[language] || selectedDay.notes_prompt.title?.ar || 'مهمة التدوين المسائية'}
                    </h3>
                </div>
                <div className="space-y-2">
                  {selectedDay.notes_prompt.points?.map((point, idx) => (
                                          <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={journalNewTag}
                        onChange={(e) => setJournalNewTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddJournalTag(); } }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder={language === 'ar' ? 'أضف تاق جديد...' : 'Add new tag...'}
                      />
                      <Button variant="outline" onClick={handleAddJournalTag} disabled={!journalNewTag.trim()}>
                        {language === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
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
                  <div
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/journal/${getDayJournal().id}`)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/journal/${getDayJournal().id}`); } }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
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
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                          {getDayJournal().content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={e => { e.stopPropagation(); setJournalForm({ title: getDayJournal().title || '', content: getDayJournal().content || '', tags: getDayJournal().tags || [] }); setShowJournalEditor(true); }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={e => { e.stopPropagation(); if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المدونة؟' : 'Are you sure you want to delete this journal?')) { handleDeleteJournal(); } }}
                        />
                      </div>
                    </div>
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
          {/* تم إزالة أزرار التنقل حسب الطلب */}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default DayViewPage;