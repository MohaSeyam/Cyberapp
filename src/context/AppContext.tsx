// Unified App Context
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { 
  Week, Note, JournalEntry, Resource, Progress, AppSettings, 
  AppState, Notification, Language, Theme 
} from '../types';
import { 
  planService, notesService, journalService, resourcesService, 
  progressService, settingsService 
} from '../services/database';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';

interface AppContextType {
  // State
  plan: Week[];
  progress: Progress[];
  appState: AppState;
  settings: AppSettings;
  lang: Language;
  theme: Theme;
  loading: boolean;
  modal: { isOpen: boolean; content: ReactNode | null };
  notifications: Notification[];
  
  // Actions
  setLang: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateProgress: (weekId: number, dayKey: string, taskId: string, done: boolean) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateNote: (id: number, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateJournalEntry: (id: number, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: number) => Promise<void>;
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateResource: (id: number, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: number) => Promise<void>;
  setModal: (modal: { isOpen: boolean; content: ReactNode | null }) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // State with proper initialization
  const [plan, setPlan] = useState<Week[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [appState, setAppState] = useState<AppState>({
    notes: {},
    journal: {},
    resources: {}
  });
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [langState, setLangState] = useState<Language>('ar');
  const [themeState, setThemeState] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ isOpen: boolean; content: ReactNode | null }>({
    isOpen: false,
    content: null
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load language and theme from localStorage
      const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language || 'ar';
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme || 'light';
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      setLangState(savedLang);
      setThemeState(savedTheme);
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error("Error parsing settings:", error);
          setSettings(DEFAULT_SETTINGS);
        }
      }
      
      // Load data from database with comprehensive safety checks
      let planData: Week[] = [];
      let progressData: Progress[] = [];
      let notesData: Note[] = [];
      let journalData: JournalEntry[] = [];
      
      try {
        [planData, progressData, notesData, journalData] = await Promise.all([
          planService.getAll().catch(() => []),
          progressService.getAll().catch(() => []),
          notesService.getAll().catch(() => []),
          journalService.getAll().catch(() => [])
        ]);
      } catch (error) {
        console.error("Error loading data from database:", error);
        // Continue with empty arrays
      }
      
      // Ensure all data are arrays
      planData = Array.isArray(planData) ? planData : [];
      progressData = Array.isArray(progressData) ? progressData : [];
      notesData = Array.isArray(notesData) ? notesData : [];
      journalData = Array.isArray(journalData) ? journalData : [];
      
      // Import plan if empty
      if (planData.length === 0) {
        try {
          const importedPlan = await planService.importFromFile();
          planData = Array.isArray(importedPlan) ? importedPlan : [];
          console.log("Imported plan:", planData.length, "weeks");
          
          // Verify that all weeks from phases.json are present
          const phasesData = await import('../data/phases.json');
          const allPhaseWeeks = phasesData.default.flatMap(phase => phase.weeks);
          const missingWeeks = allPhaseWeeks.filter(week => !planData.find(w => w.week === week));
          
          if (missingWeeks.length > 0) {
            console.warn("Missing weeks in plan:", missingWeeks);
            // Try to re-import if some weeks are missing
            try {
              const reimportedPlan = await planService.importFromFile();
              planData = Array.isArray(reimportedPlan) ? reimportedPlan : [];
              console.log("Re-imported plan:", planData.length, "weeks");
            } catch (reimportError) {
              console.error("Failed to re-import plan:", reimportError);
            }
          }
        } catch (error) {
          console.error("Failed to import plan:", error);
          toast.error("فشل في تحميل الخطة");
          planData = [];
        }
      }
      
      // Set state with validated data
      setPlan(planData);
      setProgress(progressData);
      
      // Organize notes and journal by week/day with safety checks
      const organizedNotes: Record<string, Note[]> = {};
      const organizedJournal: Record<string, JournalEntry[]> = {};
      
      notesData.forEach(note => {
        if (note && typeof note.weekId === 'number' && note.dayKey) {
          const key = `${note.weekId}-${note.dayKey}`;
          if (!organizedNotes[key]) organizedNotes[key] = [];
          organizedNotes[key].push(note);
        }
      });
      
      journalData.forEach(entry => {
        if (entry && typeof entry.weekId === 'number' && entry.dayKey) {
          const key = `${entry.weekId}-${entry.dayKey}`;
          if (!organizedJournal[key]) organizedJournal[key] = [];
          organizedJournal[key].push(entry);
        }
      });
      
      setAppState(prev => ({
        ...prev,
        notes: organizedNotes,
        journal: organizedJournal
      }));
      
      console.log("Data loaded successfully:", {
        planWeeks: planData.length,
        progressItems: progressData.length,
        notesCount: notesData.length,
        journalCount: journalData.length
      });
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("فشل في تحميل البيانات");
      // Set default empty values
      setPlan([]);
      setProgress([]);
      setAppState({
        notes: {},
        journal: {},
        resources: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply saved theme and language on mount
  useEffect(() => {
    // Apply saved theme
    if (themeState === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
    
    // Apply saved language
    document.documentElement.setAttribute('dir', langState === 'ar' ? 'rtl' : 'ltr');
  }, [themeState, langState]);

  // Language management
  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  }, []);

  // Theme management
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // عند تغيير الثيم، أضف أو أزل كلاس dark على العنصر html أو body
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setTheme(themeState === 'dark' ? 'light' : 'dark');
  }, [themeState, setTheme]);

  // Settings management
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      await settingsService.set('userSettings', updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('فشل في حفظ الإعدادات');
    }
  }, [settings]);

  // Progress management
  const updateProgress = useCallback(async (weekId: number, dayKey: string, taskId: string, done: boolean) => {
    try {
      await progressService.setTaskProgress(weekId, dayKey, taskId, done);
      setProgress(prev => {
        const existing = prev.find(p => p.weekId === weekId && p.dayKey === dayKey && p.taskId === taskId);
        if (existing) {
          return prev.map(p => p.id === existing.id ? { ...p, done } : p);
        } else {
          return [...prev, { weekId, dayKey, taskId, done }];
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('فشل في تحديث التقدم');
    }
  }, []);

  // Notes management
  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await notesService.add(note);
      const newNote = { ...note, id, createdAt: Date.now(), updatedAt: Date.now() };
      
      setAppState(prev => {
        const key = `${note.weekId}-${note.dayKey}`;
        const existingNotes = prev.notes[key] || [];
        return {
          ...prev,
          notes: {
            ...prev.notes,
            [key]: [...existingNotes, newNote]
          }
        };
      });
      
      return id;
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('فشل في إضافة الملاحظة');
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (id: number, updates: Partial<Note>) => {
    try {
      await notesService.update(id, updates);
      setAppState(prev => {
        const newNotes = { ...prev.notes };
        Object.keys(newNotes).forEach(key => {
          newNotes[key] = newNotes[key].map(note => 
            note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
          );
        });
        return { ...prev, notes: newNotes };
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('فشل في تحديث الملاحظة');
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: number) => {
    try {
      await notesService.delete(id);
      setAppState(prev => {
        const newNotes = { ...prev.notes };
        Object.keys(newNotes).forEach(key => {
          newNotes[key] = newNotes[key].filter(note => note.id !== id);
        });
        return { ...prev, notes: newNotes };
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('فشل في حذف الملاحظة');
      throw error;
    }
  }, []);

  // Journal management
  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await journalService.add(entry);
      const newEntry = { ...entry, id, createdAt: Date.now(), updatedAt: Date.now() };
      
      setAppState(prev => {
        const key = `${entry.weekId}-${entry.dayKey}`;
        return {
          ...prev,
          journal: {
            ...prev.journal,
            [key]: [newEntry]
          }
        };
      });
      
      return id;
    } catch (error) {
      console.error('Error adding journal entry:', error);
      toast.error('فشل في إضافة المدونة');
      throw error;
    }
  }, []);

  const updateJournalEntry = useCallback(async (id: number, updates: Partial<JournalEntry>) => {
    try {
      await journalService.update(id, updates);
      setAppState(prev => {
        const newJournal = { ...prev.journal };
        Object.keys(newJournal).forEach(key => {
          newJournal[key] = newJournal[key].map(entry => 
            entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry
          );
        });
        return { ...prev, journal: newJournal };
      });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast.error('فشل في تحديث المدونة');
      throw error;
    }
  }, []);

  const deleteJournalEntry = useCallback(async (id: number) => {
    try {
      await journalService.delete(id);
      setAppState(prev => {
        const newJournal = { ...prev.journal };
        Object.keys(newJournal).forEach(key => {
          newJournal[key] = newJournal[key].filter(entry => entry.id !== id);
        });
        return { ...prev, journal: newJournal };
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('فشل في حذف المدونة');
      throw error;
    }
  }, []);

  // Resources management
  const addResource = useCallback(async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await resourcesService.add(resource);
      return id;
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('فشل في إضافة المرجع');
      throw error;
    }
  }, []);

  const updateResource = useCallback(async (id: number, updates: Partial<Resource>) => {
    try {
      await resourcesService.update(id, updates);
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('فشل في تحديث المرجع');
      throw error;
    }
  }, []);

  const deleteResource = useCallback(async (id: number) => {
    try {
      await resourcesService.delete(id);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('فشل في حذف المرجع');
      throw error;
    }
  }, []);

  // Notification management
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load data from database with comprehensive safety checks
      let planData: Week[] = [];
      let progressData: Progress[] = [];
      let notesData: Note[] = [];
      let journalData: JournalEntry[] = [];
      
      try {
        [planData, progressData, notesData, journalData] = await Promise.all([
          planService.getAll(),
          progressService.getAll(),
          notesService.getAll(),
          journalService.getAll()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('فشل في تحميل البيانات');
      }
      
      // Set data with safety checks
      planData = Array.isArray(planData) ? planData : [];
      progressData = Array.isArray(progressData) ? progressData : [];
      notesData = Array.isArray(notesData) ? notesData : [];
      journalData = Array.isArray(journalData) ? journalData : [];
      
      // Import plan if empty or incomplete
      if (planData.length === 0) {
        try {
          const importedPlan = await planService.importFromFile();
          planData = Array.isArray(importedPlan) ? importedPlan : [];
          console.log("Refreshed plan:", planData.length, "weeks");
        } catch (error) {
          console.error("Failed to import plan during refresh:", error);
        }
      }
      
      setPlan(planData);
      setProgress(progressData);
      
      // Organize notes and journal entries by week
      const notesByWeek: Record<string, Note[]> = {};
      const journalByWeek: Record<string, JournalEntry[]> = {};
      
      if (Array.isArray(notesData)) {
        notesData.forEach(note => {
          const key = `${note.weekId}-${note.dayKey}`;
          if (!notesByWeek[key]) notesByWeek[key] = [];
          notesByWeek[key].push(note);
        });
      }
      
      if (Array.isArray(journalData)) {
        journalData.forEach(entry => {
          const key = `${entry.weekId}-${entry.dayKey}`;
          if (!journalByWeek[key]) journalByWeek[key] = [];
          journalByWeek[key].push(entry);
        });
      }
      
      setAppState({
        notes: notesByWeek,
        journal: journalByWeek,
        resources: {}
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLoading(false);
      toast.error('فشل في تحديث البيانات');
    }
  }, []);

  const value: AppContextType = {
    // State
    plan,
    progress,
    appState,
    settings,
    lang: langState,
    theme: themeState,
    loading,
    modal,
    notifications,
    
    // Actions
    setLang,
    setTheme,
    toggleTheme,
    updateSettings,
    updateProgress,
    addNote,
    updateNote,
    deleteNote,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addResource,
    updateResource,
    deleteResource,
    setModal,
    addNotification,
    removeNotification,
    refreshData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <div className="font-semibold">{notification.title}</div>
            <div className="text-sm opacity-90">{notification.message}</div>
          </motion.div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}