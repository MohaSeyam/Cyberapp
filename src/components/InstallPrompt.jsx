import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // التحقق من أن التطبيق مثبت بالفعل
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // الاستماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // الاستماع لحدث appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('تم قبول تثبيت التطبيق');
    } else {
      console.log('تم رفض تثبيت التطبيق');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // حفظ في localStorage لتجنب إظهار الرسالة مرة أخرى
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // لا تظهر إذا كان التطبيق مثبت أو تم رفض الرسالة سابقاً
  if (isInstalled || !showInstallPrompt || localStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  تثبيت CyberPlan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  احصل على تجربة أفضل
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                يعمل بدون إنترنت
              </span>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <Monitor className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                وصول سريع من سطح المكتب
              </span>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <Tablet className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                تجربة تطبيق محسنة
              </span>
            </div>
          </div>

          {/* Install Button */}
          <motion.button
            onClick={handleInstallClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            تثبيت التطبيق
          </motion.button>

          {/* Dismiss Link */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-3 transition-colors"
          >
            لاحقاً
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;