import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdReceipt, MdAttachMoney, MdShowChart, MdDownload } from 'react-icons/md';

const Reports = () => {
  const [stats, setStats] = useState({ todaysRevenue: 0, pendingUdhar: 0, lowStockCount: 0 });
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [dashRes, billsRes] = await Promise.all([
          axios.get('/api/shop/dashboard'),
          axios.get('/api/bills')
        ]);
        setStats(dashRes.data.data || {});
        setBills(billsRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownloadPDF = (billId) => {
    window.open(`/api/bills/${billId}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Business Reports & Sales History</h1>
        <p className="text-gray-500 text-sm">Track sales revenue, invoice generation, and download past bills</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <MdAttachMoney size={28} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Today's Revenue</div>
            <div className="text-2xl font-bold text-gray-900">₹{stats.todaysRevenue || 0}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-primary rounded-lg">
            <MdReceipt size={28} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{bills.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <MdShowChart size={28} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase">Pending Udhar</div>
            <div className="text-2xl font-bold text-gray-900">₹{stats.pendingUdhar || 0}</div>
          </div>
        </div>
      </div>

      {/* Invoice History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Recent Bills</div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-6">Invoice No</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Payment Method</th>
              <th className="py-3 px-6">Net Amount</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-6 text-gray-400">Loading bills...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-6 text-gray-400">No bills generated yet.</td></tr>
            ) : (
              bills.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-semibold text-primary">{b.invoice_no}</td>
                  <td className="py-4 px-6 font-medium">
                    {b.customer_name || 'Walk-in Customer'} {b.customer_id ? `(#${b.customer_id})` : ''}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.payment_method === 'Udhar' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                      {b.payment_method}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">₹{b.net_amount || b.total_amount}</td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDownloadPDF(b.id)}
                      className="inline-flex items-center space-x-1 bg-primary text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 transition font-semibold"
                    >
                      <MdDownload size={16} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
