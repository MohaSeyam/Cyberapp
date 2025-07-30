const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getRow } = require('../config/database');

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // userId -> socket
    this.userRooms = new Map(); // userId -> room

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await getRow(
          'SELECT id, username, role FROM users WHERE id = ? AND is_active = 1',
          [decoded.userId]
        );

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.username = user.username;
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.username} (${socket.userId}) connected`);

      // Store connected user
      this.connectedUsers.set(socket.userId, socket);

      // Join user to their personal room
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      this.userRooms.set(socket.userId, userRoom);

      // Send welcome message
      socket.emit('welcome', {
        message: `Welcome ${socket.username}!`,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // Handle user activity
      socket.on('user_activity', (data) => {
        this.handleUserActivity(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle note collaboration
      socket.on('note_edit_start', (data) => {
        this.handleNoteEditStart(socket, data);
      });

      socket.on('note_edit_stop', (data) => {
        this.handleNoteEditStop(socket, data);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleUserActivity(socket, data) {
    // Log user activity for analytics
    console.log(`User ${socket.username} activity:`, data);
    
    // Broadcast to admin room if user is admin
    if (socket.userRole === 'admin') {
      socket.to('admin_room').emit('admin_activity', {
        userId: socket.userId,
        username: socket.username,
        activity: data,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleTypingStart(socket, data) {
    const { noteId, roomId } = data;
    const room = roomId || `note_${noteId}`;
    
    socket.to(room).emit('user_typing_start', {
      userId: socket.userId,
      username: socket.username,
      noteId,
      timestamp: new Date().toISOString()
    });
  }

  handleTypingStop(socket, data) {
    const { noteId, roomId } = data;
    const room = roomId || `note_${noteId}`;
    
    socket.to(room).emit('user_typing_stop', {
      userId: socket.userId,
      username: socket.username,
      noteId,
      timestamp: new Date().toISOString()
    });
  }

  handleNoteEditStart(socket, data) {
    const { noteId } = data;
    const room = `note_${noteId}`;
    
    socket.join(room);
    socket.to(room).emit('note_edit_start', {
      userId: socket.userId,
      username: socket.username,
      noteId,
      timestamp: new Date().toISOString()
    });
  }

  handleNoteEditStop(socket, data) {
    const { noteId } = data;
    const room = `note_${noteId}`;
    
    socket.leave(room);
    socket.to(room).emit('note_edit_stop', {
      userId: socket.userId,
      username: socket.username,
      noteId,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(socket) {
    console.log(`User ${socket.username} (${socket.userId}) disconnected`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.userId);
    this.userRooms.delete(socket.userId);
  }

  // Public methods for sending notifications
  sendNotification(userId, notification) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  }

  sendToUser(userId, event, data) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  }

  broadcastToAll(event, data, excludeUserId = null) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Achievement notifications
  sendAchievement(userId, achievement) {
    this.sendNotification(userId, {
      type: 'achievement',
      title: 'إنجاز جديد! 🎉',
      message: achievement.message,
      icon: achievement.icon,
      achievement: achievement
    });
  }

  // Progress notifications
  sendProgressUpdate(userId, progress) {
    this.sendNotification(userId, {
      type: 'progress',
      title: 'تحديث التقدم 📊',
      message: progress.message,
      progress: progress
    });
  }

  // Reminder notifications
  sendReminder(userId, reminder) {
    this.sendNotification(userId, {
      type: 'reminder',
      title: 'تذكير ⏰',
      message: reminder.message,
      reminder: reminder
    });
  }

  // System notifications
  sendSystemNotification(userId, notification) {
    this.sendNotification(userId, {
      type: 'system',
      title: notification.title,
      message: notification.message,
      priority: notification.priority || 'normal'
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = WebSocketService;