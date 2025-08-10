import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from './context/LocalizationContext';
import { AppProvider } from './context/AppContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorFallback from './components/ui/ErrorFallback';

// Custom Error Boundary
class CustomErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Custom Error Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

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
  // Global error handler
  React.useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error caught:', event.error);
      // Prevent the error from being logged to console
      event.preventDefault();
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent the error from being logged to console
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
    setTimeout(() => {
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
    }, 100);
    
    // Force initial direction update
    setTimeout(() => {
      const savedLanguage = localStorage.getItem('language') || 'ar';
      const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = initialDirection;
      document.documentElement.style.direction = initialDirection;
      document.documentElement.offsetHeight; // Force reflow
      
      // Update app root element
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.dir = initialDirection;
        appRoot.style.direction = initialDirection;
        appRoot.offsetHeight; // Force reflow
      }
    }, 200);
    
    // Force initial direction update
    setTimeout(() => {
      const savedLanguage = localStorage.getItem('language') || 'ar';
      const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = initialDirection;
      document.documentElement.style.direction = initialDirection;
      document.documentElement.offsetHeight; // Force reflow
      
      // Update app root element
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.dir = initialDirection;
        appRoot.style.direction = initialDirection;
        appRoot.offsetHeight; // Force reflow
      }
    }, 200);
    
    // Force initial direction update
    setTimeout(() => {
      const savedLanguage = localStorage.getItem('language') || 'ar';
      const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = initialDirection;
      document.documentElement.style.direction = initialDirection;
      document.documentElement.offsetHeight; // Force reflow
      
      // Update app root element
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.dir = initialDirection;
        appRoot.style.direction = initialDirection;
        appRoot.offsetHeight; // Force reflow
      }
      
      console.log('Initial direction update completed:', initialDirection);
    }, 200);
    
    // Force re-render after all updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Force re-render event dispatched');
    }, 300);
    
    // Force re-render after all updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Force re-render event dispatched');
    }, 300);
    
    // Final direction update
    setTimeout(() => {
      const savedLanguage = localStorage.getItem('language') || 'ar';
      const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = initialDirection;
      document.documentElement.style.direction = initialDirection;
      document.documentElement.offsetHeight; // Force reflow
      
      // Update app root element
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.dir = initialDirection;
        appRoot.style.direction = initialDirection;
        appRoot.offsetHeight; // Force reflow
      }
      
      console.log('Final direction update completed:', initialDirection);
    }, 500);
    
    // Force re-render after all updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Force re-render event dispatched');
    }, 600);
    
    // Force re-render after all updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Force re-render event dispatched');
    }, 600);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Final language change event dispatched');
    }, 700);
    
    // Force final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('Final reflow completed');
    }, 800);
    
    // Force final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('Final reflow completed');
    }, 800);
    
    // Final CSS class update
    setTimeout(() => {
      const savedLanguage = localStorage.getItem('language') || 'ar';
      const initialDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.classList.remove('rtl', 'ltr');
      document.documentElement.classList.add(initialDirection);
      console.log('Final CSS class update completed:', initialDirection);
    }, 900);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Language initialization sequence completed');
    }, 1000);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Language initialization sequence completed');
    }, 1000);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Language initialization sequence completed');
    }, 1000);
    
    // Force one more re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Final force re-render event dispatched');
    }, 1100);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final language change event dispatched');
    }, 1200);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('Final language change event dispatched');
    }, 1200);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('Final reflow completed');
    }, 1300);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('Final reflow completed');
    }, 1300);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Complete language initialization sequence finished');
    }, 1400);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 1500);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 1500);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final language change event dispatched');
    }, 1600);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 1700);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 1700);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Complete language initialization sequence finished');
    }, 1800);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 1900);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 1900);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final language change event dispatched');
    }, 2000);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 2100);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 2100);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Complete language initialization sequence finished');
    }, 2200);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 2300);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 2300);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final language change event dispatched');
    }, 2400);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 2500);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 2500);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Complete language initialization sequence finished');
    }, 2600);
    
    // Force one final re-render
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRerender', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final force re-render event dispatched');
    }, 2700);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final language change event dispatched');
    }, 2800);
    
    // Final language change event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: localStorage.getItem('language') || 'ar', 
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr' 
        } 
      }));
      console.log('One final language change event dispatched');
    }, 2800);
    
    // Final reflow
    setTimeout(() => {
      document.documentElement.offsetHeight; // Force reflow
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.offsetHeight; // Force reflow
      }
      console.log('One final reflow completed');
    }, 2900);
    
    // Final language initialization complete
    setTimeout(() => {
      console.log('Complete language initialization sequence finished');
    }, 3000);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <LocalizationProvider>
      <AppProvider>
        <CustomErrorBoundary>
          <Router>
            <div 
              className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
              id="app-root"
            >
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
        </CustomErrorBoundary>
      </AppProvider>
    </LocalizationProvider>
  );
}

export default App;
