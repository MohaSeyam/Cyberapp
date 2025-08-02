import React, { useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const { language } = useLocalization();

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    
    // Add RTL container class for styling
    if (language === 'ar') {
      document.body.classList.add('rtl-container');
      document.body.classList.add('arabic-font');
    } else {
      document.body.classList.remove('rtl-container');
      document.body.classList.remove('arabic-font');
    }
  }, [language]);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail;
      document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', newLang);
      
      if (newLang === 'ar') {
        document.body.classList.add('rtl-container');
        document.body.classList.add('arabic-font');
      } else {
        document.body.classList.remove('rtl-container');
        document.body.classList.remove('arabic-font');
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  return <>{children}</>;
}