import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const defaultSettings = {
  theme: 'light',
  language: 'en',
  addresses: [],
  notifications: {
    payments: true,
    deliveries: true,
    promotions: false,
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('bk_settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('bk_settings', JSON.stringify(settings));
  }, [settings]);

  const setTheme = (theme) => setSettings(prev => ({ ...prev, theme }));
  const setLanguage = (language) => setSettings(prev => ({ ...prev, language }));

  const setNotification = (key, value) =>
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));

  const addAddress = (address) =>
    setSettings(prev => ({
      ...prev,
      addresses: [...prev.addresses, { ...address, id: Date.now() }],
    }));

  const updateAddress = (id, updates) =>
    setSettings(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => (a.id === id ? { ...a, ...updates } : a)),
    }));

  const deleteAddress = (id) =>
    setSettings(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== id),
    }));

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setTheme,
        setLanguage,
        setNotification,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
