import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SimpleLocalizationProvider } from './context/SimpleLocalizationContext';
import { SimpleAppProvider, useSimpleApp } from './context/SimpleAppContext';
import { useTheme } from './context/ThemeContext';
import { usePerformanceMonitor } from './hooks/usePerformance';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorFallback from './components/ui/ErrorFallback';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PerformanceMonitor from './components/ui/PerformanceMonitor';

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
const TestPage = lazy(() => import('./pages/TestPage'));

function App() {
  console.log('App component rendering...');
  
  const { theme } = useSimpleApp();
  const { theme: appTheme } = useTheme();
  const fontSize = localStorage.getItem('fontSize') || 'md';
  
  // Performance monitoring
  const performanceStats = usePerformanceMonitor();

  // Global error handler
  React.useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error caught:', event.error);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    // Language change handler
    const handleLanguageChange = (event) => {
      try {
        console.log('Language change detected in App:', event.detail);
        const { language, direction } = event.detail;
        
        // Update app root element
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
          appRoot.dir = direction;
          appRoot.style.direction = direction;
          appRoot.offsetHeight; // Force reflow
        }
        
        // Update document element
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
        document.documentElement.offsetHeight; // Force reflow
        
        // Add CSS classes for immediate visual feedback
        document.documentElement.classList.remove('rtl', 'ltr');
        document.documentElement.classList.add(direction);
        
        console.log('Language change applied:', language, 'direction:', direction);
      } catch (error) {
        console.error('Error in handleLanguageChange:', error);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('languageChanged', handleLanguageChange);

    // Initialize language direction on app load
    const savedLanguage = localStorage.getItem('language') || 'ar';
    const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    
    document.documentElement.dir = initialDirection;
    document.documentElement.lang = savedLanguage;
    document.documentElement.classList.add(initialDirection);
    
    // Update app root element
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.dir = initialDirection;
      appRoot.style.direction = initialDirection;
    }
    
    console.log('App initialized with language:', savedLanguage, 'direction:', initialDirection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Apply theme classes
  React.useEffect(() => {
    const currentTheme = appTheme || theme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme, theme]);

  // Apply font size class
  React.useEffect(() => {
    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  console.log('App component returning JSX...');

  try {
    return (
      <SimpleLocalizationProvider>
        <SimpleAppProvider>
          <ErrorBoundary>
            <Router>
              <div 
                className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
                id="app-root"
              >
                {/* Performance Monitor - Only in development */}
                {process.env.NODE_ENV === 'development' && (
                  <PerformanceMonitor stats={performanceStats} />
                )}
                
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Main Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/phases" element={<PhasesPage />} />
                    <Route path="/phases/:phaseId" element={<PhaseWeeksPage />} />
                    <Route path="/phases/:phaseId/weeks/:weekId" element={<DaysPage />} />
                    <Route path="/phases/:phaseId/weeks/:weekId/days/:dayKey" element={<DayViewPage />} />
                    
                    {/* Progress & Analytics */}
                    <Route path="/progress" element={<ProgressPage />} />
                    
                    {/* Notes Management */}
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/notes/new" element={<NoteEditPage />} />
                    <Route path="/notes/:id" element={<NoteViewPage />} />
                    <Route path="/notes/:id/edit" element={<NoteEditPage />} />
                    
                    {/* Journal Management */}
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/journal/new" element={<JournalEditPage />} />
                    <Route path="/journal/:id" element={<JournalViewPage />} />
                    <Route path="/journal/:id/edit" element={<JournalEditPage />} />
                    
                    {/* Resources Management */}
                    <Route path="/resources" element={<ResourcesPage />} />
                    
                    {/* Settings */}
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Test Page */}
                    <Route path="/test" element={<TestPage />} />
                    
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
          </ErrorBoundary>
        </SimpleAppProvider>
      </SimpleLocalizationProvider>
    );
  } catch (error) {
    console.error('Error in App component render:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ في التطبيق
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              عذراً، حدث خطأ أثناء تحميل التطبيق. يرجى تحديث الصفحة.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تحديث الصفحة
          </button>
        </div>
      </div>
    );
  }
}

console.log('App component exported successfully');

export default App;
