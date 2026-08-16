import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdSupervisorAccount, MdStorefront, MdLocalShipping, MdAttachMoney, MdLogout, MdCheckCircle, MdBlock } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_users: 0, total_shops: 0, total_deliveries: 0, total_volume: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users')
      ]);
      setStats(statsRes.data.data || {});
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch admin dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/status`);
      fetchData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600 text-white rounded-lg">
            <MdSupervisorAccount size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">Super Admin Control Panel</h1>
            <p className="text-xs text-gray-400">{user?.email || 'admin@bahikhata.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold transition"
        >
          <MdLogout size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Platform Overview & User Control</h2>
          <p className="text-gray-500 text-sm">Monitor system metrics, onboarded businesses, and manage user statuses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <MdSupervisorAccount size={28} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-primary rounded-lg">
              <MdStorefront size={28} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Retail Shops</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_shops || 0}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <MdLocalShipping size={28} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Delivery Partners</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_deliveries || 0}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <MdAttachMoney size={28} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Platform Volume</div>
              <div className="text-2xl font-bold text-gray-900">₹{stats.total_volume || 0}</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
            <span>User Directory & Status Management</span>
            <span className="text-xs text-gray-400">{users.length} Users Registered</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-6 text-gray-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-gray-400">No registered users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-semibold text-gray-900">{u.name}</td>
                    <td className="py-4 px-6 font-mono text-xs">{u.phone}</td>
                    <td className="py-4 px-6 text-gray-500">{u.email || '—'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                        {u.roleName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.is_active ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <MdCheckCircle size={14} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <MdBlock size={14} />
                          <span>Blocked</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                          u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Block Access' : 'Activate User'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
