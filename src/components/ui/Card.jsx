import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'default',
  border = 'default',
  hover = false,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const borderClasses = {
    none: '',
    default: 'border border-gray-200 dark:border-gray-700',
    colored: 'border border-blue-200 dark:border-blue-700'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200' : '';

  const classes = [
    'bg-white dark:bg-gray-800 rounded-xl',
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClasses[border],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;