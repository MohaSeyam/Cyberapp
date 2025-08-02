// Localization Hook
import { useCallback } from 'react';
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
  phases: {
    ar: "المراحل",
    en: "Phases"
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
  }
};

export function useLocalization() {
  // Get language from localStorage to avoid circular dependency
  const getLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app_language') as Language) || 'ar';
    }
    return 'ar';
  };
  
  const language = getLanguage();
  
  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.ar || key;
  }, [language]);

  return { t, language };
}