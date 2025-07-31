// Unified Card Component
import React from 'react';
import { motion } from 'framer-motion';
import { pageLayouts, animations } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  header,
  footer,
  className = '',
  variant = 'default',
  hover = false,
  onClick
}: CardProps) {
  const baseClasses = pageLayouts.card.base;
  
  const variantClasses = {
    default: '',
    elevated: 'shadow-xl hover:shadow-2xl',
    outlined: 'shadow-none border-2'
  };

  const hoverClasses = hover ? 'hover:scale-105 transition-transform duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const cardContent = (
    <>
      {/* Card Header */}
      {(header || title || subtitle) && (
        <div className={pageLayouts.card.header}>
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={pageLayouts.card.body}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className={pageLayouts.card.footer}>
          {footer}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.div
        {...animations.scaleIn}
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`}
        whileHover={hover ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      {...animations.scaleIn}
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
    >
      {cardContent}
    </motion.div>
  );
}