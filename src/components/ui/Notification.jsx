import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export default function Notification({ 
  type = "info", 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500"
  };

  const Icon = icons[type];

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-xl border shadow-lg ${colors[type]}`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />
            
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="font-semibold mb-1">{title}</h4>
              )}
              {message && (
                <p className="text-sm opacity-90">{message}</p>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <div className="mt-3 w-full bg-black/10 rounded-full h-1 overflow-hidden">
              <motion.div
                className="h-full bg-current opacity-30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}