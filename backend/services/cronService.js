const cron = require('cron');
const { getAll, getRow, runQuery } = require('../config/database');
const EmailService = require('./emailService');
const WebSocketService = require('./websocket');

class CronService {
  constructor(websocketService) {
    this.jobs = new Map();
    this.emailService = new EmailService();
    this.websocketService = websocketService;
    this.init();
  }

  init() {
    console.log('🚀 Initializing Cron Jobs...');
    
    // Daily progress reminder (9:00 AM)
    this.scheduleDailyReminder();
    
    // Weekly summary (Sunday 8:00 PM)
    this.scheduleWeeklySummary();
    
    // Monthly analytics (1st of month 6:00 AM)
    this.scheduleMonthlyAnalytics();
    
    // Cleanup old data (Daily 2:00 AM)
    this.scheduleDataCleanup();
    
    // Achievement checks (Every 6 hours)
    this.scheduleAchievementChecks();
    
    // Health check (Every 30 minutes)
    this.scheduleHealthCheck();
    
    console.log('✅ Cron Jobs initialized successfully');
  }

  // Daily progress reminder
  scheduleDailyReminder() {
    const job = new cron.CronJob(
      '0 9 * * *', // 9:00 AM daily
      async () => {
        console.log('📅 Running daily progress reminder...');
        await this.sendDailyReminders();
      },
      null,
      false,
      'Asia/Riyadh'
    );

    this.jobs.set('dailyReminder', job);
    job.start();
    console.log('✅ Daily reminder scheduled');
  }

  // Weekly summary
  scheduleWeeklySummary() {
    const job = new cron.CronJob(
      '0 20 * * 0', // Sunday 8:00 PM
      async () => {
        console.log('📅 Running weekly summary...');
        await this.sendWeeklySummaries();
      },
      null,
      false,
      'Asia/Riyadh'
    );

    this.jobs.set('weeklySummary', job);
    job.start();
    console.log('✅ Weekly summary scheduled');
  }

  // Monthly analytics
  scheduleMonthlyAnalytics() {
    const job = new cron.CronJob(
      '0 6 1 * *', // 1st of month 6:00 AM
      async () => {
        console.log('📅 Running monthly analytics...');
        await this.generateMonthlyAnalytics();
      },
      null,
      false,
      'Asia/Riyadh'
    );

    this.jobs.set('monthlyAnalytics', job);
    job.start();
    console.log('✅ Monthly analytics scheduled');
  }

  // Data cleanup
  scheduleDataCleanup() {
    const job = new cron.CronJob(
      '0 2 * * *', // Daily 2:00 AM
      async () => {
        console.log('📅 Running data cleanup...');
        await this.cleanupOldData();
      },
      null,
      false,
      'Asia/Riyadh'
    );

    this.jobs.set('dataCleanup', job);
    job.start();
    console.log('✅ Data cleanup scheduled');
  }

  // Achievement checks
  scheduleAchievementChecks() {
    const job = new cron.CronJob(
      '0 */6 * * *', // Every 6 hours
      async () => {
        console.log('📅 Running achievement checks...');
        await this.checkAchievements();
      },
      null,
      false,
      'Asia/Riyadh'
    );

    this.jobs.set('achievementChecks', job);
    job.start();
    console.log('✅ Achievement checks scheduled');
  }

  // Health check
  scheduleHealthCheck() {
    const job = new cron.CronJob(
      '*/30 * * * *', // Every 30 minutes
      async () => {
        console.log('📅 Running health check...');
        await this.performHealthCheck();
      },
      null,
      false,
      'Asia/Riyadh'
    );

    this.jobs.set('healthCheck', job);
    job.start();
    console.log('✅ Health check scheduled');
  }

  // Send daily reminders
  async sendDailyReminders() {
    try {
      // Get active users
      const users = await getAll(
        'SELECT id, username, email, first_name FROM users WHERE is_active = 1'
      );

      for (const user of users) {
        try {
          // Get user progress
          const progress = await this.getUserProgress(user.id);
          
          if (progress && progress.completionPercentage < 100) {
            // Send reminder email
            await this.emailService.sendProgressReminderEmail(user, progress);
            
            // Send WebSocket notification
            if (this.websocketService) {
              this.websocketService.sendReminder(user.id, {
                message: `حان وقت التعلم! أنت في الأسبوع ${progress.currentWeek} من أصل ${progress.totalWeeks}`,
                type: 'daily_reminder',
                progress: progress
              });
            }
          }
        } catch (error) {
          console.error(`Error sending reminder to user ${user.id}:`, error);
        }
      }

      console.log(`✅ Daily reminders sent to ${users.length} users`);
    } catch (error) {
      console.error('❌ Error sending daily reminders:', error);
    }
  }

  // Send weekly summaries
  async sendWeeklySummaries() {
    try {
      const users = await getAll(
        'SELECT id, username, email, first_name FROM users WHERE is_active = 1'
      );

      for (const user of users) {
        try {
          const summary = await this.generateWeeklySummary(user.id);
          
          if (summary) {
            // Send summary email
            await this.emailService.sendWeeklySummaryEmail(user, summary);
            
            // Send WebSocket notification
            if (this.websocketService) {
              this.websocketService.sendNotification(user.id, {
                type: 'weekly_summary',
                title: 'ملخص الأسبوع جاهز! 📊',
                message: `تم إرسال ملخص الأسبوع ${summary.weekNumber} إلى بريدك الإلكتروني`,
                summary: summary
              });
            }
          }
        } catch (error) {
          console.error(`Error sending weekly summary to user ${user.id}:`, error);
        }
      }

      console.log(`✅ Weekly summaries sent to ${users.length} users`);
    } catch (error) {
      console.error('❌ Error sending weekly summaries:', error);
    }
  }

  // Generate monthly analytics
  async generateMonthlyAnalytics() {
    try {
      // Get all users
      const users = await getAll(
        'SELECT id, username, email FROM users WHERE is_active = 1'
      );

      const analytics = {
        totalUsers: users.length,
        activeUsers: 0,
        averageProgress: 0,
        totalTasksCompleted: 0,
        totalTimeSpent: 0,
        achievements: {}
      };

      let totalProgress = 0;
      let totalTasks = 0;
      let totalTime = 0;

      for (const user of users) {
        const progress = await this.getUserProgress(user.id);
        
        if (progress && progress.completionPercentage > 0) {
          analytics.activeUsers++;
          totalProgress += progress.completionPercentage;
          totalTasks += progress.completedTasks || 0;
          totalTime += progress.totalTimeSpent || 0;
        }
      }

      if (analytics.activeUsers > 0) {
        analytics.averageProgress = Math.round(totalProgress / analytics.activeUsers);
        analytics.totalTasksCompleted = totalTasks;
        analytics.totalTimeSpent = totalTime;
      }

      // Store analytics in database
      await runQuery(
        'INSERT INTO analytics (user_id, event_type, event_data, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [0, 'monthly_analytics', JSON.stringify(analytics)]
      );

      console.log('✅ Monthly analytics generated:', analytics);
    } catch (error) {
      console.error('❌ Error generating monthly analytics:', error);
    }
  }

  // Cleanup old data
  async cleanupOldData() {
    try {
      // Clean up old analytics (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      await runQuery(
        'DELETE FROM analytics WHERE timestamp < ?',
        [oneYearAgo.toISOString()]
      );

      // Clean up old user sessions (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await runQuery(
        'DELETE FROM user_sessions WHERE expires_at < ?',
        [thirtyDaysAgo.toISOString()]
      );

      console.log('✅ Old data cleanup completed');
    } catch (error) {
      console.error('❌ Error during data cleanup:', error);
    }
  }

  // Check achievements
  async checkAchievements() {
    try {
      const users = await getAll(
        'SELECT id, username, email FROM users WHERE is_active = 1'
      );

      for (const user of users) {
        try {
          const achievements = await this.checkUserAchievements(user.id);
          
          for (const achievement of achievements) {
            // Send achievement notification
            if (this.websocketService) {
              this.websocketService.sendAchievement(user.id, achievement);
            }

            // Send achievement email
            await this.emailService.sendAchievementEmail(user, achievement);
          }
        } catch (error) {
          console.error(`Error checking achievements for user ${user.id}:`, error);
        }
      }

      console.log('✅ Achievement checks completed');
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        database: 'healthy',
        websocket: this.websocketService ? 'healthy' : 'not_initialized',
        email: 'healthy',
        activeJobs: this.jobs.size,
        connectedUsers: this.websocketService ? this.websocketService.getConnectedUsersCount() : 0
      };

      // Test database connection
      try {
        await getRow('SELECT 1 as test');
      } catch (error) {
        health.database = 'error';
      }

      // Store health check result
      await runQuery(
        'INSERT INTO analytics (user_id, event_type, event_data, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [0, 'health_check', JSON.stringify(health)]
      );

      console.log('✅ Health check completed:', health);
    } catch (error) {
      console.error('❌ Error during health check:', error);
    }
  }

  // Helper methods
  async getUserProgress(userId) {
    try {
      const progress = await getRow(
        `SELECT 
          COUNT(DISTINCT p.week_id) as completed_weeks,
          MAX(p.week_id) as current_week,
          COUNT(p.task_id) as completed_tasks,
          SUM(p.time_spent) as total_time_spent
         FROM progress p 
         WHERE p.user_id = ? AND p.is_completed = 1`,
        [userId]
      );

      if (!progress) return null;

      const totalWeeks = 50; // Total weeks in the plan
      const completionPercentage = Math.round((progress.completed_weeks / totalWeeks) * 100);

      return {
        currentWeek: progress.current_week || 1,
        totalWeeks,
        completedWeeks: progress.completed_weeks || 0,
        completedTasks: progress.completed_tasks || 0,
        totalTimeSpent: progress.total_time_spent || 0,
        completionPercentage
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  async generateWeeklySummary(userId) {
    try {
      const currentWeek = await getRow(
        'SELECT MAX(week_id) as current_week FROM progress WHERE user_id = ?',
        [userId]
      );

      if (!currentWeek || !currentWeek.current_week) return null;

      const weekNumber = currentWeek.current_week;
      
      // Get tasks completed this week
      const tasksCompleted = await getRow(
        'SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND week_id = ? AND is_completed = 1',
        [userId, weekNumber]
      );

      // Get time spent this week
      const timeSpent = await getRow(
        'SELECT SUM(time_spent) as total FROM progress WHERE user_id = ? AND week_id = ?',
        [userId, weekNumber]
      );

      // Get achievements this week
      const achievements = await getAll(
        'SELECT * FROM analytics WHERE user_id = ? AND event_type = "achievement" AND timestamp >= datetime("now", "-7 days")',
        [userId]
      );

      return {
        weekNumber,
        tasksCompleted: tasksCompleted.count || 0,
        totalTasks: 35, // Average tasks per week
        timeSpent: timeSpent.total || 0,
        achievements: achievements.length,
        nextWeekPreview: `الأسبوع ${weekNumber + 1} سيركز على ${this.getNextWeekFocus(weekNumber + 1)}`
      };
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      return null;
    }
  }

  async checkUserAchievements(userId) {
    const achievements = [];
    
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return achievements;

      // Check completion milestones
      if (progress.completionPercentage >= 25 && progress.completionPercentage < 30) {
        achievements.push({
          title: 'ربع الطريق',
          description: 'أكملت 25% من الخطة!',
          icon: '🏆',
          type: 'completion_milestone'
        });
      }

      if (progress.completionPercentage >= 50 && progress.completionPercentage < 55) {
        achievements.push({
          title: 'منتصف الطريق',
          description: 'أكملت 50% من الخطة!',
          icon: '🎯',
          type: 'completion_milestone'
        });
      }

      if (progress.completionPercentage >= 75 && progress.completionPercentage < 80) {
        achievements.push({
          title: 'قرب النهاية',
          description: 'أكملت 75% من الخطة!',
          icon: '⭐',
          type: 'completion_milestone'
        });
      }

      if (progress.completionPercentage >= 100) {
        achievements.push({
          title: 'إنجاز كامل',
          description: 'أكملت الخطة بالكامل!',
          icon: '🎉',
          type: 'completion_milestone'
        });
      }

      // Check consistency achievements
      const consecutiveWeeks = await this.getConsecutiveWeeks(userId);
      if (consecutiveWeeks >= 4) {
        achievements.push({
          title: 'متسق',
          description: '4 أسابيع متتالية من النشاط!',
          icon: '🔥',
          type: 'consistency'
        });
      }

      // Store new achievements
      for (const achievement of achievements) {
        await runQuery(
          'INSERT INTO analytics (user_id, event_type, event_data, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [userId, 'achievement', JSON.stringify(achievement)]
        );
      }

    } catch (error) {
      console.error('Error checking user achievements:', error);
    }

    return achievements;
  }

  async getConsecutiveWeeks(userId) {
    try {
      const weeks = await getAll(
        'SELECT DISTINCT week_id FROM progress WHERE user_id = ? AND is_completed = 1 ORDER BY week_id DESC',
        [userId]
      );

      let consecutive = 0;
      let expectedWeek = weeks[0]?.week_id || 0;

      for (const week of weeks) {
        if (week.week_id === expectedWeek) {
          consecutive++;
          expectedWeek--;
        } else {
          break;
        }
      }

      return consecutive;
    } catch (error) {
      console.error('Error getting consecutive weeks:', error);
      return 0;
    }
  }

  getNextWeekFocus(weekNumber) {
    if (weekNumber <= 17) return 'مفاهيم الأمن السيبراني الأساسية';
    if (weekNumber <= 37) return 'تقنيات الهجوم والدفاع';
    return 'مشاريع عملية متقدمة';
  }

  // Stop all jobs
  stopAll() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`🛑 Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  // Get job status
  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate(),
        lastDate: job.lastDate()
      };
    }
    return status;
  }
}

module.exports = CronService;