// Unified Page Layout Component
import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../../constants/theme';
import MobileBottomBar from './MobileBottomBar';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBottomBar?: boolean;
  headerAction?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  showHeader = true,
  showBottomBar = true,
  headerAction,
  titleClassName = "text-3xl font-bold text-gray-900 dark:text-white mb-2",
  subtitleClassName = "text-lg text-gray-600 dark:text-gray-400"
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className={`${showBottomBar ? 'pb-20 lg:pb-0' : ''} relative z-10`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${showHeader ? 'py-6' : 'pt-6'}`}>
          {showHeader && title && (
            <motion.div {...animations.fadeIn} className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={titleClassName}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={subtitleClassName}>
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