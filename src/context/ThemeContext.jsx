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
  const [focusMode, setFocusMode] = useState(false);

  // Load theme and focus mode from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // Default to light theme
      setTheme('light');
    }

    const savedFocusMode = localStorage.getItem('focusMode');
    if (savedFocusMode !== null) {
      setFocusMode(JSON.parse(savedFocusMode));
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

  // Apply theme and focus mode whenever they change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Apply focus mode to document
  useEffect(() => {
    if (focusMode) {
      document.documentElement.classList.add('focus-mode');
    } else {
      document.documentElement.classList.remove('focus-mode');
    }
    localStorage.setItem('focusMode', JSON.stringify(focusMode));
  }, [focusMode]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(prev => !prev);
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  // Set specific focus mode
  const setSpecificFocusMode = (newFocusMode) => {
    setFocusMode(Boolean(newFocusMode));
  };

  // Get current effective theme
  const currentTheme = useMemo(() => theme, [theme]);

  // Check if dark mode is active
  const isDark = useMemo(() => currentTheme === 'dark', [currentTheme]);

  // Check if focus mode is active
  const isFocusMode = useMemo(() => focusMode, [focusMode]);

  // Theme context value
  const value = useMemo(
    () => ({
      theme,
      currentTheme,
      isDark,
      focusMode,
      isFocusMode,
      toggleTheme,
      toggleFocusMode,
      setTheme: setSpecificTheme,
      setFocusMode: setSpecificFocusMode,
      isSystemTheme: false,
    }),
    [theme, currentTheme, isDark, focusMode, isFocusMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};