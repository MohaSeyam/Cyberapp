import React, { Suspense, lazy, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LanguageProvider from './components/layout/LanguageProvider';
import NavigationOptimizer from './components/layout/NavigationOptimizer';
import PerformanceOptimizer from './components/layout/PerformanceOptimizer';

// Font size and theme application - memoized for performance
const applyAppSettings = useCallback(() => {
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
}, []);

// Memoized ErrorFallback component
const ErrorFallback = React.memo(({ error }) => {
  return (
    <div className="p-8 text-center text-red-600 dark:text-red-400">
      <h2 className="text-2xl font-bold mb-4">حدث خطأ غير متوقع</h2>
      <p>{error?.message || 'يرجى إعادة تحميل الصفحة أو المحاولة لاحقًا.'}</p>
    </div>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

// Optimized ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent ? 
        <this.props.FallbackComponent error={this.state.error} /> : 
        <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Optimized lazy loading with preloading for critical pages
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

// Preload critical pages for faster navigation
const preloadCriticalPages = () => {
  // Preload HomePage and PhasesPage as they are most commonly accessed
  const preloadHome = () => import('./pages/HomePage');
  const preloadPhases = () => import('./pages/PhasesPage');
  
  // Use requestIdleCallback for non-critical preloading
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      preloadHome();
      preloadPhases();
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      preloadHome();
      preloadPhases();
    }, 1000);
  }
};

// Memoized App component
const App = React.memo(() => {
  useEffect(() => {
    const handleSettingsChange = () => {
      applyAppSettings();
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    
    // Apply initial settings
    applyAppSettings();
    
    // Preload critical pages
    preloadCriticalPages();
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  // Memoized routes for better performance
  const routes = useMemo(() => (
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
  ), []);

  return (
    <PerformanceOptimizer>
      <AppProvider>
        <LanguageProvider>
          <Router>
            <NavigationOptimizer>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                  {routes}
                </Suspense>
              </ErrorBoundary>
            </NavigationOptimizer>
          </Router>
        </LanguageProvider>
      </AppProvider>
    </PerformanceOptimizer>
  );
});

App.displayName = 'App';

export default App;
