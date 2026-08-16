import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MdHome, MdOutlineMiscellaneousServices, MdPayment, MdPerson } from 'react-icons/md';

const CustomerLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: 'Home', path: '/customer/home', icon: <MdHome size={24} /> },
    { name: 'Services', path: '/customer/services', icon: <MdOutlineMiscellaneousServices size={24} /> },
    { name: 'Payments', path: '/customer/payments', icon: <MdPayment size={24} /> },
    { name: 'Account', path: '/customer/account', icon: <MdPerson size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="p-4">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              path.includes(item.path) ? 'text-primary' : 'text-gray-500 hover:text-primary'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default CustomerLayout;
