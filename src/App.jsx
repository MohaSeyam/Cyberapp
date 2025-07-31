import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import "./styles/fontSizes.css";
import Navigation from "./components/layout/Navigation";
import Sidebar from "./components/layout/Sidebar";
import BottomBar from "./components/layout/BottomBar";
import HomePage from "./pages/HomePage";
import DayViewPageEnhanced from "./pages/DayViewPageEnhanced";
import NotesPage from "./pages/NotesPage";
import JournalPage from "./pages/JournalPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import PlanPage from "./pages/PlanPage";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500 mb-4">Please check the console for details</p>
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-red-600">Error Details</summary>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// App Routes Component
function AppRoutes() {
  const { loading, plan, progress } = useApp();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show loading screen while data is being loaded
  if (loading) {
    return <LoadingScreen />;
  }

  // Show loading screen if plan is not loaded yet or is undefined
  if (!plan || !Array.isArray(plan) || plan.length === 0) {
    return <LoadingScreen />;
  }

  // Show loading screen if progress is not loaded yet or is undefined
  if (!progress || !Array.isArray(progress)) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navigation />
      <div className="flex lg:flex-row flex-col">
        {!isMobile && <Sidebar />}
        <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 lg:ml-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/day/:weekId/:dayIndex" element={<DayViewPageEnhanced />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      <BottomBar />
    </>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure everything is initialized
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <AppProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: { fontFamily: 'Tajawal, sans-serif', fontSize: 16 },
                duration: 2500,
              }}
            />
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </div>
    </ErrorBoundary>
  );
}
