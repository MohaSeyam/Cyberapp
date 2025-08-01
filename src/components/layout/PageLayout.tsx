// Unified Page Layout Component
import React from 'react';
import { motion } from 'framer-motion';
import { pageLayouts, animations } from '../../constants/theme';
import MobileBottomBar from './MobileBottomBar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBottomBar?: boolean;
}

export default function PageLayout({
  children,
  title,
  subtitle,
  description,
  header,
  footer,
  className = '',
  showHeader = false,
  showFooter = true,
  showBottomBar = true
}: PageLayoutProps) {
  return (
    <div className={`${pageLayouts.container} ${className}`}>
      {/* Page Header - Only show if showHeader is true or header is provided */}
      {(showHeader || header) && (
        <motion.header
          {...animations.fadeIn}
          className={pageLayouts.header}
        >
          {header || (
            <>
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-gray-500 dark:text-gray-500 mt-4 max-w-3xl">
                  {description}
                </p>
              )}
            </>
          )}
        </motion.header>
      )}

      {/* Main Content */}
      <motion.main
        {...animations.fadeIn}
        transition={{ delay: 0.1 }}
        className={`${pageLayouts.main} ${showBottomBar ? 'pb-20 lg:pb-0' : ''}`}
      >
        {children}
      </motion.main>

      {/* Page Footer */}
      {showFooter && footer && (
        <motion.footer
          {...animations.fadeIn}
          transition={{ delay: 0.2 }}
          className={pageLayouts.footer}
        >
          {footer}
        </motion.footer>
      )}

      {/* Mobile Bottom Bar */}
      {showBottomBar && <MobileBottomBar />}
    </div>
  );
}