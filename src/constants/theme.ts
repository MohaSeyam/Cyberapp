// Unified Theme System
export const theme = {
  colors: {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-600',
      focus: 'focus:ring-blue-500'
    },
    secondary: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      text: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-600',
      focus: 'focus:ring-gray-500'
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    danger: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'bg-red-500',
      600: 'bg-red-600',
      text: 'text-red-600',
      border: 'border-red-200'
    },
    info: {
      50: 'bg-indigo-50',
      100: 'bg-indigo-100',
      500: 'bg-indigo-500',
      600: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-200'
    }
  },
  
  gradients: {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600',
    info: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    background: 'bg-gradient-to-br from-gray-50 via-white to-blue-50',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
  },
  
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    inner: 'shadow-inner'
  },
  
  rounded: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  },
  
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }
};

export const pageLayouts = {
  container: 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
  header: 'bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-6 sm:px-8',
  main: 'px-6 py-8 sm:px-8 max-w-7xl mx-auto',
  footer: 'bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-6 sm:px-8',
  card: {
    base: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
    header: 'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
  }
};

export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  },
  
  stagger: (delay: number = 0.1) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay }
  })
};