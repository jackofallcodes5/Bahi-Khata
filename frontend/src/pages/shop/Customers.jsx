import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdSearch, MdPhone, MdPerson, MdAdd, MdEmail } from 'react-icons/md';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/shop/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/shop/customers', formData);
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search) ||
    String(c.id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Udhar & Directory</h1>
          <p className="text-gray-500 text-sm">View Customer IDs, track credit balances, and add new customers</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <MdAdd size={20} />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center max-w-md">
        <MdSearch className="text-gray-400 mr-2" size={20} />
        <input 
          type="text"
          placeholder="Search by Customer ID, name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus:outline-none text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-400">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">No customers found.</div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-lg">
                    <MdPerson size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                      <MdPhone size={14} /> {c.phone}
                    </p>
                    {c.email && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MdEmail size={12} /> {c.email}
                      </p>
                    )}
                  </div>
                </div>
                <span className="bg-blue-100 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                  ID: #{c.id}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Udhar Balance</span>
                <span className={`text-base font-bold ${c.outstanding_balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  ₹{c.outstanding_balance || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
                <input 
                  type="text" required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email (Optional)</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
