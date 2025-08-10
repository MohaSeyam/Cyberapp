import React, { createContext, useContext, useState, useEffect } from 'react';

const SimpleLocalizationContext = createContext();

const defaultLocalization = {
  language: 'ar',
  direction: 'rtl',
  isRTL: true,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key
};

export const SimpleLocalizationProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ar');
  const [direction, setDirection] = useState('rtl');
  const [isRTL, setIsRTL] = useState(true);

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'ar';
    setLanguageState(savedLanguage);
    
    const newDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    setIsRTL(newDirection === 'rtl');
    
    // Set document attributes
    document.documentElement.dir = newDirection;
    document.documentElement.lang = savedLanguage;
  }, []);

  const setLanguage = (newLanguage) => {
    try {
      setLanguageState(newLanguage);
      localStorage.setItem('language', newLanguage);
      
      const newDirection = newLanguage === 'ar' ? 'rtl' : 'ltr';
      setDirection(newDirection);
      setIsRTL(newDirection === 'rtl');
      
      // Set document attributes
      document.documentElement.dir = newDirection;
      document.documentElement.lang = newLanguage;
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  };

  const t = (key) => {
    // Simple translation function
    const translations = {
      'notes': { ar: 'الملاحظات', en: 'Notes' },
      'journal': { ar: 'المدونات', en: 'Journal' },
      'resources': { ar: 'الموارد', en: 'Resources' },
      'settings': { ar: 'الإعدادات', en: 'Settings' },
      'progress': { ar: 'التقدم', en: 'Progress' },
      'phases': { ar: 'المراحل', en: 'Phases' },
      'home': { ar: 'الرئيسية', en: 'Home' },
      'loading': { ar: 'جاري التحميل...', en: 'Loading...' },
      'error': { ar: 'خطأ', en: 'Error' },
      'success': { ar: 'نجح', en: 'Success' },
      'save': { ar: 'حفظ', en: 'Save' },
      'cancel': { ar: 'إلغاء', en: 'Cancel' },
      'delete': { ar: 'حذف', en: 'Delete' },
      'edit': { ar: 'تعديل', en: 'Edit' },
      'add': { ar: 'إضافة', en: 'Add' },
      'back': { ar: 'رجوع', en: 'Back' },
      'next': { ar: 'التالي', en: 'Next' },
      'previous': { ar: 'السابق', en: 'Previous' },
      'close': { ar: 'إغلاق', en: 'Close' },
      'open': { ar: 'فتح', en: 'Open' },
      'search': { ar: 'بحث', en: 'Search' },
      'filter': { ar: 'تصفية', en: 'Filter' },
      'sort': { ar: 'ترتيب', en: 'Sort' },
      'export': { ar: 'تصدير', en: 'Export' },
      'import': { ar: 'استيراد', en: 'Import' },
      'clear': { ar: 'مسح', en: 'Clear' },
      'reset': { ar: 'إعادة تعيين', en: 'Reset' },
      'confirm': { ar: 'تأكيد', en: 'Confirm' },
      'yes': { ar: 'نعم', en: 'Yes' },
      'no': { ar: 'لا', en: 'No' },
      'ok': { ar: 'موافق', en: 'OK' },
      'retry': { ar: 'إعادة المحاولة', en: 'Retry' },
      'refresh': { ar: 'تحديث', en: 'Refresh' },
      'reload': { ar: 'إعادة تحميل', en: 'Reload' },
      'download': { ar: 'تحميل', en: 'Download' },
      'upload': { ar: 'رفع', en: 'Upload' },
      'copy': { ar: 'نسخ', en: 'Copy' },
      'paste': { ar: 'لصق', en: 'Paste' },
      'cut': { ar: 'قص', en: 'Cut' },
      'select': { ar: 'اختيار', en: 'Select' },
      'all': { ar: 'الكل', en: 'All' },
      'none': { ar: 'لا شيء', en: 'None' },
      'new': { ar: 'جديد', en: 'New' },
      'old': { ar: 'قديم', en: 'Old' },
      'recent': { ar: 'حديث', en: 'Recent' },
      'favorite': { ar: 'مفضل', en: 'Favorite' },
      'important': { ar: 'مهم', en: 'Important' },
      'urgent': { ar: 'عاجل', en: 'Urgent' },
      'completed': { ar: 'مكتمل', en: 'Completed' },
      'pending': { ar: 'قيد الانتظار', en: 'Pending' },
      'in_progress': { ar: 'قيد التنفيذ', en: 'In Progress' },
      'not_started': { ar: 'لم يبدأ', en: 'Not Started' },
      'overdue': { ar: 'متأخر', en: 'Overdue' },
      'on_time': { ar: 'في الوقت المحدد', en: 'On Time' },
      'early': { ar: 'مبكر', en: 'Early' },
      'late': { ar: 'متأخر', en: 'Late' },
      'today': { ar: 'اليوم', en: 'Today' },
      'yesterday': { ar: 'أمس', en: 'Yesterday' },
      'tomorrow': { ar: 'غداً', en: 'Tomorrow' },
      'this_week': { ar: 'هذا الأسبوع', en: 'This Week' },
      'last_week': { ar: 'الأسبوع الماضي', en: 'Last Week' },
      'next_week': { ar: 'الأسبوع القادم', en: 'Next Week' },
      'this_month': { ar: 'هذا الشهر', en: 'This Month' },
      'last_month': { ar: 'الشهر الماضي', en: 'Last Month' },
      'next_month': { ar: 'الشهر القادم', en: 'Next Month' },
      'this_year': { ar: 'هذا العام', en: 'This Year' },
      'last_year': { ar: 'العام الماضي', en: 'Last Year' },
      'next_year': { ar: 'العام القادم', en: 'Next Year' }
    };

    const translation = translations[key];
    if (translation) {
      return translation[language] || translation.ar || key;
    }
    return key;
  };

  const contextValue = {
    language,
    direction,
    isRTL,
    setLanguage,
    toggleLanguage,
    t
  };

  return (
    <SimpleLocalizationContext.Provider value={contextValue}>
      {children}
    </SimpleLocalizationContext.Provider>
  );
};

export const useSimpleLocalization = () => {
  const context = useContext(SimpleLocalizationContext);
  if (!context) {
    console.error('useSimpleLocalization must be used within SimpleLocalizationProvider');
    return defaultLocalization;
  }
  return context;
};