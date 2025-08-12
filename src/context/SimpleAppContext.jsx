import React, { createContext, useContext, useState, useEffect } from 'react';

// Simple context with minimal state
const SimpleAppContext = createContext();

// Default values
const defaultState = {
  // Basic state
  language: 'ar',
  theme: 'light',
  loading: false,
  
  // Data arrays
  plan: [],
  progress: [],
  notes: [],
  journalEntries: [],
  resources: [],
  taskEvaluations: [],
  weekEvaluations: [],
  
  // Functions
  setLanguage: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
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
  refreshData: async () => {},
  exportData: async () => {},
  importData: async () => {},
  clearAllData: async () => {}
};

export const SimpleAppProvider = ({ children }) => {
  // Basic state
  const [language, setLanguageState] = useState('ar');
  const [theme, setThemeState] = useState('light');
  const [loading, setLoading] = useState(false);
  
  // Data state
  const [plan, setPlan] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [resources, setResources] = useState([]);
  const [taskEvaluations, setTaskEvaluations] = useState([]);
  const [weekEvaluations, setWeekEvaluations] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load language and theme from localStorage
        const savedLang = localStorage.getItem('language') || 'ar';
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        setLanguageState(savedLang);
        setThemeState(savedTheme);
        
        // Set document attributes
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLang;
        
        // Apply theme to document element
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Load data from localStorage (simplified)
        const savedPlan = localStorage.getItem('plan');
        const savedProgress = localStorage.getItem('progress');
        const savedNotes = localStorage.getItem('notes');
        const savedJournal = localStorage.getItem('journalEntries');
        const savedResources = localStorage.getItem('resources');
        const savedTaskEvaluations = localStorage.getItem('taskEvaluations');
        const savedWeekEvaluations = localStorage.getItem('weekEvaluations');
        
        // تصحيح الملاحظات القديمة
        if (savedNotes) {
          let notesArr = JSON.parse(savedNotes);
          let changed = false;
          notesArr = notesArr.map(note => {
            if (!note.id || isNaN(Number(note.id))) {
              changed = true;
              return { ...note, id: Date.now() + Math.floor(Math.random() * 100000) };
            }
            return note;
          });
          if (changed) localStorage.setItem('notes', JSON.stringify(notesArr));
          setNotes(notesArr);
        }
        // تصحيح المدونات القديمة
        if (savedJournal) {
          let journalArr = JSON.parse(savedJournal);
          let changed = false;
          journalArr = journalArr.map(entry => {
            if (!entry.id || isNaN(Number(entry.id))) {
              changed = true;
              return { ...entry, id: Date.now() + Math.floor(Math.random() * 100000) };
            }
            return entry;
          });
          if (changed) localStorage.setItem('journalEntries', JSON.stringify(journalArr));
          setJournalEntries(journalArr);
        }
        
        if (savedPlan) setPlan(JSON.parse(savedPlan));
        if (savedProgress) setProgress(JSON.parse(savedProgress));
        if (savedResources) setResources(JSON.parse(savedResources));
        if (savedTaskEvaluations) setTaskEvaluations(JSON.parse(savedTaskEvaluations));
        if (savedWeekEvaluations) setWeekEvaluations(JSON.parse(savedWeekEvaluations));
        
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Functions
  const setLanguage = (newLang) => {
    try {
      setLanguageState(newLang);
      localStorage.setItem('language', newLang);
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const setTheme = (newTheme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Apply theme to document element
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const updateProgress = async (weekId, dayKey, taskId, done, phaseId) => {
    try {
      const newProgress = [...progress];
      const existingIndex = newProgress.findIndex(p => 
        p.weekId === weekId && p.dayKey === dayKey && p.taskId === taskId
      );
      
      if (existingIndex >= 0) {
        newProgress[existingIndex] = { ...newProgress[existingIndex], done, ...(phaseId ? { phaseId } : {}) };
      } else {
        newProgress.push({ weekId, dayKey, taskId, done, ...(phaseId ? { phaseId } : {}) });
      }
      
      setProgress(newProgress);
      try {
        localStorage.setItem('progress', JSON.stringify(newProgress));
      } catch (error) {
        console.error('Error saving progress to localStorage:', error);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const addNote = async (noteData) => {
    try {
      const newNote = {
        id: Date.now(),
        ...noteData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const newNotes = [...notes, newNote];
      setNotes(newNotes);
      try {
        localStorage.setItem('notes', JSON.stringify(newNotes));
      } catch (error) {
        console.error('Error saving note to localStorage:', error);
      }
      return newNote.id;
    } catch (error) {
      console.error('Error adding note:', error);
      return 0;
    }
  };

  const updateNote = async (id, updates) => {
    try {
      const newNotes = notes.map(note => 
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      );
      setNotes(newNotes);
      try {
        localStorage.setItem('notes', JSON.stringify(newNotes));
      } catch (error) {
        console.error('Error saving updated note to localStorage:', error);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      const newNotes = notes.filter(note => note.id !== id);
      setNotes(newNotes);
      try {
        localStorage.setItem('notes', JSON.stringify(newNotes));
      } catch (error) {
        console.error('Error saving notes after deletion to localStorage:', error);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const addJournalEntry = async (entryData) => {
    try {
      const newEntry = {
        id: Date.now(),
        ...entryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const newEntries = [...journalEntries, newEntry];
      setJournalEntries(newEntries);
      try {
        localStorage.setItem('journalEntries', JSON.stringify(newEntries));
      } catch (error) {
        console.error('Error saving journal entry to localStorage:', error);
      }
      return newEntry.id;
    } catch (error) {
      console.error('Error adding journal entry:', error);
      return 0;
    }
  };

  const updateJournalEntry = async (id, updates) => {
    try {
      const newEntries = journalEntries.map(entry => 
        entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
      );
      setJournalEntries(newEntries);
      try {
        localStorage.setItem('journalEntries', JSON.stringify(newEntries));
      } catch (error) {
        console.error('Error saving updated journal entry to localStorage:', error);
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  const deleteJournalEntry = async (id) => {
    try {
      const newEntries = journalEntries.filter(entry => entry.id !== id);
      setJournalEntries(newEntries);
      try {
        localStorage.setItem('journalEntries', JSON.stringify(newEntries));
      } catch (error) {
        console.error('Error saving journal entries after deletion to localStorage:', error);
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  const addResource = async (resourceData) => {
    try {
      const newResource = {
        id: Date.now(),
        ...resourceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const newResources = [...resources, newResource];
      setResources(newResources);
      try {
        localStorage.setItem('resources', JSON.stringify(newResources));
      } catch (error) {
        console.error('Error saving resource to localStorage:', error);
      }
      return newResource.id;
    } catch (error) {
      console.error('Error adding resource:', error);
      return 0;
    }
  };

  const updateResource = async (id, updates) => {
    try {
      const newResources = resources.map(resource => 
        resource.id === id ? { ...resource, ...updates, updatedAt: new Date().toISOString() } : resource
      );
      setResources(newResources);
      try {
        localStorage.setItem('resources', JSON.stringify(newResources));
      } catch (error) {
        console.error('Error saving updated resource to localStorage:', error);
      }
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const deleteResource = async (id) => {
    try {
      const newResources = resources.filter(resource => resource.id !== id);
      setResources(newResources);
      try {
        localStorage.setItem('resources', JSON.stringify(newResources));
      } catch (error) {
        console.error('Error saving resources after deletion to localStorage:', error);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      // Reload data from localStorage
      const savedPlan = localStorage.getItem('plan');
      const savedProgress = localStorage.getItem('progress');
      const savedNotes = localStorage.getItem('notes');
      const savedJournal = localStorage.getItem('journalEntries');
      const savedResources = localStorage.getItem('resources');
      const savedTaskEvaluations = localStorage.getItem('taskEvaluations');
      const savedWeekEvaluations = localStorage.getItem('weekEvaluations');
      
      if (savedPlan) setPlan(JSON.parse(savedPlan));
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
      if (savedResources) setResources(JSON.parse(savedResources));
      if (savedTaskEvaluations) setTaskEvaluations(JSON.parse(savedTaskEvaluations));
      if (savedWeekEvaluations) setWeekEvaluations(JSON.parse(savedWeekEvaluations));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        plan,
        progress,
        notes,
        journalEntries,
        resources,
        taskEvaluations,
        weekEvaluations,
        language,
        theme
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
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const importData = async (data) => {
    try {
      const importedData = JSON.parse(data);
      if (importedData.plan) setPlan(importedData.plan);
      if (importedData.progress) setProgress(importedData.progress);
      if (importedData.notes) setNotes(importedData.notes);
      if (importedData.journalEntries) setJournalEntries(importedData.journalEntries);
      if (importedData.resources) setResources(importedData.resources);
      if (importedData.taskEvaluations) setTaskEvaluations(importedData.taskEvaluations);
      if (importedData.weekEvaluations) setWeekEvaluations(importedData.weekEvaluations);
      
      // Save to localStorage
      localStorage.setItem('plan', JSON.stringify(importedData.plan || []));
      localStorage.setItem('progress', JSON.stringify(importedData.progress || []));
      localStorage.setItem('notes', JSON.stringify(importedData.notes || []));
      localStorage.setItem('journalEntries', JSON.stringify(importedData.journalEntries || []));
      localStorage.setItem('resources', JSON.stringify(importedData.resources || []));
      localStorage.setItem('taskEvaluations', JSON.stringify(importedData.taskEvaluations || []));
      localStorage.setItem('weekEvaluations', JSON.stringify(importedData.weekEvaluations || []));
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const clearAllData = async () => {
    try {
      if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء غير قابل للتراجع.')) {
        setPlan([]);
        setProgress([]);
        setNotes([]);
        setJournalEntries([]);
        setResources([]);
        setTaskEvaluations([]);
        setWeekEvaluations([]);
        
        // Clear localStorage
        localStorage.removeItem('plan');
        localStorage.removeItem('progress');
        localStorage.removeItem('notes');
        localStorage.removeItem('journalEntries');
        localStorage.removeItem('resources');
        localStorage.removeItem('taskEvaluations');
        localStorage.removeItem('weekEvaluations');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  // Add or update a single task evaluation
  const addOrUpdateTaskEvaluation = (evaluation) => {
    try {
      setTaskEvaluations((prev) => {
        const index = prev.findIndex(
          (e) => e.taskId === evaluation.taskId && e.weekId === evaluation.weekId
        );
        let next;
        if (index >= 0) {
          next = [...prev];
          next[index] = { ...prev[index], ...evaluation };
        } else {
          next = [...prev, evaluation];
        }
        try {
          localStorage.setItem('taskEvaluations', JSON.stringify(next));
        } catch (error) {
          console.error('Error saving task evaluation to localStorage:', error);
        }
        return next;
      });
    } catch (error) {
      console.error('Error updating task evaluation:', error);
    }
  };

  // Add or update a single week evaluation
  const addOrUpdateWeekEvaluation = (evaluation) => {
    try {
      setWeekEvaluations((prev) => {
        const index = prev.findIndex(
          (e) => e.weekId === evaluation.weekId
        );
        let next;
        if (index >= 0) {
          next = [...prev];
          next[index] = { ...prev[index], ...evaluation };
        } else {
          next = [...prev, evaluation];
        }
        try {
          localStorage.setItem('weekEvaluations', JSON.stringify(next));
        } catch (error) {
          console.error('Error saving week evaluation to localStorage:', error);
        }
        return next;
      });
    } catch (error) {
      console.error('Error updating week evaluation:', error);
    }
  };

  // Create context value
  const contextValue = {
    // State
    language,
    theme,
    loading,
    plan,
    progress,
    notes,
    journalEntries,
    resources,
    taskEvaluations,
    weekEvaluations,
    
    // Functions
    setLanguage,
    setTheme,
    toggleTheme,
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
    refreshData,
    exportData,
    importData,
    clearAllData,
    addOrUpdateTaskEvaluation,
    addOrUpdateWeekEvaluation,
  };

  return (
    <SimpleAppContext.Provider value={contextValue}>
      {children}
    </SimpleAppContext.Provider>
  );
};

// Hook to use the context
export const useSimpleApp = () => {
  const context = useContext(SimpleAppContext);
  
  if (!context) {
    console.error('useSimpleApp must be used within SimpleAppProvider');
    return defaultState;
  }
  
  return context;
};