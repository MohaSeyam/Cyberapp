import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LanguageProvider from './components/layout/LanguageProvider';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const PhasesPage = lazy(() => import('./pages/PhasesPage'));
const PhaseWeeksPage = lazy(() => import('./components/phases/PhaseWeeksPage'));
const DaysPage = lazy(() => import('./components/days/DaysPage'));
const DayViewPage = lazy(() => import('./components/days/DayViewPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ExportPage = lazy(() => import('./pages/ExportPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NoteViewPage = lazy(() => import('./pages/NoteViewPage'));
const JournalViewPage = lazy(() => import('./pages/JournalViewPage'));
const NoteEditPage = lazy(() => import('./pages/NoteEditPage'));
const JournalEditPage = lazy(() => import('./pages/JournalEditPage'));
const FeaturesDemoPage = lazy(() => import('./pages/FeaturesDemoPage'));

function App() {
  const [key, setKey] = useState(0);

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
    <AppProvider>
      <LanguageProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Toaster />
            <Routes key={key}>
              <Route path="/" element={<HomePage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/export" element={<ExportPage />} />
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
        </Router>
      </LanguageProvider>
    </AppProvider>
  );
}

export default App;
