import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Target, BookOpen, Users, 
  CheckCircle, Circle, ArrowLeft, ChevronRight,
  TrendingUp, Award, Star, Shield, Plus,
  Edit, Trash2, Save, X, FileText, Link
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import RichTextEditor from '../components/editors/RichTextEditor';
import { weekPhaseService } from '../services/weekPhaseService';

export default function DayPage() {
  const { plan, progress, appState, updateProgress, addNote, updateNote, deleteNote } = useApp();
  const { language } = useLocalization();
  const { weekId, dayKey } = useParams();
  const navigate = useNavigate();
  
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');

  // Get current week and day data
  const currentWeek = useMemo(() => {
    if (!plan || !weekId) return null;
    return plan.find(w => w.week === parseInt(weekId));
  }, [plan, weekId]);

  const currentDay = useMemo(() => {
    if (!currentWeek || !dayKey) return null;
    return currentWeek.days?.find(d => d.key === dayKey);
  }, [currentWeek, dayKey]);

  // Get day name and number
  const getDayInfo = (dayKey: string) => {
    const dayNames: { [key: string]: { name: string; number: number } } = {
      'sun': { name: 'الأحد', number: 1 },
      'mon': { name: 'الاثنين', number: 2 },
      'tue': { name: 'الثلاثاء', number: 3 },
      'wed': { name: 'الأربعاء', number: 4 },
      'thu': { name: 'الخميس', number: 5 },
      'fri': { name: 'الجمعة', number: 6 },
      'sat': { name: 'السبت', number: 7 }
    };
    return dayNames[dayKey] || { name: dayKey, number: 0 };
  };

  // Get task type icon and color
  const getTaskTypeConfig = (type: string) => {
    const configs: { [key: string]: { icon: any; color: string; bgColor: string; gradient: string } } = {
      'Blue Team': { 
        icon: Shield, 
        color: 'blue', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        gradient: 'from-blue-500 to-blue-600'
      },
      'Red Team': { 
        icon: Target, 
        color: 'red', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        gradient: 'from-red-500 to-red-600'
      },
      'Practical': { 
        icon: TrendingUp, 
        color: 'green', 
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        gradient: 'from-green-500 to-green-600'
      },
      'Theoretical': { 
        icon: BookOpen, 
        color: 'purple', 
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        gradient: 'from-purple-500 to-purple-600'
      },
      'Policies': { 
        icon: Award, 
        color: 'orange', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        gradient: 'from-orange-500 to-orange-600'
      }
    };
    return configs[type] || { 
      icon: Circle, 
      color: 'gray', 
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      gradient: 'from-gray-500 to-gray-600'
    };
  };

  // Get notes for current day
  const dayNotes = useMemo(() => {
    if (!appState.notes || !weekId || !dayKey) return [];
    const key = `${weekId}-${dayKey}`;
    return appState.notes[key] || [];
  }, [appState.notes, weekId, dayKey]);

  const handleTaskToggle = async (taskId: string, done: boolean) => {
    if (!weekId || !dayKey) return;
    try {
      await updateProgress(parseInt(weekId), dayKey, taskId, done);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddNote = async () => {
    if (!weekId || !dayKey || !noteContent.trim()) return;
    
    try {
      await addNote({
        weekId: parseInt(weekId),
        dayKey,
        taskId: selectedTask || '',
        title: 'ملاحظة جديدة',
        content: noteContent,
        tags: []
      });
      setNoteContent('');
      setShowNoteEditor(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !noteContent.trim()) return;
    
    try {
      await updateNote(editingNote.id, { content: noteContent });
      setNoteContent('');
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleBackToWeek = () => {
    navigate(`/week/${weekId}`);
  };

  if (!currentWeek || !currentDay) {
    return (
      <PageLayout title="خطأ" subtitle="اليوم غير موجود">
        <div className="text-center">
          <p>اليوم غير موجود</p>
          <Button onClick={handleBackToWeek}>العودة للأسبوع</Button>
        </div>
      </PageLayout>
    );
  }

  const dayInfo = getDayInfo(dayKey);
  const totalTasks = currentDay.tasks?.length || 0;
  const completedTasks = progress.filter(p => 
    p.weekId === parseInt(weekId) && p.dayKey === dayKey && p.done
  ).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PageLayout 
      title={language === 'ar' ? `اليوم ${dayInfo.name}` : `Day ${dayInfo.name}`}
      subtitle={language === 'ar' ? 'مهام وتعلم' : 'Tasks & Learning'}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Day Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">{dayInfo.number}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {language === 'ar' ? dayInfo.name : dayInfo.name}
          </h1>
          <p className="text-lg text-gray-300">
            {language === 'ar' ? `اليوم ${dayInfo.number} من الأسبوع` : `Day ${dayInfo.number} of the week`}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تقدم اليوم' : 'Day Progress'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {completedTasks}/{totalTasks} {language === 'ar' ? 'مهمة' : 'tasks'}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {currentDay.tasks?.map((task, index) => {
            const isCompleted = progress.some(p => 
              p.weekId === parseInt(weekId) && p.dayKey === dayKey && p.taskId === task.id && p.done
            );
            const taskConfig = getTaskTypeConfig(task.type);
            const Icon = taskConfig.icon;
            const taskNotes = dayNotes.filter(note => note.taskId === task.id);

            return (
              <motion.div
                key={task.id}
                {...animations.stagger(index * 0.1)}
                className="group"
              >
                <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 ${
                  isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                  'border-gray-200 dark:border-gray-700'
                }`}>
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
                      <div className={`p-3 rounded-full ${taskConfig.bgColor}`}>
                        <Icon className={`w-6 h-6 text-${taskConfig.color}-600 dark:text-${taskConfig.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {language === 'ar' ? task.description?.ar : task.description?.en}
                        </h3>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${taskConfig.color}-100 dark:bg-${taskConfig.color}-900/30 text-${taskConfig.color}-600 dark:text-${taskConfig.color}-400`}>
                            {task.type}
                          </span>
                          <span className="flex items-center space-x-1 rtl:space-x-reverse">
                            <Clock className="w-4 h-4" />
                            <span>{task.duration}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Task Toggle */}
                    <button
                      onClick={() => handleTaskToggle(task.id, !isCompleted)}
                      className={`p-3 rounded-full transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Task Notes */}
                  {taskNotes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {language === 'ar' ? 'الملاحظات' : 'Notes'}
                      </h4>
                      <div className="space-y-3">
                        {taskNotes.map((note) => (
                          <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(note.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </span>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <button
                                  onClick={() => {
                                    setEditingNote(note);
                                    setNoteContent(note.content);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div 
                              className="text-sm text-gray-700 dark:text-gray-300"
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Note Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setSelectedTask(task.id);
                        setShowNoteEditor(true);
                        setNoteContent('');
                      }}
                      className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Note Editor Modal */}
        {showNoteEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingNote ? (language === 'ar' ? 'تعديل الملاحظة' : 'Edit Note') : (language === 'ar' ? 'إضافة ملاحظة' : 'Add Note')}
                </h3>
                <button
                  onClick={() => {
                    setShowNoteEditor(false);
                    setEditingNote(null);
                    setNoteContent('');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <RichTextEditor
                value={noteContent}
                onChange={setNoteContent}
                placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                className="mb-4"
              />
              
              <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNoteEditor(false);
                    setEditingNote(null);
                    setNoteContent('');
                  }}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  onClick={editingNote ? handleEditNote : handleAddNote}
                  disabled={!noteContent.trim()}
                >
                  {editingNote ? (language === 'ar' ? 'حفظ' : 'Save') : (language === 'ar' ? 'إضافة' : 'Add')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Day Summary */}
        <motion.div {...animations.fadeIn} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'ملخص اليوم' : 'Day Summary'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {language === 'ar' ? 'تقدم مهام اليوم' : 'Today\'s task progress'}
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'مكتمل' : 'Completed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {progressPercentage}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'التقدم' : 'Progress'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}