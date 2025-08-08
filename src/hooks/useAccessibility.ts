import { useEffect, useState, useCallback, useRef } from 'react';

interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
}

interface AccessibilityState {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isLargeText: boolean;
  isScreenReaderActive: boolean;
  isKeyboardNavigation: boolean;
  focusVisible: boolean;
  currentFocus: string | null;
}

export const useAccessibility = (config: Partial<AccessibilityConfig> = {}) => {
  const {
    enableHighContrast = true,
    enableReducedMotion = true,
    enableLargeText = true,
    enableScreenReader = true,
    enableKeyboardNavigation = true
  } = config;

  const [state, setState] = useState<AccessibilityState>({
    isHighContrast: false,
    isReducedMotion: false,
    isLargeText: false,
    isScreenReaderActive: false,
    isKeyboardNavigation: false,
    focusVisible: false,
    currentFocus: null
  });

  const focusHistory = useRef<string[]>([]);
  const lastFocusTime = useRef(0);

  // Detect screen reader
  const detectScreenReader = useCallback(() => {
    if (!enableScreenReader) return;

    const isScreenReader = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.querySelector('[aria-live]') !== null ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver');

    setState(prev => ({ ...prev, isScreenReaderActive: isScreenReader }));
  }, [enableScreenReader]);

  // Detect keyboard navigation
  const detectKeyboardNavigation = useCallback(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastFocusTime.current > 100) {
        setState(prev => ({ ...prev, isKeyboardNavigation: true }));
      }
      lastFocusTime.current = now;
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, isKeyboardNavigation: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enableKeyboardNavigation]);

  // Handle focus management
  const handleFocusChange = useCallback((elementId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentFocus: elementId,
      focusVisible: true 
    }));

    focusHistory.current.push(elementId);
    if (focusHistory.current.length > 10) {
      focusHistory.current.shift();
    }

    // Announce focus change to screen readers
    if (state.isScreenReaderActive) {
      const element = document.getElementById(elementId);
      if (element) {
        const ariaLabel = element.getAttribute('aria-label') || element.textContent;
        if (ariaLabel) {
          announceToScreenReader(ariaLabel);
        }
      }
    }
  }, [state.isScreenReaderActive]);

  // Announce to screen reader
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Apply accessibility styles
  const applyAccessibilityStyles = useCallback(() => {
    const root = document.documentElement;
    
    if (state.isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (state.isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (state.isLargeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (state.isKeyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [state]);

  // Toggle accessibility features
  const toggleHighContrast = useCallback(() => {
    setState(prev => ({ ...prev, isHighContrast: !prev.isHighContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setState(prev => ({ ...prev, isReducedMotion: !prev.isReducedMotion }));
  }, []);

  const toggleLargeText = useCallback(() => {
    setState(prev => ({ ...prev, isLargeText: !prev.isLargeText }));
  }, []);

  // Focus management utilities
  const focusElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      handleFocusChange(elementId);
    }
  }, [handleFocusChange]);

  const focusNext = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    );
    
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    const nextElement = focusableElements[nextIndex] as HTMLElement;
    
    if (nextElement) {
      nextElement.focus();
      handleFocusChange(nextElement.id || `element-${nextIndex}`);
    }
  }, [handleFocusChange]);

  const focusPrevious = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    );
    
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    const prevElement = focusableElements[prevIndex] as HTMLElement;
    
    if (prevElement) {
      prevElement.focus();
      handleFocusChange(prevElement.id || `element-${prevIndex}`);
    }
  }, [handleFocusChange]);

  // Initialize accessibility features
  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setState(prev => ({
      ...prev,
      isReducedMotion: prefersReducedMotion,
      isHighContrast: prefersHighContrast
    }));

    detectScreenReader();
    const keyboardCleanup = detectKeyboardNavigation();
    applyAccessibilityStyles();

    return keyboardCleanup;
  }, [detectScreenReader, detectKeyboardNavigation, applyAccessibilityStyles]);

  // Apply styles when state changes
  useEffect(() => {
    applyAccessibilityStyles();
  }, [applyAccessibilityStyles]);

  return {
    state,
    focusElement,
    focusNext,
    focusPrevious,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    announceToScreenReader,
    focusHistory: focusHistory.current
  };
};