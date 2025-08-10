import React, { useEffect, useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';

const LanguageTest = () => {
  const { language, direction, isRTL, toggleLanguage } = useLocalization();
  const [testCount, setTestCount] = useState(0);

  // Debug logging to help identify React #130 issues
  console.log('LanguageTest render:', {
    language: language || 'undefined',
    direction: direction || 'undefined',
    isRTL: isRTL || false,
    testCount
  });

  // Additional safety checks for React #130
  const safeLanguage = language || 'ar';
  const safeDirection = direction || 'rtl';
  const safeIsRTL = isRTL || false;

  useEffect(() => {
    try {
      // Force immediate direction update
      const updateDirection = () => {
        const newDirection = safeLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = newDirection;
        document.documentElement.lang = safeLanguage;
        
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
    } catch (error) {
      console.error('Error in LanguageTest useEffect:', error);
    }
  }, [safeLanguage]);

  const handleToggleLanguage = () => {
    try {
      console.log('Toggling language from:', safeLanguage);
      toggleLanguage();
      
      // Force immediate update
      setTimeout(() => {
        const newDirection = safeLanguage === 'ar' ? 'ltr' : 'rtl';
        document.documentElement.dir = newDirection;
        document.documentElement.offsetHeight; // Force reflow
      }, 0);
    } catch (error) {
      console.error('Error in handleToggleLanguage:', error);
    }
  };

  return (
    <div 
      className="p-4 border rounded-lg"
      dir={safeDirection}
      style={{ direction: safeDirection }}
    >
      <h3 className="text-lg font-bold mb-4">
        اختبار تغيير اللغة / Language Test
      </h3>
      
      <div className="space-y-2">
        <p><strong>اللغة الحالية / Current Language:</strong> {safeLanguage}</p>
        <p><strong>الاتجاه / Direction:</strong> {safeDirection}</p>
        <p><strong>RTL:</strong> {safeIsRTL ? 'نعم / Yes' : 'لا / No'}</p>
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