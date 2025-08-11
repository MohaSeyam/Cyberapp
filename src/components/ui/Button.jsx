import React from 'react';
import { useLocalization } from '../../context/LocalizationContext';
import LoadingSpinner from './LoadingSpinner';

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
  const { language } = useLocalization();
  const isRTL = language === 'ar';

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    outline:
      'border border-gray-300 dark:border-gray-600 bg-transparent',
    ghost: 'bg-transparent'
  };

  // في حال الاتجاه RTL، نعكس المسافات
  const iconSpacing = isRTL
    ? iconPosition === 'left'
      ? 'ml-2'
      : 'mr-2'
    : iconPosition === 'left'
    ? 'mr-2'
    : 'ml-2';

  const renderIcon = () => {
    if (!icon) return null;

    // إذا أيقونة جاهزة كعنصر JSX
    if (React.isValidElement(icon)) {
      return (
        <span className={`inline-flex items-center ${iconSpacing}`}>
          {icon}
        </span>
      );
    }

    // إذا مكوّن (دالة أو كائن)
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComp = icon;
      try {
        // إذا الحزمة مصدّرة كـ default
        if (IconComp && typeof IconComp === 'object' && IconComp.default) {
          const Actual = IconComp.default;
          return (
            <span className={`inline-flex items-center ${iconSpacing}`}>
              <Actual className="w-4 h-4" />
            </span>
          );
        }
        return (
          <span className={`inline-flex items-center ${iconSpacing}`}>
            <IconComp className="w-4 h-4" />
          </span>
        );
      } catch (e) {
        console.warn('Button: فشل عرض الأيقونة', e);
        return null;
      }
    }

    // أي نوع آخر (string، رقم...)
    return (
      <span className={`inline-flex items-center ${iconSpacing}`}>
        {icon}
      </span>
    );
  };

  const iconNode = renderIcon();

  const content = (
    <>
      {iconPosition === 'left' && iconNode}
      {loading ? <LoadingSpinner /> : <span>{children}</span>}
      {iconPosition === 'right' && iconNode}
    </>
  );

  const classes = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-2xl',
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    className
  ]
    .filter(Boolean)
    .join(' ');

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
