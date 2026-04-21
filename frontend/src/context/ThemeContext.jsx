// src/context/ThemeContext.jsx
// Dark mode removed — always light
import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Force light mode permanently
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
    localStorage.setItem('aiwatch_theme', 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme: 'light',
      toggleTheme: () => {},
      setLightTheme: () => {},
      setDarkTheme: () => {},
    }}>
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
