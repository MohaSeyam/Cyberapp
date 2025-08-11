import React from 'react';

const Skeleton = ({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height, 
  animation = 'pulse',
  lines = 1,
  spacing = 'normal'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 rounded';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
    shimmer: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
  };

  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3',
    loose: 'space-y-4'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`${spacingClasses[spacing]} ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`
              ${baseClasses} 
              ${animationClasses[animation]}
              ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            `}
            style={{
              height: height || '1rem',
              width: index === lines - 1 ? '75%' : width || '100%'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={`
          ${baseClasses} 
          ${animationClasses[animation]}
          ${className}
        `}
        style={{
          width: width || height || '2rem',
          height: height || width || '2rem',
          borderRadius: '50%'
        }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${animationClasses[animation]} ${className}`}>
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`${className}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex space-x-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`
                  ${baseClasses} 
                  ${animationClasses[animation]}
                  h-4 rounded
                `}
                style={{ width: index === 0 ? '20%' : index === 1 ? '30%' : index === 2 ? '25%' : '25%' }}
              />
            ))}
          </div>
          
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-3">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`
                    ${baseClasses} 
                    ${animationClasses[animation]}
                    h-4 rounded
                  `}
                  style={{ width: colIndex === 0 ? '20%' : colIndex === 1 ? '30%' : colIndex === 2 ? '25%' : '25%' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default rectangular skeleton
  return (
    <div
      className={`
        ${baseClasses} 
        ${animationClasses[animation]}
        ${className}
      `}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  );
};

// Specific skeleton components for common use cases
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <Skeleton variant="text" lines={lines} className={className} />
);

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <Skeleton 
      variant="circular" 
      className={`${sizeClasses[size]} ${className}`} 
    />
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <Skeleton variant="card" className={className} />
);

export const SkeletonListItem = ({ className = '' }) => (
  <Skeleton variant="list-item" className={className} />
);

export const SkeletonTable = ({ rows = 5, className = '' }) => (
  <Skeleton variant="table" className={className} />
);

export const SkeletonButton = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6'
  };
  
  return (
    <Skeleton 
      className={`${sizeClasses[size]} ${className}`} 
      height="auto"
    />
  );
};

export default Skeleton;