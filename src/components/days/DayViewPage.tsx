// Day View Page - Enhanced with Task Types and Evening Journaling
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Target, BookOpen, MessageSquare,
  ExternalLink, Plus, CheckCircle, Circle, Video, FileText, 
  Wrench, Mic, GraduationCap, Edit2, ChevronLeft, ChevronRight,
  ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Star,
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

export default function DayViewPage() {
  const { plan, progress, refreshData, appState } = useApp();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { weekId, dayIndex } = useParams();

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  // State for modals and forms
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'article' as const });
  const [newJournalEntry, setNewJournalEntry] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags] = useState([
    'مهم', 'عاجل', 'مفيد', 'صعب', 'سهل', 'ممارسة', 'نظرية', 'عملي'
  ]);

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  const selectedWeek = safePlan.find(w => w.week === parseInt(weekId));
  const selectedDay = selectedWeek?.days?.[parseInt(dayIndex)];

  // Calculate day completion
  const getDayCompletion = () => {
    if (!selectedWeek || !selectedDay) return { completed: 0, total: 0, percentage: 0 };

    const dayProgress = safeProgress.filter(p => 
      p.weekId === (weekId?.toString() || '') && p.dayKey === selectedDay.key
    );
    const completedTasks = dayProgress.filter(p => p.done).length;
    const totalTasks = selectedDay.tasks?.length || 0;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { completed: completedTasks, total: totalTasks, percentage };
  };

  const dayCompletion = getDayCompletion();

  // Tag management
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Note management
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('يرجى إدخال محتوى الملاحظة');
      return;
    }

    try {
      const noteData = {
        id: Date.now(),
        content: newNote,
        tags: selectedTags,
        timestamp: new Date().toISOString(),
        dayKey: selectedDay?.key || ''
      };

      // Add note to app state
      const updatedNotes = {
        ...appState?.notes,
        [`${weekId}-${selectedDay?.key}`]: [
          ...(appState?.notes?.[`${weekId}-${selectedDay?.key}`] || []),
          noteData
        ]
      };

      // Update app state
      console.log('Note added:', noteData);
      toast.success('تم إضافة الملاحظة بنجاح');
      
      setNewNote('');
      setSelectedTags([]);
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('حدث خطأ أثناء إضافة الملاحظة');
    }
  };

  // Resource management
  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      toast.error('يرجى إدخال عنوان وروابط المورد');
      return;
    }

    if (!isValidUrl(newResource.url)) {
      toast.error('يرجى إدخال رابط صحيح');
      return;
    }

    try {
      const resourceData = {
        id: Date.now().toString(),
        title: newResource.title,
        url: newResource.url,
        type: newResource.type,
        timestamp: new Date().toISOString(),
        dayKey: selectedDay?.key || ''
      };

      // Add resource to app state
      const updatedResources = {
        ...appState?.resources,
        [`${weekId}-${selectedDay?.key}`]: [
          ...(appState?.resources?.[`${weekId}-${selectedDay?.key}`] || []),
          resourceData
        ]
      };

      // Update app state
      console.log('Resource added:', resourceData);
      toast.success('تم إضافة المورد بنجاح');
      
      setNewResource({ title: '', url: '', type: 'article' });
      setShowResourceModal(false);
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('حدث خطأ أثناء إضافة المورد');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      // Remove resource from app state
      const updatedResources = {
        ...appState?.resources,
        [`${weekId}-${selectedDay?.key}`]: (appState?.resources?.[`${weekId}-${selectedDay?.key}`] || [])
          .filter((resource: Resource) => resource.id !== resourceId)
      };

      // Update app state
      console.log('Resource deleted:', resourceId);
      toast.success('تم حذف المورد بنجاح');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('حدث خطأ أثناء حذف المورد');
    }
  };

  // Note deletion
  const handleDeleteNote = async (noteId: number) => {
    try {
      // Remove note from app state
      const updatedNotes = {
        ...appState?.notes,
        [`${weekId}-${selectedDay?.key}`]: (appState?.notes?.[`${weekId}-${selectedDay?.key}`] || [])
          .filter((note: any) => note.id !== noteId)
      };

      // Update app state
      console.log('Note deleted:', noteId);
      toast.success('تم حذف الملاحظة بنجاح');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('حدث خطأ أثناء حذف الملاحظة');
    }
  };

  // Journal management
  const handleDeleteJournalEntry = async (entryId: number) => {
    try {
      // Remove journal entry from app state
      const updatedJournal = {
        ...appState?.journal,
        [`${weekId}-${selectedDay?.key}`]: (appState?.journal?.[`${weekId}-${selectedDay?.key}`] || [])
          .filter((entry: any) => entry.id !== entryId)
      };

      // Update app state
      console.log('Journal entry deleted:', entryId);
      toast.success('تم حذف مدخل اليومية بنجاح');
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('حدث خطأ أثناء حذف مدخل اليومية');
    }
  };

  const handleAddJournalEntry = async () => {
    if (!newJournalEntry.trim()) {
      toast.error('يرجى إدخال محتوى مدخل اليومية');
      return;
    }

    try {
      const journalData = {
        id: Date.now(),
        content: newJournalEntry,
        timestamp: new Date().toISOString(),
        dayKey: selectedDay?.key || ''
      };

      // Add journal entry to app state
      const updatedJournal = {
        ...appState?.journal,
        [`${weekId}-${selectedDay?.key}`]: [
          ...(appState?.journal?.[`${weekId}-${selectedDay?.key}`] || []),
          journalData
        ]
      };

      // Update app state
      console.log('Journal entry added:', journalData);
      toast.success('تم إضافة مدخل اليومية بنجاح');
      
      setNewJournalEntry('');
      setShowJournalModal(false);
    } catch (error) {
      console.error('Error adding journal entry:', error);
      toast.error('حدث خطأ أثناء إضافة مدخل اليومية');
    }
  };

  // Utility functions
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const openResourceInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Navigation functions
  const goToNextDay = () => {
    const nextDayIndex = parseInt(dayIndex) + 1;
    if (nextDayIndex < (selectedWeek?.days?.length || 0)) {
      navigate(`/day/${weekId}/${nextDayIndex}`);
    }
  };

  const goToPreviousDay = () => {
    const prevDayIndex = parseInt(dayIndex) - 1;
    if (prevDayIndex >= 0) {
      navigate(`/day/${weekId}/${prevDayIndex}`);
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
      <PageLayout 
        title="جاري التحميل"
        subtitle="جاري تحميل محتوى اليوم"
        showBottomBar={true}
      >
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

  // تعريف مفاتيح اليوم
  const dayKey = selectedWeek && selectedDay ? `${selectedWeek.week}-${selectedDay.key}` : '';
  const notes = (appState?.notes && dayKey) ? appState.notes[dayKey] || [] : [];
  const journalEntries = (appState?.journal && dayKey) ? appState.journal[dayKey] || [] : [];

  return (
    <PageLayout 
      title={selectedDay?.name?.ar || 'اليوم'}
      subtitle={selectedDay?.topic?.ar || ''}
      showBottomBar={true}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Button
              onClick={goToDayList}
              variant="outline"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للأيام
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousDay}
                disabled={parseInt(dayIndex) <= 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextDay}
                disabled={parseInt(dayIndex) >= (selectedWeek.days?.length || 0) - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {selectedDay.name?.ar}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
            {selectedDay.topic?.ar}
          </p>
          
          {/* Day Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <DayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    تقدم اليوم
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dayCompletion.completed} من {dayCompletion.total} مهمة مكتملة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {dayCompletion.percentage}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500 bg-blue-500"
                style={{ width: `${dayCompletion.percentage}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                مهام اليوم
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dayCompletion.completed} من {dayCompletion.total} مكتملة
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedDay.tasks?.map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  weekId={weekId}
                  dayKey={selectedDay.key}
                  taskTypeConfig={taskTypeConfig}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Notes and Resources Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  الملاحظات
                </h3>
                <Button
                  onClick={() => setShowNoteModal(true)}
                  variant="primary"
                  size="sm"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة ملاحظة
                </Button>
              </div>
              
              <div className="space-y-3">
                {notes.map((note: any) => (
                  <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">{note.content}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {notes.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    لا توجد ملاحظات بعد. أضف ملاحظة جديدة!
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  الموارد
                </h3>
                <Button
                  onClick={() => setShowResourceModal(true)}
                  variant="primary"
                  size="sm"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مورد
                </Button>
              </div>
              
              <div className="space-y-3">
                {(appState?.resources?.[dayKey] || []).map((resource: Resource) => {
                  const ResourceIcon = resourceTypeIcons[resource.type] || FileText;
                  return (
                    <div key={resource.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <ResourceIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {resource.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {resource.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => openResourceInNewTab(resource.url)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteResource(resource.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {(appState?.resources?.[dayKey] || []).length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    لا توجد موارد بعد. أضف مورد جديد!
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Journal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                يومية المساء
              </h3>
              <Button
                onClick={() => setShowJournalModal(true)}
                variant="primary"
                size="sm"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة مدخل
              </Button>
            </div>
            
            <div className="space-y-3">
              {journalEntries.map((entry: any) => (
                <div key={entry.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">{entry.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(entry.timestamp).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteJournalEntry(entry.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {journalEntries.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  لا توجد مداخل في اليومية بعد. أضف مدخل جديد!
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Modals */}
        {/* Note Modal */}
        <Modal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          title="إضافة ملاحظة جديدة"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                محتوى الملاحظة
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="اكتب ملاحظتك هنا..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                العلامات
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowNoteModal(false)}
                variant="outline"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddNote}
                variant="primary"
              >
                إضافة الملاحظة
              </Button>
            </div>
          </div>
        </Modal>

        {/* Resource Modal */}
        <Modal
          isOpen={showResourceModal}
          onClose={() => setShowResourceModal(false)}
          title="إضافة مورد جديد"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان المورد
              </label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل عنوان المورد"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رابط المورد
              </label>
              <input
                type="url"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نوع المورد
              </label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="article">مقال</option>
                <option value="video">فيديو</option>
                <option value="book">كتاب</option>
                <option value="tool">أداة</option>
                <option value="podcast">بودكاست</option>
                <option value="course">دورة</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowResourceModal(false)}
                variant="outline"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddResource}
                variant="primary"
              >
                إضافة المورد
              </Button>
            </div>
          </div>
        </Modal>

        {/* Journal Modal */}
        <Modal
          isOpen={showJournalModal}
          onClose={() => setShowJournalModal(false)}
          title="إضافة مدخل في اليومية"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                محتوى المدخل
              </label>
              <textarea
                value={newJournalEntry}
                onChange={(e) => setNewJournalEntry(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={6}
                placeholder="اكتب انعكاساتك على ما تعلمته اليوم..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowJournalModal(false)}
                variant="outline"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddJournalEntry}
                variant="primary"
              >
                إضافة المدخل
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageLayout>
  );
}