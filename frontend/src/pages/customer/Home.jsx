import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdDownload, MdPayment, MdCheckCircle } from 'react-icons/md';

const CustomerHome = () => {
  const [data, setData] = useState({ totalOutstanding: 0, businesses: [] });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/customer/dashboard');
      setData(res.data.data || { totalOutstanding: 0, businesses: [] });
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePayAll = async () => {
    setPaying(true);
    try {
      await axios.post('/api/customer/pay-all');
      setPaidSuccess(true);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 font-medium">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customer Dashboard</h1>
      </header>

      {/* Outstanding Summary Card */}
      <div className="bg-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl font-bold">₹</div>
        
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-medium mb-1 opacity-90">Total Outstanding Udhar Amount</h2>
            <div className="text-4xl font-extrabold tracking-tight">₹{data.totalOutstanding}</div>
          </div>

          {(data.totalOutstanding == 0 || paidSuccess) && (
            <div className="flex items-center space-x-1 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-sm">
              <MdCheckCircle size={18} />
              <span>All Dues Paid</span>
            </div>
          )}
        </div>

        {data.totalOutstanding > 0 ? (
          <button 
            onClick={handlePayAll}
            disabled={paying}
            className="mt-6 bg-white text-primary px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-gray-100 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <MdPayment size={20} />
            <span>{paying ? 'Processing Payment...' : 'Pay All'}</span>
          </button>
        ) : (
          <div className="mt-6 inline-flex items-center space-x-2 bg-emerald-600/90 text-white px-4 py-2 rounded-xl text-sm font-bold">
            <MdCheckCircle size={18} />
            <span>Status: Paid</span>
          </div>
        )}
      </div>

      {/* Connected Businesses */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Connected Businesses</h3>
        <div className="space-y-4">
          {data.businesses.map(b => (
            <div key={b.customer_id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  {b.business_name ? b.business_name.charAt(0).toUpperCase() : 'B'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base">{b.business_name}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">{b.business_type}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-400 font-medium uppercase mb-0.5">Outstanding Dues</div>
                {b.outstanding_balance > 0 ? (
                  <div className="font-bold text-red-600 text-lg">₹{b.outstanding_balance}</div>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                    <MdCheckCircle size={14} />
                    <span>Paid</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          {data.businesses.length === 0 && (
            <div className="text-center text-gray-400 py-12 bg-white rounded-xl border border-dashed border-gray-200">
              No connected businesses found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
