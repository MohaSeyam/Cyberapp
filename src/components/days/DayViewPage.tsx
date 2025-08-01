// Day View Page - Enhanced with Task Types and Evening Journaling
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Target, BookOpen, MessageSquare,
  ExternalLink, Plus, CheckCircle, Circle, Video, FileText, 
  Wrench, Mic, GraduationCap, Edit2, ChevronLeft, ChevronRight,
  ArrowLeft, Sun, Coffee, Zap, Heart, Brain, Star, Home,
  Shield, Eye, Bug, Users, Code
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
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
    icon: Eye,
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
  const { plan, progress, addNote, addResource, lang, updateResource } = useApp();
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
  const [resourceModal, setResourceModal] = useState({ isOpen: false, resource: null as Resource | null });
  const [noteContent, setNoteContent] = useState('');
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'video' as const });

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

  const handleAddNote = async () => {
    if (noteContent.trim() && selectedWeek && selectedDay) {
      try {
        await addNote({
          title: `ملاحظة مهمة`,
          content: noteContent,
          keywords: '',
          tags: [],
          weekId: selectedWeek.week,
          dayKey: selectedDay.key,
          taskId: noteModal.taskId
        });
        setNoteContent('');
        setNoteModal({ isOpen: false, taskId: '' });
      } catch (error) {
        console.error('Error adding note:', error);
      }
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
          dayIndex: parseInt(dayIndex)
        });
        setResourceForm({ title: '', url: '', type: 'video' });
        setResourceModal({ isOpen: false, resource: null });
      } catch (error) {
        console.error('Error adding resource:', error);
      }
    }
  };

  // Navigation functions
  const goToNextDay = () => {
    if (selectedWeek && selectedWeek.days && parseInt(dayIndex) < selectedWeek.days.length - 1) {
      navigate(`/day/${weekId}/${parseInt(dayIndex) + 1}`);
    }
  };

  const goToPreviousDay = () => {
    if (parseInt(dayIndex) > 0) {
      navigate(`/day/${weekId}/${parseInt(dayIndex) - 1}`);
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل محتوى اليوم...</p>
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <DayIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedDay.name?.ar}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
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
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-5 h-5" />}
                onClick={() => setResourceModal({ isOpen: true, resource: null })}
              >
                إضافة مرجع جديد
              </Button>
            </div>

            <div className="space-y-4">
              {(selectedDay.resources || []).length > 0 ? (
                (selectedDay.resources || []).map((resource, index) => {
                  const Icon = resourceTypeIcons[resource.type] || FileText;
                  const typeColors = {
                    video: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
                    article: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
                    book: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
                    tool: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
                    podcast: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
                    course: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  };
                  
                  return (
                    <motion.div
                      key={index}
                      {...animations.stagger(0.3 + index * 0.1)}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
                      onClick={() => setResourceModal({ isOpen: true, resource })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${typeColors[resource.type] || typeColors.article}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {resource.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[resource.type] || typeColors.article}`}>
                                {resource.type === 'video' ? 'فيديو' : 
                                 resource.type === 'article' ? 'مقال' :
                                 resource.type === 'book' ? 'كتاب' :
                                 resource.type === 'tool' ? 'أداة' :
                                 resource.type === 'podcast' ? 'بودكاست' :
                                 resource.type === 'course' ? 'دورة' : resource.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {resource.description || 'لا يوجد وصف'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-4 h-4" />}
                            onClick={e => { e.stopPropagation(); setResourceModal({ isOpen: true, resource }); }}
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<ExternalLink className="w-4 h-4" />}
                            onClick={e => { e.stopPropagation(); window.open(resource.url, '_blank'); }}
                          >
                            فتح
                          </Button>
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

        {/* Evening Journaling Section */}
        {selectedDay.notes_prompt && (
          <motion.div
            {...animations.fadeIn}
            transition={{ delay: 0.3 }}
          >
            <Card
              title={selectedDay.notes_prompt.title?.[lang] || 'مهمة التدوين المسائية'}
              subtitle="تدوين المساء"
            >
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    نقاط التدوين:
                  </h4>
                  <ul className="space-y-2">
                    {(selectedDay.notes_prompt.points || []).map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-200">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{point?.[lang] || 'Point'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="primary"
                  icon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => setNoteModal({ isOpen: true, taskId: 'journal' })}
                >
                  بدء التدوين
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

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

      {/* Note Modal */}
      <Modal
        isOpen={noteModal.isOpen}
        onClose={() => setNoteModal({ isOpen: false, taskId: '' })}
        title="إضافة ملاحظة"
        size="lg"
      >
        <div className="space-y-4">
          <RichTextEditor
            content={noteContent}
            onChange={setNoteContent}
            placeholder="اكتب ملاحظتك هنا..."
            lang={lang}
            minHeight="200px"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setNoteModal({ isOpen: false, taskId: '' })}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!noteContent.trim()}
            >
              حفظ الملاحظة
            </Button>
          </div>
        </div>
      </Modal>

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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="أدخل الرابط"
            />
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
                  try {
                    if (resourceModal.resource) {
                      // تعديل مرجع
                      await updateResource(resourceModal.resource.id!, {
                        title: resourceForm.title,
                        url: resourceForm.url,
                        type: resourceForm.type
                      });
                    } else {
                      // إضافة مرجع جديد
                      await addResource({
                        title: resourceForm.title,
                        url: resourceForm.url,
                        type: resourceForm.type,
                        weekId: selectedWeek.week,
                        dayIndex: parseInt(dayIndex)
                      });
                    }
                    setResourceForm({ title: '', url: '', type: 'video' });
                    setResourceModal({ isOpen: false, resource: null });
                  } catch (error) {
                    console.error('Error saving resource:', error);
                  }
                }
              }}
              disabled={!resourceForm.title.trim() || !resourceForm.url.trim()}
            >
              {resourceModal.resource ? 'تحديث المورد' : 'إضافة مورد'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}