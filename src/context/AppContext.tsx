// Unified App Context
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
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
import { useLocalization } from '../hooks/useLocalization';

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
  forceReloadData: () => Promise<void>;
  fixMissingWeeks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// Cache for expensive operations
const cache = new Map();

export function AppProvider({ children }: AppProviderProps) {
  console.log("🏗️ AppProvider: Starting initialization...");
  
  try {
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

    console.log("🏗️ AppProvider: State initialized");

    // Translation function
    const { t } = useLocalization();

    // Optimized language change handler
    const handleLanguageChange = useCallback((event: CustomEvent) => {
      const newLang = event.detail;
      setLangState(prevLang => {
        if (prevLang !== newLang) {
          localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
          return newLang;
        }
        return prevLang;
      });
    }, []);

    // Listen for language changes from other components
    useEffect(() => {
      window.addEventListener('languageChanged', handleLanguageChange as EventListener);
      
      return () => {
        window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      };
    }, [handleLanguageChange]);

    // Optimized loadInitialData with caching
    const loadInitialData = useCallback(async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cacheKey = 'initialData';
        const cachedData = cache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp < 30000) { // 30 second cache
          setPlan(cachedData.plan);
          setProgress(cachedData.progress);
          setAppState(cachedData.appState);
          setSettings(cachedData.settings);
          setLangState(cachedData.lang);
          setThemeState(cachedData.theme);
          setLoading(false);
          return;
        }
        
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
        let resourcesData: Resource[] = [];
        
        try {
          [planData, progressData, notesData, journalData, resourcesData] = await Promise.all([
            planService.getAll().catch(() => []),
            progressService.getAll().catch(() => []),
            notesService.getAll().catch(() => []),
            journalService.getAll().catch(() => []),
            resourcesService.getAll().catch(() => [])
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
        resourcesData = Array.isArray(resourcesData) ? resourcesData : [];
        
        // Import plan if empty or incomplete
        if (planData.length === 0) {
          try {
            const importedPlan = await planService.importFromFile();
            planData = Array.isArray(importedPlan) ? importedPlan : [];
            console.log("Imported plan:", planData.length, "weeks");
          } catch (error) {
            console.error("Failed to import plan:", error);
            toast.error("فشل في تحميل الخطة");
            planData = [];
          }
        }
        
        // Always verify that all weeks from phases.json are present
        try {
          const phasesData = await import('../data/phases.json');
          const allPhaseWeeks = phasesData.default.flatMap(phase => phase.weeks);
          const missingWeeks = allPhaseWeeks.filter(week => !planData.find(w => w.week === week));
          
          if (missingWeeks.length > 0) {
            console.warn("Missing weeks in plan:", missingWeeks);
            console.log("Current plan weeks:", planData.map(w => w.week));
            
            // Force import from file if weeks are missing
            try {
              console.log("Forcing import from PlanData.json...");
              const forcedPlan = await import('../data/PlanData.json');
              planData = Array.isArray(forcedPlan.default) ? forcedPlan.default : [];
              console.log("Forced import successful:", planData.length, "weeks");
              
              // Save to IndexedDB
              await planService.save(planData);
              console.log("Saved to IndexedDB");
              
              // Verify again after forced import
              const stillMissingWeeks = allPhaseWeeks.filter(week => !planData.find(w => w.week === week));
              if (stillMissingWeeks.length > 0) {
                console.error("Still missing weeks after forced import:", stillMissingWeeks);
                toast.error(`${t('missingWeeks')}: ${stillMissingWeeks.join(', ')}`);
              } else {
                console.log("All weeks are now present!");
                toast.success(t('dataLoadSuccess'));
              }
            } catch (forcedImportError) {
              console.error("Failed to force import plan:", forcedImportError);
              toast.error(t('planLoadFailed'));
            }
          }
        } catch (error) {
          console.error("Error verifying weeks:", error);
        }
        
        // Set state with validated data
        setPlan(planData);
        setProgress(progressData);
        
        // Optimize appState structure for better performance
        const optimizedAppState: AppState = {
          notes: notesData.reduce((acc, note) => {
            acc[note.id] = note;
            return acc;
          }, {} as Record<number, Note>),
          journal: journalData.reduce((acc, entry) => {
            acc[entry.id] = entry;
            return acc;
          }, {} as Record<number, JournalEntry>),
          resources: resourcesData.reduce((acc, resource) => {
            acc[resource.id] = resource;
            return acc;
          }, {} as Record<number, Resource>)
        };
        
        setAppState(optimizedAppState);
        
        // Cache the data
        cache.set(cacheKey, {
          plan: planData,
          progress: progressData,
          appState: optimizedAppState,
          settings: savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS,
          lang: savedLang,
          theme: savedTheme,
          timestamp: Date.now()
        });
        
      } catch (error) {
        console.error("Error in loadInitialData:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }, [t]);

    // Load data on mount
    useEffect(() => {
      loadInitialData();
    }, [loadInitialData]);

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
      setThemeState(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        
        if (newTheme === 'dark') {
          document.body.classList.add('dark');
          document.documentElement.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
          document.documentElement.classList.remove('dark');
        }
        
        return newTheme;
      });
    }, []);

    // Settings management with debouncing
    const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
      });
      
      // Debounce the database update
      const timeoutId = setTimeout(async () => {
        try {
          await settingsService.save(newSettings);
        } catch (error) {
          console.error("Error saving settings:", error);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }, []);

    // Progress management with optimistic updates
    const updateProgress = useCallback(async (weekId: number, dayKey: string, taskId: string, done: boolean) => {
      // Optimistic update
      setProgress(prev => {
        const existing = prev.find(p => p.weekId === weekId && p.dayKey === dayKey && p.taskId === taskId);
        if (existing) {
          return prev.map(p => 
            p.weekId === weekId && p.dayKey === dayKey && p.taskId === taskId 
              ? { ...p, done, updatedAt: new Date().toISOString() }
              : p
          );
        } else {
          return [...prev, {
            id: `${weekId}-${dayKey}-${taskId}`,
            weekId,
            dayKey,
            taskId,
            done,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
        }
      });

      // Update database
      try {
        await progressService.update(weekId, dayKey, taskId, done);
      } catch (error) {
        console.error("Error updating progress:", error);
        // Revert optimistic update on error
        setProgress(prev => prev.filter(p => !(p.weekId === weekId && p.dayKey === dayKey && p.taskId === taskId)));
        toast.error("فشل في تحديث التقدم");
      }
    }, []);

    // Notes management with optimistic updates
    const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newNote: Note = {
        ...note,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistic update
      setAppState(prev => ({
        ...prev,
        notes: { ...prev.notes, [newNote.id]: newNote }
      }));

      try {
        const savedNote = await notesService.add(newNote);
        return savedNote.id;
      } catch (error) {
        console.error("Error adding note:", error);
        // Revert optimistic update
        setAppState(prev => {
          const { [newNote.id]: removed, ...rest } = prev.notes;
          return { ...prev, notes: rest };
        });
        toast.error("فشل في إضافة الملاحظة");
        throw error;
      }
    }, []);

    const updateNote = useCallback(async (id: number, updates: Partial<Note>) => {
      // Optimistic update
      setAppState(prev => ({
        ...prev,
        notes: {
          ...prev.notes,
          [id]: { ...prev.notes[id], ...updates, updatedAt: new Date().toISOString() }
        }
      }));

      try {
        await notesService.update(id, updates);
      } catch (error) {
        console.error("Error updating note:", error);
        toast.error("فشل في تحديث الملاحظة");
        throw error;
      }
    }, []);

    const deleteNote = useCallback(async (id: number) => {
      // Optimistic update
      setAppState(prev => {
        const { [id]: removed, ...rest } = prev.notes;
        return { ...prev, notes: rest };
      });

      try {
        await notesService.delete(id);
      } catch (error) {
        console.error("Error deleting note:", error);
        toast.error("فشل في حذف الملاحظة");
        throw error;
      }
    }, []);

    // Journal management with optimistic updates
    const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newEntry: JournalEntry = {
        ...entry,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistic update
      setAppState(prev => ({
        ...prev,
        journal: { ...prev.journal, [newEntry.id]: newEntry }
      }));

      try {
        const savedEntry = await journalService.add(newEntry);
        return savedEntry.id;
      } catch (error) {
        console.error("Error adding journal entry:", error);
        // Revert optimistic update
        setAppState(prev => {
          const { [newEntry.id]: removed, ...rest } = prev.journal;
          return { ...prev, journal: rest };
        });
        toast.error("فشل في إضافة مدونة");
        throw error;
      }
    }, []);

    const updateJournalEntry = useCallback(async (id: number, updates: Partial<JournalEntry>) => {
      // Optimistic update
      setAppState(prev => ({
        ...prev,
        journal: {
          ...prev.journal,
          [id]: { ...prev.journal[id], ...updates, updatedAt: new Date().toISOString() }
        }
      }));

      try {
        await journalService.update(id, updates);
      } catch (error) {
        console.error("Error updating journal entry:", error);
        toast.error("فشل في تحديث المدونة");
        throw error;
      }
    }, []);

    const deleteJournalEntry = useCallback(async (id: number) => {
      // Optimistic update
      setAppState(prev => {
        const { [id]: removed, ...rest } = prev.journal;
        return { ...prev, journal: rest };
      });

      try {
        await journalService.delete(id);
      } catch (error) {
        console.error("Error deleting journal entry:", error);
        toast.error("فشل في حذف المدونة");
        throw error;
      }
    }, []);

    // Resources management with optimistic updates
    const addResource = useCallback(async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newResource: Resource = {
        ...resource,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistic update
      setAppState(prev => ({
        ...prev,
        resources: { ...prev.resources, [newResource.id]: newResource }
      }));

      try {
        const savedResource = await resourcesService.add(newResource);
        return savedResource.id;
      } catch (error) {
        console.error("Error adding resource:", error);
        // Revert optimistic update
        setAppState(prev => {
          const { [newResource.id]: removed, ...rest } = prev.resources;
          return { ...prev, resources: rest };
        });
        toast.error("فشل في إضافة المورد");
        throw error;
      }
    }, []);

    const updateResource = useCallback(async (id: number, updates: Partial<Resource>) => {
      // Optimistic update
      setAppState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          [id]: { ...prev.resources[id], ...updates, updatedAt: new Date().toISOString() }
        }
      }));

      try {
        await resourcesService.update(id, updates);
      } catch (error) {
        console.error("Error updating resource:", error);
        toast.error("فشل في تحديث المورد");
        throw error;
      }
    }, []);

    const deleteResource = useCallback(async (id: number) => {
      // Optimistic update
      setAppState(prev => {
        const { [id]: removed, ...rest } = prev.resources;
        return { ...prev, resources: rest };
      });

      try {
        await resourcesService.delete(id);
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error("فشل في حذف المورد");
        throw error;
      }
    }, []);

    // Modal management
    const setModalState = useCallback((modal: { isOpen: boolean; content: ReactNode | null }) => {
      setModal(modal);
    }, []);

    // Notifications management
    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString()
      };
      setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Data refresh with cache invalidation
    const refreshData = useCallback(async () => {
      // Clear cache
      cache.clear();
      await loadInitialData();
    }, [loadInitialData]);

    const forceReloadData = useCallback(async () => {
      // Clear cache and force reload
      cache.clear();
      setLoading(true);
      await loadInitialData();
    }, [loadInitialData]);

    const fixMissingWeeks = useCallback(async () => {
      try {
        setLoading(true);
        await loadInitialData();
        toast.success("تم إصلاح البيانات بنجاح");
      } catch (error) {
        console.error("Error fixing missing weeks:", error);
        toast.error("فشل في إصلاح البيانات");
      } finally {
        setLoading(false);
      }
    }, [loadInitialData]);

    // Memoized context value to prevent unnecessary re-renders
    const value: AppContextType = useMemo(() => ({
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
      setModal: setModalState,
      addNotification,
      removeNotification,
      refreshData,
      forceReloadData,
      fixMissingWeeks,
    }), [
      plan,
      progress,
      appState,
      settings,
      langState,
      themeState,
      loading,
      modal,
      notifications,
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
      setModalState,
      addNotification,
      removeNotification,
      refreshData,
      forceReloadData,
      fixMissingWeeks,
    ]);

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
  } catch (error) {
    console.error("❌ AppProvider: Error occurred during initialization:", error);
    // Return a fallback context to prevent crashes
    return {
      plan: [],
      progress: [],
      appState: { notes: {}, journal: {}, resources: {} },
      settings: DEFAULT_SETTINGS,
      lang: 'ar' as Language,
      theme: 'light' as Theme,
      loading: false,
      modal: { isOpen: false, content: null },
      notifications: [],
      setLang: () => {},
      setTheme: () => {},
      toggleTheme: () => {},
      updateSettings: async () => {},
      updateProgress: async () => {},
      addNote: async () => 0,
      updateNote: async () => {},
      deleteNote: async () => {},
      addJournalEntry: async () => 0,
      updateJournalEntry: async () => {},
      deleteJournalEntry: async () => {},
      addResource: async () => 0,
      updateResource: async () => {},
      deleteResource: async () => {},
      setModal: () => {},
      addNotification: () => {},
      removeNotification: () => {},
      refreshData: async () => {},
      forceReloadData: async () => {},
      fixMissingWeeks: async () => {},
    };
  }
}

export function useApp() {
  console.log("🔍 useApp: Starting...");
  
  try {
    const context = useContext(AppContext);
    console.log("🔍 useApp: Context received:", { 
      hasContext: !!context, 
      contextKeys: context ? Object.keys(context) : [],
      planLength: context?.plan?.length,
      progressLength: context?.progress?.length
    });
    
    if (context === undefined) {
      console.error("❌ useApp: Context is undefined - AppProvider might be missing");
      throw new Error('useApp must be used within an AppProvider');
    }
    
    if (!context) {
      console.error("❌ useApp: Context is null");
      throw new Error('AppContext is null');
    }
    
    console.log("✅ useApp: Returning context successfully");
    return context;
  } catch (error) {
    console.error("❌ useApp: Error occurred:", error);
    // Return a fallback context to prevent crashes
    return {
      plan: [],
      progress: [],
      appState: { notes: {}, journal: {}, resources: {} },
      settings: DEFAULT_SETTINGS,
      lang: 'ar' as Language,
      theme: 'light' as Theme,
      loading: false,
      modal: { isOpen: false, content: null },
      notifications: [],
      setLang: () => {},
      setTheme: () => {},
      toggleTheme: () => {},
      updateSettings: async () => {},
      updateProgress: async () => {},
      addNote: async () => 0,
      updateNote: async () => {},
      deleteNote: async () => {},
      addJournalEntry: async () => 0,
      updateJournalEntry: async () => {},
      deleteJournalEntry: async () => {},
      addResource: async () => 0,
      updateResource: async () => {},
      deleteResource: async () => {},
      setModal: () => {},
      addNotification: () => {},
      removeNotification: () => {},
      refreshData: async () => {},
      forceReloadData: async () => {},
      fixMissingWeeks: async () => {},
    };
  }
}