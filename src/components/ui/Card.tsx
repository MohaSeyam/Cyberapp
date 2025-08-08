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
  dir?: 'rtl' | 'ltr'; // أضف خاصية الاتجاه
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
  const direction = typeof window !== 'undefined' && document?.documentElement?.dir ? document.documentElement.dir : 'ltr';
  
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
        <div className={`${pageLayouts.card.header}`} dir={direction}>
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white rtl:text-right">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 rtl:text-right">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={`${pageLayouts.card.body}`} dir={direction}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className={`${pageLayouts.card.footer}`} dir={direction}>
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
        dir={direction}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      {...animations.scaleIn}
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      dir={direction}
    >
      {cardContent}
    </motion.div>
  );
}