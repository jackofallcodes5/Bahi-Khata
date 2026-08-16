import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import {
  MdLogout, MdPersonOutline, MdLocationOn, MdNotificationsNone, MdSettings,
  MdChevronRight, MdDarkMode, MdLightMode,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import SettingsModal from '../../components/SettingsModal';
import ProfileModal from '../../components/ProfileModal';

const CustomerAccount = () => {
  const { user, logout } = useAuth();
  const { settings, setTheme } = useSettings();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [settingsTab, setSettingsTab] = useState('appearance');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openSettings = (tab = 'appearance') => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  const menuItems = [
    {
      icon: <MdPersonOutline size={24} />,
      title: 'Profile Settings',
      desc: 'Update your name, email, phone',
      action: () => setShowProfile(true),
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: <MdLocationOn size={24} />,
      title: 'Addresses',
      desc: `${settings.addresses.length} saved address${settings.addresses.length !== 1 ? 'es' : ''}`,
      action: () => openSettings('addresses'),
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      icon: <MdNotificationsNone size={24} />,
      title: 'Notifications',
      desc: 'Configure alerts & reminders',
      action: () => openSettings('notifications'),
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      icon: <MdSettings size={24} />,
      title: 'App Settings',
      desc: `Theme: ${settings.theme === 'dark' ? 'Dark' : 'Light'} · Language: ${settings.language.toUpperCase()}`,
      action: () => openSettings('appearance'),
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <header className="flex items-center space-x-4 mb-2">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name || 'User'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.phone}</p>
          <span className="text-xs text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-medium">{user?.role}</span>
        </div>
      </header>

      {/* Quick Theme Toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dark Mode</span>
        <button
          onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
          className={`relative w-12 h-6 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform flex items-center justify-center ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
            {settings.theme === 'dark' ? <MdDarkMode size={10} className="text-primary" /> : <MdLightMode size={10} className="text-yellow-400" />}
          </span>
        </button>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-100 dark:border-gray-700 text-left"
          >
            <div className={`${item.bg} ${item.color} p-2 rounded-lg mr-4`}>{item.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
            <MdChevronRight size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 text-danger rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition border border-red-100 dark:border-red-800"
      >
        <MdLogout className="mr-2" size={20} /> Logout
      </button>

      {/* Modals */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} initialTab={settingsTab} />
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
};

export default CustomerAccount;

