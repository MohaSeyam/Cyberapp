// Unified Page Layout Component
import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../../constants/theme';
import MobileBottomBar from './MobileBottomBar';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLocalization } from '../../hooks/useLocalization';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBottomBar?: boolean;
  headerAction?: React.ReactNode;
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  showHeader = true,
  showBottomBar = true,
  headerAction
}: PageLayoutProps) {
  const { language } = useLocalization();
  // Sidebar placement: right for Arabic, left for English
  const sidebarPosition = language === 'ar' ? 'right-0' : 'left-0';
  const contentMargin = language === 'ar' ? 'lg:mr-64' : 'lg:ml-64';
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar />
      {/* Sidebar for large screens */}
      <div className={`hidden lg:block fixed top-0 ${sidebarPosition} h-full z-30`}>
        <Sidebar />
      </div>
      {/* Main Content */}
      <main className={`${showBottomBar ? 'pb-20 lg:pb-0' : ''} relative z-10 ${contentMargin}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showHeader && title && (
            <motion.div {...animations.fadeIn} className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
                {headerAction && (
                  <div className="flex items-center">
                    {headerAction}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          <motion.div {...animations.fadeIn}>
            {children}
          </motion.div>
        </div>
      </main>
      {/* Mobile Bottom Bar */}
      {showBottomBar && <MobileBottomBar />}
    </div>
  );
}