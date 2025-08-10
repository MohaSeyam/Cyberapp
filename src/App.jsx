import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { LocalizationProvider } from './context/LocalizationContext';
import { AppProvider } from './context/AppContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorFallback from './components/ui/ErrorFallback';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const PhasesPage = lazy(() => import('./pages/PhasesPage'));
const PhaseWeeksPage = lazy(() => import('./pages/PhaseWeeksPage'));
const DaysPage = lazy(() => import('./pages/DaysPage'));
const DayViewPage = lazy(() => import('./pages/DayViewPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const NoteEditPage = lazy(() => import('./pages/NoteEditPage'));
const NoteViewPage = lazy(() => import('./pages/NoteViewPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const JournalEditPage = lazy(() => import('./pages/JournalEditPage'));
const JournalViewPage = lazy(() => import('./pages/JournalViewPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LocalizationProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/phases" element={<PhasesPage />} />
                  <Route path="/phase/:phaseId" element={<PhaseWeeksPage />} />
                  <Route path="/week/:weekId" element={<DaysPage />} />
                  <Route path="/day/:weekId/:dayIndex" element={<DayViewPage />} />
                  
                  {/* Progress & Analytics */}
                  <Route path="/progress" element={<ProgressPage />} />
                  
                  {/* Notes Management */}
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/new" element={<NoteEditPage />} />
                  <Route path="/notes/:noteId" element={<NoteViewPage />} />
                  <Route path="/notes/:noteId/edit" element={<NoteEditPage />} />
                  
                  {/* Journal Management */}
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/journal/new" element={<JournalEditPage />} />
                  <Route path="/journal/:entryId" element={<JournalViewPage />} />
                  <Route path="/journal/:entryId/edit" element={<JournalEditPage />} />
                  
                  {/* Resources Management */}
                  <Route path="/resources" element={<ResourcesPage />} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Redirect old routes */}
                  <Route path="/plan" element={<Navigate to="/phases" replace />} />
                  <Route path="/weeks" element={<Navigate to="/phases" replace />} />
                  <Route path="/days" element={<Navigate to="/phases" replace />} />
                  
                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AppProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}

export default App;
