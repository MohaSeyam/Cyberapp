// Localization Hook
import { useCallback, useState, useEffect } from 'react';
import type { Language } from '../types';

interface TranslationData {
  [key: string]: {
    ar: string;
    en: string;
  };
}

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
  backToList: {
    ar: "العودة للقائمة",
    en: "Back to List"
  },
  
  // Search and Filter
  search: {
    ar: "البحث",
    en: "Search"
  },
  searchNotes: {
    ar: "البحث في الملاحظات...",
    en: "Search notes..."
  },
  searchJournal: {
    ar: "البحث في المدونات...",
    en: "Search journal..."
  },
  filter: {
    ar: "فلترة",
    en: "Filter"
  },
  sortBy: {
    ar: "ترتيب حسب",
    en: "Sort by"
  },
  newest: {
    ar: "الأحدث",
    en: "Newest"
  },
  oldest: {
    ar: "الأقدم",
    en: "Oldest"
  },
  title: {
    ar: "العنوان",
    en: "Title"
  },
  date: {
    ar: "التاريخ",
    en: "Date"
  },
  allItems: {
    ar: "الكل",
    en: "All"
  },
  
  // Status Messages
  noResults: {
    ar: "لا توجد نتائج للبحث",
    en: "No search results"
  },
  noNotes: {
    ar: "لا توجد ملاحظات",
    en: "No notes"
  },
  noJournalEntries: {
    ar: "لا توجد مدونات",
    en: "No journal entries"
  },
  noTasks: {
    ar: "لا توجد مهام",
    en: "No tasks"
  },
  loadingData: {
    ar: "جاري تحميل البيانات...",
    en: "Loading data..."
  },
  savingData: {
    ar: "جاري حفظ البيانات...",
    en: "Saving data..."
  },
  dataSaved: {
    ar: "تم حفظ البيانات",
    en: "Data saved"
  },
  dataLoadError: {
    ar: "خطأ في تحميل البيانات",
    en: "Error loading data"
  },
  dataSaveError: {
    ar: "خطأ في حفظ البيانات",
    en: "Error saving data"
  },
  missingWeeks: {
    ar: "أسابيع مفقودة",
    en: "Missing weeks"
  },
  dataLoadSuccess: {
    ar: "تم تحميل جميع الأسابيع بنجاح",
    en: "All weeks loaded successfully"
  },
  
  // Editor
  titlePlaceholder: {
    ar: "عنوان الملاحظة...",
    en: "Note title..."
  },
  contentPlaceholder: {
    ar: "اكتب ملاحظتك هنا...",
    en: "Write your note here..."
  },
  journalTitlePlaceholder: {
    ar: "عنوان المدونة...",
    en: "Journal title..."
  },
  journalContentPlaceholder: {
    ar: "اكتب مدونتك هنا...",
    en: "Write your journal entry here..."
  },
  tags: {
    ar: "العلامات",
    en: "Tags"
  },
  addTag: {
    ar: "إضافة علامة",
    en: "Add tag"
  },
  tagPlaceholder: {
    ar: "اكتب علامة جديدة...",
    en: "Type a new tag..."
  },
  
  // Auto-save
  saving: {
    ar: "جارٍ الحفظ...",
    en: "Saving..."
  },
  saved: {
    ar: "تم الحفظ",
    en: "Saved"
  },
  saveError: {
    ar: "خطأ في الحفظ",
    en: "Save Error"
  },
  
  // Charts and Statistics
  progressOverTime: {
    ar: "التقدم عبر الزمن",
    en: "Progress Over Time"
  },
  weeklyProgressChart: {
    ar: "رسم بياني للتقدم الأسبوعي",
    en: "Weekly Progress Chart"
  },
  taskTypePieChart: {
    ar: "رسم بياني دائري لأنواع المهام",
    en: "Task Type Pie Chart"
  },
  distributionVisualization: {
    ar: "تصور التوزيع",
    en: "Distribution Visualization"
  },
  chartComingSoon: {
    ar: "الرسم البياني متاح الآن",
    en: "Chart Available Now"
  },
  detailedStatistics: {
    ar: "إحصائيات مفصلة",
    en: "Detailed Statistics"
  },
  comprehensiveAnalysis: {
    ar: "تحليل شامل",
    en: "Comprehensive Analysis"
  },
  skillsMatrix: {
    ar: "مصفوفة المهارات",
    en: "Skills Matrix"
  },
  yourSkillLevels: {
    ar: "مستويات مهاراتك",
    en: "Your Skill Levels"
  },
  level: {
    ar: "مستوى",
    en: "Level"
  },
  skillCategories: {
    ar: "فئات المهارات",
    en: "Skill Categories"
  },
  categoryBreakdown: {
    ar: "تفصيل الفئات",
    en: "Category Breakdown"
  },
  skills: {
    ar: "مهارات",
    en: "Skills"
  },
  suggestions: {
    ar: "الاقتراحات",
    en: "Suggestions"
  },
  trackYourProgress: {
    ar: "تتبع تقدمك",
    en: "Track Your Progress"
  },
  choosePhaseToStart: {
    ar: "اختر المرحلة للبدء",
    en: "Choose Phase to Start"
  },
  weekDays: {
    ar: "أيام الأسبوع",
    en: "Week Days"
  },
  dayDetails: {
    ar: "تفاصيل اليوم",
    en: "Day Details"
  },
  phaseWeeks: {
    ar: "أسابيع المرحلة",
    en: "Phase Weeks"
  },
  weekProgress: {
    ar: "تقدم الأسبوع",
    en: "Week Progress"
  },
  
  // Data Sync
  syncData: {
    ar: "مزامنة البيانات",
    en: "Sync Data"
  },
  syncStatus: {
    ar: "حالة المزامنة",
    en: "Sync Status"
  },
  pendingSync: {
    ar: "في انتظار المزامنة",
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
  exportError: {
    ar: "خطأ في التصدير",
    en: "Export error"
  },
  
  // File Upload
  uploadFile: {
    ar: "رفع ملف",
    en: "Upload File"
  },
  dragAndDrop: {
    ar: "اسحب وأفلت الملفات هنا",
    en: "Drag and drop files here"
  },
  orClickToSelect: {
    ar: "أو انقر لاختيار الملفات",
    en: "Or click to select files"
  },
  fileTooLarge: {
    ar: "الملف كبير جداً",
    en: "File too large"
  },
  unsupportedFileType: {
    ar: "نوع ملف غير مدعوم",
    en: "Unsupported file type"
  },
  uploadSuccess: {
    ar: "تم رفع الملف بنجاح",
    en: "File uploaded successfully"
  },
  uploadError: {
    ar: "خطأ في رفع الملف",
    en: "Upload error"
  },
  
  // Welcome Messages
  welcome: {
    ar: "مرحباً",
    en: "Welcome"
  },
  cyberSecurityLearning: {
    ar: "تعلم الأمن السيبراني",
    en: "Cyber Security Learning"
  },
  trackYourLearning: {
    ar: "تتبع تعلمك",
    en: "Track Your Learning"
  },
  learningPhases: {
    ar: "مراحل التعلم",
    en: "Learning Phases"
  },
  week: {
    ar: "أسبوع",
    en: "Week"
  },
  
  // Additional Statistics
  totalWeeks: {
    ar: "إجمالي الأسابيع",
    en: "Total Weeks"
  },
  totalTasks: {
    ar: "إجمالي المهام",
    en: "Total Tasks"
  },
  completedTasks: {
    ar: "المهام المكتملة",
    en: "Completed Tasks"
  },
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
    beginner: {
      ar: "مبتدئ",
      en: "Beginner"
    },
    intermediate: {
      ar: "متوسط",
      en: "Intermediate"
    },
    advanced: {
      ar: "متقدم",
      en: "Advanced"
    },
    start: {
      ar: "ابدأ",
      en: "Start"
    },

    // Calendar Integration
    calendarIntegration: {
      ar: "تكامل التقويم",
      en: "Calendar Integration"
    },
    syncTasksWithCalendars: {
      ar: "مزامنة المهام والمواعيد مع تقويماتك الخارجية",
      en: "Sync tasks and appointments with your external calendars"
    },
    addEvent: {
      ar: "إضافة حدث",
      en: "Add Event"
    },
    comingSoon: {
      ar: "قريباً",
      en: "Coming Soon"
    },
    syncAllTasks: {
      ar: "مزامنة جميع المهام",
      en: "Sync All Tasks"
    },
    exportAllEvents: {
      ar: "تصدير جميع الأحداث",
      en: "Export All Events"
    },
    addedEvents: {
      ar: "الأحداث المضافة",
      en: "Added Events"
    },
    availableTasks: {
      ar: "المهام المتاحة",
      en: "Available Tasks"
    },
    supportedCalendars: {
      ar: "التقويمات المدعومة",
      en: "Supported Calendars"
    },
    eventAddedSuccessfully: {
      ar: "تم إضافة الحدث بنجاح",
      en: "Event added successfully"
    },
    errorAddingEvent: {
      ar: "خطأ في إضافة الحدث",
      en: "Error adding event"
    },
    successfullySynced: {
      ar: "تم مزامنة",
      en: "Successfully synced"
    },
    tasks: {
      ar: "مهمة",
      en: "tasks"
    },
    allEventsExported: {
      ar: "تم تصدير جميع الأحداث",
      en: "All events exported"
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
    notifications: {
      ar: "الإشعارات",
      en: "Notifications"
    },
    new: {
      ar: "جديد",
      en: "new"
    },
    noNotifications: {
      ar: "لا توجد إشعارات",
      en: "No notifications"
    },
    notificationsWillAppear: {
      ar: "ستظهر الإشعارات هنا عند وجود نشاط جديد",
      en: "Notifications will appear here when there is new activity"
    },
    notificationSettings: {
      ar: "إعدادات الإشعارات",
      en: "Notification Settings"
    },
    generalSettings: {
      ar: "الإعدادات العامة",
      en: "General Settings"
    },
    enableNotifications: {
      ar: "تفعيل الإشعارات",
      en: "Enable notifications"
    },
    notificationSounds: {
      ar: "أصوات الإشعارات",
      en: "Notification sounds"
    },
    desktopNotifications: {
      ar: "إشعارات سطح المكتب",
      en: "Desktop notifications"
    },
    notificationTypes: {
      ar: "أنواع الإشعارات",
      en: "Notification Types"
    },
    learningProgress: {
      ar: "تقدم التعلم",
      en: "Learning progress"
    },
    systemNotifications: {
      ar: "إشعارات النظام",
      en: "System notifications"
    },
    quietHours: {
      ar: "ساعات الهدوء",
      en: "Quiet Hours"
    },
    enableQuietHours: {
      ar: "تفعيل ساعات الهدوء",
      en: "Enable quiet hours"
    },
    startTime: {
      ar: "وقت البداية",
      en: "Start Time"
    },
    endTime: {
      ar: "وقت النهاية",
      en: "End Time"
    },
    markAsRead: {
      ar: "تحديد كمقروء",
      en: "Mark as Read"
    },

    // Auto Backup
    autoBackup: {
      ar: "النسخ الاحتياطي التلقائي",
      en: "Auto Backup"
    },
    protectYourData: {
      ar: "حماية بياناتك مع النسخ الاحتياطي التلقائي والمتقدم",
      en: "Protect your data with automatic and advanced backup"
    },
    online: {
      ar: "متصل بالإنترنت",
      en: "Online"
    },
    offline: {
      ar: "غير متصل",
      en: "Offline"
    },
    backups: {
      ar: "النسخ الاحتياطية",
      en: "Backups"
    },
    successful: {
      ar: "ناجحة",
      en: "Successful"
    },
    totalSize: {
      ar: "إجمالي الحجم",
      en: "Total Size"
    },
    lastBackup: {
      ar: "آخر نسخة",
      en: "Last Backup"
    },
    createBackup: {
      ar: "إنشاء نسخة احتياطية",
      en: "Create Backup"
    },
    backingUp: {
      ar: "جاري النسخ...",
      en: "Backing up..."
    },
    restore: {
      ar: "استعادة",
      en: "Restore"
    },
    import: {
      ar: "استيراد",
      en: "Import"
    },
    backupCreatedSuccessfully: {
      ar: "تم إنشاء النسخة الاحتياطية بنجاح",
      en: "Backup created successfully"
    },
    errorCreatingBackup: {
      ar: "خطأ في إنشاء النسخة الاحتياطية",
      en: "Error creating backup"
    },
    backupUploadedToCloud: {
      ar: "تم رفع النسخة الاحتياطية إلى السحابة",
      en: "Backup uploaded to cloud"
    },
    errorUploadingBackup: {
      ar: "خطأ في رفع النسخة الاحتياطية",
      en: "Error uploading backup"
    },
    backupRestoredSuccessfully: {
      ar: "تم استعادة النسخة الاحتياطية بنجاح",
      en: "Backup restored successfully"
    },
    errorRestoringBackup: {
      ar: "خطأ في استعادة النسخة الاحتياطية",
      en: "Error restoring backup"
    },
    backupDeleted: {
      ar: "تم حذف النسخة الاحتياطية",
      en: "Backup deleted"
    },
    backupExported: {
      ar: "تم تصدير النسخة الاحتياطية",
      en: "Backup exported"
    },
    backupImported: {
      ar: "تم استيراد النسخة الاحتياطية",
      en: "Backup imported"
    },
    errorImportingBackup: {
      ar: "خطأ في استيراد النسخة الاحتياطية",
      en: "Error importing backup"
    },
    noBackups: {
      ar: "لا توجد نسخ احتياطية",
      en: "No backups"
    },
    createBackupToProtect: {
      ar: "قم بإنشاء نسخة احتياطية لحماية بياناتك",
      en: "Create a backup to protect your data"
    },
    backupSettings: {
      ar: "إعدادات النسخ الاحتياطي",
      en: "Backup Settings"
    },
    enableBackup: {
      ar: "تفعيل النسخ الاحتياطي",
      en: "Enable backup"
    },
    cloudBackup: {
      ar: "النسخ الاحتياطي السحابي",
      en: "Cloud backup"
    },
    scheduleSettings: {
      ar: "إعدادات التكرار",
      en: "Schedule Settings"
    },
    backupIntervalMinutes: {
      ar: "فترة النسخ الاحتياطي (دقائق)",
      en: "Backup interval (minutes)"
    },
    maxBackups: {
      ar: "الحد الأقصى للنسخ",
      en: "Max backups"
    },
    backupContent: {
      ar: "محتوى النسخ الاحتياطي",
      en: "Backup Content"
    },
    includeNotes: {
      ar: "تضمين الملاحظات",
      en: "Include notes"
    },
    includeProgress: {
      ar: "تضمين التقدم",
      en: "Include progress"
    },
    includeSettings: {
      ar: "تضمين الإعدادات",
      en: "Include settings"
    },
    securitySettings: {
      ar: "إعدادات الأمان",
      en: "Security Settings"
    },
    compressData: {
      ar: "ضغط البيانات",
      en: "Compress data"
    },
    encryptData: {
      ar: "تشفير البيانات",
      en: "Encrypt data"
    },
    restoreBackup: {
      ar: "استعادة النسخة الاحتياطية",
      en: "Restore Backup"
    },
    selectBackupToRestore: {
      ar: "اختر النسخة الاحتياطية التي تريد استعادتها. تحذير: سيتم استبدال البيانات الحالية.",
      en: "Select the backup you want to restore. Warning: Current data will be replaced."
    },
  completed: {
    ar: "مكتمل",
    en: "Completed"
  },
  total: {
    ar: "إجمالي",
    en: "Total"
  },
  quickActions: {
    ar: "الإجراءات السريعة",
    en: "Quick Actions"
  },
  beginYourJourney: {
    ar: "ابدأ رحلتك التعليمية",
    en: "Begin your learning journey"
      },
  organizeYourNotes: {
    ar: "نظم ملاحظاتك",
    en: "Organize your notes"
  },
  reflectOnLearning: {
    ar: "تأمل في تعلمك",
    en: "Reflect on your learning"
  },
  recentActivity: {
    ar: "النشاط الأخير",
    en: "Recent Activity"
  },
  yourLatestProgress: {
    ar: "أحدث تقدمك",
    en: "Your latest progress"
  },
  completedTask: {
    ar: "مهمة مكتملة",
    en: "Completed Task"
  },
  cybersecurityBasics: {
    ar: "أساسيات الأمن السيبراني",
    en: "Cybersecurity Basics"
  },
  noActivityYet: {
    ar: "لا يوجد نشاط بعد",
    en: "No activity yet"
  },
  startYourJourney: {
    ar: "ابدأ رحلتك التعليمية",
    en: "Start your learning journey"
  },
  startLearning: {
    ar: "ابدأ التعلم",
    en: "Start Learning"
  },
  viewProgress: {
    ar: "عرض التقدم",
    en: "View Progress"
  },
  learningJournal: {
    ar: "مدونة التعلم",
    en: "Learning Journal"
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
  
  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[currentLanguage] || translation.ar || key;
  }, [currentLanguage]);

  return { t, language: currentLanguage, setLang };
}