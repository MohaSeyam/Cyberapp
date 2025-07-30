const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.init();
  }

  async init() {
    try {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Load email templates
      await this.loadTemplates();

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  async loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/emails');
    
    try {
      const files = await fs.readdir(templatesDir);
      
      for (const file of files) {
        if (file.endsWith('.html')) {
          const templateName = path.basename(file, '.html');
          const templatePath = path.join(templatesDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          
          this.templates[templateName] = templateContent;
        }
      }
      
      console.log(`✅ Loaded ${Object.keys(this.templates).length} email templates`);
    } catch (error) {
      console.error('❌ Failed to load email templates:', error);
    }
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: `"CyberPlan" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  async sendTemplateEmail(to, templateName, data) {
    try {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const html = this.replaceTemplateVariables(template, data);
      const subject = data.subject || 'CyberPlan Notification';

      return await this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('❌ Failed to send template email:', error);
      throw error;
    }
  }

  replaceTemplateVariables(template, data) {
    let html = template;
    
    // Replace variables like {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
    });

    // Replace common variables
    html = html.replace(/{{currentYear}}/g, new Date().getFullYear());
    html = html.replace(/{{currentDate}}/g, new Date().toLocaleDateString('ar-SA'));

    return html;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Welcome email
  async sendWelcomeEmail(user) {
    const data = {
      username: user.username,
      firstName: user.firstName || user.username,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      subject: 'مرحباً بك في CyberPlan! 🚀'
    };

    return await this.sendTemplateEmail(user.email, 'welcome', data);
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const data = {
      username: user.username,
      resetUrl,
      expiryHours: 24,
      subject: 'إعادة تعيين كلمة المرور - CyberPlan'
    };

    return await this.sendTemplateEmail(user.email, 'password-reset', data);
  }

  // Achievement email
  async sendAchievementEmail(user, achievement) {
    const data = {
      username: user.username,
      achievementTitle: achievement.title,
      achievementDescription: achievement.description,
      achievementIcon: achievement.icon,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      subject: `إنجاز جديد! ${achievement.title} 🎉`
    };

    return await this.sendTemplateEmail(user.email, 'achievement', data);
  }

  // Progress reminder email
  async sendProgressReminderEmail(user, progress) {
    const data = {
      username: user.username,
      currentWeek: progress.currentWeek,
      totalWeeks: progress.totalWeeks,
      completionPercentage: progress.completionPercentage,
      nextTask: progress.nextTask,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      subject: 'تذكير: استمر في رحلة التعلم! 📚'
    };

    return await this.sendTemplateEmail(user.email, 'progress-reminder', data);
  }

  // Weekly summary email
  async sendWeeklySummaryEmail(user, summary) {
    const data = {
      username: user.username,
      weekNumber: summary.weekNumber,
      tasksCompleted: summary.tasksCompleted,
      totalTasks: summary.totalTasks,
      timeSpent: summary.timeSpent,
      achievements: summary.achievements,
      nextWeekPreview: summary.nextWeekPreview,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      subject: `ملخص الأسبوع ${summary.weekNumber} - CyberPlan 📊`
    };

    return await this.sendTemplateEmail(user.email, 'weekly-summary', data);
  }

  // Course completion email
  async sendCourseCompletionEmail(user, completion) {
    const data = {
      username: user.username,
      completionDate: completion.date,
      totalWeeks: completion.totalWeeks,
      totalTasks: completion.totalTasks,
      timeSpent: completion.timeSpent,
      certificateUrl: completion.certificateUrl,
      subject: 'مبروك! لقد أكملت دورة CyberPlan! 🎓'
    };

    return await this.sendTemplateEmail(user.email, 'course-completion', data);
  }

  // Custom notification email
  async sendCustomNotificationEmail(user, notification) {
    const data = {
      username: user.username,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      subject: notification.subject || 'إشعار من CyberPlan'
    };

    return await this.sendTemplateEmail(user.email, 'custom-notification', data);
  }

  // Bulk email (for admin notifications)
  async sendBulkEmail(users, templateName, data) {
    const results = [];
    
    for (const user of users) {
      try {
        const userData = { ...data, username: user.username };
        const result = await this.sendTemplateEmail(user.email, templateName, userData);
        results.push({ userId: user.id, success: true, result });
      } catch (error) {
        results.push({ userId: user.id, success: false, error: error.message });
      }
    }

    return results;
  }

  // Test email
  async sendTestEmail(to) {
    const data = {
      username: 'Test User',
      subject: 'اختبار خدمة البريد الإلكتروني - CyberPlan'
    };

    return await this.sendTemplateEmail(to, 'test', data);
  }
}

module.exports = EmailService;