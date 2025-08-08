import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  variant?: 'default' | 'pulse' | 'dots' | 'bars';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'جاري التحميل...',
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full`}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [20, 40, 20],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-2 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 border-r-purple-600 border-b-indigo-600 rounded-full`}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      {/* Background Animation */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-full blur-xl"
      />

      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* Main Spinner */}
        <div className="relative">
          {renderSpinner()}
          
          {/* Orbiting Elements */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full" />
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full" />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-500 rounded-full" />
          </motion.div>
        </div>

        {/* Loading Text */}
        {text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={`text-center ${textSizes[size]}`}
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-gray-600 dark:text-gray-400 font-medium"
            >
              {text}
            </motion.p>
            
            {/* Progress Dots */}
            <div className="flex justify-center mt-2 space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                  className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;