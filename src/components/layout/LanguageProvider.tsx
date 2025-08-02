import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const { lang } = useApp();

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    
    // Add RTL container class for styling
    if (lang === 'ar') {
      document.body.classList.add('rtl-container');
      document.body.classList.add('arabic-font');
    } else {
      document.body.classList.remove('rtl-container');
      document.body.classList.remove('arabic-font');
    }
  }, [lang]);

  return <>{children}</>;
}