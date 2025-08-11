import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newPreference = e.matches ? 'dark' : 'light';
      setSystemPreference(newPreference);
      
      // If theme is set to 'system', update accordingly
      if (theme === 'system') {
        applyTheme(newPreference);
      }
    };

    // Set initial system preference
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to system preference
      setTheme('system');
    }
  }, []);

  // Apply theme to document
  const applyTheme = (selectedTheme) => {
    const actualTheme = selectedTheme === 'system' ? systemPreference : selectedTheme;
    
    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark');
    
    // Add new theme class
    document.documentElement.classList.add(actualTheme);
    
    // Update CSS custom properties for smooth transitions
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');
    
    // Store theme preference
    localStorage.setItem('theme', selectedTheme);
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, systemPreference]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  // Get current effective theme
  const currentTheme = useMemo(() => {
    return theme === 'system' ? systemPreference : theme;
  }, [theme, systemPreference]);

  // Check if dark mode is active
  const isDark = useMemo(() => {
    return currentTheme === 'dark';
  }, [currentTheme]);

  // Theme context value
  const value = useMemo(() => ({
    theme,
    currentTheme,
    isDark,
    systemPreference,
    toggleTheme,
    setTheme: setSpecificTheme,
    isSystemTheme: theme === 'system'
  }), [theme, currentTheme, isDark, systemPreference]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};