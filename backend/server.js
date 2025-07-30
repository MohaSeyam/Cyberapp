const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import services
const WebSocketService = require('./services/websocket');
const EmailService = require('./services/emailService');
const CacheService = require('./services/cacheService');
const CronService = require('./services/cronService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const planRoutes = require('./routes/plan');
const notesRoutes = require('./routes/notes');
const journalRoutes = require('./routes/journal');
const progressRoutes = require('./routes/progress');
const resourcesRoutes = require('./routes/resources');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize services
const websocketService = new WebSocketService(server);
const emailService = new EmailService();
const cacheService = new CacheService();
const cronService = new CronService(websocketService);

// Make services available globally
global.websocketService = websocketService;
global.emailService = emailService;
global.cacheService = cacheService;
global.cronService = cronService;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      websocket: websocketService ? 'active' : 'inactive',
      email: emailService.transporter ? 'ready' : 'not_configured',
      cache: cacheService.isConnected ? 'connected' : 'disconnected',
      cron: cronService.jobs.size + ' jobs active'
    }
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CyberPlan API Documentation',
  customfavIcon: '/favicon.ico'
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/plan', authenticateToken, planRoutes);
app.use('/api/notes', authenticateToken, notesRoutes);
app.use('/api/journal', authenticateToken, journalRoutes);
app.use('/api/progress', authenticateToken, progressRoutes);
app.use('/api/resources', authenticateToken, resourcesRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 CyberPlan Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📧 Email Service: ${emailService.transporter ? 'Ready' : 'Not configured'}`);
  console.log(`💾 Cache Service: ${cacheService.isConnected ? 'Connected' : 'Not connected'}`);
  console.log(`⏰ Cron Jobs: ${cronService.jobs.size} jobs active`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Stop cron jobs
  cronService.stopAll();
  
  // Close cache connection
  await cacheService.close();
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  // Stop cron jobs
  cronService.stopAll();
  
  // Close cache connection
  await cacheService.close();
  
  // Close server
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;