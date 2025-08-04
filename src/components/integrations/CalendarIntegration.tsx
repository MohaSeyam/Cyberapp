import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Plus, ExternalLink, Download, Upload,
  Clock, MapPin, Users, Bell, Settings, CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { animations } from '../../constants/theme';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  reminder?: number; // minutes before
  calendarType: 'google' | 'outlook' | 'ical';
  taskId?: string;
}

interface CalendarProvider {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  supported: boolean;
}

export default function CalendarIntegration() {
  const { plan, progress, appState } = useApp();
  const { t, language } = useLocalization();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const calendarProviders: CalendarProvider[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: Calendar,
      color: 'text-blue-600',
      description: language === 'ar' ? 'مزامنة مع تقويم جوجل' : 'Sync with Google Calendar',
      supported: true
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      icon: Calendar,
      color: 'text-blue-500',
      description: language === 'ar' ? 'مزامنة مع تقويم أوتلوك' : 'Sync with Outlook Calendar',
      supported: true
    },
    {
      id: 'ical',
      name: 'iCal Export',
      icon: Download,
      color: 'text-green-600',
      description: language === 'ar' ? 'تصدير ملف iCal' : 'Export iCal file',
      supported: true
    }
  ];

  // تحويل المهام إلى أحداث تقويم
  const convertTasksToEvents = (): CalendarEvent[] => {
    if (!plan || !progress) return [];

    const taskEvents: CalendarEvent[] = [];
    
    plan.forEach((week, weekIndex) => {
      week.days.forEach((day, dayIndex) => {
        if (day.key === 'fri') return; // تخطي يوم الجمعة
        
        day.tasks?.forEach((task, taskIndex) => {
          const taskProgress = progress.find(p => p.taskId === task.id);
          const isCompleted = taskProgress?.done || false;
          
          // إنشاء تاريخ للمهمة
          const taskDate = new Date();
          taskDate.setDate(taskDate.getDate() + (weekIndex * 7) + dayIndex);
          taskDate.setHours(9 + taskIndex, 0, 0, 0); // توزيع المهام على ساعات مختلفة
          
          const endDate = new Date(taskDate);
          endDate.setHours(taskDate.getHours() + 1); // مدة ساعة واحدة
          
          taskEvents.push({
            id: `task-${task.id}`,
            title: task.title,
            description: task.description || '',
            startDate: taskDate,
            endDate: endDate,
            reminder: 15, // تذكير قبل 15 دقيقة
            calendarType: 'google',
            taskId: task.id
          });
        });
      });
    });

    return taskEvents;
  };

  // إضافة حدث جديد
  const addEventToCalendar = async (event: CalendarEvent) => {
    setLoading(true);
    
    try {
      switch (event.calendarType) {
        case 'google':
          await addToGoogleCalendar(event);
          break;
        case 'outlook':
          await addToOutlookCalendar(event);
          break;
        case 'ical':
          await exportToICal(event);
          break;
      }
      
      setEvents(prev => [...prev, event]);
      toast.success(language === 'ar' ? 'تم إضافة الحدث بنجاح' : 'Event added successfully');
      setShowAddEvent(false);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error(language === 'ar' ? 'خطأ في إضافة الحدث' : 'Error adding event');
    } finally {
      setLoading(false);
    }
  };

  // إضافة إلى Google Calendar
  const addToGoogleCalendar = async (event: CalendarEvent) => {
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', event.title);
    googleCalendarUrl.searchParams.set('dates', formatGoogleCalendarDates(event.startDate, event.endDate));
    googleCalendarUrl.searchParams.set('details', event.description);
    if (event.location) {
      googleCalendarUrl.searchParams.set('location', event.location);
    }
    
    window.open(googleCalendarUrl.toString(), '_blank');
  };

  // إضافة إلى Outlook Calendar
  const addToOutlookCalendar = async (event: CalendarEvent) => {
    const outlookCalendarUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookCalendarUrl.searchParams.set('subject', event.title);
    outlookCalendarUrl.searchParams.set('body', event.description);
    outlookCalendarUrl.searchParams.set('startdt', event.startDate.toISOString());
    outlookCalendarUrl.searchParams.set('enddt', event.endDate.toISOString());
    if (event.location) {
      outlookCalendarUrl.searchParams.set('location', event.location);
    }
    
    window.open(outlookCalendarUrl.toString(), '_blank');
  };

  // تصدير إلى iCal
  const exportToICal = async (event: CalendarEvent) => {
    const icalContent = generateICalContent(event);
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // توليد محتوى iCal
  const generateICalContent = (event: CalendarEvent): string => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CyberPlan//Calendar Integration//EN
BEGIN:VEVENT
UID:${event.id}@cyberplan.com
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
${event.location ? `LOCATION:${event.location}` : ''}
${event.reminder ? `BEGIN:VALARM
TRIGGER:-PT${event.reminder}M
ACTION:DISPLAY
DESCRIPTION:${event.title}
END:VALARM` : ''}
END:VEVENT
END:VCALENDAR`;
  };

  // تنسيق التواريخ لـ Google Calendar
  const formatGoogleCalendarDates = (start: Date, end: Date): string => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    return `${formatDate(start)}/${formatDate(end)}`;
  };

  // مزامنة جميع المهام
  const syncAllTasks = async () => {
    setLoading(true);
    
    try {
      const taskEvents = convertTasksToEvents();
      let syncedCount = 0;
      
      for (const event of taskEvents) {
        await addToGoogleCalendar(event);
        syncedCount++;
      }
      
      setEvents(taskEvents);
      toast.success(
        language === 'ar' 
          ? `تم مزامنة ${syncedCount} مهمة بنجاح` 
          : `Successfully synced ${syncedCount} tasks`
      );
    } catch (error) {
      console.error('Error syncing tasks:', error);
      toast.error(language === 'ar' ? 'خطأ في المزامنة' : 'Sync error');
    } finally {
      setLoading(false);
    }
  };

  // تصدير جميع الأحداث
  const exportAllEvents = () => {
    const allEvents = convertTasksToEvents();
    const icalContent = allEvents.map(event => generateICalContent(event)).join('\n');
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberplan-tasks-${new Date().toISOString().split('T')[0]}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(language === 'ar' ? 'تم تصدير جميع الأحداث' : 'All events exported');
  };

  useEffect(() => {
    // تحميل الأحداث المحفوظة
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  useEffect(() => {
    // حفظ الأحداث
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  return (
    <div className="space-y-6">
      {/* عنوان القسم */}
      <motion.div
        {...animations.fadeIn}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'تكامل التقويم' : 'Calendar Integration'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar' 
            ? 'مزامنة المهام والمواعيد مع تقويماتك الخارجية'
            : 'Sync tasks and appointments with your external calendars'
          }
        </p>
      </motion.div>

      {/* مزودي التقويم */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {calendarProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            {...animations.stagger(index * 0.1)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-800 mb-4 inline-block`}>
                <provider.icon className={`w-8 h-8 ${provider.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {provider.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {provider.description}
              </p>
              <Button
                variant={provider.supported ? "primary" : "outline"}
                size="sm"
                disabled={!provider.supported}
                onClick={() => {
                  if (provider.id === 'ical') {
                    exportAllEvents();
                  } else {
                    setShowAddEvent(true);
                  }
                }}
              >
                {provider.supported 
                  ? (language === 'ar' ? 'إضافة حدث' : 'Add Event')
                  : (language === 'ar' ? 'قريباً' : 'Coming Soon')
                }
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* أزرار الإجراءات السريعة */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <Button
          variant="primary"
          onClick={syncAllTasks}
          disabled={loading}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Calendar className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'مزامنة جميع المهام' : 'Sync All Tasks'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={exportAllEvents}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Download className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'تصدير جميع الأحداث' : 'Export All Events'}
          </span>
        </Button>
      </motion.div>

      {/* قائمة الأحداث */}
      {events.length > 0 && (
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'الأحداث المضافة' : 'Added Events'}
          </h3>
          
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                {...animations.stagger(index * 0.05)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.startDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {event.startDate.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.calendarType === 'google' ? 'bg-blue-100 text-blue-800' :
                        event.calendarType === 'outlook' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.calendarType}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        {language === 'ar' ? 'عرض' : 'View'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* إحصائيات سريعة */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">
            {events.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'الأحداث المضافة' : 'Added Events'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {convertTasksToEvents().length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'المهام المتاحة' : 'Available Tasks'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {calendarProviders.filter(p => p.supported).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'التقويمات المدعومة' : 'Supported Calendars'}
          </div>
        </Card>
      </motion.div>

      {/* Modal لإضافة حدث جديد */}
      <Modal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        title={language === 'ar' ? 'إضافة حدث جديد' : 'Add New Event'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان الحدث' : 'Event Title'}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={language === 'ar' ? 'أدخل عنوان الحدث' : 'Enter event title'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder={language === 'ar' ? 'أدخل وصف الحدث' : 'Enter event description'}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'تاريخ النهاية' : 'End Date'}
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowAddEvent(false)}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // تنفيذ إضافة الحدث
                setShowAddEvent(false);
              }}
            >
              {language === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal لعرض تفاصيل الحدث */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'التفاصيل' : 'Details'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedEvent.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                </span>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.startDate.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                </span>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.endDate.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </p>
              </div>
            </div>
            
            {selectedEvent.location && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </span>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.location}
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}