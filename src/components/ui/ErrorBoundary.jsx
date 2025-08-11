import React from 'react';
import { useSimpleApp } from '../../context/SimpleAppContext';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import Button from './Button';
import Card from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // this.logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
    
    // Clear any cached data or reset app state
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, retryCount, onRetry, onReset }) => {
  const { language } = useSimpleLocalization();
  const { navigate } = useSimpleApp();

  const isArabic = language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isArabic ? 'حدث خطأ غير متوقع' : 'Unexpected Error'}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isArabic 
              ? 'عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.'
              : 'Sorry, an error occurred while loading the page. Please try again.'
            }
          </p>

          {retryCount > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {isArabic 
                ? `محاولات إعادة التحميل: ${retryCount}`
                : `Retry attempts: ${retryCount}`
              }
            </p>
          )}

          <div className="space-y-3">
            <Button 
              onClick={onRetry}
              className="w-full"
              variant="primary"
            >
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </Button>
            
            <Button 
              onClick={onReset}
              className="w-full"
              variant="secondary"
            >
              {isArabic ? 'إعادة تعيين' : 'Reset'}
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
              variant="outline"
            >
              {isArabic ? 'العودة للرئيسية' : 'Go Home'}
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                {isArabic ? 'تفاصيل الخطأ (للمطورين)' : 'Error Details (for developers)'}
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {error.toString()}
                </div>
                {errorInfo && errorInfo.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ErrorBoundary;