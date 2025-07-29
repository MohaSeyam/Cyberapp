import React from "react";

export default function Card({ 
  children, 
  variant = "default",
  interactive = false,
  className = "", 
  ...props 
}) {
  const base = "bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-xl shadow-sm transition-all duration-200";
  
  const variants = {
    default: "p-6",
    compact: "p-4",
    spacious: "p-8",
    flat: "shadow-none",
    elevated: "shadow-lg hover:shadow-xl",
    interactive: "cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-[0_4px_32px_0_rgba(139,92,246,0.25)] dark:hover:shadow-[0_10px_30px_-15px_rgba(2,12,27,0.7)] hover:scale-[1.02] active:scale-[0.98]"
  };

  const interactiveClasses = interactive ? variants.interactive : "";

  return (
    <div
      className={`
        ${base} 
        ${variants[variant]} 
        ${interactiveClasses}
        [&_.card-secondary]:text-light-textSecondary dark:[&_.card-secondary]:text-dark-textSecondary
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
