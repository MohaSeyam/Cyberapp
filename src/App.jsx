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

// Debug component to test each part
function DebugComponent({ name, children }) {
  console.log(`Rendering ${name}`);
  try {
    return children;
  } catch (error) {
    console.error(`Error in ${name}:`, error);
    return (
      <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded">
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
        <DebugComponent name="ThemeProvider">
          <ThemeProvider>
            <DebugComponent name="AppProvider">
              <AppProvider>
                <DebugComponent name="BrowserRouter">
                  <BrowserRouter>
                    <DebugComponent name="Toaster">
                      <Toaster
                        position="top-center"
                        toastOptions={{
                          style: { fontFamily: 'Tajawal, sans-serif', fontSize: 16 },
                          duration: 2500,
                        }}
                      />
                    </DebugComponent>
                    <DebugComponent name="Routes">
                      <Routes>
                        <Route path="/" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="Dashboard">
                                <Dashboard />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/plan" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="CyberPlan">
                                <CyberPlan />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/journal" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="Journal">
                                <Journal />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/phase/:phaseId" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="PhaseView">
                                <PhaseView />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/week/:weekId" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="WeekView">
                                <WeekView />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/day/:weekId/:dayKey" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="DayView">
                                <DayView />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/notebook" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="Notebook">
                                <Notebook />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/achievements" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="Achievements">
                                <Achievements />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/phases" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="PlanPhases">
                                <PlanPhases />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="/settings" element={
                          <DebugComponent name="MainLayout">
                            <MainLayout>
                              <DebugComponent name="Settings">
                                <Settings />
                              </DebugComponent>
                            </MainLayout>
                          </DebugComponent>
                        } />
                        <Route path="*" element={
                          <DebugComponent name="NotFound">
                            <NotFound />
                          </DebugComponent>
                        } />
                      </Routes>
                    </DebugComponent>
                  </BrowserRouter>
                </DebugComponent>
              </AppProvider>
            </DebugComponent>
          </ThemeProvider>
        </DebugComponent>
      </div>
    </ErrorBoundary>
  );
}
