// Advanced Analytics Service
import { openDB } from 'idb';

export interface AnalyticsEvent {
  id: string;
  name: string;
  category: string;
  data: any;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueSessions: number;
  averageSessionDuration: number;
  mostUsedFeatures: Array<{ feature: string; count: number }>;
  completionRate: number;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    averageStreak: number;
  };
  productivityScore: number;
  learningProgress: {
    phasesCompleted: number;
    totalPhases: number;
    skillsAcquired: number;
    totalSkills: number;
  };
}

export interface UserBehavior {
  pageViews: Array<{ page: string; timestamp: Date; duration: number }>;
  featureUsage: Array<{ feature: string; count: number; lastUsed: Date }>;
  taskCompletion: Array<{ taskId: string; completedAt: Date; timeSpent: number }>;
  noteCreation: Array<{ noteId: string; createdAt: Date; wordCount: number }>;
  journalEntries: Array<{ entryId: string; createdAt: Date; wordCount: number }>;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: Date;
  private currentPage: string = '';
  private pageStartTime: Date = new Date();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    const existingSessionId = localStorage.getItem('analytics_session_id');
    if (existingSessionId) {
      return existingSessionId;
    }
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionId);
    return sessionId;
  }

  private async initializeAnalytics() {
    try {
      const db = await openDB('cyberplan', 1);
      
      // إنشاء جدول الأحداث إذا لم يكن موجوداً
      if (!db.objectStoreNames.contains('analytics_events')) {
        db.createObjectStore('analytics_events', { keyPath: 'id' });
      }
      
      // تسجيل بداية الجلسة
      await this.trackEvent('session_start', {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async trackEvent(eventName: string, data: any = {}): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: eventName,
        category: this.getEventCategory(eventName),
        data: {
          ...data,
          page: this.currentPage,
          sessionId: this.sessionId
        },
        timestamp: new Date(),
        sessionId: this.sessionId
      };

      // حفظ في IndexedDB
      const db = await openDB('cyberplan', 1);
      await db.add('analytics_events', event);

      // حفظ في localStorage للنسخ الاحتياطي
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      
      // الاحتفاظ بآخر 1000 حدث فقط
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));

    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  private getEventCategory(eventName: string): string {
    const categories: { [key: string]: string } = {
      // أحداث التنقل
      'page_view': 'navigation',
      'session_start': 'session',
      'session_end': 'session',
      
      // أحداث المهام
      'task_completed': 'tasks',
      'task_created': 'tasks',
      'task_updated': 'tasks',
      'task_deleted': 'tasks',
      
      // أحداث الملاحظات
      'note_created': 'notes',
      'note_updated': 'notes',
      'note_deleted': 'notes',
      'note_viewed': 'notes',
      
      // أحداث المدونات
      'journal_entry_created': 'journal',
      'journal_entry_updated': 'journal',
      'journal_entry_deleted': 'journal',
      'journal_entry_viewed': 'journal',
      
      // أحداث التصدير
      'export_created': 'export',
      'backup_created': 'backup',
      'sync_completed': 'sync',
      
      // أحداث الإعدادات
      'setting_changed': 'settings',
      'theme_changed': 'settings',
      'language_changed': 'settings'
    };

    return categories[eventName] || 'general';
  }

  trackPageView(pageName: string): void {
    const previousPage = this.currentPage;
    const pageDuration = previousPage ? Date.now() - this.pageStartTime.getTime() : 0;

    if (previousPage) {
      this.trackEvent('page_view', {
        page: previousPage,
        duration: pageDuration,
        nextPage: pageName
      });
    }

    this.currentPage = pageName;
    this.pageStartTime = new Date();
  }

  async getMetrics(timeRange: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<AnalyticsMetrics> {
    try {
      const events = await this.getAllEvents(timeRange);
      const userBehavior = await this.getUserBehavior(timeRange);
      
      return {
        totalEvents: events.length,
        uniqueSessions: this.getUniqueSessions(events),
        averageSessionDuration: this.calculateAverageSessionDuration(events),
        mostUsedFeatures: this.getMostUsedFeatures(events),
        completionRate: this.calculateCompletionRate(userBehavior),
        streakData: await this.getStreakData(),
        productivityScore: this.calculateProductivityScore(userBehavior),
        learningProgress: await this.getLearningProgress()
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private async getAllEvents(timeRange: string): Promise<AnalyticsEvent[]> {
    try {
      const db = await openDB('cyberplan', 1);
      const allEvents = await db.getAll('analytics_events');
      
      if (timeRange === 'all') {
        return allEvents;
      }

      const now = new Date();
      const timeRanges = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };

      const cutoffTime = now.getTime() - timeRanges[timeRange as keyof typeof timeRanges];
      
      return allEvents.filter(event => 
        event.timestamp.getTime() > cutoffTime
      );
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  private async getUserBehavior(timeRange: string): Promise<UserBehavior> {
    try {
      const events = await this.getAllEvents(timeRange);
      
      const pageViews = events
        .filter(e => e.name === 'page_view')
        .map(e => ({
          page: e.data.page,
          timestamp: e.timestamp,
          duration: e.data.duration || 0
        }));

      const featureUsage = this.aggregateFeatureUsage(events);
      const taskCompletion = this.getTaskCompletionEvents(events);
      const noteCreation = this.getNoteCreationEvents(events);
      const journalEntries = this.getJournalEntryEvents(events);

      return {
        pageViews,
        featureUsage,
        taskCompletion,
        noteCreation,
        journalEntries
      };
    } catch (error) {
      console.error('Failed to get user behavior:', error);
      return {
        pageViews: [],
        featureUsage: [],
        taskCompletion: [],
        noteCreation: [],
        journalEntries: []
      };
    }
  }

  private getUniqueSessions(events: AnalyticsEvent[]): number {
    const sessions = new Set(events.map(e => e.sessionId));
    return sessions.size;
  }

  private calculateAverageSessionDuration(events: AnalyticsEvent[]): number {
    const sessions = new Map<string, { start: Date; end: Date }>();
    
    events.forEach(event => {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, { start: event.timestamp, end: event.timestamp });
      } else {
        const session = sessions.get(event.sessionId)!;
        session.end = event.timestamp;
      }
    });

    const durations = Array.from(sessions.values()).map(session => 
      session.end.getTime() - session.start.getTime()
    );

    return durations.length > 0 ? durations.reduce((a, b) => a + b) / durations.length : 0;
  }

  private getMostUsedFeatures(events: AnalyticsEvent[]): Array<{ feature: string; count: number }> {
    const featureCounts = new Map<string, number>();
    
    events.forEach(event => {
      const count = featureCounts.get(event.name) || 0;
      featureCounts.set(event.name, count + 1);
    });

    return Array.from(featureCounts.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateCompletionRate(userBehavior: UserBehavior): number {
    const totalTasks = userBehavior.taskCompletion.length;
    const completedTasks = userBehavior.taskCompletion.filter(t => t.completedAt).length;
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }

  private async getStreakData(): Promise<{ currentStreak: number; longestStreak: number; averageStreak: number }> {
    try {
      const db = await openDB('cyberplan', 1);
      const progress = await db.getAll('progress');
      
      // حساب المسارات
      const completedDates = progress
        .filter(p => p.done)
        .map(p => new Date(p.updatedAt || 0).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < completedDates.length; i++) {
        const currentDate = new Date(completedDates[i]);
        const nextDate = i < completedDates.length - 1 ? new Date(completedDates[i + 1]) : null;
        
        if (nextDate) {
          const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak + 1);
            tempStreak = 0;
          }
        } else {
          tempStreak++;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      currentStreak = tempStreak;

      return {
        currentStreak,
        longestStreak,
        averageStreak: longestStreak // تبسيط للحساب
      };
    } catch (error) {
      console.error('Failed to get streak data:', error);
      return { currentStreak: 0, longestStreak: 0, averageStreak: 0 };
    }
  }

  private calculateProductivityScore(userBehavior: UserBehavior): number {
    let score = 0;
    
    // نقاط للمهام المكتملة
    score += userBehavior.taskCompletion.length * 10;
    
    // نقاط للملاحظات والمدونات
    score += userBehavior.noteCreation.length * 5;
    score += userBehavior.journalEntries.length * 5;
    
    // نقاط لاستخدام الميزات
    score += userBehavior.featureUsage.length * 2;
    
    // نقاط للوقت المستغرق في التطبيق
    const totalTime = userBehavior.pageViews.reduce((sum, view) => sum + view.duration, 0);
    score += Math.floor(totalTime / (1000 * 60)) * 0.1; // 0.1 نقطة لكل دقيقة
    
    return Math.min(100, score);
  }

  private async getLearningProgress(): Promise<{ phasesCompleted: number; totalPhases: number; skillsAcquired: number; totalSkills: number }> {
    try {
      const db = await openDB('cyberplan', 1);
      const progress = await db.getAll('progress');
      
      const completedTasks = progress.filter(p => p.done);
      const totalTasks = progress.length;
      
      // حساب المراحل المكتملة (تبسيط)
      const phasesCompleted = Math.floor((completedTasks.length / totalTasks) * 8);
      
      return {
        phasesCompleted: Math.min(phasesCompleted, 8),
        totalPhases: 8,
        skillsAcquired: completedTasks.length,
        totalSkills: totalTasks
      };
    } catch (error) {
      console.error('Failed to get learning progress:', error);
      return { phasesCompleted: 0, totalPhases: 8, skillsAcquired: 0, totalSkills: 0 };
    }
  }

  private aggregateFeatureUsage(events: AnalyticsEvent[]): Array<{ feature: string; count: number; lastUsed: Date }> {
    const featureMap = new Map<string, { count: number; lastUsed: Date }>();
    
    events.forEach(event => {
      if (!featureMap.has(event.name)) {
        featureMap.set(event.name, { count: 0, lastUsed: event.timestamp });
      }
      
      const feature = featureMap.get(event.name)!;
      feature.count++;
      feature.lastUsed = event.timestamp;
    });

    return Array.from(featureMap.entries())
      .map(([feature, data]) => ({
        feature,
        count: data.count,
        lastUsed: data.lastUsed
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getTaskCompletionEvents(events: AnalyticsEvent[]): Array<{ taskId: string; completedAt: Date; timeSpent: number }> {
    return events
      .filter(e => e.name === 'task_completed')
      .map(e => ({
        taskId: e.data.taskId || 'unknown',
        completedAt: e.timestamp,
        timeSpent: e.data.timeSpent || 0
      }));
  }

  private getNoteCreationEvents(events: AnalyticsEvent[]): Array<{ noteId: string; createdAt: Date; wordCount: number }> {
    return events
      .filter(e => e.name === 'note_created')
      .map(e => ({
        noteId: e.data.noteId || 'unknown',
        createdAt: e.timestamp,
        wordCount: e.data.wordCount || 0
      }));
  }

  private getJournalEntryEvents(events: AnalyticsEvent[]): Array<{ entryId: string; createdAt: Date; wordCount: number }> {
    return events
      .filter(e => e.name === 'journal_entry_created')
      .map(e => ({
        entryId: e.data.entryId || 'unknown',
        createdAt: e.timestamp,
        wordCount: e.data.wordCount || 0
      }));
  }

  private getDefaultMetrics(): AnalyticsMetrics {
    return {
      totalEvents: 0,
      uniqueSessions: 0,
      averageSessionDuration: 0,
      mostUsedFeatures: [],
      completionRate: 0,
      streakData: { currentStreak: 0, longestStreak: 0, averageStreak: 0 },
      productivityScore: 0,
      learningProgress: { phasesCompleted: 0, totalPhases: 8, skillsAcquired: 0, totalSkills: 0 }
    };
  }

  // تسجيل نهاية الجلسة
  async endSession(): Promise<void> {
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    
    await this.trackEvent('session_end', {
      sessionId: this.sessionId,
      duration: sessionDuration,
      pageViews: this.currentPage
    });
  }
}

export const analyticsService = new AnalyticsService();