import { useState, useCallback, useRef, useEffect } from 'react';
import { Notification } from '../components/notifications/NotificationSystem';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Auto-dismiss notifications after duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && !timeoutRefs.current.has(notification.id)) {
        const timeout = setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.duration);
        
        timeoutRefs.current.set(notification.id, timeout);
      }
    });

    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      dismissible: notification.dismissible !== false
    };

    setNotifications(prev => [newNotification, ...prev]);

    return id;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 7000,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const showPersistent = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: undefined, // No auto-dismiss
      dismissible: true,
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPersistent
  };
};