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

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // Default to light theme
      setTheme('light');
    }
  }, []);

  // Apply theme to document
  const applyTheme = (selectedTheme) => {
    const actualTheme = ['light', 'dark'].includes(selectedTheme) ? selectedTheme : 'light';

    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark');

    // Add new theme class
    document.documentElement.classList.add(actualTheme);

    // Update CSS custom properties for smooth transitions
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s ease');

    // Store theme preference in localStorage
    localStorage.setItem('theme', actualTheme);
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  // Get current effective theme
  const currentTheme = useMemo(() => theme, [theme]);

  // Check if dark mode is active
  const isDark = useMemo(() => currentTheme === 'dark', [currentTheme]);

  // Theme context value
  const value = useMemo(
    () => ({
      theme,
      currentTheme,
      isDark,
      toggleTheme,
      setTheme: setSpecificTheme,
      isSystemTheme: false,
    }),
    [theme, currentTheme, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};