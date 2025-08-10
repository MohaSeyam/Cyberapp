import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = '', 
  variant = 'spinner',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinnerVariants = {
    spinner: (
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
    ),
    pulse: (
      <div className={`animate-pulse bg-blue-600 rounded-full ${sizeClasses[size]}`} />
    ),
    dots: (
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    )
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {spinnerVariants[variant]}
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;