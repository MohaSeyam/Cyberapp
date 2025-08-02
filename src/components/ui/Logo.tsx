import React from 'react';
import geminiLogo from '../../assets/Gemini_Generated_Image_26mado26mado26ma.png';

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
      <img 
        src={geminiLogo} 
        alt="Gemini Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}