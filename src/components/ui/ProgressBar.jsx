import React from "react";

export default function ProgressBar({ 
  progress, 
  size = "md",
  variant = "default",
  showLabel = true,
  className = "" 
}) {
  const sizes = {
    sm: "h-2",
    md: "h-3", 
    lg: "h-4",
    xl: "h-6"
  };

  const variants = {
    default: "bg-gray-200 dark:bg-gray-700",
    primary: "bg-blue-200 dark:bg-blue-700",
    success: "bg-green-200 dark:bg-green-700",
    warning: "bg-yellow-200 dark:bg-yellow-700",
    danger: "bg-red-200 dark:bg-red-700"
  };

  const progressColors = {
    default: "bg-light-accent dark:bg-dark-accent",
    primary: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500"
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            التقدم
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className={`w-full ${sizes[size]} rounded-full ${variants[variant]} overflow-hidden`}>
        <div 
          className={`h-full ${progressColors[variant]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}