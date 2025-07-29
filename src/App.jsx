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

// Debug wrapper component
function DebugWrapper({ children, name }) {
  console.log(`Rendering ${name}`);
  try {
    return children;
  } catch (error) {
    console.error(`Error in ${name}:`, error);
    return (
      <div className="p-4 bg-red-100 text-red-700">
        Error rendering {name}: {error.message}
      </div>
    );
  }
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
        <DebugWrapper name="ThemeProvider">
          <ThemeProvider>
            <DebugWrapper name="AppProvider">
              <AppProvider>
                <DebugWrapper name="BrowserRouter">
                  <BrowserRouter>
                    <DebugWrapper name="Toaster">
                      <Toaster
                        position="top-center"
                        toastOptions={{
                          style: { fontFamily: 'Tajawal, sans-serif', fontSize: 16 },
                          duration: 2500,
                        }}
                      />
                    </DebugWrapper>
                    <DebugWrapper name="Routes">
                      <Routes>
                        <Route path="/" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="Dashboard">
                                <Dashboard />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/plan" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="CyberPlan">
                                <CyberPlan />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/journal" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="Journal">
                                <Journal />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/phase/:phaseId" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="PhaseView">
                                <PhaseView />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/week/:weekId" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="WeekView">
                                <WeekView />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/day/:weekId/:dayKey" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="DayView">
                                <DayView />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/notebook" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="Notebook">
                                <Notebook />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/achievements" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="Achievements">
                                <Achievements />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/phases" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="PlanPhases">
                                <PlanPhases />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="/settings" element={
                          <DebugWrapper name="MainLayout">
                            <MainLayout>
                              <DebugWrapper name="Settings">
                                <Settings />
                              </DebugWrapper>
                            </MainLayout>
                          </DebugWrapper>
                        } />
                        <Route path="*" element={
                          <DebugWrapper name="NotFound">
                            <NotFound />
                          </DebugWrapper>
                        } />
                      </Routes>
                    </DebugWrapper>
                  </BrowserRouter>
                </DebugWrapper>
              </AppProvider>
            </DebugWrapper>
          </ThemeProvider>
        </DebugWrapper>
      </div>
    </ErrorBoundary>
  );
}
