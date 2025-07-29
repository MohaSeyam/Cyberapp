import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md",
  loading = false,
  disabled = false,
  className = "", 
  ...props 
}) {
  const base = "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  };
  
  const variants = {
    primary: "bg-light-accent dark:bg-dark-accent text-white border border-light-accent dark:border-dark-accent hover:bg-yellow-400 hover:border-yellow-400 dark:hover:bg-yellow-500 dark:hover:border-yellow-500 focus:ring-yellow-400 dark:focus:ring-yellow-400 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95",
    secondary: "bg-white dark:bg-dark-card text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-light-accent dark:focus:ring-dark-accent shadow-sm hover:shadow-md",
    outline: "bg-transparent border-2 border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent hover:bg-light-accent hover:text-white dark:hover:bg-dark-accent dark:hover:text-white focus:ring-light-accent dark:focus:ring-dark-accent",
    ghost: "bg-transparent text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-light-accent dark:focus:ring-dark-accent",
    danger: "bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600 focus:ring-red-400 shadow-sm hover:shadow-lg",
    success: "bg-green-500 text-white border border-green-500 hover:bg-green-600 hover:border-green-600 focus:ring-green-400 shadow-sm hover:shadow-lg"
  };

  return (
    <button 
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
