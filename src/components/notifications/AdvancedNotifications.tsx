import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Settings, X, CheckCircle, AlertCircle, Info, 
  Star, Trophy, Target, Clock, Zap, Heart, Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';
import toast from 'react-hot-toast';

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: () => void;
  priority: 'low' | 'medium' | 'high';
  category: string;
  icon?: React.ComponentType<any>;
  duration?: number;
  persistent?: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  achievements: boolean;
  reminders: boolean;
  progress: boolean;
  system: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function AdvancedNotifications() {
  const { plan, progress, appState } = useApp();
  const { t, language } = useLocalization();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    achievements: true,
    reminders: true,
    progress: true,
    system: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // تحميل الإشعارات المحفوظة
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // حفظ الإشعارات
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // تحميل الإعدادات
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // حفظ الإعدادات
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // إنشاء إشعار جديد
  const createNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    if (!settings.enabled) return;

    // فحص ساعات الهدوء
    if (settings.quietHours.enabled && isInQuietHours()) {
      return;
    }

    const newNotification: NotificationItem = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // عرض الإشعار الفوري
    if (settings.desktop) {
      showToastNotification(newNotification);
    }

    // تشغيل الصوت
    if (settings.sound) {
      playNotificationSound(newNotification.type);
    }
  }, [settings]);

  // فحص ساعات الهدوء
  const isInQuietHours = (): boolean => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // عبر منتصف الليل
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  // عرض إشعار فوري
  const showToastNotification = (notification: NotificationItem) => {
    const icon = getNotificationIcon(notification.type);
    const iconColor = getNotificationColor(notification.type);

    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${getNotificationBorderColor(notification.type)} bg-white dark:bg-gray-800`}
        >
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <div className={`p-2 rounded-full ${iconColor}`}>
              {React.createElement(icon, { className: "w-5 h-5" })}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      ),
      {
        duration: notification.duration || 5000,
        position: 'top-right'
      }
    );
  };

  // تشغيل صوت الإشعار
  const playNotificationSound = (type: string) => {
    // يمكن إضافة أصوات مختلفة حسب نوع الإشعار
    const audio = new Audio('/notification-sound.mp3'); // تحتاج لإضافة ملف الصوت
    audio.volume = 0.3;
    audio.play().catch(() => {
      // تجاهل الأخطاء إذا لم يكن الصوت متاحاً
    });
  };

  // الحصول على أيقونة الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      case 'achievement': return Trophy;
      case 'reminder': return Clock;
      default: return Bell;
    }
  };

  // الحصول على لون الإشعار
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'achievement': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'reminder': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // الحصول على لون الحدود
  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      case 'achievement': return 'border-purple-500';
      case 'reminder': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  // تحديث حالة القراءة
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // تحديث جميع الإشعارات كمقروءة
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // حذف إشعار
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // حذف جميع الإشعارات
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // تحديث الإعدادات
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // إنشاء إشعارات تجريبية
  const createTestNotifications = () => {
    const testNotifications = [
      {
        type: 'achievement' as const,
        title: language === 'ar' ? 'إنجاز جديد!' : 'New Achievement!',
        message: language === 'ar' ? 'أكملت 7 أيام متتالية من التعلم' : 'You completed 7 consecutive days of learning',
        priority: 'high' as const,
        category: 'achievement',
        icon: Trophy
      },
      {
        type: 'reminder' as const,
        title: language === 'ar' ? 'تذكير' : 'Reminder',
        message: language === 'ar' ? 'حان وقت مراجعة ما تعلمته اليوم' : 'Time to review what you learned today',
        priority: 'medium' as const,
        category: 'reminder',
        icon: Clock
      },
      {
        type: 'success' as const,
        title: language === 'ar' ? 'مهمة مكتملة' : 'Task Completed',
        message: language === 'ar' ? 'تم إكمال مهمة الأمان السيبراني بنجاح' : 'Cybersecurity task completed successfully',
        priority: 'low' as const,
        category: 'progress',
        icon: CheckCircle
      }
    ];

    testNotifications.forEach(notification => {
      createNotification(notification);
    });
  };

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    if (!settings[notification.category as keyof NotificationSettings]) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* عنوان القسم */}
      <motion.div
        {...animations.fadeIn}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'الإشعارات المتقدمة' : 'Advanced Notifications'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar' 
            ? 'إدارة الإشعارات والتخصيص حسب احتياجاتك'
            : 'Manage notifications and customize according to your needs'
          }
        </p>
      </motion.div>

      {/* إحصائيات سريعة */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">
            {notifications.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">
            {unreadCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'غير مقروءة' : 'Unread'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">
            {notifications.filter(n => n.type === 'achievement').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'الإنجازات' : 'Achievements'}
          </div>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">
            {notifications.filter(n => n.type === 'reminder').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'التذكيرات' : 'Reminders'}
          </div>
        </Card>
      </motion.div>

      {/* أزرار الإجراءات */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <Button
          variant="primary"
          onClick={createTestNotifications}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Bell className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'إنشاء إشعارات تجريبية' : 'Create Test Notifications'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <CheckCircle className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All as Read'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Settings className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
          className="flex items-center space-x-2 rtl:space-x-reverse"
        >
          <X className="w-5 h-5" />
          <span>
            {language === 'ar' ? 'مسح الكل' : 'Clear All'}
          </span>
        </Button>
      </motion.div>

      {/* قائمة الإشعارات */}
      <motion.div
        {...animations.fadeIn}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {unreadCount} {language === 'ar' ? 'جديد' : 'new'}
            </span>
          )}
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`transition-all duration-200 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <Card className="p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {React.createElement(getNotificationIcon(notification.type), { className: "w-5 h-5" })}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${!notification.read ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {language === 'ar' 
                              ? notification.priority === 'high' ? 'عالية' : notification.priority === 'medium' ? 'متوسطة' : 'منخفضة'
                              : notification.priority
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.category}
                        </span>
                        
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              {language === 'ar' ? 'تحديد كمقروء' : 'Mark as Read'}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredNotifications.length === 0 && (
            <motion.div
              {...animations.fadeIn}
              className="text-center py-12"
            >
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' 
                  ? 'ستظهر الإشعارات هنا عند وجود نشاط جديد'
                  : 'Notifications will appear here when there is new activity'
                }
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Modal الإعدادات */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
      >
        <div className="space-y-6">
          {/* الإعدادات العامة */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSettings({ enabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable notifications'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => updateSettings({ sound: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'أصوات الإشعارات' : 'Notification sounds'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.desktop}
                  onChange={(e) => updateSettings({ desktop: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'إشعارات سطح المكتب' : 'Desktop notifications'}
                </span>
              </label>
            </div>
          </div>

          {/* أنواع الإشعارات */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'أنواع الإشعارات' : 'Notification Types'}
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.achievements}
                  onChange={(e) => updateSettings({ achievements: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الإنجازات' : 'Achievements'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.reminders}
                  onChange={(e) => updateSettings({ reminders: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'التذكيرات' : 'Reminders'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.progress}
                  onChange={(e) => updateSettings({ progress: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تقدم التعلم' : 'Learning progress'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.system}
                  onChange={(e) => updateSettings({ system: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'إشعارات النظام' : 'System notifications'}
                </span>
              </label>
            </div>
          </div>

          {/* ساعات الهدوء */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'ساعات الهدوء' : 'Quiet Hours'}
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={settings.quietHours.enabled}
                  onChange={(e) => updateSettings({ 
                    quietHours: { ...settings.quietHours, enabled: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'تفعيل ساعات الهدوء' : 'Enable quiet hours'}
                </span>
              </label>
              
              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'وقت البداية' : 'Start Time'}
                    </label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => updateSettings({ 
                        quietHours: { ...settings.quietHours, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'ar' ? 'وقت النهاية' : 'End Time'}
                    </label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => updateSettings({ 
                        quietHours: { ...settings.quietHours, end: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}