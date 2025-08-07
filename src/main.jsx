import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/main.css";

alert("main.jsx loaded!");

console.log("main.jsx loaded");

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Error boundary for the root
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Root error boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Application Error
            </h1>
            <p style={{ marginBottom: '16px' }}>
              Something went wrong. Please check the console for details.
            </p>
            <details style={{ marginBottom: '16px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '12px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
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

try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>
  );
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  
  // Fallback error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fef2f2;
        color: #dc2626;
        padding: 20px;
        font-family: Arial, sans-serif;
        text-align: center;
      ">
        <div>
          <h1 style="font-size: 24px; margin-bottom: 16px;">
            Critical Application Error
          </h1>
          <p style="margin-bottom: 16px;">
            Failed to render the application. Please check the console for details.
          </p>
          <button 
            onclick="window.location.reload()"
            style="
              background-color: #dc2626;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
