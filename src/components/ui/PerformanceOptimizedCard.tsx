import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

interface PerformanceOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  animation?: boolean;
}

const PerformanceOptimizedCard = memo(({
  children,
  className = '',
  onClick,
  hover = true,
  loading = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  animation = true
}: PerformanceOptimizedCardProps) => {
  // Memoized class names
  const cardClasses = useMemo(() => {
    const baseClasses = 'rounded-lg border transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg',
      outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
      filled: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
    };
    
    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };
    
    const hoverClasses = hover && !disabled && !loading 
      ? 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer' 
      : '';
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    const loadingClasses = loading ? 'animate-pulse' : '';
    
    return [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      hoverClasses,
      disabledClasses,
      loadingClasses,
      className
    ].filter(Boolean).join(' ');
  }, [variant, size, hover, disabled, loading, className]);

  // Memoized click handler
  const handleClick = useCallback(() => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  }, [disabled, loading, onClick]);

  // Memoized animation props
  const animationProps = useMemo(() => {
    if (!animation) return {};
    
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 }
    };
  }, [animation]);

  const CardComponent = animation ? motion.div : 'div';

  return (
    <CardComponent
      className={cardClasses}
      onClick={handleClick}
      {...(animation ? animationProps : {})}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      {children}
    </CardComponent>
  );
});

PerformanceOptimizedCard.displayName = 'PerformanceOptimizedCard';

export default PerformanceOptimizedCard;