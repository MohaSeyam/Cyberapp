import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LanguageProvider from './components/layout/LanguageProvider';
import { ErrorBoundary } from 'react-error-boundary';

// Font size and theme application
const applyAppSettings = () => {
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
  const fontSize = settings.fontSize || 'medium';
  const compactMode = settings.compactMode || false;
  
  // Apply font size
  document.documentElement.className = document.documentElement.className
    .replace(/text-size-\w+/g, '')
    .replace(/compact-mode/g, '');
  
  document.documentElement.classList.add(`text-size-${fontSize}`);
  if (compactMode) {
    document.documentElement.classList.add('compact-mode');
  }
};

function ErrorFallback({ error }) {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">حدث خطأ غير متوقع</h2>
      <p>{error?.message || 'يرجى إعادة تحميل الصفحة أو المحاولة لاحقًا.'}</p>
    </div>
  );
}

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const PhasesPage = lazy(() => import('./pages/PhasesPage'));
const PhaseWeeksPage = lazy(() => import('./components/phases/PhaseWeeksPage'));
const DaysPage = lazy(() => import('./components/days/DaysPage'));
const DayViewPage = lazy(() => import('./components/days/DayViewPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NoteViewPage = lazy(() => import('./pages/NoteViewPage'));
const JournalViewPage = lazy(() => import('./pages/JournalViewPage'));
const NoteEditPage = lazy(() => import('./pages/NoteEditPage'));
const JournalEditPage = lazy(() => import('./pages/JournalEditPage'));
const FeaturesDemoPage = lazy(() => import('./pages/FeaturesDemoPage'));

function App() {
  useEffect(() => {
    const handleSettingsChange = () => {
      // Apply settings when they change
      applyAppSettings();
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    
    // Apply initial settings
    applyAppSettings();
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  return (
    <AppProvider>
      <LanguageProvider>
        <Router>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingSpinner />}>
              <Toaster />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/phases" element={<PhasesPage />} />
                <Route path="/phase/:phaseId" element={<PhaseWeeksPage />} />
                <Route path="/day/:weekId/:dayIndex" element={<DayViewPage />} />
                <Route path="/days/:weekId" element={<DaysPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/note/:noteId" element={<NoteViewPage />} />
                <Route path="/note/:noteId/edit" element={<NoteEditPage />} />
                <Route path="/journal-entry/:entryId" element={<JournalViewPage />} />
                <Route path="/journal-entry/:entryId/edit" element={<JournalEditPage />} />
                <Route path="/features" element={<FeaturesDemoPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </LanguageProvider>
    </AppProvider>
  );
}

export default App;
