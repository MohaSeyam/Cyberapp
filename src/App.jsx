import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LanguageProvider from './components/layout/LanguageProvider';
import { ErrorBoundary } from 'react-error-boundary';
import NotificationSystem from './components/notifications/NotificationSystem';
import { useNotifications } from './hooks/useNotifications';

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
const PhaseWeeksPage = lazy(() => import('./pages/PhaseWeeksPage'));
const DaysPage = lazy(() => import('./pages/DaysPage'));
const DayViewPage = lazy(() => import('./pages/DayViewPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NoteViewPage = lazy(() => import('./pages/NoteViewPage'));
const JournalViewPage = lazy(() => import('./pages/JournalViewPage'));
const NoteEditPage = lazy(() => import('./pages/NoteEditPage'));
const JournalEditPage = lazy(() => import('./pages/JournalEditPage'));

function AppContent() {
  const [key, setKey] = useState(0);
  const { notifications, dismissNotification } = useNotifications();

  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render of all components when language changes
      setKey(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner size="xl" text="جاري تحميل التطبيق..." variant="pulse" />}>
          <Toaster />
          <NotificationSystem 
            notifications={notifications}
            onDismiss={dismissNotification}
            maxNotifications={5}
          />
          <Routes key={key}>
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
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AppProvider>
  );
}

export default App;
