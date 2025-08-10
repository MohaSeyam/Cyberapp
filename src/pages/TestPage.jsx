import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';

const TestPage = () => {
  const navigate = useNavigate();
  
  // Safe access to useLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;

  const handleNavigation = (path) => {
    try {
      console.log('Attempting to navigate to:', path);
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location
      window.location.href = path;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {language === 'ar' ? 'صفحة الاختبار' : 'Test Page'}
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => handleNavigation('/phases')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'ar' ? 'الانتقال إلى المراحل' : 'Navigate to Phases'}
          </button>
          
          <button
            onClick={() => handleNavigation('/progress')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {language === 'ar' ? 'الانتقال إلى التقدم' : 'Navigate to Progress'}
          </button>
          
          <button
            onClick={() => handleNavigation('/notes')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {language === 'ar' ? 'الانتقال إلى الملاحظات' : 'Navigate to Notes'}
          </button>
          
                         <button
                 onClick={() => handleNavigation('/')}
                 className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
               >
                 {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
               </button>
             </div>
             

           </div>
         </div>
       );
     };

export default TestPage;