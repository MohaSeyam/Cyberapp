import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CyberPlan from "./pages/CyberPlan";
import Journal from "./pages/Journal";
import PhaseView from "./pages/PhaseView";
import WeekView from "./pages/WeekView";
import DayView from "./pages/DayView";
import Notebook from "./pages/Notebook";
import Achievements from "./pages/Achievements";
import { Toaster } from "react-hot-toast";
import PlanPhases from "./pages/PlanPhases";
import Settings from "./pages/Settings";
import { useState, useEffect } from "react";

// Error Boundary Component
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
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500 mb-4">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

// Simple test component
function TestComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">App is working!</h1>
        <p className="text-blue-500">If you can see this, the basic setup is working.</p>
      </div>
    </div>
  );
}

// Simple Dashboard component for testing
function SimpleDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Dashboard is working!</h1>
        <p className="text-green-500">Dashboard component loaded successfully.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("App component mounted");
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <ThemeProvider>
          <AppProvider>
            <BrowserRouter>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: { fontFamily: 'Tajawal, sans-serif', fontSize: 16 },
                  duration: 2500,
                }}
              />
              <Routes>
                <Route path="/" element={<SimpleDashboard />} />
                <Route path="/plan" element={<CyberPlan />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/phase/:phaseId" element={<PhaseView />} />
                <Route path="/week/:weekId" element={<WeekView />} />
                <Route path="/day/:weekId/:dayKey" element={<DayView />} />
                <Route path="/notebook" element={<Notebook />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/phases" element={<PlanPhases />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </ThemeProvider>
      </div>
    </ErrorBoundary>
  );
}
