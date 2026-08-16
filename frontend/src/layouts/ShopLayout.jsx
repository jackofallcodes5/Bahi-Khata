import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { MdPointOfSale, MdInventory, MdPeople, MdInsertChart, MdMenu, MdClose, MdLogout } from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';

const ShopLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const path = location.pathname;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'POS (Billing)', path: '/shop/pos', icon: <MdPointOfSale size={20} /> },
    { name: 'Inventory', path: '/shop/inventory', icon: <MdInventory size={20} /> },
    { name: 'Customers', path: '/shop/customers', icon: <MdPeople size={20} /> },
    { name: 'Reports', path: '/shop/reports', icon: <MdInsertChart size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-xl z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-primary">Shop Panel</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <MdClose size={24} />
          </button>
        </div>
        <div className="p-4 flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  path.includes(item.path) ? 'bg-blue-50 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-danger hover:bg-red-50 rounded-lg transition-colors mt-auto"
          >
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center px-4 lg:px-8 border-b border-gray-100 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 mr-4">
            <MdMenu size={24} />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            {/* Top right profile / notifications */}
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              S
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ShopLayout;
