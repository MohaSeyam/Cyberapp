import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Translation data
const translations = {
  missingWeeks: {
    ar: "أسابيع مفقودة",
    en: "Missing weeks"
  },
  dataLoadSuccess: {
    ar: "تم تحميل البيانات بنجاح",
    en: "Data loaded successfully"
  },
  planLoadFailed: {
    ar: "فشل في تحميل الخطة",
    en: "Failed to load plan"
  },
  dataLoadFailed: {
    ar: "فشل في تحميل البيانات",
    en: "Failed to load data"
  },
  refreshFailed: {
    ar: "فشل في تحديث البيانات",
    en: "Failed to refresh data"
  },
  updateDataFailed: {
    ar: "فشل في تحديث البيانات",
    en: "Failed to update data"
  },
  forceReloadSuccess: {
    ar: "تم إعادة تحميل البيانات بنجاح",
    en: "Data reloaded successfully"
  },
  forceReloadFailed: {
    ar: "فشل في إعادة تحميل البيانات",
    en: "Failed to reload data"
  },
  fixWeeksSuccess: {
    ar: "تم إصلاح الأسابيع المفقودة بنجاح",
    en: "Missing weeks fixed successfully"
  },
  fixWeeksFailed: {
    ar: "فشل في إصلاح الأسابيع المفقودة",
    en: "Failed to fix missing weeks"
  }
};

const LocalizationContext = createContext({
  language: 'ar',
  direction: 'rtl',
  isRTL: true,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key
});

export const useLocalization = () => {
  try {
    const context = useContext(LocalizationContext);
    // Since we now have a default value, context should never be undefined
    // But we'll still add safety checks for the context values
    return {
      language: context.language || 'ar',
      direction: context.direction || 'rtl',
      isRTL: context.isRTL !== undefined ? context.isRTL : true,
      setLanguage: context.setLanguage || (() => {}),
      toggleLanguage: context.toggleLanguage || (() => {}),
      t: context.t || ((key) => key)
    };
  } catch (error) {
    console.error('Error in useLocalization:', error);
    // Return default values on error
    return {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key) => key
    };
  }
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

  // Translation function
  const t = useMemo(() => {
    return (key) => {
      const translation = translations[key];
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
      return translation[language] || translation.ar || key;
    };
  }, [language]);

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
    document.documentElement.lang = language;
    
    // Update document title based on language
    document.title = language === 'ar' ? 'خطة التعلم الذكية' : 'Smart Learning Plan';
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { 
        language, 
        direction: newDirection, 
        isRTL: newDirection === 'rtl' 
      } 
    }));
  }, [language]);

  const changeLanguage = (newLanguage) => {
    // Immediately update direction and document attributes
    const newDirection = newLanguage === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
    document.documentElement.lang = newLanguage;
    
    // Update language state
    setLanguage(newLanguage);
    
    // Force a re-render by dispatching event
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { 
        language: newLanguage, 
        direction: newDirection, 
        isRTL: newDirection === 'rtl' 
      } 
    }));
  };

  const toggleLanguage = () => {
    const currentLang = language || 'ar';
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  const isRTL = direction === 'rtl';

  const value = {
    language,
    direction,
    isRTL,
    setLanguage: changeLanguage,
    toggleLanguage,
    t
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};