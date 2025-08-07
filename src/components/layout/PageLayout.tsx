// Unified Page Layout Component
import React, { ReactNode, useMemo } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomBar from './MobileBottomBar';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showBottomBar?: boolean;
  className?: string;
}

// Memoized PageLayout component for better performance
const PageLayout = React.memo(({ 
  children, 
  title, 
  subtitle, 
  showHeader = true, 
  showBottomBar = true,
  className = ""
}: PageLayoutProps) => {
  // Memoized header content
  const headerContent = useMemo(() => {
    if (!showHeader) return null;
    
    return (
      <div className="mb-6">
        {title && (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    );
  }, [showHeader, title, subtitle]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className={`${showBottomBar ? 'pb-20 lg:pb-0' : ''} relative z-10 flex-1 transition-all duration-300`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {headerContent}
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
      {/* Mobile Bottom Bar */}
      {showBottomBar && <MobileBottomBar />}
    </div>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;