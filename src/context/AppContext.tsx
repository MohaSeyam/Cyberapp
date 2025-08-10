// Unified App Context
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { 
  Week, Note, JournalEntry, Resource, Progress, AppSettings, 
  AppState, Notification, Language, Theme, TaskEvaluation, WeekEvaluation 
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
  taskEvaluations: TaskEvaluation[];
  weekEvaluations: WeekEvaluation[];
  
  // Additional state for direct access
  notes: Note[];
  journalEntries: JournalEntry[];
  resources: Resource[];
  
  // Actions
  setLang: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateProgress: (weekId: number, dayKey: string, taskId: string, done: boolean) => Promise<void>;
  addOrUpdateProgress: (weekId: number, dayKey: string, taskId: string, done: boolean) => Promise<void>;
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
  addOrUpdateTaskEvaluation: (evaluation: TaskEvaluation) => void;
  addOrUpdateWeekEvaluation: (evaluation: WeekEvaluation) => void;
  exportData: () => Promise<void>;
  importData: (data: any) => Promise<void>;
  clearAllData: () => Promise<void>;
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
  const [taskEvaluations, setTaskEvaluations] = useState<TaskEvaluation[]>([]);
  const [weekEvaluations, setWeekEvaluations] = useState<WeekEvaluation[]>([]);

  const addOrUpdateTaskEvaluation = (evaluation: TaskEvaluation) => {
    setTaskEvaluations(prev => {
      const idx = prev.findIndex(e => e.taskId === evaluation.taskId && e.weekId === evaluation.weekId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = evaluation;
        return updated;
      }
      return [...prev, evaluation];
    });
  };

  const addOrUpdateWeekEvaluation = (evaluation: WeekEvaluation) => {
    setWeekEvaluations(prev => {
      const idx = prev.findIndex(e => e.weekId === evaluation.weekId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = evaluation;
        return updated;
      }
      return [...prev, evaluation];
    });
  };

  // Simple error messages
  const getErrorMessage = (key: string) => {
    const messages = {
      missingWeeks: 'أسابيع مفقودة',
      dataLoadSuccess: 'تم تحميل البيانات بنجاح',
      planLoadFailed: 'فشل في تحميل الخطة',
      dataLoadFailed: 'فشل في تحميل البيانات',
      refreshFailed: 'فشل في تحديث البيانات',
      updateDataFailed: 'فشل في تحديث البيانات',
      forceReloadSuccess: 'تم إعادة تحميل البيانات بنجاح',
      forceReloadFailed: 'فشل في إعادة تحميل البيانات',
      fixWeeksSuccess: 'تم إصلاح الأسابيع المفقودة بنجاح',
      fixWeeksFailed: 'فشل في إصلاح الأسابيع المفقودة'
    };
    return messages[key] || key;
  };
  
  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail;
      console.log('AppContext received language change:', newLang);
      setLangState(newLang);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

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
              toast.error(`${getErrorMessage('missingWeeks')}: ${stillMissingWeeks.join(', ')}`);
            } else {
              console.log("All weeks are now present!");
              toast.success(getErrorMessage('dataLoadSuccess'));
            }
          } catch (forcedImportError) {
            console.error("Failed to force import plan:", forcedImportError);
            toast.error(getErrorMessage('planLoadFailed'));
          }
        }
      } catch (error) {
        console.error("Error verifying weeks:", error);
      }
      
      // Set state with validated data
      setPlan(planData);
      setProgress(progressData);
      
      // Organize notes and journal by week/day with safety checks
      const organizedNotes: Record<string, Note[]> = {};
      const organizedJournal: Record<string, JournalEntry[]> = {};
      
      (notesData || []).forEach(note => {
        if (note && typeof note.weekId === 'number' && note.dayKey) {
          const key = `${note.weekId}-${note.dayKey}`;
          if (!organizedNotes[key]) organizedNotes[key] = [];
          organizedNotes[key].push(note);
        }
      });
      
      (journalData || []).forEach(entry => {
        if (entry && typeof entry.weekId === 'number' && entry.dayKey) {
          const key = `${entry.weekId}-${entry.dayKey}`;
          if (!organizedJournal[key]) organizedJournal[key] = [];
          organizedJournal[key].push(entry);
        }
      });
      
      // Organize resources by day
      const organizedResources: { [key: string]: Resource[] } = {};
      (resourcesData || []).forEach(resource => {
        if (resource && typeof resource.weekId === 'number' && resource.dayKey) {
          const key = `${resource.weekId}-${resource.dayKey}`;
          if (!organizedResources[key]) organizedResources[key] = [];
          organizedResources[key].push(resource);
        }
      });
      
      setAppState(prev => ({
        ...prev,
        notes: organizedNotes,
        journal: organizedJournal,
        resources: organizedResources
      }));
      
      console.log("Data loaded successfully:", {
        planWeeks: planData.length,
        progressItems: progressData.length,
        notesCount: notesData.length,
        journalCount: journalData.length
      });
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error(getErrorMessage('dataLoadFailed'));
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
      await settingsService.set('userSettings', updatedSettings);
      // أعد تحميل الإعدادات من القاعدة بعد الحفظ
      const dbSettings = await settingsService.get('userSettings');
      console.log('Settings after save:', dbSettings);
      settingsService.applySettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('فشل في حفظ الإعدادات');
    }
  }, [settings]);

  // Progress management
  const updateProgress = useCallback(async (weekId: number, dayKey: string, taskId: string, done: boolean) => {
    try {
      await progressService.setTaskProgress(weekId, dayKey, taskId, done);
      // أعد تحميل progress من القاعدة بعد التحديث
      const dbProgress = await progressService.getAll();
      setProgress(dbProgress);
      console.log('Progress after update:', dbProgress);
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
      
      // Update local state
      setAppState(prev => {
        const dayKey = `${resource.weekId}-${resource.dayKey}`;
        const existingResources = prev.resources[dayKey] || [];
        const newResource = { ...resource, id, createdAt: Date.now(), updatedAt: Date.now() };
        
        return {
          ...prev,
          resources: {
            ...prev.resources,
            [dayKey]: [...existingResources, newResource]
          }
        };
      });
      
      return id;
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('فشل في إضافة المرجع');
      throw error;
    }
  }, []);

  const updateResource = useCallback(async (id: number, updates: Partial<Resource>) => {
    try {
      console.log('Updating resource in database:', id, updates);
      await resourcesService.update(id, updates);
      console.log('Resource updated successfully in database');
      
      // Update local state
      setAppState(prev => {
        const updatedResources = { ...prev.resources };
        
        // Find and update the resource in all day keys
        Object.keys(updatedResources).forEach(dayKey => {
          updatedResources[dayKey] = updatedResources[dayKey].map(resource => 
            resource.id === id 
              ? { ...resource, ...updates, updatedAt: Date.now() }
              : resource
          );
        });
        
        console.log('Local state updated successfully');
        console.log('Updated resources:', updatedResources);
        return {
          ...prev,
          resources: updatedResources
        };
      });
      
      // Force a re-render by updating the state again
      setTimeout(() => {
        setAppState(prev => ({ ...prev }));
      }, 100);
      
      // Also refresh the resources from database to ensure consistency
      setTimeout(async () => {
        try {
          const freshResources = await resourcesService.getAll();
          console.log('Fresh resources from database:', freshResources);
          
          // Organize resources by day
          const organizedResources: { [key: string]: Resource[] } = {};
          freshResources.forEach(resource => {
            if (resource && typeof resource.weekId === 'number' && resource.dayKey) {
              const key = `${resource.weekId}-${resource.dayKey}`;
              if (!organizedResources[key]) organizedResources[key] = [];
              organizedResources[key].push(resource);
            }
          });
          
          setAppState(prev => ({
            ...prev,
            resources: organizedResources
          }));
        } catch (error) {
          console.error('Error refreshing resources:', error);
        }
      }, 200);
    } catch (error) {
      console.error('Error updating resource:', error);
      console.error('Error details:', error);
      toast.error('فشل في تحديث المرجع');
      throw error;
    }
  }, []);

  const deleteResource = useCallback(async (id: number) => {
    try {
      await resourcesService.delete(id);
      
      // Update local state
      setAppState(prev => {
        const updatedResources = { ...prev.resources };
        
        // Remove the resource from all day keys
        Object.keys(updatedResources).forEach(dayKey => {
          updatedResources[dayKey] = updatedResources[dayKey].filter(resource => resource.id !== id);
        });
        
        return {
          ...prev,
          resources: updatedResources
        };
      });
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
      
      // Always verify that all weeks from phases.json are present
      try {
        const phasesData = await import('../data/phases.json');
        const allPhaseWeeks = phasesData.default.flatMap(phase => phase.weeks);
        const missingWeeks = allPhaseWeeks.filter(week => !planData.find(w => w.week === week));
        
        if (missingWeeks.length > 0) {
          console.warn("Missing weeks in refreshed plan:", missingWeeks);
          console.log("Current plan weeks:", planData.map(w => w.week));
          
          // Try to re-import if some weeks are missing
          try {
            const reimportedPlan = await planService.importFromFile();
            planData = Array.isArray(reimportedPlan) ? reimportedPlan : [];
            console.log("Re-imported plan during refresh:", planData.length, "weeks");
            
            // Verify again after re-import
            const stillMissingWeeks = allPhaseWeeks.filter(week => !planData.find(w => w.week === week));
            if (stillMissingWeeks.length > 0) {
              console.error("Still missing weeks after refresh re-import:", stillMissingWeeks);
              toast.error(`${getErrorMessage('missingWeeks')}: ${stillMissingWeeks.join(', ')}`);
            }
          } catch (reimportError) {
            console.error("Failed to re-import plan during refresh:", reimportError);
            toast.error(getErrorMessage('refreshFailed'));
          }
        }
      } catch (error) {
        console.error("Error verifying weeks during refresh:", error);
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
      toast.error(getErrorMessage('updateDataFailed'));
    }
  }, []);

  // Force reload data function
  const forceReloadData = async () => {
    try {
      setLoading(true);
      console.log("Force reloading data...");
      
      // Clear existing data
      await Promise.all([
        planService.clear(),
        progressService.clear(),
        notesService.clear(),
        journalService.clear(),
        resourcesService.clear()
      ]);
      
      // Import fresh data
      const freshPlan = await planService.importFromFile();
      console.log("Fresh plan loaded:", freshPlan.length, "weeks");
      
      // Verify all weeks are present
      const phasesData = await import('../data/phases.json');
      const allPhaseWeeks = phasesData.default.flatMap(phase => phase.weeks);
      const missingWeeks = allPhaseWeeks.filter(week => !freshPlan.find(w => w.week === week));
      
      if (missingWeeks.length > 0) {
        console.error("Missing weeks after force reload:", missingWeeks);
        toast.error(`${getErrorMessage('missingWeeks')}: ${missingWeeks.join(', ')}`);
      } else {
        console.log("All weeks present after force reload!");
        toast.success(getErrorMessage('forceReloadSuccess'));
      }
      
      // Update state
      setPlan(freshPlan);
      setProgress([]);
      setAppState({
        notes: {},
        journal: {},
        resources: {}
      });
      
    } catch (error) {
      console.error("Error in force reload:", error);
      toast.error(getErrorMessage('forceReloadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Fix missing weeks function
  const fixMissingWeeks = async () => {
    try {
      setLoading(true);
      console.log("Fixing missing weeks...");
      
      // Import fresh data directly from PlanData.json
      const planData = await import('../data/PlanData.json');
      const freshPlan = Array.isArray(planData.default) ? planData.default : [];
      
      console.log("Fresh plan loaded:", freshPlan.length, "weeks");
      console.log("Available weeks:", freshPlan.map(w => w.week).sort((a, b) => a - b));
      
      // Clear existing plan data
      await planService.save([]);
      console.log("Cleared existing plan data");
      
      // Save fresh data to IndexedDB
      await planService.save(freshPlan);
      console.log("Saved fresh data to IndexedDB");
      
      // Verify all weeks are present
      const phasesData = await import('../data/phases.json');
      const allPhaseWeeks = phasesData.default.flatMap(phase => phase.weeks);
      const missingWeeks = allPhaseWeeks.filter(week => !freshPlan.find(w => w.week === week));
      
      if (missingWeeks.length > 0) {
        console.error("Missing weeks after fix:", missingWeeks);
        toast.error(`${getErrorMessage('missingWeeks')}: ${missingWeeks.join(', ')}`);
      } else {
        console.log("All weeks present after fix!");
        toast.success(getErrorMessage('fixWeeksSuccess'));
      }
      
      // Update state
      setPlan(freshPlan);
      
      // Force refresh
      await refreshData();
      
    } catch (error) {
      console.error("Error fixing missing weeks:", error);
      toast.error(getErrorMessage('fixWeeksFailed'));
    } finally {
      setLoading(false);
    }
  };

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
    taskEvaluations,
    weekEvaluations,
    
    // Additional state for direct access
    notes: Object.values(appState.notes || {}).flat(),
    journalEntries: Object.values(appState.journal || {}).flat(),
    resources: Object.values(appState.resources || {}).flat(),
    
    // Actions
    setLang: (newLang: Language) => {
      setLangState(newLang);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
    },
    setTheme,
    toggleTheme,
    updateSettings,
    updateProgress,
    addOrUpdateProgress: updateProgress, // Alias for updateProgress
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
    forceReloadData,
    fixMissingWeeks,
    addOrUpdateTaskEvaluation,
    addOrUpdateWeekEvaluation,
    exportData: async () => {
      try {
        const data = {
          plan: plan,
          progress: progress,
          appState: appState,
          settings: settings,
          lang: langState,
          theme: themeState,
          taskEvaluations: taskEvaluations,
          weekEvaluations: weekEvaluations,
          notes: Object.values(appState.notes).flat(),
          journalEntries: Object.values(appState.journal).flat(),
          resources: Object.values(appState.resources).flat(),
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('تم تصدير البيانات بنجاح');
      } catch (error) {
        console.error('Error exporting data:', error);
        toast.error('فشل في تصدير البيانات');
      }
    },
    importData: async (data: any) => {
      try {
        const importedData = JSON.parse(data);
        setPlan(importedData.plan);
        setProgress(importedData.progress);
        setAppState({
          notes: importedData.notes.reduce((acc: Record<string, Note[]>, note: Note) => {
            const key = `${note.weekId}-${note.dayKey}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(note);
            return acc;
          }, {}),
          journal: importedData.journalEntries.reduce((acc: Record<string, JournalEntry[]>, entry: JournalEntry) => {
            const key = `${entry.weekId}-${entry.dayKey}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(entry);
            return acc;
          }, {}),
          resources: importedData.resources.reduce((acc: { [key: string]: Resource[] }, resource: Resource) => {
            const key = `${resource.weekId}-${resource.dayKey}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(resource);
            return acc;
          }, {}),
        });
        setTaskEvaluations(importedData.taskEvaluations);
        setWeekEvaluations(importedData.weekEvaluations);
        toast.success('تم استيراد البيانات بنجاح');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('فشل في استيراد البيانات');
      }
    },
    clearAllData: async () => {
      if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء غير قابل للتراجع.')) {
        try {
          await Promise.all([
            planService.clear(),
            progressService.clear(),
            notesService.clear(),
            journalService.clear(),
            resourcesService.clear(),
            settingsService.clear(),
            taskEvaluations.map(e => notesService.delete(e.taskId)), // Clear task evaluations
            weekEvaluations.map(e => notesService.delete(e.weekId)), // Clear week evaluations
          ]);
          toast.success('تم حذف جميع البيانات بنجاح');
          setPlan([]);
          setProgress([]);
          setAppState({
            notes: {},
            journal: {},
            resources: {}
          });
          setTaskEvaluations([]);
          setWeekEvaluations([]);
        } catch (error) {
          console.error('Error clearing all data:', error);
          toast.error('فشل في حذف البيانات');
        }
      }
    }
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
  try {
    const context = useContext(AppContext);
    if (context === undefined) {
      console.warn('useApp called outside of AppProvider, returning default values');
      // Return default values instead of throwing error
      return {
        plan: [],
        progress: [],
        appState: { notes: {}, journal: {}, resources: {} },
        settings: {},
        lang: 'ar',
        theme: 'light',
        loading: false,
        modal: { isOpen: false, content: null },
        notifications: [],
        taskEvaluations: [],
        weekEvaluations: [],
        notes: [],
        journalEntries: [],
        resources: [],
        setLang: () => {},
        setTheme: () => {},
        toggleTheme: () => {},
        updateSettings: async () => {},
        updateProgress: async () => {},
        addOrUpdateProgress: async () => {},
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
        addOrUpdateTaskEvaluation: () => {},
        addOrUpdateWeekEvaluation: () => {},
        exportData: async () => {},
        importData: async () => {},
        clearAllData: async () => {}
      };
    }
    
    // Add safety checks for context values
    const safeContext = {
      ...context,
      plan: context.plan || [],
      progress: context.progress || [],
      notes: context.notes || [],
      journalEntries: context.journalEntries || [],
      resources: context.resources || [],
      taskEvaluations: context.taskEvaluations || [],
      weekEvaluations: context.weekEvaluations || [],
      notifications: context.notifications || [],
      appState: context.appState || { notes: {}, journal: {}, resources: {} },
      settings: context.settings || {},
      lang: context.lang || 'ar',
      theme: context.theme || 'light',
      loading: context.loading || false,
      modal: context.modal || { isOpen: false, content: null }
    };
    
    return safeContext;
  } catch (error) {
    console.error('Error in useApp:', error);
    // Return default values on error
    return {
      plan: [],
      progress: [],
      appState: { notes: {}, journal: {}, resources: {} },
      settings: {},
      lang: 'ar',
      theme: 'light',
      loading: false,
      modal: { isOpen: false, content: null },
      notifications: [],
      taskEvaluations: [],
      weekEvaluations: [],
      notes: [],
      journalEntries: [],
      resources: [],
      setLang: () => {},
      setTheme: () => {},
      toggleTheme: () => {},
      updateSettings: async () => {},
      updateProgress: async () => {},
      addOrUpdateProgress: async () => {},
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
      addOrUpdateTaskEvaluation: () => {},
      addOrUpdateWeekEvaluation: () => {},
      exportData: async () => {},
      importData: async () => {},
      clearAllData: async () => {}
    };
  }
}