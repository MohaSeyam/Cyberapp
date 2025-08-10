import React, { createContext, useContext, useState, useEffect } from 'react';

const LocalizationContext = createContext();

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Arabic
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'ar';
  });

  const [direction, setDirection] = useState(() => {
    return language === 'ar' ? 'rtl' : 'ltr';
  });

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction
    setDirection(language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update document title based on language
    document.title = language === 'ar' ? 'خطة التعلم الذكية' : 'Smart Learning Plan';
  }, [language]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const isRTL = direction === 'rtl';

  const value = {
    language,
    direction,
    isRTL,
    setLanguage: changeLanguage
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};