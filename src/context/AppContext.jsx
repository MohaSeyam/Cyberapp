import { createContext, useContext, useState, useEffect, useCallback } from "react";
import i18n from "../i18n/i18n";
import { getPlanData } from "../services/dataService";
import { FaCheck, FaEdit, FaClock } from "react-icons/fa";
import * as db from "../services/dbService";

const AppContext = createContext();

export function AppProvider({ children }) {
  console.log("AppProvider rendering");
  const [user, setUser] = useState(null);
  const [lang, setLangState] = useState(() => {
    // تحميل اللغة من localStorage أو استخدام العربية كافتراضي
    return localStorage.getItem('app_language') || "ar";
  });
  const [settings, setSettings] = useState(() => {
    // تحميل الإعدادات من localStorage أو استخدام القيم الافتراضية
    const savedSettings = localStorage.getItem('app_settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      notifications: true,
      sound: true,
      autoSave: true,
      theme: "light",
      fontSize: "medium",
      compactMode: false
    };
  });
  const [planData, setPlanData] = useState(null);
  const [plan, setPlan] = useState([]);
  const [progress, setProgress] = useState([]);
  const [appState, setAppState] = useState({
    progress: {},
    notes: {},
    resources: {},
  });
  const [modal, setModal] = useState({ isOpen: false, content: null });
  const [globalPomodoro, setGlobalPomodoro] = useState(null); // { title, minutes, running }
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب كل البيانات من القاعدة
  const fetchAll = useCallback(async () => {
    console.log("AppContext fetchAll called - starting");
    setLoading(true);
    try {
      // استورد البيانات من PlanData.json إذا كانت قاعدة البيانات فارغة
      const plan = await db.getPlan();
      if (!plan || plan.length === 0) {
        console.log("Plan is empty, importing from PlanData.json");
        try {
          const res = await fetch("/PlanData.json");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              await db.savePlan(data);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching PlanData.json:", fetchError);
        }
      }
      
      const [planData, notesData, journalData, progressData] = await Promise.all([
        db.getPlan().catch(() => []),
        db.getNotes().catch(() => []),
        db.getJournalEntries().catch(() => []),
        db.getProgress().catch(() => [])
      ]);
      
      console.log("AppContext data fetched:", { planData: planData.length, progressData: progressData.length });
      
      // تهيئة كل مهمة بـ done: false إذا لم تكن موجودة
      const normalizedPlan = (planData || []).map(week => ({
        ...week,
        days: (week.days || []).map(day => ({
          ...day,
          tasks: (day.tasks || []).map(task => {
            const t = { ...task, done: typeof task.done === 'boolean' ? task.done : false };
            return t;
          })
        }))
      }));
      
      console.log("AppContext - normalized plan length:", normalizedPlan.length);
      console.log("AppContext - first week:", normalizedPlan[0]);
      console.log("AppContext - phases found:", Array.from(new Set(normalizedPlan.map(w => w.phase))));
      
      setPlan(normalizedPlan);
      setProgress(progressData || []);
      setAppState(prev => ({
        ...prev,
        notes: notesData || [],
        journal: journalData || []
      }));
    } catch (error) {
      console.error("AppContext fetchAll error:", error);
      // Set default values on error
      setPlan([]);
      setProgress([]);
      setAppState(prev => ({
        ...prev,
        notes: [],
        journal: []
      }));
    } finally {
      setLoading(false);
      console.log("AppContext loading set to false");
    }
  }, []);

  useEffect(() => {
    console.log("AppContext useEffect running - calling fetchAll");
    fetchAll();
    
    // تحميل اللغة المحفوظة في i18n
    const savedLang = localStorage.getItem('app_language') || "ar";
    i18n.changeLanguage(savedLang);
    document.documentElement.setAttribute("dir", savedLang === "ar" ? "rtl" : "ltr");
  }, [fetchAll]);

  const Icons = {
    check: FaCheck,
    edit: FaEdit,
    clock: FaClock,
    task: (type) => <FaCheck />,
    resource: (type) => <FaEdit />,
  };

  const translations = {
    ar: {
      activeTasks: "المهام النشطة",
      suggestedResources: "المراجع المقترحة",
      addResource: "إضافة مرجع",
      eveningJournaling: "مهمة التدوين المسائية",
      minutes: "دقيقة",
      editNote: "تعديل الملاحظة",
      noteOnTask: "ملاحظة على المهمة",
      noteTitle: "عنوان الملاحظة",
      keywords: "الكلمات المفتاحية",
      noteContent: "محتوى الملاحظة",
      deleteNote: "حذف الملاحظة",
      cancel: "إلغاء",
      saveNote: "حفظ الملاحظة",
      editResource: "تعديل المرجع",
      resourceTitle: "عنوان المرجع",
      resourceUrl: "رابط المرجع",
      resourceType: "نوع المرجع",
      video: "فيديو",
      article: "مقالة",
      link: "رابط",
      deleteResource: "حذف المرجع",
      saveResource: "حفظ المرجع",
      taskCompleted: "تم إكمال المهمة بنجاح!",
      taskAdded: "تم إضافة المهمة بنجاح!",
      noteSaved: "تم حفظ الملاحظة بنجاح!",
      resourceAdded: "تم إضافة المرجع بنجاح!",
      progressUpdated: "تم تحديث التقدم بنجاح!",
      errorOccurred: "حدث خطأ، يرجى المحاولة مرة أخرى",
      loading: "جاري التحميل...",
      saving: "جاري الحفظ...",
      noData: "لا توجد بيانات متاحة",
      searchPlaceholder: "البحث في المهام والمراجع...",
      filterAll: "الكل",
      filterCompleted: "مكتمل",
      filterPending: "قيد التنفيذ",
      sortByDate: "ترتيب حسب التاريخ",
      sortByName: "ترتيب حسب الاسم",
      sortByProgress: "ترتيب حسب التقدم",
    },
    en: {
      activeTasks: "Active Tasks",
      suggestedResources: "Suggested Resources",
      addResource: "Add Resource",
      eveningJournaling: "Evening Journaling",
      minutes: "min",
      editNote: "Edit Note",
      noteOnTask: "Note on task",
      noteTitle: "Note Title",
      keywords: "Keywords",
      noteContent: "Note Content",
      deleteNote: "Delete Note",
      cancel: "Cancel",
      saveNote: "Save Note",
      editResource: "Edit Resource",
      resourceTitle: "Resource Title",
      resourceUrl: "Resource URL",
      resourceType: "Resource Type",
      video: "Video",
      article: "Article",
      link: "Link",
      deleteResource: "Delete Resource",
      saveResource: "Save Resource",
      taskCompleted: "Task completed successfully!",
      taskAdded: "Task added successfully!",
      noteSaved: "Note saved successfully!",
      resourceAdded: "Resource added successfully!",
      progressUpdated: "Progress updated successfully!",
      errorOccurred: "An error occurred, please try again",
      loading: "Loading...",
      saving: "Saving...",
      noData: "No data available",
      searchPlaceholder: "Search in tasks and resources...",
      filterAll: "All",
      filterCompleted: "Completed",
      filterPending: "Pending",
      sortByDate: "Sort by Date",
      sortByName: "Sort by Name",
      sortByProgress: "Sort by Progress",
    }
  };

  // زامن i18n.language مع lang عند التحميل
  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);





  // إزالة إشعار
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // إضافة إشعار جديد
  const addNotification = useCallback((type, title, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, title, message, duration };
    setNotifications(prev => [...prev, notification]);
    
    // إزالة الإشعار تلقائياً
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, [removeNotification]);

  // حفظ الإعدادات في قاعدة البيانات
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      // حفظ الإعدادات في localStorage
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      await db.setSetting('userSettings', updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification('error', 'خطأ في حفظ الإعدادات', 'فشل في حفظ الإعدادات، يرجى المحاولة مرة أخرى');
    }
  }, [settings, addNotification]);

  // تحديث التقدم
  const updateProgress = useCallback(async (weekId, dayKey, taskId, done) => {
    try {
      await db.setTaskProgress(weekId, dayKey, taskId, done);
      // تحديث progress في state
      setProgress(prev => {
        const existing = prev.find(p => p.weekId == weekId && p.dayKey == dayKey && p.taskId == taskId);
        if (existing) {
          return prev.map(p => p.id === existing.id ? { ...p, done } : p);
        } else {
          return [...prev, { weekId, dayKey, taskId, done }];
        }
      });
      addNotification('success', 'تم تحديث التقدم', 'تم تحديث حالة المهمة بنجاح');
    } catch (error) {
      console.error('Error updating progress:', error);
      addNotification('error', 'خطأ في تحديث التقدم', 'فشل في تحديث حالة المهمة');
    }
  }, [addNotification]);

  // حفظ ملاحظة
  const saveNote = useCallback(async (note) => {
    try {
      const savedNote = await db.addNote(note);
      setAppState(prev => ({
        ...prev,
        notes: [...prev.notes, savedNote]
      }));
      addNotification('success', 'تم حفظ الملاحظة', 'تم حفظ الملاحظة بنجاح');
      return savedNote;
    } catch (error) {
      console.error('Error saving note:', error);
      addNotification('error', 'خطأ في حفظ الملاحظة', 'فشل في حفظ الملاحظة');
      throw error;
    }
  }, [addNotification]);

  // حذف ملاحظة
  const deleteNote = useCallback(async (noteId) => {
    try {
      await db.deleteNote(noteId);
      setAppState(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId)
      }));
      addNotification('success', 'تم حذف الملاحظة', 'تم حذف الملاحظة بنجاح');
    } catch (error) {
      console.error('Error deleting note:', error);
      addNotification('error', 'خطأ في حذف الملاحظة', 'فشل في حذف الملاحظة');
    }
  }, [addNotification]);

  const setLang = (lng) => {
    setLangState(lng);
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
    // حفظ اللغة في localStorage
    localStorage.setItem('app_language', lng);
  };

  const value = {
    user,
    setUser,
    lang: lang || "ar", // Fallback to Arabic
    setLang,
    settings,
    updateSettings,
    planData,
    plan: plan || [], // Fallback to empty array
    progress: progress || [], // Fallback to empty array
    appState: appState || { progress: {}, notes: {}, resources: {} }, // Fallback to empty object
    setAppState,
    modal,
    setModal,
    globalPomodoro,
    setGlobalPomodoro,
    notifications,
    addNotification,
    removeNotification,
    updateProgress,
    saveNote,
    deleteNote,
    loading,
    Icons,
    translations: translations || { ar: {}, en: {} } // Fallback to empty translations
  };

  // Don't render children until context is fully initialized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    console.error("useApp must be used within an AppProvider");
    throw new Error("useApp must be used within an AppProvider");
  }
  
  // Ensure all required properties are available
  if (!context.lang) {
    console.warn("Context lang is not initialized yet");
  }
  
  return context;
}
