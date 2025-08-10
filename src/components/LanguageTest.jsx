import React, { useEffect, useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';

const LanguageTest = () => {
  const { language, direction, isRTL, toggleLanguage } = useLocalization();
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    // Force immediate direction update
    const updateDirection = () => {
      const newDirection = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = newDirection;
      document.documentElement.lang = language;
      
      // Force reflow
      document.documentElement.offsetHeight;
      
      // Add CSS classes
      document.documentElement.classList.remove('rtl', 'ltr');
      document.documentElement.classList.add(newDirection);
    };

    updateDirection();
    
    // Listen for language changes
    const handleLanguageChange = (event) => {
      console.log('Language changed:', event.detail);
      updateDirection();
      setTestCount(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [language]);

  const handleToggleLanguage = () => {
    console.log('Toggling language from:', language);
    toggleLanguage();
    
    // Force immediate update
    setTimeout(() => {
      const newDirection = language === 'ar' ? 'ltr' : 'rtl';
      document.documentElement.dir = newDirection;
      document.documentElement.offsetHeight; // Force reflow
    }, 0);
  };

  return (
    <div 
      className="p-4 border rounded-lg"
      dir={direction}
      style={{ direction }}
    >
      <h3 className="text-lg font-bold mb-4">
        اختبار تغيير اللغة / Language Test
      </h3>
      
      <div className="space-y-2">
        <p><strong>اللغة الحالية / Current Language:</strong> {language}</p>
        <p><strong>الاتجاه / Direction:</strong> {direction}</p>
        <p><strong>RTL:</strong> {isRTL ? 'نعم / Yes' : 'لا / No'}</p>
        <p><strong>عدد التحديثات / Update Count:</strong> {testCount}</p>
      </div>
      
      <div className="mt-4 space-x-4">
        <button
          onClick={handleToggleLanguage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          تغيير اللغة / Toggle Language
        </button>
        
        <button
          onClick={() => setTestCount(0)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          إعادة تعيين العداد / Reset Counter
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="text-right">
          هذا نص تجريبي للاختبار من اليمين لليسار
        </p>
        <p className="text-left">
          This is a test text for left to right testing
        </p>
      </div>
    </div>
  );
};

export default LanguageTest;