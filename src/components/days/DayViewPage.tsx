// Day View Page - Enhanced with Task Types and Evening Journaling
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Target, BookOpen, MessageSquare,
  ExternalLink, Plus, CheckCircle, Circle, Video, FileText, 
  Wrench, Mic, GraduationCap, Edit2, ChevronLeft, ChevronRight,
  ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Star, Home,
  Shield, Bug, Users, Code, Trash2, X, Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import toast from 'react-hot-toast';
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

// Task type icons and colors mapping
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

// Breadcrumbs component
function Breadcrumbs({ items }: { items: Array<{ label: string; onClick?: () => void; icon?: any }> }) {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Home className="w-4 h-4 mr-1" />
        الرئيسية
      </button>
      
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          {item.onClick ? (
            <button onClick={item.onClick} className="text-blue-600 dark:text-blue-400 hover:underline">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </button>
          ) : (
            <span className="text-gray-700 dark:text-gray-200 font-semibold">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function DayViewPage() {
  const { weekId = "1", dayIndex = "0" } = useParams<{ weekId: string; dayIndex: string }>();
  const navigate = useNavigate();
  const { plan, progress, addNote, addResource, lang, updateResource, deleteResource, deleteNote, deleteJournalEntry, addJournalEntry, refreshData, appState } = useApp();
  const { t } = useLocalization();

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, taskId: '' });
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null as Resource | null });
  const [noteContent, setNoteContent] = useState('');
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'video' as const });
  const [journalForm, setJournalForm] = useState({ title: '', content: '', tags: [] as string[] });
  const [journalModal, setJournalModal] = useState({ isOpen: false, entry: null as any });

  
  // Get resources for current day (combine plan resources with user-added resources)
  const currentDayResources = useMemo(() => {
    const resources = [];
    
    // Add resources from the plan (original resources)
    if (selectedDay?.resources && Array.isArray(selectedDay.resources)) {
      resources.push(...selectedDay.resources);
    }
    
    // Add user-added resources from context
    if (appState?.resources && selectedWeek && selectedDay) {
      const dayKey = `${selectedWeek.week}-${selectedDay.key}`;
      const userResources = appState.resources[dayKey] || [];
      
      // Filter out duplicates and add user resources
      userResources.forEach(userResource => {
        const isDuplicate = resources.some(planResource => 
          planResource.title === userResource.title && 
          planResource.url === userResource.url
        );
        if (!isDuplicate) {
          resources.push(userResource);
        }
      });
    }
    
    console.log('Current day resources:', resources);
    return resources;
  }, [appState?.resources, selectedWeek, selectedDay, selectedDay?.resources]);

  // Update resource form when editing
  useEffect(() => {
    if (resourceModal.resource) {
      setResourceForm({
        title: resourceModal.resource.title || '',
        url: resourceModal.resource.url || '',
        type: resourceModal.resource.type || 'video'
      });
    } else {
      setResourceForm({ title: '', url: '', type: 'video' });
    }
  }, [resourceModal.resource]);

  // Update journal form when editing
  useEffect(() => {
    if (journalModal.entry) {
      setJournalForm({
        title: journalModal.entry.title || '',
        content: journalModal.entry.content || '',
        tags: journalModal.entry.tags || []
      });
    } else {
      setJournalForm({ title: '', content: '', tags: [] });
    }
  }, [journalModal.entry]);

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

  // Tag management functions
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !noteForm.tags.includes(trimmedTag)) {
      setNoteForm(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNoteForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleAddNote = async () => {
    if (noteForm.title.trim() && noteForm.content.trim() && selectedWeek && selectedDay) {
      try {
        await addNote({
          title: noteForm.title,
          content: noteForm.content,
          keywords: '',
          tags: noteForm.tags,
          weekId: selectedWeek.week,
          dayKey: selectedDay.key,
          taskId: noteModal.taskId
        });
        setNoteForm({ title: '', content: '', tags: [] });
        setNoteModal({ isOpen: false, taskId: '' });
        toast.success('تم إضافة الملاحظة بنجاح');
      } catch (error) {
        console.error('Error adding note:', error);
        toast.error('فشل في إضافة الملاحظة');
      }
    } else {
      toast.error('يرجى ملء العنوان والمحتوى');
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
          dayKey: selectedDay.key
        });
        setResourceForm({ title: '', url: '', type: 'video' });
        setResourceModal({ isOpen: false, resource: null });
        toast.success('تم إضافة المرجع بنجاح');
      } catch (error) {
        console.error('Error adding resource:', error);
        toast.error('فشل في إضافة المرجع');
      }
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المرجع؟ لا يمكن التراجع عن هذا الإجراء.')) {
      if (selectedWeek && selectedDay) {
        try {
          await deleteResource(resourceId);
          // Optionally, refresh the resources list or update the state
          // For now, we'll just close the modal and let the user re-add if needed
          setResourceModal({ isOpen: false, resource: null });
        } catch (error) {
          console.error('Error deleting resource:', error);
        }
      }
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await deleteNote(noteId);
        // Refresh notes or update state as needed
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleDeleteJournalEntry = async (entryId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await deleteJournalEntry(entryId);
        setSelectedJournalEntry(null);
        // Refresh journal entries or update state as needed
      } catch (error) {
        console.error('Error deleting journal entry:', error);
      }
    }
  };

  const handleAddJournalEntry = async () => {
    if (journalForm.title.trim() && journalForm.content.trim() && selectedWeek && selectedDay) {
      try {
        await addJournalEntry({
          title: journalForm.title,
          content: journalForm.content,
          tags: journalForm.tags,
          weekId: selectedWeek.week,
          dayKey: selectedDay.key,
          taskId: 'journal'
        });
        setJournalForm({ title: '', content: '', tags: [] });
        setJournalModal({ isOpen: false, entry: null });
      } catch (error) {
        console.error('Error adding journal entry:', error);
      }
    }
  };

  // دالة التحقق من صحة الرابط
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };



  const openResourceInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Navigation functions
  const goToNextDay = () => {
    if (selectedWeek && selectedWeek.days) {
      const filteredDays = selectedWeek.days.filter(day => day.key !== 'fri');
      const currentDayInFiltered = filteredDays.findIndex(day => day.key === selectedDay.key);
      if (currentDayInFiltered < filteredDays.length - 1) {
        const nextDay = filteredDays[currentDayInFiltered + 1];
        const nextDayIndex = selectedWeek.days.findIndex(day => day.key === nextDay.key);
        navigate(`/day/${weekId}/${nextDayIndex}`);
      }
    }
  };

  const goToPreviousDay = () => {
    if (selectedWeek && selectedWeek.days) {
      const filteredDays = selectedWeek.days.filter(day => day.key !== 'fri');
      const currentDayInFiltered = filteredDays.findIndex(day => day.key === selectedDay.key);
      if (currentDayInFiltered > 0) {
        const prevDay = filteredDays[currentDayInFiltered - 1];
        const prevDayIndex = selectedWeek.days.findIndex(day => day.key === prevDay.key);
        navigate(`/day/${weekId}/${prevDayIndex}`);
      }
    }
  };

  const goToDayList = () => {
    navigate(`/days/${weekId}`);
  };

  const goToWeekView = () => {
    navigate('/phases');
  };

  if (!selectedWeek || !selectedDay) {
    return (
      <PageLayout title="جاري التحميل">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 mb-6">
            {!selectedWeek ? `الأسبوع ${weekId} غير موجود` : 'جاري تحميل محتوى اليوم...'}
          </p>
          {!selectedWeek && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={refreshData} variant="primary">
                تحديث البيانات
              </Button>
              <Button onClick={() => navigate('/phases')} variant="outline">
                العودة للمراحل
              </Button>
            </div>
          )}
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

  const breadcrumbs = [
    { label: 'المراحل', icon: Calendar, onClick: goToWeekView },
    { label: `الأسبوع ${selectedWeek.week}`, icon: Target, onClick: goToDayList },
    { label: 'الأيام', icon: Calendar, onClick: goToDayList },
    { label: selectedDay.name?.ar || 'اليوم', icon: DayIcon }
  ];

  // تعريف مفاتيح اليوم
  const dayKey = selectedWeek && selectedDay ? `${selectedWeek.week}-${selectedDay.key}` : '';
  const notes = (appState?.notes && dayKey) ? appState.notes[dayKey] || [] : [];
  const journalEntries = (appState?.journal && dayKey) ? appState.journal[dayKey] || [] : [];

  return (
    <PageLayout 
      title={selectedDay?.name?.ar || safeT('dayDetails')}
      subtitle={selectedDay?.topic?.ar || ''}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Day Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft />}
              onClick={goToDayList}
            />
            
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
            <h1 className="text-4xl font-bold text-white mb-2">
              {selectedDay.name?.ar}
            </h1>
            <p className="text-xl text-gray-200">
              {selectedDay.topic?.ar}
            </p>
          </div>
        </div>

        {/* Tasks Section by Type */}
        <motion.div {...animations.fadeIn} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              مهام اليوم
            </h2>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(selectedDay.tasks || []).length} مهام
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
            }, {} as Record<string, typeof selectedDay.tasks>);

            return Object.entries(tasksByType).map(([type, tasks]) => {
              const typeInfo = taskTypeConfig[type as keyof typeof taskTypeConfig] || taskTypeConfig['Blue Team'];
              const TypeIcon = typeInfo?.icon || Shield;
              
              return (
                <Card key={type} className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                      <TypeIcon className={`w-5 h-5 ${typeInfo.textColor}`} />
                    </div>
                    <h3 className={`text-lg font-semibold ${typeInfo.textColor}`}>
                      {type}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tasks?.map((task, index) => (
                      <motion.div
                        key={task.id}
                        {...animations.stagger(index * 0.1)}
                      >
                        <TaskCard
                          task={task}
                          weekId={selectedWeek.week}
                          dayKey={selectedDay.key}
                          variant="detailed"
                          showNotes={true}
                          onNoteClick={() => setNoteModal({ isOpen: true, taskId: task.id })}
                        />
                      </motion.div>
                    ))}
                  </div>
                </Card>
              );
            });
          })()}
        </motion.div>

        {/* Resources Section */}
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    المراجع والموارد
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    موارد مفيدة لليوم
                  </p>
                </div>
              </div>
              <button
                className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                onClick={() => setResourceModal({ isOpen: true, resource: null })}
                aria-label="إضافة مرجع جديد"
              >
                <Plus className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-4">
              {currentDayResources.length > 0 ? (
                currentDayResources.map((resource, index) => {
                  const Icon = resourceTypeIcons[resource.type] || FileText;
                  
                  return (
                    <motion.div
                      key={index}
                      {...animations.stagger(0.3 + index * 0.1)}
                      className="group relative"
                    >
                      {/* Resource Card */}
                      <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {resource.title}
                              </h4>
                              {resource.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">

                            {/* Open in New Tab Button */}
                            <button
                              onClick={() => openResourceInNewTab(resource.url)}
                              className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                              title="فتح في تبويب جديد"
                            >
                              <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </button>
                            {/* Edit Button */}
                            <button
                              onClick={() => setResourceModal({ isOpen: true, resource })}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              title="تعديل المرجع"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              title="حذف المرجع"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">لا توجد مراجع بعد</h4>
                  <p className="text-sm mb-4">أضف مراجع مفيدة لليوم</p>
                  <Button
                    variant="outline"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setResourceModal({ isOpen: true, resource: null })}
                  >
                    إضافة أول مرجع
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Notes Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>الملاحظات ({notes.length})</span>
            </h3>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد ملاحظات لهذا اليوم</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                أضف ملاحظات من كروت المهام
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => navigate(`/note/${note.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {note.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(note.createdAt).toLocaleDateString('ar-SA')}</span>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{note.tags.length} وسوم</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Journal Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>المدونات ({journalEntries.length})</span>
            </h3>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
              onClick={() => setJournalModal({ isOpen: true, entry: null })}
              aria-label="إضافة مدونة جديدة"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {journalEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">لا توجد مدونات لهذا اليوم</p>
            </div>
          ) : (
            <div className="space-y-3">
              {journalEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => navigate(`/journal-entry/${entry.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {entry.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(entry.createdAt).toLocaleDateString('ar-SA')}</span>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{entry.tags.length} وسوم</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setJournalForm({
                            title: entry.title,
                            content: entry.content,
                            tags: entry.tags || []
                          });
                          setJournalModal({ isOpen: true, entry });
                        }}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJournalEntry(entry.id);
                        }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Navigation Footer */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.6 }}>
          <Card>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={goToDayList}
                icon={<ArrowLeft />}
              >
                العودة للأيام
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronLeft />}
                  onClick={goToPreviousDay}
                  disabled={parseInt(dayIndex) <= 0}
                >
                  اليوم السابق
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ChevronRight />}
                  onClick={goToNextDay}
                  disabled={parseInt(dayIndex) >= (selectedWeek.days?.length || 0) - 1}
                >
                  اليوم التالي
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>



      {/* Resource Modal */}
      <Modal
        isOpen={resourceModal.isOpen}
        onClose={() => setResourceModal({ isOpen: false, resource: null })}
        title={resourceModal.resource ? 'تعديل المورد' : 'إضافة مورد'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              عنوان المورد
            </label>
            <input
              type="text"
              value={resourceForm.title}
              onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="أدخل العنوان"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              رابط المورد
            </label>
            <input
              type="url"
              value={resourceForm.url}
              onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                resourceForm.url && !isValidUrl(resourceForm.url) 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="https://www.example.com"
            />
            {resourceForm.url && !isValidUrl(resourceForm.url) && (
              <p className="text-red-500 text-sm mt-1">
                يرجى إدخال رابط صحيح يبدأ بـ https://
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نوع المورد
            </label>
            <select
              value={resourceForm.type}
              onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="video">فيديو</option>
              <option value="article">مقال</option>
              <option value="book">كتاب</option>
              <option value="tool">أداة</option>
              <option value="podcast">بودكاست</option>
              <option value="course">دورة</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setResourceModal({ isOpen: false, resource: null })}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (resourceForm.title.trim() && resourceForm.url.trim() && selectedWeek && selectedDay) {
                  if (!isValidUrl(resourceForm.url)) {
                    toast.error('يرجى إدخال رابط صحيح يبدأ بـ https://');
                    return;
                  }
                  
                  try {
                    if (resourceModal.resource && resourceModal.resource.id) {
                      // تعديل مرجع موجود
                      console.log('Updating resource with ID:', resourceModal.resource.id);
                      console.log('Resource data:', resourceModal.resource);
                      console.log('Form data:', resourceForm);
                      
                      await updateResource(resourceModal.resource.id, {
                        title: resourceForm.title,
                        url: resourceForm.url,
                        type: resourceForm.type
                      });
                      
                      // إغلاق المودال بعد التحديث الناجح
                      setResourceModal({ isOpen: false, resource: null });
                      setResourceForm({ title: '', url: '', type: 'video' });
                      toast.success('تم تحديث المرجع بنجاح');
                      
                      // Force re-render of resources
                      setTimeout(() => {
                        // This will trigger the useMemo to recalculate currentDayResources
                        setSelectedDay({ ...selectedDay });
                      }, 100);
                    } else {
                      // إضافة مرجع جديد
                      console.log('Adding new resource');
                      await handleAddResource();
                    }
                  } catch (error) {
                    console.error('Error saving resource:', error);
                    console.error('Error details:', error);
                    toast.error('فشل في حفظ المرجع');
                  }
                } else {
                  toast.error('يرجى ملء جميع الحقول المطلوبة');
                }
              }}
              disabled={!resourceForm.title.trim() || !resourceForm.url.trim() || !isValidUrl(resourceForm.url)}
            >
              {resourceModal.resource ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={noteModal.isOpen}
        onClose={() => setNoteModal({ isOpen: false, taskId: '' })}
        title="إضافة ملاحظة"
        size="xl"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              عنوان الملاحظة
            </label>
            <input
              type="text"
              value={noteForm.title}
              onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="أدخل عنوان الملاحظة"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              التاقات
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {noteForm.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => setNoteForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="أضف تاق"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const tag = e.currentTarget.value.trim();
                      if (tag && !noteForm.tags.includes(tag)) {
                        setNoteForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const tag = input.value.trim();
                    if (tag && !noteForm.tags.includes(tag)) {
                      setNoteForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      input.value = '';
                    }
                  }}
                >
                  إضافة
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              محتوى الملاحظة
            </label>
            <RichTextEditor
              content={noteForm.content}
              onChange={(content) => setNoteForm(prev => ({ ...prev, content }))}
              placeholder="اكتب ملاحظتك هنا..."
              lang={lang}
              minHeight="400px"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setNoteModal({ isOpen: false, taskId: '' });
                setNoteForm({ title: '', content: '', tags: [] });
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!noteForm.title.trim() || !noteForm.content.trim()}
            >
              حفظ الملاحظة
            </Button>
          </div>
        </div>
      </Modal>

      {/* Journal Modal */}
      <Modal
        isOpen={journalModal.isOpen}
        onClose={() => setJournalModal({ isOpen: false, entry: null })}
        title={journalModal.entry ? 'تعديل المدونة' : 'إضافة مدونة جديدة'}
        size="xl"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              عنوان المدونة
            </label>
            <input
              type="text"
              value={journalForm.title}
              onChange={(e) => setJournalForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="أدخل عنوان المدونة"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              التاقات
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {journalForm.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => setJournalForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="أضف تاق"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const tag = e.currentTarget.value.trim();
                      if (tag && !journalForm.tags.includes(tag)) {
                        setJournalForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const tag = input.value.trim();
                    if (tag && !journalForm.tags.includes(tag)) {
                      setJournalForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      input.value = '';
                    }
                  }}
                >
                  إضافة
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              محتوى المدونة
            </label>
            <RichTextEditor
              content={journalForm.content}
              onChange={(content) => setJournalForm(prev => ({ ...prev, content }))}
              placeholder="اكتب محتوى المدونة هنا..."
              lang={lang}
              minHeight="400px"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setJournalModal({ isOpen: false, entry: null })}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleAddJournalEntry}
              disabled={!journalForm.title.trim() || !journalForm.content.trim()}
            >
              {journalModal.entry ? 'تحديث المدونة' : 'حفظ المدونة'}
            </Button>
          </div>
        </div>
      </Modal>


    </PageLayout>
  );
}