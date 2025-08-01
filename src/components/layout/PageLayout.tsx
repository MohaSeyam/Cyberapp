// Unified Page Layout Component
import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../../constants/theme';
import TopNavBar from './TopNavBar';
import MobileBottomBar from './MobileBottomBar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBottomBar?: boolean;
  showTopNavBar?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  showHeader = true,
  showBottomBar = true,
  showTopNavBar = true,
  showBackButton = false,
  onBackClick
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Top Navigation Bar */}
      {showTopNavBar && (
        <TopNavBar 
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
        />
      )}

      {/* Main Content */}
      <main className={`${showTopNavBar ? 'pt-16' : ''} ${showBottomBar ? 'pb-20 lg:pb-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showHeader && title && (
            <motion.div {...animations.fadeIn} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
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