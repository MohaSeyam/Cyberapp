import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import CyberPlan from "./pages/CyberPlan";
import Journal from "./pages/Journal";
import Notebook from "./pages/Notebook";
import Achievements from "./pages/Achievements";
import DayViewPage from "./pages/DayView/DayViewPage";
import WeekView from "./pages/WeekView";
import PhaseView from "./pages/PhaseView";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import { Toaster } from "react-hot-toast";
import PlanPhases from "./pages/PlanPhases";
import Settings from "./pages/Settings";
import { useState, useEffect } from "react";

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



export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="plan" element={<CyberPlan />} />
                    <Route path="journal" element={<Journal />} />
                    <Route path="phase/:phaseId" element={<PhaseView />} />
                    <Route path="week/:weekId" element={<WeekView />} />
                    <Route path="day/:weekId/:dayKey" element={<DayViewPage />} />
                    <Route path="notebook" element={<Notebook />} />
                    <Route path="achievements" element={<Achievements />} />
                    <Route path="phases" element={<PlanPhases />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </AppProvider>
          </ThemeProvider>
      </div>
    </ErrorBoundary>
  );
}
