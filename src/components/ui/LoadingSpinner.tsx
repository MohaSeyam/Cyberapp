import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
}

// Memoized LoadingSpinner component for better performance
const LoadingSpinner = React.memo(({ 
  size = 'md', 
  color = 'primary', 
  className = "",
  text
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton loading component for better UX
export const SkeletonLoader = React.memo(({ 
  className = "",
  lines = 3 
}: { className?: string; lines?: number }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 ${
            index === 0 ? 'w-3/4' : index === 1 ? 'w-1/2' : 'w-2/3'
          }`}
        />
      ))}
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

// Card skeleton for better loading states
export const CardSkeleton = React.memo(() => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
      </div>
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

export default LoadingSpinner;