// Unified Modal Component
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  // Confirm modal props
  onConfirm?: () => void;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirmModal?: boolean;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  onConfirm,
  message,
  confirmText,
  cancelText,
  isConfirmModal = false
}: ModalProps) {
  const { lang } = useApp();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`w-full ${modalSizes[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                {title && (
                  <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-1"
                    icon={<X size={20} />}
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {isConfirmModal ? (
                <div className="space-y-6">
                  {/* Message */}
                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {message}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="px-6 py-2"
                    >
                      {cancelText || (lang === 'ar' ? 'إلغاء' : 'Cancel')}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        onConfirm?.();
                        onClose();
                      }}
                      className="px-6 py-2"
                    >
                      {confirmText || (lang === 'ar' ? 'حذف' : 'Delete')}
                    </Button>
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}