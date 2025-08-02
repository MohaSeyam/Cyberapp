import React from 'react';
import { useApp } from '../../context/AppContext';

interface RTLWrapperProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean; // If true, reverses the RTL behavior
}

export default function RTLWrapper({ children, className = '', reverse = false }: RTLWrapperProps) {
  const { lang } = useApp();
  const isRTL = lang === 'ar';
  
  const getDirection = () => {
    if (reverse) {
      return isRTL ? 'ltr' : 'rtl';
    }
    return isRTL ? 'rtl' : 'ltr';
  };

  return (
    <div 
      className={`${className} ${isRTL ? 'rtl-container' : ''}`}
      style={{ direction: getDirection() }}
    >
      {children}
    </div>
  );
}