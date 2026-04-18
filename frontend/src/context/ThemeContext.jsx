// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const LS_KEY = 'aiwatch_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or default to 'dark'
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LS_KEY) || 'dark';
    }
    return 'dark';
  });

  // Apply theme via data-theme attribute on document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // Also keep the class for backward compatibility
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LS_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme = useCallback(() => setTheme('dark'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
