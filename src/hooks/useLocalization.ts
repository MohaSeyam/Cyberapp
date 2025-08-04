// Localization Hook
import { useCallback, useState, useEffect, useMemo } from 'react';
import type { Language } from '../types';

interface TranslationData {
  [key: string]: {
    ar: string;
    en: string;
  };
}

// Memoized translations object to prevent recreation on every render
const translations: TranslationData = {
  // Common
  save: {
    ar: "حفظ",
    en: "Save"
  },
  cancel: {
    ar: "إلغاء",
    en: "Cancel"
  },
  delete: {
    ar: "حذف",
    en: "Delete"
  },
  edit: {
    ar: "تعديل",
    en: "Edit"
  },
  add: {
    ar: "إضافة",
    en: "Add"
  },
  close: {
    ar: "إغلاق",
    en: "Close"
  },
  loading: {
    ar: "جاري التحميل...",
    en: "Loading..."
  },
  error: {
    ar: "خطأ",
    en: "Error"
  },
  success: {
    ar: "نجح",
    en: "Success"
  },
  reset: {
    ar: "إعادة تعيين",
    en: "Reset"
  },
  update: {
    ar: "تحديث",
    en: "Update"
  },
  open: {
    ar: "فتح",
    en: "Open"
  },
  view: {
    ar: "عرض",
    en: "View"
  },
  viewAll: {
    ar: "عرض الكل",
    en: "View All"
  },
  
  // Navigation
  home: {
    ar: "الرئيسية",
    en: "Home"
  },
  today: {
    ar: "اليوم",
    en: "Today"
  },
  notes: {
    ar: "الملاحظات",
    en: "Notes"
  },
  journal: {
    ar: "المدونة",
    en: "Journal"
  },
  learningJournal: {
    ar: "مدونة التعلم",
    en: "Learning Journal"
  },
  manageNotes: {
    ar: "إدارة الملاحظات",
    en: "Manage Notes"
  },
  trackProgress: {
    ar: "تتبع التقدم",
    en: "Track Progress"
  },
  appSettings: {
    ar: "إعدادات التطبيق",
    en: "App Settings"
  },
  progress: {
    ar: "التقدم",
    en: "Progress"
  },
  settings: {
    ar: "الإعدادات",
    en: "Settings"
  },
  dashboard: {
    ar: "لوحة التحكم",
    en: "Dashboard"
  },
  export: {
    ar: "تصدير",
    en: "Export"
  },
  reports: {
    ar: "التقارير",
    en: "Reports"
  },
  phases: {
    ar: "المراحل",
    en: "Phases"
  },
  plan: {
    ar: "الخطة",
    en: "Plan"
  },
  weeks: {
    ar: "الأسابيع",
    en: "Weeks"
  },
  days: {
    ar: "الأيام",
    en: "Days"
  },
  
  // Actions
  addNote: {
    ar: "إضافة ملاحظة",
    en: "Add Note"
  },
  addJournal: {
    ar: "إضافة مدونة",
    en: "Add Journal"
  },
  addTask: {
    ar: "إضافة مهمة",
    en: "Add Task"
  },
  saveNote: {
    ar: "حفظ الملاحظة",
    en: "Save Note"
  },
  saveJournal: {
    ar: "حفظ المدونة",
    en: "Save Journal"
  },
  deleteNote: {
    ar: "حذف الملاحظة",
    en: "Delete Note"
  },
  deleteJournal: {
    ar: "حذف المدونة",
    en: "Delete Journal"
  },
  editNote: {
    ar: "تعديل الملاحظة",
    en: "Edit Note"
  },
  editJournal: {
    ar: "تعديل المدونة",
    en: "Edit Journal"
  },
  copyContent: {
    ar: "نسخ المحتوى",
    en: "Copy Content"
  },
  printContent: {
    ar: "طباعة المحتوى",
    en: "Print Content"
  },
  back: {
    ar: "رجوع",
    en: "Back"
  },
  next: {
    ar: "التالي",
    en: "Next"
  },
  previous: {
    ar: "السابق",
    en: "Previous"
  },
  search: {
    ar: "بحث",
    en: "Search"
  },
  filter: {
    ar: "تصفية",
    en: "Filter"
  },
  sort: {
    ar: "ترتيب",
    en: "Sort"
  },
  
  // Status
  pending: {
    ar: "قيد الانتظار",
    en: "Pending"
  },
  completed: {
    ar: "مكتمل",
    en: "Completed"
  },
  inProgress: {
    ar: "قيد التنفيذ",
    en: "In Progress"
  },
  notStarted: {
    ar: "لم يبدأ",
    en: "Not Started"
  },
  overdue: {
    ar: "متأخر",
    en: "Overdue"
  },
  
  // Sync
  sync: {
    ar: "مزامنة",
    en: "Sync"
  },
  syncPending: {
    ar: "مزامنة معلقة",
    en: "Pending Sync"
  },
  syncSuccess: {
    ar: "تمت المزامنة بنجاح",
    en: "Sync successful"
  },
  syncError: {
    ar: "خطأ في المزامنة",
    en: "Sync error"
  },
  
  // Export
  exportData: {
    ar: "تصدير البيانات",
    en: "Export Data"
  },
  exportOptions: {
    ar: "خيارات التصدير",
    en: "Export Options"
  },
  selectContent: {
    ar: "اختر المحتوى",
    en: "Select Content"
  },
  notesAndJournals: {
    ar: "الملاحظات والمدونات",
    en: "Notes and Journals"
  },
  progressReports: {
    ar: "تقارير التقدم",
    en: "Progress Reports"
  },
  both: {
    ar: "كلاهما",
    en: "Both"
  },
  timeRange: {
    ar: "النطاق الزمني",
    en: "Time Range"
  },
  daily: {
    ar: "يومي",
    en: "Daily"
  },
  weekly: {
    ar: "أسبوعي",
    en: "Weekly"
  },
  monthly: {
    ar: "شهري",
    en: "Monthly"
  },
  byPhase: {
    ar: "حسب المرحلة",
    en: "By Phase"
  },
  allData: {
    ar: "كامل",
    en: "All"
  },
  fileFormat: {
    ar: "صيغة الملف",
    en: "File Format"
  },
  pdf: {
    ar: "PDF",
    en: "PDF"
  },
  csvExcel: {
    ar: "CSV/Excel",
    en: "CSV/Excel"
  },
  markdown: {
    ar: "Markdown",
    en: "Markdown"
  },
  plainText: {
    ar: "نص عادي",
    en: "Plain Text"
  },
  exportLanguage: {
    ar: "لغة التصدير",
    en: "Export Language"
  },
  arabic: {
    ar: "العربية",
    en: "Arabic"
  },
  english: {
    ar: "الإنجليزية",
    en: "English"
  },
  generateExport: {
    ar: "إنشاء التصدير",
    en: "Generate Export"
  },
  exportGenerated: {
    ar: "تم إنشاء التصدير",
    en: "Export generated"
  },
  
  // Progress Stats
  totalDuration: {
    ar: "إجمالي المدة",
    en: "Total Duration"
  },
  hours: {
    ar: "ساعة",
    en: "hours"
  },
  completionRate: {
    ar: "نسبة الإنجاز",
    en: "Completion Rate"
  },
  currentStreak: {
    ar: "التتابع الحالي",
    en: "Current Streak"
  },
  longestStreak: {
    ar: "أطول تتابع",
    en: "Longest Streak"
  },
  hoursLearned: {
    ar: "ساعات التعلم",
    en: "Hours Learned"
  },
  taskTypesDistribution: {
    ar: "توزيع أنواع المهام",
    en: "Task Types Distribution"
  },
  distributionOfCompletedTasks: {
    ar: "توزيع المهام المكتملة",
    en: "Distribution of Completed Tasks"
  },
  blueTeam: {
    ar: "الفريق الأزرق",
    en: "Blue Team"
  },
  redTeam: {
    ar: "الفريق الأحمر",
    en: "Red Team"
  },
  practical: {
    ar: "عملي",
    en: "Practical"
  },
  theoretical: {
    ar: "نظري",
    en: "Theoretical"
  },
  policies: {
    ar: "السياسات",
    en: "Policies"
  },
  
  // Enhanced Home Page
  currentProgress: {
    ar: "التقدم الحالي",
    en: "Current Progress"
  },

  // Smart Recommendations
  smartRecommendations: {
    ar: "التوصيات الذكية",
    en: "Smart Recommendations"
  },
  personalizedRecommendations: {
    ar: "توصيات مخصصة بناءً على تقدمك وأسلوب تعلمك",
    en: "Personalized recommendations based on your progress and learning style"
  },
  streakDays: {
    ar: "أيام التتابع",
    en: "Streak Days"
  },
  avgTime: {
    ar: "متوسط الوقت",
    en: "Avg Time"
  },
  improveSkills: {
    ar: "تحسين مهارات",
    en: "Improve"
  },
  focusOnDeveloping: {
    ar: "ركز على تطوير مهارات",
    en: "Focus on developing"
  },
  buildYourStreak: {
    ar: "بناء التتابع",
    en: "Build Your Streak"
  },
  tryCompleteOneTask: {
    ar: "حاول إكمال مهمة واحدة كل يوم لبناء تتابع قوي",
    en: "Try to complete one task daily to build a strong streak"
  },
  handsOnPractice: {
    ar: "تمارين عملية",
    en: "Hands-on Practice"
  },
  tryVirtualLabs: {
    ar: "جرب المختبرات الافتراضية والتمارين العملية",
    en: "Try virtual labs and hands-on exercises"
  },
  morningLearning: {
    ar: "تعلم في الصباح",
    en: "Morning Learning"
  },
  takeAdvantageOfMorning: {
    ar: "استفد من طاقتك الصباحية للتعلم العميق",
    en: "Take advantage of your morning energy for deep learning"
  },
  afternoonSession: {
    ar: "جلسة بعد الظهر",
    en: "Afternoon Session"
  },
  perfectTimeForReview: {
    ar: "وقت مثالي للمراجعة والتطبيق العملي",
    en: "Perfect time for review and practical application"
  },
  eveningLearning: {
    ar: "تعلم مسائي",
    en: "Evening Learning"
  },
  focusOnTheoretical: {
    ar: "ركز على المفاهيم النظرية والمراجعة",
    en: "Focus on theoretical concepts and review"
  },
  startSmall: {
    ar: "ابدأ صغيراً",
    en: "Start Small"
  },
  focusOnOneTask: {
    ar: "ركز على مهمة واحدة يومياً لبناء العادة",
    en: "Focus on one task daily to build the habit"
  },
  advancedChallenge: {
    ar: "تحدي متقدم",
    en: "Advanced Challenge"
  },
  tryComplexProjects: {
    ar: "جرب مشاريع أكثر تعقيداً لاختبار مهاراتك",
    en: "Try more complex projects to test your skills"
  },
  noRecommendationsAvailable: {
    ar: "لا توجد توصيات حالياً",
    en: "No recommendations available"
  },
  completeMoreTasks: {
    ar: "اكمل المزيد من المهام لتلقي توصيات مخصصة",
    en: "Complete more tasks to receive personalized recommendations"
  },
  high: {
    ar: "عالية",
    en: "High"
  },
  medium: {
    ar: "متوسطة",
    en: "Medium"
  },
  low: {
    ar: "منخفضة",
    en: "Low"
  },
  priority: {
    ar: "الأولوية",
    en: "Priority"
  },
  difficulty: {
    ar: "الصعوبة",
    en: "Difficulty"
  },
  category: {
    ar: "الفئة",
    en: "Category"
  },
  timeManagement: {
    ar: "إدارة الوقت",
    en: "Time Management"
  },
  skillDevelopment: {
    ar: "تطوير المهارات",
    en: "Skill Development"
  },
  learningStyle: {
    ar: "أسلوب التعلم",
    en: "Learning Style"
  },
  productivity: {
    ar: "الإنتاجية",
    en: "Productivity"
  },
  
  // Calendar Integration
  calendarIntegration: {
    ar: "تكامل التقويم",
    en: "Calendar Integration"
  },
  syncWithCalendar: {
    ar: "مزامنة مع التقويم",
    en: "Sync with Calendar"
  },
  googleCalendar: {
    ar: "تقويم جوجل",
    en: "Google Calendar"
  },
  outlookCalendar: {
    ar: "تقويم أوتلوك",
    en: "Outlook Calendar"
  },
  icalExport: {
    ar: "تصدير iCal",
    en: "iCal Export"
  },
  addToCalendar: {
    ar: "إضافة إلى التقويم",
    en: "Add to Calendar"
  },
  calendarEvent: {
    ar: "حدث التقويم",
    en: "Calendar Event"
  },
  eventTitle: {
    ar: "عنوان الحدث",
    en: "Event Title"
  },
  enterEventTitle: {
    ar: "أدخل عنوان الحدث",
    en: "Enter event title"
  },
  description: {
    ar: "الوصف",
    en: "Description"
  },
  enterEventDescription: {
    ar: "أدخل وصف الحدث",
    en: "Enter event description"
  },
  details: {
    ar: "التفاصيل",
    en: "Details"
  },
  startDate: {
    ar: "تاريخ البداية",
    en: "Start Date"
  },
  endDate: {
    ar: "تاريخ النهاية",
    en: "End Date"
  },
  location: {
    ar: "الموقع",
    en: "Location"
  },
  addNewEvent: {
    ar: "إضافة حدث جديد",
    en: "Add New Event"
  },
  allEventsExported: {
    ar: "تم تصدير جميع الأحداث",
    en: "All events exported"
  },

  // Advanced Notifications
  advancedNotifications: {
    ar: "الإشعارات المتقدمة",
    en: "Advanced Notifications"
  },
  manageNotificationsCustomize: {
    ar: "إدارة الإشعارات والتخصيص حسب احتياجاتك",
    en: "Manage notifications and customize according to your needs"
  },
  totalNotifications: {
    ar: "إجمالي الإشعارات",
    en: "Total Notifications"
  },
  unread: {
    ar: "غير مقروءة",
    en: "Unread"
  },
  achievements: {
    ar: "الإنجازات",
    en: "Achievements"
  },
  reminders: {
    ar: "التذكيرات",
    en: "Reminders"
  },
  createTestNotifications: {
    ar: "إنشاء إشعارات تجريبية",
    en: "Create Test Notifications"
  },
  markAllAsRead: {
    ar: "تحديد الكل كمقروء",
    en: "Mark All as Read"
  },
  clearAll: {
    ar: "مسح الكل",
    en: "Clear All"
  },
  markAsRead: {
    ar: "تحديد كمقروء",
    en: "Mark as Read"
  },

  // Auto Backup
  cloudBackup: {
    ar: "النسخ الاحتياطي السحابي",
    en: "Cloud backup"
  },
  localBackup: {
    ar: "النسخ الاحتياطي المحلي",
    en: "Local backup"
  },
  backupFrequency: {
    ar: "تكرار النسخ الاحتياطي",
    en: "Backup frequency"
  },
  enableBackup: {
    ar: "تفعيل النسخ الاحتياطي",
    en: "Enable backup"
  },
  backupCreatedSuccessfully: {
    ar: "تم إنشاء النسخة الاحتياطية بنجاح",
    en: "Backup created successfully"
  },
  backupRestoredSuccessfully: {
    ar: "تم استعادة النسخة الاحتياطية بنجاح",
    en: "Backup restored successfully"
  },
  backupDeletedSuccessfully: {
    ar: "تم حذف النسخة الاحتياطية بنجاح",
    en: "Backup deleted successfully"
  },
  backupError: {
    ar: "خطأ في النسخ الاحتياطي",
    en: "Backup error"
  },
  restoreBackup: {
    ar: "استعادة النسخة الاحتياطية",
    en: "Restore backup"
  },
  deleteBackup: {
    ar: "حذف النسخة الاحتياطية",
    en: "Delete backup"
  },
  import: {
    ar: "استيراد",
    en: "Import"
  },
  
  // Home Page
  welcomeToCyberPlan: {
    ar: "مرحباً بك في خطة الأمن السيبراني",
    en: "Welcome to CyberPlan"
  },
  startYourJourney: {
    ar: "ابدأ رحلتك التعليمية",
    en: "Start Your Learning Journey"
  },
  beginYourJourney: {
    ar: "ابدأ رحلتك التعليمية",
    en: "Begin your learning journey"
  },
  organizeYourNotes: {
    ar: "نظم ملاحظاتك",
    en: "Organize your notes"
  },
  startLearning: {
    ar: "ابدأ التعلم",
    en: "Start Learning"
  },
  viewProgress: {
    ar: "عرض التقدم",
    en: "View Progress"
  },
  
  // Platform Features
  platformFeatures: {
    ar: "مميزات المنصة",
    en: "Platform Features"
  },
  cyberSecurity: {
    ar: "الأمان السيبراني",
    en: "Cyber Security"
  },
  learnCyberSecurityBasics: {
    ar: "تعلم أساسيات الأمن السيبراني وحماية الأنظمة",
    en: "Learn cybersecurity basics and system protection"
  },
  globalNetworks: {
    ar: "الشبكات العالمية",
    en: "Global Networks"
  },
  understandGlobalNetworks: {
    ar: "فهم الشبكات والاتصالات العالمية",
    en: "Understand global networks and communications"
  },
  advancedTechnologies: {
    ar: "التقنيات المتقدمة",
    en: "Advanced Technologies"
  },
  exploreLatestTechnologies: {
    ar: "استكشاف أحدث التقنيات في مجال الأمن السيبراني",
    en: "Explore latest technologies in cybersecurity"
  },
  continuousLearning: {
    ar: "التعلم المستمر",
    en: "Continuous Learning"
  },
  continuousLearningApproach: {
    ar: "نهج التعلم المستمر والتطوير المهني",
    en: "Continuous learning approach and professional development"
  }
};

export function useLocalization() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app_language') as Language) || 'ar';
    }
    return 'ar';
  });
  
  // Memoized translation function for better performance
  const t = useMemo(() => {
    return (key: string): string => {
      const translation = translations[key];
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
      return translation[currentLanguage] || translation.ar || key;
    };
  }, [currentLanguage]);
  
  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail;
      setCurrentLanguage(newLang);
    };

    const handleStorageChange = () => {
      const newLang = localStorage.getItem('app_language') as Language;
      if (newLang && newLang !== currentLanguage) {
        setCurrentLanguage(newLang);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentLanguage]);
  
  const setLang = useCallback((newLang: Language) => {
    console.log('useLocalization setLang called with:', newLang);
    setCurrentLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', newLang);
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
    }
  }, []);
  
  return {
    language: currentLanguage,
    setLanguage: setLang,
    t
  };
}