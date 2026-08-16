import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdCalendarMonth, MdPauseCircle, MdAddCircle, MdCheckCircle, MdPlayArrow } from 'react-icons/md';

const CustomerServices = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get('/api/customer/subscriptions');
      setSubscriptions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handlePause = async (id) => {
    try {
      await axios.post(`/api/customer/subscriptions/${id}/pause`, {});
      alert('Subscription paused for 7 days');
      fetchSubscriptions();
    } catch (err) {
      alert('Failed to pause subscription');
    }
  };

  const handleRequestExtra = async (id) => {
    try {
      await axios.post(`/api/customer/subscriptions/${id}/extra`, { extra_quantity: 1 });
      alert('Extra +1 quantity requested for today!');
      fetchSubscriptions();
    } catch (err) {
      alert('Failed to request extra item');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 font-medium">Loading subscriptions...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">My Service & Delivery Subscriptions</h1>
        <p className="text-gray-500 text-sm">Manage daily deliveries, pause service, or request extra items</p>
      </header>

      <div className="space-y-4">
        {subscriptions.map(sub => (
          <div key={sub.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 space-y-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{sub.product_name || sub.service_name}</h3>
                <p className="text-sm font-semibold text-primary">{sub.business_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Daily Qty: <strong className="text-gray-800">{sub.quantity_per_delivery}</strong></p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sub.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {sub.status}
                </span>
                <p className="text-xs text-gray-400 mt-1 font-medium">{sub.frequency}</p>
              </div>
            </div>

            {/* Attendance Activity Row */}
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-600 mb-2 flex items-center">
                <MdCalendarMonth className="mr-1 text-primary" size={16} /> Activity Tracker
              </h4>
              <div className="flex justify-between items-center px-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 font-semibold mb-1">{day}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                      i === 6 ? (sub.today_status === 'Delivered' ? 'bg-emerald-600' : 'bg-gray-300') : 'bg-emerald-500'
                    }`}>
                      {i === 6 && sub.today_status === 'Delivered' ? '✓' : '✓'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-1">
              <button 
                onClick={() => handleRequestExtra(sub.id)}
                className="flex-1 bg-blue-50 text-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-blue-100 transition space-x-1"
              >
                <MdAddCircle size={18}/>
                <span>+1 Extra Item</span>
              </button>
              <button 
                onClick={() => handlePause(sub.id)}
                className={`flex-1 ${sub.status === 'Paused' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-amber-100 transition space-x-1`}
              >
                <MdPauseCircle size={18}/>
                <span>{sub.status === 'Paused' ? 'Paused (Resume)' : 'Pause 7 Days'}</span>
              </button>
            </div>
          </div>
        ))}

        {subscriptions.length === 0 && (
          <div className="text-center text-gray-400 py-12 bg-white rounded-xl border border-dashed border-gray-200">
            No active subscriptions found. Connected service providers will add your daily orders here.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerServices;
