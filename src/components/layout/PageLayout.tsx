// Unified Page Layout Component
import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { pageLayouts, animations } from '../../constants/theme';

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
}

export default function PageLayout({
  children,
  title,
  subtitle,
  description,
  header,
  footer,
  className = '',
  showHeader = true,
  showFooter = false
}: PageLayoutProps) {
  const { lang } = useApp();

  return (
    <div className={`${pageLayouts.default.container} ${className}`}>
      {/* Page Header */}
      {showHeader && (
        <motion.header
          {...animations.fadeIn}
          className={pageLayouts.default.header}
        >
          <div className={pageLayouts.default.maxWidth}>
            <div className="px-6 py-6 sm:px-8">
              {header || (
                <>
                  {title && (
                    <motion.h1
                      {...animations.slideIn}
                      className={`text-3xl font-bold text-gray-900 dark:text-white ${
                        lang === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {title}
                    </motion.h1>
                  )}
                  {subtitle && (
                    <motion.p
                      {...animations.slideIn}
                      transition={{ delay: 0.1 }}
                      className={`text-lg text-gray-600 dark:text-gray-400 mt-2 ${
                        lang === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {subtitle}
                    </motion.p>
                  )}
                  {description && (
                    <motion.p
                      {...animations.slideIn}
                      transition={{ delay: 0.2 }}
                      className={`text-gray-500 dark:text-gray-400 mt-2 ${
                        lang === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {description}
                    </motion.p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.header>
      )}

      {/* Page Content */}
      <main className={pageLayouts.default.content}>
        <div className={pageLayouts.default.maxWidth}>
          <motion.div
            {...animations.fadeIn}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Page Footer */}
      {showFooter && footer && (
        <motion.footer
          {...animations.fadeIn}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        >
          <div className={pageLayouts.default.maxWidth}>
            <div className="px-6 py-6 sm:px-8">
              {footer}
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
}