import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className="relative">
        {/* Shield Background */}
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg shadow-lg flex items-center justify-center">
          {/* Shield Icon */}
          <svg 
            className="w-3/4 h-3/4 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
        </div>
        
        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs">CS</span>
        </div>
      </div>
    </div>
  );
}