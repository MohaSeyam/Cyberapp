// Localization Hook
import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
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
  progress: {
    ar: "التقدم",
    en: "Progress"
  },
  settings: {
    ar: "الإعدادات",
    en: "Settings"
  },
  
  // Tasks
  tasks: {
    ar: "المهام",
    en: "Tasks"
  },
  todayTasks: {
    ar: "مهام اليوم",
    en: "Today's Tasks"
  },
  activeTasks: {
    ar: "المهام النشطة",
    en: "Active Tasks"
  },
  completedTasks: {
    ar: "المهام المكتملة",
    en: "Completed Tasks"
  },
  taskDuration: {
    ar: "مدة المهمة",
    en: "Task Duration"
  },
  minutes: {
    ar: "دقيقة",
    en: "minutes"
  },
  hours: {
    ar: "ساعة",
    en: "hours"
  },
  
  // Resources
  resources: {
    ar: "المراجع",
    en: "Resources"
  },
  suggestedResources: {
    ar: "المراجع المقترحة",
    en: "Suggested Resources"
  },
  resourcesForToday: {
    ar: "المراجع لليوم",
    en: "Resources for Today"
  },
  addResource: {
    ar: "إضافة مرجع",
    en: "Add Resource"
  },
  resourceTitle: {
    ar: "عنوان المرجع",
    en: "Resource Title"
  },
  resourceUrl: {
    ar: "رابط المرجع",
    en: "Resource URL"
  },
  resourceType: {
    ar: "نوع المرجع",
    en: "Resource Type"
  },
  video: {
    ar: "فيديو",
    en: "Video"
  },
  article: {
    ar: "مقال",
    en: "Article"
  },
  book: {
    ar: "كتاب",
    en: "Book"
  },
  tool: {
    ar: "أداة",
    en: "Tool"
  },
  podcast: {
    ar: "بودكاست",
    en: "Podcast"
  },
  course: {
    ar: "دورة",
    en: "Course"
  },
  noResourcesYet: {
    ar: "لا توجد مراجع بعد",
    en: "No resources yet"
  },
  addYourFirstResource: {
    ar: "أضف مرجعك الأول",
    en: "Add your first resource"
  },
  
  // Notes
  addNote: {
    ar: "إضافة ملاحظة",
    en: "Add Note"
  },
  editNote: {
    ar: "تعديل الملاحظة",
    en: "Edit Note"
  },
  saveNote: {
    ar: "حفظ الملاحظة",
    en: "Save Note"
  },
  updateNote: {
    ar: "تحديث الملاحظة",
    en: "Update Note"
  },
  noteTitle: {
    ar: "عنوان الملاحظة",
    en: "Note Title"
  },
  noteContent: {
    ar: "محتوى الملاحظة",
    en: "Note Content"
  },
  writeTaskNote: {
    ar: "اكتب ملاحظة على المهمة",
    en: "Write a note about the task"
  },
  writeHere: {
    ar: "اكتب هنا...",
    en: "Write here..."
  },
  searchNotes: {
    ar: "البحث في الملاحظات",
    en: "Search notes"
  },
  allTags: {
    ar: "جميع العلامات",
    en: "All Tags"
  },
  tags: {
    ar: "العلامات",
    en: "Tags"
  },
  addTag: {
    ar: "إضافة علامة",
    en: "Add Tag"
  },
  keywords: {
    ar: "الكلمات المفتاحية",
    en: "Keywords"
  },
  enterTitle: {
    ar: "أدخل العنوان",
    en: "Enter title"
  },
  enterKeywords: {
    ar: "أدخل الكلمات المفتاحية",
    en: "Enter keywords"
  },
  enterUrl: {
    ar: "أدخل الرابط",
    en: "Enter URL"
  },
  noNotesYet: {
    ar: "لا توجد ملاحظات بعد",
    en: "No notes yet"
  },
  noNotesFound: {
    ar: "لم يتم العثور على ملاحظات",
    en: "No notes found"
  },
  createYourFirstNote: {
    ar: "أنشئ ملاحظتك الأولى",
    en: "Create your first note"
  },
  tryDifferentSearch: {
    ar: "جرب بحثاً مختلفاً",
    en: "Try a different search"
  },
  confirmDeleteNote: {
    ar: "هل أنت متأكد من حذف هذه الملاحظة؟",
    en: "Are you sure you want to delete this note?"
  },
  manageYourNotes: {
    ar: "إدارة ملاحظاتك",
    en: "Manage your notes"
  },
  
  // Journal
  addEntry: {
    ar: "إضافة مدخل",
    en: "Add Entry"
  },
  editJournalEntry: {
    ar: "تعديل مدخل المدونة",
    en: "Edit Journal Entry"
  },
  addJournalEntry: {
    ar: "إضافة مدخل للمدونة",
    en: "Add Journal Entry"
  },
  saveEntry: {
    ar: "حفظ المدخل",
    en: "Save Entry"
  },
  updateEntry: {
    ar: "تحديث المدخل",
    en: "Update Entry"
  },
  journalTitle: {
    ar: "عنوان المدونة",
    en: "Journal Title"
  },
  journalContent: {
    ar: "محتوى المدونة",
    en: "Journal Content"
  },
  writeJournalEntry: {
    ar: "اكتب مدخل المدونة",
    en: "Write journal entry"
  },
  searchJournal: {
    ar: "البحث في المدونة",
    en: "Search journal"
  },
  allWeeks: {
    ar: "جميع الأسابيع",
    en: "All Weeks"
  },
  selectWeek: {
    ar: "اختر الأسبوع",
    en: "Select Week"
  },
  noJournalEntries: {
    ar: "لا توجد مداخل في المدونة",
    en: "No journal entries"
  },
  noEntriesFound: {
    ar: "لم يتم العثور على مداخل",
    en: "No entries found"
  },
  startYourJournal: {
    ar: "ابدأ مدونتك",
    en: "Start your journal"
  },
  confirmDeleteJournal: {
    ar: "هل أنت متأكد من حذف هذا المدخل؟",
    en: "Are you sure you want to delete this entry?"
  },
  yourLearningJourney: {
    ar: "رحلة تعلمك",
    en: "Your Learning Journey"
  },
  totalEntries: {
    ar: "إجمالي المداخل",
    en: "Total Entries"
  },
  thisWeek: {
    ar: "هذا الأسبوع",
    en: "This Week"
  },
  totalWords: {
    ar: "إجمالي الكلمات",
    en: "Total Words"
  },
  words: {
    ar: "كلمات",
    en: "words"
  },
  journalEntry: {
    ar: "مدخل المدونة",
    en: "Journal Entry"
  },
  entries: {
    ar: "مداخل",
    en: "entries"
  },
  
  // Progress
  trackYourLearningJourney: {
    ar: "تتبع رحلة تعلمك",
    en: "Track Your Learning Journey"
  },
  totalTasks: {
    ar: "إجمالي المهام",
    en: "Total Tasks"
  },
  completionRate: {
    ar: "معدل الإكمال",
    en: "Completion Rate"
  },
  totalHours: {
    ar: "إجمالي الساعات",
    en: "Total Hours"
  },
  progressOverview: {
    ar: "نظرة عامة على التقدم",
    en: "Progress Overview"
  },
  yourLearningProgress: {
    ar: "تقدمك في التعلم",
    en: "Your Learning Progress"
  },
  overallProgress: {
    ar: "التقدم العام",
    en: "Overall Progress"
  },
  currentWeek: {
    ar: "الأسبوع الحالي",
    en: "Current Week"
  },
  timeSpent: {
    ar: "الوقت المستغرق",
    en: "Time Spent"
  },
  phaseProgress: {
    ar: "تقدم المراحل",
    en: "Phase Progress"
  },
  progressByPhase: {
    ar: "التقدم حسب المرحلة",
    en: "Progress by Phase"
  },
  achievements: {
    ar: "الإنجازات",
    en: "Achievements"
  },
  unlockYourAchievements: {
    ar: "افتح إنجازاتك",
    en: "Unlock Your Achievements"
  },
  firstTask: {
    ar: "المهمة الأولى",
    en: "First Task"
  },
  completedFirstTask: {
    ar: "أكملت مهمتك الأولى",
    en: "Completed your first task"
  },
  weekWarrior: {
    ar: "محارب الأسبوع",
    en: "Week Warrior"
  },
  completedWeek: {
    ar: "أكملت أسبوعاً كاملاً",
    en: "Completed a full week"
  },
  speedLearner: {
    ar: "المتعلم السريع",
    en: "Speed Learner"
  },
  completed5Tasks: {
    ar: "أكملت 5 مهام",
    en: "Completed 5 tasks"
  },
  recentActivity: {
    ar: "النشاط الأخير",
    en: "Recent Activity"
  },
  yourLatestProgress: {
    ar: "أحدث تقدمك",
    en: "Your Latest Progress"
  },
  completedTask: {
    ar: "مهمة مكتملة",
    en: "Completed Task"
  },
  noRecentActivity: {
    ar: "لا يوجد نشاط حديث",
    en: "No recent activity"
  },
  completeTasksToSeeActivity: {
    ar: "أكمل المهام لرؤية النشاط",
    en: "Complete tasks to see activity"
  },
  
  // Settings
  customizeYourExperience: {
    ar: "خصص تجربتك",
    en: "Customize Your Experience"
  },
  quickSettings: {
    ar: "الإعدادات السريعة",
    en: "Quick Settings"
  },
  mostUsedSettings: {
    ar: "الإعدادات الأكثر استخداماً",
    en: "Most Used Settings"
  },
  language: {
    ar: "اللغة",
    en: "Language"
  },
  theme: {
    ar: "المظهر",
    en: "Theme"
  },
  light: {
    ar: "فاتح",
    en: "Light"
  },
  dark: {
    ar: "داكن",
    en: "Dark"
  },
  appearance: {
    ar: "المظهر",
    en: "Appearance"
  },
  fontSize: {
    ar: "حجم الخط",
    en: "Font Size"
  },
  small: {
    ar: "صغير",
    en: "Small"
  },
  medium: {
    ar: "متوسط",
    en: "Medium"
  },
  large: {
    ar: "كبير",
    en: "Large"
  },
  compactMode: {
    ar: "الوضع المضغوط",
    en: "Compact Mode"
  },
  notifications: {
    ar: "الإشعارات",
    en: "Notifications"
  },
  enableNotifications: {
    ar: "تفعيل الإشعارات",
    en: "Enable Notifications"
  },
  soundEffects: {
    ar: "المؤثرات الصوتية",
    en: "Sound Effects"
  },
  data: {
    ar: "البيانات",
    en: "Data"
  },
  autoSave: {
    ar: "الحفظ التلقائي",
    en: "Auto Save"
  },
  dataManagement: {
    ar: "إدارة البيانات",
    en: "Data Management"
  },
  manageYourData: {
    ar: "إدارة بياناتك",
    en: "Manage Your Data"
  },
  exportSettings: {
    ar: "تصدير الإعدادات",
    en: "Export Settings"
  },
  importSettings: {
    ar: "استيراد الإعدادات",
    en: "Import Settings"
  },
  refreshData: {
    ar: "تحديث البيانات",
    en: "Refresh Data"
  },
  clearData: {
    ar: "مسح البيانات",
    en: "Clear Data"
  },
  confirmClearData: {
    ar: "هل أنت متأكد من مسح جميع البيانات؟",
    en: "Are you sure you want to clear all data?"
  },
  about: {
    ar: "حول",
    en: "About"
  },
  appInformation: {
    ar: "معلومات التطبيق",
    en: "App Information"
  },
  appName: {
    ar: "اسم التطبيق",
    en: "App Name"
  },
  version: {
    ar: "الإصدار",
    en: "Version"
  },
  lastUpdated: {
    ar: "آخر تحديث",
    en: "Last Updated"
  },
  
  // Home Page
  totalWeeks: {
    ar: "إجمالي الأسابيع",
    en: "Total Weeks"
  },
  week: {
    ar: "أسبوع",
    en: "Week"
  },
  learningPhases: {
    ar: "مراحل التعلم",
    en: "Learning Phases"
  },
  quickActions: {
    ar: "الإجراءات السريعة",
    en: "Quick Actions"
  },
  startLearning: {
    ar: "ابدأ التعلم",
    en: "Start Learning"
  },
  beginYourJourney: {
    ar: "ابدأ رحلتك",
    en: "Begin Your Journey"
  },
  community: {
    ar: "المجتمع",
    en: "Community"
  },
  joinDiscord: {
    ar: "انضم للديسكورد",
    en: "Join Discord"
  },
  trackProgress: {
    ar: "تتبع التقدم",
    en: "Track Progress"
  },
  viewAnalytics: {
    ar: "عرض التحليلات",
    en: "View Analytics"
  },
  currentProgress: {
    ar: "التقدم الحالي",
    en: "Current Progress"
  },
  completed: {
    ar: "مكتمل",
    en: "Completed"
  },
  total: {
    ar: "إجمالي",
    en: "Total"
  },
  noActivityYet: {
    ar: "لا يوجد نشاط بعد",
    en: "No activity yet"
  },
  startYourJourney: {
    ar: "ابدأ رحلتك",
    en: "Start Your Journey"
  },
  cybersecurityBasics: {
    ar: "أساسيات الأمن السيبراني",
    en: "Cybersecurity Basics"
  },
  
  // Evening Journaling
  eveningJournaling: {
    ar: "كتابة المساء",
    en: "Evening Journaling"
  },
  journalingPoints: {
    ar: "نقاط الكتابة",
    en: "Journaling Points"
  },
  startJournaling: {
    ar: "ابدأ الكتابة",
    en: "Start Journaling"
  },
  
  // Loading
  loadingDayContent: {
    ar: "جاري تحميل محتوى اليوم...",
    en: "Loading day content..."
  }
};

export function useLocalization() {
  const { lang } = useApp();

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const tWithLang = useCallback((key: string, language: Language): string => {
    return translations[key]?.[language] || key;
  }, []);

  return { t, tWithLang };
}