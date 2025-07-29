import { createContext, useContext, useState, useEffect, useCallback } from "react";
import i18n from "../i18n/i18n";
import { getPlanData } from "../services/dataService";
import { FaCheck, FaEdit, FaClock } from "react-icons/fa";
import { useCyberPlan } from "../hooks/useCyberPlan";
import * as db from "../services/dbService";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [lang, setLangState] = useState("ar");
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    autoSave: true,
    theme: "light",
    fontSize: "medium",
    compactMode: false
  });
  const [planData, setPlanData] = useState(null);
  const [appState, setAppState] = useState({
    progress: {},
    notes: {},
    resources: {},
  });
  const [modal, setModal] = useState({ isOpen: false, content: null });
  const [theme, setTheme] = useState("light");
  const [globalPomodoro, setGlobalPomodoro] = useState(null); // { title, minutes, running }
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const cyberPlan = useCyberPlan();

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

  // تحميل بيانات الخطة عند بدء التطبيق
  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true);
        const data = await getPlanData();
        setPlanData(data);
      } catch (error) {
        console.error('Error loading plan data:', error);
        // Show error notification
        addNotification('error', 'خطأ في تحميل البيانات', 'فشل في تحميل بيانات الخطة، يرجى المحاولة مرة أخرى');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);

  // تحميل جميع الملاحظات والمدونات من dbService عند بدء التطبيق
  useEffect(() => {
    async function loadUserData() {
      try {
        const [notes, journal, userSettings] = await Promise.all([
          db.getNotes(),
          db.getJournalEntries(),
          db.getSetting('userSettings')
        ]);
        
        setAppState(prev => ({
          ...prev,
          notes,
          journal
        }));
        
        if (userSettings) {
          setSettings(prev => ({ ...prev, ...userSettings }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
    loadUserData();
  }, []);

  // حفظ الإعدادات في قاعدة البيانات
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await db.setSetting('userSettings', updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification('error', 'خطأ في حفظ الإعدادات', 'فشل في حفظ الإعدادات، يرجى المحاولة مرة أخرى');
    }
  }, [settings]);

  // إضافة إشعار جديد
  const addNotification = useCallback((type, title, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, title, message, duration };
    setNotifications(prev => [...prev, notification]);
    
    // إزالة الإشعار تلقائياً
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  // إزالة إشعار
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // تحديث التقدم
  const updateProgress = useCallback(async (weekId, dayKey, taskId, done) => {
    try {
      await db.setTaskProgress(weekId, dayKey, taskId, done);
      setAppState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          [`${weekId}-${dayKey}-${taskId}`]: done
        }
      }));
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
  };

  const value = {
    user,
    setUser,
    lang,
    setLang,
    settings,
    updateSettings,
    planData,
    appState,
    setAppState,
    modal,
    setModal,
    theme,
    setTheme,
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
    translations
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
