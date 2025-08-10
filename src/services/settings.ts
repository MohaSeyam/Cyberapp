// Advanced Settings Service
import { openDB } from 'idb';

export interface UserSettings {
  // المظهر والتصميم
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  
  // اللغة والاتجاه
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  
  // الإشعارات
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    taskReminders: boolean;
    progressUpdates: boolean;
    backupReminders: boolean;
  };
  
  // التلقائية
  autoSave: boolean;

  autoSync: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  syncProvider: 'google-drive' | 'dropbox' | 'local-backup' | 'none';
  
  // التخصيص
  customizations: {
    showAnimations: boolean;
    showProgressBars: boolean;
    showStreakCounter: boolean;
    showCompletionRate: boolean;
    showTimeSpent: boolean;
    showSkillLevels: boolean;
    showAchievements: boolean;
    showSuggestions: boolean;
  };
  
  // الخصوصية
  privacy: {
    trackAnalytics: boolean;
    shareProgress: boolean;
    allowBackup: boolean;
    dataRetention: '1month' | '3months' | '6months' | '1year' | 'forever';
  };
  
  // الإنتاجية
  productivity: {
    focusMode: boolean;
    pomodoroTimer: boolean;
    breakReminders: boolean;
    goalSetting: boolean;
    progressTracking: boolean;
  };
  
  // التصدير
  export: {
    defaultFormat: 'pdf' | 'csv' | 'markdown' | 'txt';
    includeLogo: boolean;
    includeCharts: boolean;
    includeProgress: boolean;
    includeNotes: boolean;
    defaultLanguage: 'ar' | 'en';
  };
  
  // الميزات المتقدمة
  advanced: {
    enableOfflineMode: boolean;
    enableDataCompression: boolean;
    enableEncryption: boolean;
    enableAutoUpdate: boolean;
    enableDebugMode: boolean;
  };
}

export interface SettingsCategory {
  id: string;
  name: { ar: string; en: string };
  icon: string;
  description: { ar: string; en: string };
  settings: Array<{
    key: keyof UserSettings;
    type: 'boolean' | 'select' | 'color' | 'text' | 'number';
    label: { ar: string; en: string };
    description?: { ar: string; en: string };
    options?: Array<{ value: any; label: { ar: string; en: string } }>;
    defaultValue: any;
  }>;
}

class SettingsService {
  private settings: UserSettings;
  private listeners: Array<(settings: UserSettings) => void> = [];
  private defaultSettings: UserSettings;

  constructor() {
    this.defaultSettings = this.getDefaultSettings();
    this.settings = this.loadSettings();
  }

  private getDefaultSettings(): UserSettings {
    return {
      // المظهر والتصميم
      theme: 'auto',
      primaryColor: '#3B82F6',
      accentColor: '#10B981',
      fontSize: 'medium',
      fontFamily: 'Cairo',
      borderRadius: 'medium',
      
      // اللغة والاتجاه
      language: 'ar',
      direction: 'rtl',
      
      // الإشعارات
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        taskReminders: true,
        progressUpdates: true,
        backupReminders: true,
      },
      
      // التلقائية
      autoSave: true,
  
      autoSync: false,
      backupFrequency: 'weekly',
      syncProvider: 'local-backup',
      
      // التخصيص
      customizations: {
        showAnimations: true,
        showProgressBars: true,
        showStreakCounter: true,
        showCompletionRate: true,
        showTimeSpent: true,
        showSkillLevels: true,
        showAchievements: true,
        showSuggestions: true,
      },
      
      // الخصوصية
      privacy: {
        trackAnalytics: true,
        shareProgress: false,
        allowBackup: true,
        dataRetention: '6months',
      },
      
      // الإنتاجية
      productivity: {
        focusMode: false,
        pomodoroTimer: false,
        breakReminders: false,
        goalSetting: true,
        progressTracking: true,
      },
      
      // التصدير
      export: {
        defaultFormat: 'pdf',
        includeLogo: true,
        includeCharts: true,
        includeProgress: true,
        includeNotes: true,
        defaultLanguage: 'ar',
      },
      
      // الميزات المتقدمة
      advanced: {
        enableOfflineMode: true,
        enableDataCompression: true,
        enableEncryption: false,
        enableAutoUpdate: true,
        enableDebugMode: false,
      },
    };
  }

  private loadSettings(): UserSettings {
    try {
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    return { ...this.defaultSettings };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('user_settings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Public Methods
  getSettings(): UserSettings {
    return { ...this.settings };
  }

  updateSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void {
    this.settings[key] = value;
    this.saveSettings();
  }

  updateNestedSetting<K extends keyof UserSettings>(
    category: K,
    subKey: string,
    value: any
  ): void {
    if (typeof this.settings[category] === 'object' && this.settings[category] !== null) {
      (this.settings[category] as any)[subKey] = value;
      this.saveSettings();
    }
  }

  resetSettings(): void {
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
  }

  resetCategory(category: keyof UserSettings): void {
    this.settings[category] = this.defaultSettings[category];
    this.saveSettings();
  }

  addListener(listener: (settings: UserSettings) => void): () => void {
    this.listeners.push(listener);
    
    // إرجاع دالة لإزالة المستمع
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Categories
  getSettingsCategories(): SettingsCategory[] {
    return [
      {
        id: 'appearance',
        name: { ar: 'المظهر والتصميم', en: 'Appearance & Design' },
        icon: '🎨',
        description: { ar: 'تخصيص مظهر التطبيق', en: 'Customize app appearance' },
        settings: [
          {
            key: 'theme',
            type: 'select',
            label: { ar: 'المظهر', en: 'Theme' },
            description: { ar: 'اختر مظهر التطبيق', en: 'Choose app theme' },
            options: [
              { value: 'light', label: { ar: 'فاتح', en: 'Light' } },
              { value: 'dark', label: { ar: 'داكن', en: 'Dark' } },
              { value: 'auto', label: { ar: 'تلقائي', en: 'Auto' } }
            ],
            defaultValue: 'auto'
          },
          {
            key: 'primaryColor',
            type: 'color',
            label: { ar: 'اللون الأساسي', en: 'Primary Color' },
            description: { ar: 'اللون الأساسي للتطبيق', en: 'Main app color' },
            defaultValue: '#3B82F6'
          },
          {
            key: 'accentColor',
            type: 'color',
            label: { ar: 'لون التمييز', en: 'Accent Color' },
            description: { ar: 'لون التمييز للتطبيق', en: 'Accent color for highlights' },
            defaultValue: '#10B981'
          },
          {
            key: 'fontSize',
            type: 'select',
            label: { ar: 'حجم الخط', en: 'Font Size' },
            options: [
              { value: 'small', label: { ar: 'صغير', en: 'Small' } },
              { value: 'medium', label: { ar: 'متوسط', en: 'Medium' } },
              { value: 'large', label: { ar: 'كبير', en: 'Large' } }
            ],
            defaultValue: 'medium'
          },
          {
            key: 'fontFamily',
            type: 'select',
            label: { ar: 'نوع الخط', en: 'Font Family' },
            options: [
              { value: 'Cairo', label: { ar: 'القاهرة', en: 'Cairo' } },
              { value: 'Amiri', label: { ar: 'أميري', en: 'Amiri' } },
              { value: 'Arial', label: { ar: 'آريال', en: 'Arial' } },
              { value: 'Times New Roman', label: { ar: 'تايمز', en: 'Times New Roman' } }
            ],
            defaultValue: 'Cairo'
          }
        ]
      },
      {
        id: 'notifications',
        name: { ar: 'الإشعارات', en: 'Notifications' },
        icon: '🔔',
        description: { ar: 'إعدادات الإشعارات', en: 'Notification settings' },
        settings: [
          {
            key: 'notifications',
            type: 'boolean',
            label: { ar: 'تفعيل الإشعارات', en: 'Enable Notifications' },
            defaultValue: true
          },
          {
            key: 'notifications',
            type: 'boolean',
            label: { ar: 'الأصوات', en: 'Sounds' },
            defaultValue: true
          },
          {
            key: 'notifications',
            type: 'boolean',
            label: { ar: 'إشعارات سطح المكتب', en: 'Desktop Notifications' },
            defaultValue: true
          }
        ]
      },
      {
        id: 'automation',
        name: { ar: 'التلقائية', en: 'Automation' },
        icon: '⚙️',
        description: { ar: 'إعدادات التلقائية', en: 'Automation settings' },
        settings: [
          {
            key: 'autoSave',
            type: 'boolean',
            label: { ar: 'الحفظ التلقائي', en: 'Auto Save' },
            defaultValue: true
          },
          {
        
            type: 'boolean',
            label: { ar: 'النسخ الاحتياطي التلقائي', en: 'Auto Backup' },
            defaultValue: true
          },
          {
            key: 'backupFrequency',
            type: 'select',
            label: { ar: 'تكرار النسخ الاحتياطي', en: 'Backup Frequency' },
            options: [
              { value: 'daily', label: { ar: 'يومي', en: 'Daily' } },
              { value: 'weekly', label: { ar: 'أسبوعي', en: 'Weekly' } },
              { value: 'monthly', label: { ar: 'شهري', en: 'Monthly' } }
            ],
            defaultValue: 'weekly'
          }
        ]
      },
      {
        id: 'customization',
        name: { ar: 'التخصيص', en: 'Customization' },
        icon: '🎯',
        description: { ar: 'تخصيص العناصر المعروضة', en: 'Customize displayed elements' },
        settings: [
          {
            key: 'customizations',
            type: 'boolean',
            label: { ar: 'الحركات', en: 'Animations' },
            defaultValue: true
          },
          {
            key: 'customizations',
            type: 'boolean',
            label: { ar: 'أشرطة التقدم', en: 'Progress Bars' },
            defaultValue: true
          },
          {
            key: 'customizations',
            type: 'boolean',
            label: { ar: 'عداد المسار', en: 'Streak Counter' },
            defaultValue: true
          },
          {
            key: 'customizations',
            type: 'boolean',
            label: { ar: 'نسبة الإنجاز', en: 'Completion Rate' },
            defaultValue: true
          }
        ]
      },
      {
        id: 'privacy',
        name: { ar: 'الخصوصية', en: 'Privacy' },
        icon: '🔒',
        description: { ar: 'إعدادات الخصوصية', en: 'Privacy settings' },
        settings: [
          {
            key: 'privacy',
            type: 'boolean',
            label: { ar: 'تتبع التحليلات', en: 'Track Analytics' },
            defaultValue: true
          },
          {
            key: 'privacy',
            type: 'boolean',
            label: { ar: 'مشاركة التقدم', en: 'Share Progress' },
            defaultValue: false
          },
          {
            key: 'privacy',
            type: 'select',
            label: { ar: 'احتفاظ البيانات', en: 'Data Retention' },
            options: [
              { value: '1month', label: { ar: 'شهر واحد', en: '1 Month' } },
              { value: '3months', label: { ar: '3 أشهر', en: '3 Months' } },
              { value: '6months', label: { ar: '6 أشهر', en: '6 Months' } },
              { value: '1year', label: { ar: 'سنة واحدة', en: '1 Year' } },
              { value: 'forever', label: { ar: 'للأبد', en: 'Forever' } }
            ],
            defaultValue: '6months'
          }
        ]
      },
      {
        id: 'productivity',
        name: { ar: 'الإنتاجية', en: 'Productivity' },
        icon: '🚀',
        description: { ar: 'أدوات الإنتاجية', en: 'Productivity tools' },
        settings: [
          {
            key: 'productivity',
            type: 'boolean',
            label: { ar: 'وضع التركيز', en: 'Focus Mode' },
            defaultValue: false
          },
          {
            key: 'productivity',
            type: 'boolean',
            label: { ar: 'مؤقت بومودورو', en: 'Pomodoro Timer' },
            defaultValue: false
          },
          {
            key: 'productivity',
            type: 'boolean',
            label: { ar: 'تذكيرات الاستراحة', en: 'Break Reminders' },
            defaultValue: false
          },
          {
            key: 'productivity',
            type: 'boolean',
            label: { ar: 'تحديد الأهداف', en: 'Goal Setting' },
            defaultValue: true
          }
        ]
      },
      {
        id: 'export',
        name: { ar: 'التصدير', en: 'Export' },
        icon: '📤',
        description: { ar: 'إعدادات التصدير', en: 'Export settings' },
        settings: [
          {
            key: 'export',
            type: 'select',
            label: { ar: 'الصيغة الافتراضية', en: 'Default Format' },
            options: [
              { value: 'pdf', label: { ar: 'PDF', en: 'PDF' } },
              { value: 'csv', label: { ar: 'CSV', en: 'CSV' } },
              { value: 'markdown', label: { ar: 'Markdown', en: 'Markdown' } },
              { value: 'txt', label: { ar: 'نص عادي', en: 'Plain Text' } }
            ],
            defaultValue: 'pdf'
          },
          {
            key: 'export',
            type: 'boolean',
            label: { ar: 'تضمين الشعار', en: 'Include Logo' },
            defaultValue: true
          },
          {
            key: 'export',
            type: 'boolean',
            label: { ar: 'تضمين الرسوم البيانية', en: 'Include Charts' },
            defaultValue: true
          },
          {
            key: 'export',
            type: 'select',
            label: { ar: 'اللغة الافتراضية', en: 'Default Language' },
            options: [
              { value: 'ar', label: { ar: 'العربية', en: 'Arabic' } },
              { value: 'en', label: { ar: 'الإنجليزية', en: 'English' } }
            ],
            defaultValue: 'ar'
          }
        ]
      },
      {
        id: 'advanced',
        name: { ar: 'متقدم', en: 'Advanced' },
        icon: '🔧',
        description: { ar: 'الإعدادات المتقدمة', en: 'Advanced settings' },
        settings: [
          {
            key: 'advanced',
            type: 'boolean',
            label: { ar: 'الوضع بدون اتصال', en: 'Offline Mode' },
            defaultValue: true
          },
          {
            key: 'advanced',
            type: 'boolean',
            label: { ar: 'ضغط البيانات', en: 'Data Compression' },
            defaultValue: true
          },
          {
            key: 'advanced',
            type: 'boolean',
            label: { ar: 'التشفير', en: 'Encryption' },
            defaultValue: false
          },
          {
            key: 'advanced',
            type: 'boolean',
            label: { ar: 'التحديث التلقائي', en: 'Auto Update' },
            defaultValue: true
          },
          {
            key: 'advanced',
            type: 'boolean',
            label: { ar: 'وضع التصحيح', en: 'Debug Mode' },
            defaultValue: false
          }
        ]
      }
    ];
  }

  // Utility Methods
  async exportSettings(): Promise<string> {
    try {
      const settingsData = {
        settings: this.settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return 'Settings exported successfully';
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  async importSettings(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.settings) {
        this.settings = { ...this.defaultSettings, ...data.settings };
        this.saveSettings();
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Failed to import settings');
    }
  }

  // Apply settings to DOM
  applySettings(): void {
    const root = document.documentElement;
    
    // تطبيق المظهر
    if (this.settings.theme === 'dark' || 
        (this.settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // تطبيق الألوان
    root.style.setProperty('--primary-color', this.settings.primaryColor);
    root.style.setProperty('--accent-color', this.settings.accentColor);
    
    // تطبيق الخط
    root.style.setProperty('--font-family', this.settings.fontFamily);
    root.style.setProperty('--font-size', this.getFontSizeValue());
    
    // تطبيق الاتجاه
    root.setAttribute('dir', this.settings.direction);
    root.setAttribute('lang', this.settings.language);
  }

  private getFontSizeValue(): string {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    return sizes[this.settings.fontSize] || '16px';
  }
}

export const settingsService = new SettingsService();