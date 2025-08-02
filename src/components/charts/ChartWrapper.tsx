import React from 'react';
import { useApp } from '../../context/AppContext';

interface ChartWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function ChartWrapper({ children, className = '' }: ChartWrapperProps) {
  const { lang } = useApp();
  const isRTL = lang === 'ar';

  return (
    <div 
      className={`chart-container ${className}`}
      style={{ 
        direction: 'ltr', // Charts should always be LTR
        textAlign: isRTL ? 'right' : 'left'
      }}
    >
      {children}
    </div>
  );
}