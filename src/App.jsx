import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import PerformanceMonitor from './components/ui/PerformanceMonitor';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const PhasesPage = lazy(() => import('./pages/PhasesPage'));
const WeeksPage = lazy(() => import('./pages/WeeksPage'));
const DayPage = lazy(() => import('./pages/DayPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const NoteViewPage = lazy(() => import('./pages/NoteViewPage'));
const NoteEditPage = lazy(() => import('./pages/NoteEditPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const JournalViewPage = lazy(() => import('./pages/JournalViewPage'));
const JournalEditPage = lazy(() => import('./pages/JournalEditPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const FeaturesDemoPage = lazy(() => import('./pages/FeaturesDemoPage'));

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

function App() {
  // Performance monitoring callback
  const handlePerformanceMetrics = (metrics) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics);
    }
    
    // Send metrics to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics tracking here
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AppProvider>
        <Router>
          <div className="App">
            {/* Performance Monitor */}
            <PerformanceMonitor 
              enabled={true}
              onMetricsUpdate={handlePerformanceMetrics}
              showDebug={process.env.NODE_ENV === 'development'}
            />
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            {/* Routes with Suspense */}
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/phases" element={<PhasesPage />} />
                <Route path="/phase/:phaseId" element={<WeeksPage />} />
                <Route path="/week/:weekId" element={<DayPage />} />
                <Route path="/day/:weekId/:dayKey" element={<DayPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/:id" element={<NoteViewPage />} />
                <Route path="/notes/:id/edit" element={<NoteEditPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/:id" element={<JournalViewPage />} />
                <Route path="/journal/:id/edit" element={<JournalEditPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/features" element={<FeaturesDemoPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
