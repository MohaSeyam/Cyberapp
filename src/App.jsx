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
import DayView from "./pages/DayView";
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
    console.error('Error boundary caught error:', error, errorInfo);
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

// Simple test component without context
function SimpleTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Simple Test Working!</h1>
        <p className="text-blue-500">Basic React rendering is working.</p>
      </div>
    </div>
  );
}

// Test component with ThemeProvider only
function ThemeTest() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Theme Provider Working!</h1>
          <p className="text-green-500">ThemeProvider is working.</p>
        </div>
      </div>
    </ThemeProvider>
  );
}

// Test component with both providers
function ContextTest() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen flex items-center justify-center bg-purple-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-600 mb-4">Context Providers Working!</h1>
            <p className="text-purple-500">Both ThemeProvider and AppProvider are working.</p>
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [testMode, setTestMode] = useState('simple'); // 'simple', 'theme', 'context', 'full'

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

  // Test different modes
  if (testMode === 'simple') {
    return (
      <ErrorBoundary>
        <SimpleTest />
      </ErrorBoundary>
    );
  }

  if (testMode === 'theme') {
    return (
      <ErrorBoundary>
        <ThemeTest />
      </ErrorBoundary>
    );
  }

  if (testMode === 'context') {
    return (
      <ErrorBoundary>
        <ContextTest />
      </ErrorBoundary>
    );
  }

  // Full app
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
                <Route path="/" element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                } />
                <Route path="/plan" element={
                  <MainLayout>
                    <CyberPlan />
                  </MainLayout>
                } />
                <Route path="/journal" element={
                  <MainLayout>
                    <Journal />
                  </MainLayout>
                } />
                <Route path="/phase/:phaseId" element={
                  <MainLayout>
                    <PhaseView />
                  </MainLayout>
                } />
                <Route path="/week/:weekId" element={
                  <MainLayout>
                    <WeekView />
                  </MainLayout>
                } />
                <Route path="/day/:weekId/:dayKey" element={
                  <MainLayout>
                    <DayView />
                  </MainLayout>
                } />
                <Route path="/notebook" element={
                  <MainLayout>
                    <Notebook />
                  </MainLayout>
                } />
                <Route path="/achievements" element={
                  <MainLayout>
                    <Achievements />
                  </MainLayout>
                } />
                <Route path="/phases" element={
                  <MainLayout>
                    <PlanPhases />
                  </MainLayout>
                } />
                <Route path="/settings" element={
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </ThemeProvider>
      </div>
    </ErrorBoundary>
  );
}
