import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('codefuse-theme');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('codefuse-theme', darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.documentElement.style.setProperty('--bg-color', darkMode ? '#1a1a1a' : '#ffffff');
    document.documentElement.style.setProperty('--text-color', darkMode ? '#ffffff' : '#212529');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);