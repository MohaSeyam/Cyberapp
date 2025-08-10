import React from 'react';
import { useLocalization } from '../../context/LocalizationContext';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const { language } = useSimpleLocalization();
  const safeLanguage = language || 'ar';
  const isRTL = safeLanguage === 'ar';

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    className
  ].join(' ');

  const IconComponent = icon;
  const iconClasses = iconSizes[size];

  const renderIcon = () => {
    if (!IconComponent || loading) return null;
    
    return (
      <IconComponent className={iconClasses} />
    );
  };

  const renderLoadingSpinner = () => {
    if (!loading) return null;
    
    return (
      <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconClasses}`} />
    );
  };

  // Determine icon position based on RTL
  const effectiveIconPosition = iconPosition === 'auto' ? (isRTL ? 'right' : 'left') : iconPosition;

  const content = (
    <>
      {effectiveIconPosition === 'left' && (renderIcon() || renderLoadingSpinner())}
      {children && <span className={effectiveIconPosition === 'left' ? 'mr-2' : 'ml-2'}>{children}</span>}
      {effectiveIconPosition === 'right' && (renderIcon() || renderLoadingSpinner())}
    </>
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;