import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  // Initialize WebSocket connection
  connect(token) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const wsUrl = baseUrl.replace('http', 'ws');

      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
      });

      this.setupEventHandlers();
      console.log('🔌 WebSocket connecting...');
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('user_activity', { type: 'page_view', data: { page: window.location.pathname } });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        toast.error('فشل في الاتصال بالخادم');
      }
    });

    // Welcome message
    this.socket.on('welcome', (data) => {
      console.log('Welcome message:', data);
      this.triggerEvent('welcome', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      console.log('New notification:', data);
      this.showNotification(data);
      this.triggerEvent('notification', data);
    });

    // Progress updates
    this.socket.on('progress_update', (data) => {
      console.log('Progress update:', data);
      this.triggerEvent('progress_update', data);
    });

    // Achievement notifications
    this.socket.on('achievement', (data) => {
      console.log('New achievement:', data);
      this.showAchievement(data);
      this.triggerEvent('achievement', data);
    });

    // Reminder notifications
    this.socket.on('reminder', (data) => {
      console.log('Reminder:', data);
      this.showReminder(data);
      this.triggerEvent('reminder', data);
    });

    // Typing indicators
    this.socket.on('user_typing_start', (data) => {
      this.triggerEvent('typing_start', data);
    });

    this.socket.on('user_typing_stop', (data) => {
      this.triggerEvent('typing_stop', data);
    });

    // Note collaboration
    this.socket.on('note_edit_start', (data) => {
      this.triggerEvent('note_edit_start', data);
    });

    this.socket.on('note_edit_stop', (data) => {
      this.triggerEvent('note_edit_stop', data);
    });

    // System notifications
    this.socket.on('system_notification', (data) => {
      console.log('System notification:', data);
      this.showSystemNotification(data);
      this.triggerEvent('system_notification', data);
    });

    // Weekly summary
    this.socket.on('weekly_summary', (data) => {
      console.log('Weekly summary:', data);
      this.triggerEvent('weekly_summary', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast.error('حدث خطأ في الاتصال المباشر');
    });
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }

  // Send user activity
  sendActivity(activity) {
    this.emit('user_activity', {
      type: activity.type,
      data: activity.data,
      timestamp: new Date().toISOString()
    });
  }

  // Start typing indicator
  startTyping(noteId, roomId = null) {
    this.emit('typing_start', { noteId, roomId });
  }

  // Stop typing indicator
  stopTyping(noteId, roomId = null) {
    this.emit('typing_stop', { noteId, roomId });
  }

  // Start note editing
  startNoteEdit(noteId) {
    this.emit('note_edit_start', { noteId });
  }

  // Stop note editing
  stopNoteEdit(noteId) {
    this.emit('note_edit_stop', { noteId });
  }

  // Show notification
  showNotification(data) {
    const { type, title, message, priority = 'normal' } = data;
    
    const toastOptions = {
      duration: priority === 'high' ? 8000 : 4000,
      position: 'top-right',
    };

    switch (type) {
      case 'achievement':
        toast.success(`${title}\n${message}`, {
          ...toastOptions,
          icon: data.icon || '🏆',
        });
        break;
      
      case 'progress':
        toast.success(`${title}\n${message}`, {
          ...toastOptions,
          icon: '📊',
        });
        break;
      
      case 'reminder':
        toast(`${title}\n${message}`, {
          ...toastOptions,
          icon: '⏰',
        });
        break;
      
      case 'system':
        if (priority === 'high') {
          toast.error(`${title}\n${message}`, toastOptions);
        } else {
          toast(`${title}\n${message}`, {
            ...toastOptions,
            icon: 'ℹ️',
          });
        }
        break;
      
      default:
        toast(`${title}\n${message}`, toastOptions);
    }
  }

  // Show achievement notification
  showAchievement(data) {
    const { achievement } = data;
    toast.success(
      `🎉 ${achievement.title}\n${achievement.description}`,
      {
        duration: 6000,
        position: 'top-center',
        icon: achievement.icon || '🏆',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      }
    );
  }

  // Show reminder notification
  showReminder(data) {
    const { reminder } = data;
    toast(
      `⏰ ${reminder.title}\n${reminder.message}`,
      {
        duration: 8000,
        position: 'top-right',
        icon: '⏰',
        style: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
        },
      }
    );
  }

  // Show system notification
  showSystemNotification(data) {
    const { title, message, priority = 'normal' } = data;
    
    if (priority === 'high') {
      toast.error(`${title}\n${message}`, {
        duration: 10000,
        position: 'top-center',
      });
    } else {
      toast(`${title}\n${message}`, {
        duration: 5000,
        position: 'top-right',
        icon: 'ℹ️',
      });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  triggerEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id,
    };
  }

  // Reconnect manually
  reconnect(token) {
    this.disconnect();
    setTimeout(() => {
      this.connect(token);
    }, 1000);
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;