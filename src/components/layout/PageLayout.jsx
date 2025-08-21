import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import { useTheme } from '../../context/ThemeContext';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FocusTimer from '../ui/FocusTimer';

const PageLayout = ({
  children,
  title,
  subtitle,
  showHeader = true,
  showBottomBar = true,
  className = '',
  ...props
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language, direction, isRTL } = localizationData;
  const safeLanguage = language || 'ar';
  
  // Get focus mode state
  const { isFocusMode } = useTheme();

  // Get font size from localStorage
  const fontSize = localStorage.getItem('fontSize') || 'md';
  const fontSizeClass = `text-size-${fontSize}`;

  // Ensure sidebar closed on small screens; do not auto-open on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainPadding = showBottomBar ? `pb-20 lg:pb-0 ${sidebarOpen ? 'lg:pl-64' : ''}` : '';

  return (
    <div 
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}
      dir={direction}
      style={{ direction }}
      {...props}
    >
      {/* Top Bar */}
      {showHeader && (
        <TopBar 
          onSidebarToggle={showBottomBar ? () => setSidebarOpen(!sidebarOpen) : undefined}
          sidebarOpen={sidebarOpen}
        />
      )}

      {/* Sidebar */}
      {showBottomBar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className={`${showHeader ? 'pt-20' : 'pt-4'} ${mainPadding}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              {title && (
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${fontSizeClass} ${isFocusMode ? 'main-content' : ''}`}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Focus Timer - Only when focus mode is active */}
      {isFocusMode && <FocusTimer />}

      {/* Bottom Navigation - Only on small screens */}
      {showBottomBar && (
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

export default PageLayout;