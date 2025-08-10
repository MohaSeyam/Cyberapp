import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300 font-mono">
              {error.message || 'خطأ غير معروف'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;