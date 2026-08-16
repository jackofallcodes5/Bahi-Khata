import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdCheckCircle, MdLocalShipping, MdPeople, MdLogout, MdAdd, MdCalculate, MdDownload, MdReceipt, MdSearch, MdCalendarToday, MdWarning } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('route'); // 'route', 'customers', 'billing'
  const [routeList, setRouteList] = useState([]);
  const [todayName, setTodayName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Add Customer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    service_name: '',
    unit_price: '',
    quantity_per_delivery: '1',
    frequency: 'Everyday',
    delivery_days: ALL_DAYS
  });

  const [addError, setAddError] = useState('');

  // Generated Bill Modal State
  const [calculatedBill, setCalculatedBill] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [routeRes, custRes] = await Promise.all([
        axios.get('/api/delivery/todays-route'),
        axios.get('/api/delivery/customers')
      ]);
      setRouteList(routeRes.data.data || []);
      setTodayName(routeRes.data.today || '');
      setCustomers(custRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch delivery dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDayToggle = (day) => {
    if (newCust.delivery_days.includes(day)) {
      if (newCust.delivery_days.length === 1) return; // keep at least 1 day
      setNewCust({ ...newCust, delivery_days: newCust.delivery_days.filter(d => d !== day) });
    } else {
      setNewCust({ ...newCust, delivery_days: [...newCust.delivery_days, day] });
    }
  };

  const handleMarkAttendance = async (subscription_id, status, quantity) => {
    try {
      await axios.post('/api/delivery/attendance', {
        subscription_id,
        date: new Date().toISOString().split('T')[0],
        status,
        quantity_delivered: quantity
      });
      fetchData();
    } catch (err) {
      alert('Failed to update delivery status');
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      const payload = {
        ...newCust,
        delivery_days: newCust.delivery_days.join(',')
      };
      await axios.post('/api/delivery/customers', payload);
      setShowAddModal(false);
      setNewCust({ name: '', phone: '', service_name: '', unit_price: '', quantity_per_delivery: '1', frequency: 'Everyday', delivery_days: ALL_DAYS });
      fetchData();
      alert('Customer & Service Subscription added successfully!');
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add customer subscription');
    }
  };

  const handleCalculateBill = async (subscription_id) => {
    try {
      const res = await axios.post('/api/delivery/calculate-bill', { subscription_id });
      setCalculatedBill(res.data.data);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate bill');
    }
  };

  const handleDownloadPDF = (billId) => {
    window.open(`/api/bills/${billId}/pdf`, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredCustomers = customers.filter(c => 
    c.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.customer_phone?.includes(search) ||
    c.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary text-white rounded-lg">
            <MdLocalShipping size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">{user?.name || 'Delivery & Service Partner'}</h1>
            <p className="text-xs text-gray-400">{user?.role || 'Service Provider'}</p>
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Module Header & Action Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Service & Delivery Route Management</h2>
            <p className="text-gray-500 text-sm">Schedule days of week, manage routes, and calculate monthly service bills</p>
          </div>

          <button 
            onClick={() => { setAddError(''); setShowAddModal(true); }}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <MdAdd size={20} />
            <span>Add Service Customer</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-sm border">
          <button 
            onClick={() => setActiveTab('route')} 
            className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition ${activeTab === 'route' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Today's Route Tracker ({routeList.length})
          </button>
          <button 
            onClick={() => setActiveTab('customers')} 
            className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition ${activeTab === 'customers' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Service Customers ({customers.length})
          </button>
          <button 
            onClick={() => setActiveTab('billing')} 
            className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition ${activeTab === 'billing' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Bill Calculation System
          </button>
        </div>

        {/* TAB 1: TODAY'S ROUTE */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-primary font-bold">
              <span className="flex items-center space-x-1.5">
                <MdCalendarToday size={18} />
                <span>Schedule Filter: Today is <strong>{todayName || 'Today'}</strong></span>
              </span>
              <span>Showing {routeList.length} Scheduled Deliveries</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading today's delivery route...</div>
            ) : routeList.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100 shadow-sm">
                No active delivery routes scheduled for <strong>{todayName}</strong>. Subscriptions scheduled for other days are hidden automatically!
              </div>
            ) : (
              routeList.map(item => (
                <div key={item.subscription_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-lg">{item.customer_name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-primary font-semibold">
                        Daily Qty: {item.quantity_per_delivery}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-semibold">{item.product_name || item.service_name} • ₹{item.unit_price || 0}/unit</p>
                    <p className="text-xs text-gray-400 font-mono">Phone: {item.customer_phone}</p>
                    {item.delivery_days && (
                      <p className="text-[11px] text-gray-500">Days: <span className="font-semibold text-gray-700">{item.delivery_days}</span></p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    {item.today_status === 'Delivered' ? (
                      <span className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg font-semibold text-sm border border-emerald-200">
                        <MdCheckCircle size={18} />
                        <span>Delivered</span>
                      </span>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleMarkAttendance(item.subscription_id, 'Delivered', item.quantity_per_delivery)}
                          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                          Mark Delivered
                        </button>
                        <button 
                          onClick={() => handleMarkAttendance(item.subscription_id, 'Skipped', 0)}
                          className="flex-1 sm:flex-none border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-semibold text-sm transition"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: SERVICE CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center max-w-md">
              <MdSearch className="text-gray-400 mr-2" size={20} />
              <input 
                type="text"
                placeholder="Search by customer name, phone, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCustomers.length === 0 ? (
                <div className="col-span-full bg-white p-8 text-center text-gray-400 rounded-xl border">No customers found.</div>
              ) : (
                filteredCustomers.map(c => (
                  <div key={c.subscription_id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{c.customer_name}</h3>
                        <p className="text-xs text-gray-500 font-mono">Phone: {c.customer_phone}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-primary">
                        {c.frequency}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Service/Product:</span> <strong className="text-gray-800">{c.service_name || c.product_name}</strong></div>
                      <div className="flex justify-between"><span className="text-gray-500">Rate / Price:</span> <strong>₹{c.unit_price || 0}</strong></div>
                      <div className="flex justify-between"><span className="text-gray-500">Daily Quantity:</span> <strong>{c.quantity_per_delivery}</strong></div>
                      <div className="flex justify-between"><span className="text-gray-500">Scheduled Days:</span> <strong className="text-primary">{c.delivery_days || 'Everyday'}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Outstanding Dues</span>
                        <div className={`font-bold text-sm ${c.outstanding_balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹{c.outstanding_balance || 0}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCalculateBill(c.subscription_id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1"
                      >
                        <MdCalculate size={16} />
                        <span>Issue Monthly Bill</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BILL CALCULATION SYSTEM */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
              <span>Service Bill Calculation Engine</span>
              <span className="text-xs text-gray-400 font-normal">Automated based on attendance & unit prices</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Service</th>
                  <th className="py-3 px-6">Daily Qty</th>
                  <th className="py-3 px-6">Unit Price</th>
                  <th className="py-3 px-6">Outstanding Dues</th>
                  <th className="py-3 px-6 text-right">Calculate Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {customers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-6 text-gray-400">No service subscriptions found.</td></tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.subscription_id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {c.customer_name}
                        <div className="text-xs font-mono text-gray-400">{c.customer_phone}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800">{c.service_name || c.product_name}</td>
                      <td className="py-4 px-6">{c.quantity_per_delivery}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">₹{c.unit_price || 0}</td>
                      <td className="py-4 px-6 font-bold text-red-600">₹{c.outstanding_balance || 0}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleCalculateBill(c.subscription_id)}
                          className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition"
                        >
                          <MdCalculate size={16} />
                          <span>Calculate & Issue</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Customer & Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800">Add Service Customer & Subscription</h2>
            
            {addError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-start space-x-2">
                <MdWarning size={18} className="text-red-500 shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Customer Phone Number (Registered)</label>
                <input 
                  type="text" required
                  value={newCust.phone}
                  onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="e.g. 5555555555"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">* Customer must be registered on Bahi Khata first.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Service / Product Name</label>
                <input 
                  type="text" required
                  value={newCust.service_name}
                  onChange={e => setNewCust({ ...newCust, service_name: e.target.value })}
                  placeholder="e.g. Cow Milk 1L or House Cleaning"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Unit Rate / Price (₹)</label>
                  <input 
                    type="number" step="0.01" required
                    value={newCust.unit_price}
                    onChange={e => setNewCust({ ...newCust, unit_price: e.target.value })}
                    placeholder="e.g. 60"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Daily Delivery Qty</label>
                  <input 
                    type="number" required
                    value={newCust.quantity_per_delivery}
                    onChange={e => setNewCust({ ...newCust, quantity_per_delivery: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Day of Week Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Select Delivery / Service Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_DAYS.map(day => {
                    const isSelected = newCust.delivery_days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                          isSelected ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Calculated Result Modal */}
      {calculatedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <MdCheckCircle size={36} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Monthly Bill Calculated!</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-1.5">
              <div><span className="text-gray-500">Invoice No:</span> <strong className="text-primary">{calculatedBill.invoice_no}</strong></div>
              <div><span className="text-gray-500">Customer:</span> <strong>{calculatedBill.customer_name}</strong></div>
              <div><span className="text-gray-500">Days Delivered:</span> <strong>{calculatedBill.days_delivered} Days</strong></div>
              <div><span className="text-gray-500">Total Units Delivered:</span> <strong>{calculatedBill.total_qty} Units</strong></div>
              <div><span className="text-gray-500">Unit Price:</span> <strong>₹{calculatedBill.unit_price}</strong></div>
              <div className="pt-2 border-t text-base font-bold flex justify-between text-gray-900">
                <span>Calculated Bill:</span>
                <span className="text-emerald-600">₹{calculatedBill.calculated_amount}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setCalculatedBill(null)} 
                className="flex-1 py-2 border rounded-lg text-sm text-gray-600 font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => handleDownloadPDF(calculatedBill.bill_id)} 
                className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center space-x-1"
              >
                <MdDownload size={18} />
                <span>PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
