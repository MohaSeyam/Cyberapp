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

  // Get day name and number with language support
  const getDayInfo = (dayKey: string) => {
    const dayNames: { [key: string]: { ar: { name: string; number: number }; en: { name: string; number: number } } } = {
      'sun': { 
        ar: { name: 'الأحد', number: 1 }, 
        en: { name: 'Sunday', number: 1 } 
      },
      'mon': { 
        ar: { name: 'الاثنين', number: 2 }, 
        en: { name: 'Monday', number: 2 } 
      },
      'tue': { 
        ar: { name: 'الثلاثاء', number: 3 }, 
        en: { name: 'Tuesday', number: 3 } 
      },
      'wed': { 
        ar: { name: 'الأربعاء', number: 4 }, 
        en: { name: 'Wednesday', number: 4 } 
      },
      'thu': { 
        ar: { name: 'الخميس', number: 5 }, 
        en: { name: 'Thursday', number: 5 } 
      },
      'fri': { 
        ar: { name: 'الجمعة', number: 6 }, 
        en: { name: 'Friday', number: 6 } 
      },
      'sat': { 
        ar: { name: 'السبت', number: 7 }, 
        en: { name: 'Saturday', number: 7 } 
      }
    };
    return dayNames[dayKey]?.[language] || { name: dayKey, number: 0 };
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

  // Calculate day completion
  const getDayCompletion = (weekNumber: number, dayKey: string) => {
    const dayTasks = currentDay?.tasks || [];
    const totalTasks = dayTasks.length;
    const completedTasks = progress.filter(p => 
      p.weekId === weekNumber && p.dayKey === dayKey && p.done
    ).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Calculate week completion
  const getWeekCompletion = (weekNumber: number) => {
    const weekTasks = currentWeek?.days?.flatMap(d => d.tasks || []) || [];
    const totalTasks = weekTasks.length;
    const completedTasks = progress.filter(p => 
      p.weekId === weekNumber && p.done
    ).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

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
      await addNote(parseInt(weekId), dayKey, {
        title: language === 'ar' ? 'ملاحظة جديدة' : 'New Note',
        content: noteContent,
        tags: []
      });
      setNoteContent('');
      setShowNoteEditor(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = async () => {
    if (!editingNote || !noteContent.trim()) return;
    try {
      await updateNote(editingNote.id, {
        ...editingNote,
        content: noteContent
      });
      setNoteContent('');
      setEditingNote(null);
      setShowNoteEditor(false);
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
      <PageLayout 
        title={language === 'ar' ? 'جاري التحميل' : 'Loading'}
        subtitle={language === 'ar' ? 'جاري تحميل بيانات اليوم' : 'Loading day data'}
        showBottomBar={true}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'جاري تحميل محتوى اليوم...' : 'Loading day content...'}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const dayInfo = getDayInfo(dayKey);
  const weekCompletion = getWeekCompletion(parseInt(weekId));
  const dayCompletion = getDayCompletion(parseInt(weekId), dayKey);

  return (
    <PageLayout 
      title={language === 'ar' ? `اليوم ${dayInfo.number}` : `Day ${dayInfo.number}`}
      subtitle={currentDay.topic[language]}
      showBottomBar={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Day Header - Centered and Enlarged */}
        <div className="text-center mb-8">
          <div className="relative">
            {/* Day Title - Large and White */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {dayInfo.name}
            </h1>
            
            {/* Day of Week Indicator - Beautiful and Subtle */}
            <div className="absolute -top-2 -right-4 md:-right-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-white/90">
                  {language === 'ar' ? `اليوم ${dayInfo.number} من الأسبوع` : `Day ${dayInfo.number} of the week`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Topic */}
          <p className="text-lg text-white/90 mt-4 max-w-2xl mx-auto">
            {currentDay.topic[language]}
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentDay.tasks?.length || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'مهمة' : 'Tasks'}
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dayCompletion}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'إكمال اليوم' : 'Day Progress'}
              </div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {weekCompletion}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'إكمال الأسبوع' : 'Week Progress'}
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'المهام' : 'Tasks'}
          </h2>
          
          {currentDay.tasks?.map((task, index) => {
            const isCompleted = progress.some(p => 
              p.taskId === task.id && p.weekId === parseInt(weekId) && p.dayKey === dayKey && p.done
            );
            const config = getTaskTypeConfig(task.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={task.id}
                {...animations.stagger(index * 0.1)}
                className="group"
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                  'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}>
                  <div className="flex items-start justify-between p-6">
                    {/* Task Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                        <div className={`p-2 rounded-full ${config.bgColor}`}>
                          <Icon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {task.description[language]}
                          </h3>
                          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Clock className="w-4 h-4" />
                              <span>{task.duration} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                              {task.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Better Aligned */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4">
                      <Button
                        variant={isCompleted ? "success" : "outline"}
                        size="sm"
                        onClick={() => handleTaskToggle(task.id, !isCompleted)}
                        className="flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{language === 'ar' ? 'مكتمل' : 'Done'}</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4" />
                            <span>{language === 'ar' ? 'إكمال' : 'Complete'}</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task.id);
                          setShowNoteEditor(true);
                        }}
                        className="flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{language === 'ar' ? 'ملاحظة' : 'Note'}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Notes Section */}
        {dayNotes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'الملاحظات' : 'Notes'}
            </h2>
            
            {dayNotes.map((note, index) => (
              <motion.div
                key={note.id}
                {...animations.stagger(index * 0.1)}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingNote(note);
                          setNoteContent(note.content);
                          setShowNoteEditor(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Note Editor Modal */}
        {showNoteEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingNote ? (language === 'ar' ? 'تعديل الملاحظة' : 'Edit Note') : (language === 'ar' ? 'إضافة ملاحظة' : 'Add Note')}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNoteEditor(false);
                    setEditingNote(null);
                    setNoteContent('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <RichTextEditor
                value={noteContent}
                onChange={setNoteContent}
                placeholder={language === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                minHeight="300px"
              />
              
              <div className="flex justify-end space-x-3 mt-4">
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
                  {editingNote ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </PageLayout>
  );
}