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
  settings: {
    ar: "الإعدادات",
    en: "Settings"
  },
  
  // Tasks
  tasks: {
    ar: "المهام",
    en: "Tasks"
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
  
  // Resources
  resources: {
    ar: "المراجع",
    en: "Resources"
  },
  suggestedResources: {
    ar: "المراجع المقترحة",
    en: "Suggested Resources"
  },
  addResource: {
    ar: "إضافة مرجع",
    en: "Add Resource"
  },
  editResource: {
    ar: "تعديل المرجع",
    en: "Edit Resource"
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
  
  // Notes
  notes: {
    ar: "الملاحظات",
    en: "Notes"
  },
  addNote: {
    ar: "إضافة ملاحظة",
    en: "Add Note"
  },
  editNote: {
    ar: "تعديل الملاحظة",
    en: "Edit Note"
  },
  noteTitle: {
    ar: "عنوان الملاحظة",
    en: "Note Title"
  },
  noteContent: {
    ar: "محتوى الملاحظة",
    en: "Note Content"
  },
  keywords: {
    ar: "الكلمات المفتاحية",
    en: "Keywords"
  },
  tags: {
    ar: "العلامات",
    en: "Tags"
  },
  
  // Journal
  journal: {
    ar: "المدونة",
    en: "Journal"
  },
  eveningJournaling: {
    ar: "مهمة التدوين المسائية",
    en: "Evening Journaling Task"
  },
  journalTitle: {
    ar: "عنوان المدونة",
    en: "Journal Title"
  },
  journalContent: {
    ar: "محتوى المدونة",
    en: "Journal Content"
  },
  
  // Task Types
  blueTeam: {
    ar: "فريق أزرق",
    en: "Blue Team"
  },
  redTeam: {
    ar: "فريق أحمر",
    en: "Red Team"
  },
  softSkills: {
    ar: "مهارات ناعمة",
    en: "Soft Skills"
  },
  practical: {
    ar: "عملي",
    en: "Practical"
  },
  
  // Resource Types
  video: {
    ar: "فيديو",
    en: "Video"
  },
  article: {
    ar: "مقالة",
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
  quiz: {
    ar: "اختبار",
    en: "Quiz"
  },
  project: {
    ar: "مشروع",
    en: "Project"
  },
  community: {
    ar: "مجتمع",
    en: "Community"
  },
  news: {
    ar: "خبر",
    en: "News"
  },
  link: {
    ar: "رابط آخر",
    en: "Other Link"
  },
  
  // Messages
  saveSuccess: {
    ar: "تم الحفظ بنجاح",
    en: "Saved successfully"
  },
  deleteSuccess: {
    ar: "تم الحذف بنجاح",
    en: "Deleted successfully"
  },
  saveError: {
    ar: "فشل في الحفظ",
    en: "Failed to save"
  },
  deleteError: {
    ar: "فشل في الحذف",
    en: "Failed to delete"
  },
  loadError: {
    ar: "فشل في التحميل",
    en: "Failed to load"
  },
  noData: {
    ar: "لا توجد بيانات",
    en: "No data available"
  },
  
  // Placeholders
  writeHere: {
    ar: "اكتب هنا...",
    en: "Write here..."
  },
  writeTaskNote: {
    ar: "اكتب ملاحظة على المهمة...",
    en: "Write a note about the task..."
  },
  writeJournalEntry: {
    ar: "اكتب مدونة اليوم...",
    en: "Write today's journal entry..."
  },
  enterTitle: {
    ar: "أدخل العنوان...",
    en: "Enter title..."
  },
  enterUrl: {
    ar: "أدخل الرابط...",
    en: "Enter URL..."
  },
  enterKeywords: {
    ar: "أدخل الكلمات المفتاحية...",
    en: "Enter keywords..."
  },
  
  // Week and Day names
  saturday: {
    ar: "السبت",
    en: "Saturday"
  },
  sunday: {
    ar: "الأحد",
    en: "Sunday"
  },
  monday: {
    ar: "الاثنين",
    en: "Monday"
  },
  tuesday: {
    ar: "الثلاثاء",
    en: "Tuesday"
  },
  wednesday: {
    ar: "الأربعاء",
    en: "Wednesday"
  },
  thursday: {
    ar: "الخميس",
    en: "Thursday"
  },
  friday: {
    ar: "الجمعة",
    en: "Friday"
  },
  
  // Week
  week: {
    ar: "أسبوع",
    en: "Week"
  },
  phase: {
    ar: "مرحلة",
    en: "Phase"
  },
  objective: {
    ar: "الهدف",
    en: "Objective"
  },
  topic: {
    ar: "الموضوع",
    en: "Topic"
  }
};

export function useLocalization() {
  const { lang } = useApp();
  
  const t = useCallback((key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[lang];
    }
    return fallback || key;
  }, [lang]);
  
  const tWithLang = useCallback((key: string, targetLang?: Language): string => {
    const translation = translations[key];
    if (translation) {
      return translation[targetLang || lang];
    }
    return key;
  }, [lang]);
  
  return { t, tWithLang, lang };
}