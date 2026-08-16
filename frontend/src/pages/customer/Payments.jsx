import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdReceiptLong, MdCheckCircle, MdPayment } from 'react-icons/md';

const CustomerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('/api/customer/payments');
        setPayments(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch payment history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDownloadReceipt = (billId) => {
    if (!billId) return alert('No invoice attached to this transaction receipt.');
    window.open(`/api/bills/${billId}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History & Receipts</h1>
          <p className="text-gray-500 text-sm">View completed transaction payments across connected businesses</p>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-200 text-center text-gray-400">
            No payments recorded yet.
          </div>
        ) : (
          payments.map(payment => (
            <div key={payment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <MdCheckCircle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base">{payment.business_name}</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(payment.created_at).toLocaleString()} • <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">{payment.payment_method}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-gray-900 text-lg">₹{payment.amount}</div>
                {payment.bill_id ? (
                  <button 
                    onClick={() => handleDownloadReceipt(payment.bill_id)}
                    className="text-primary text-xs font-semibold flex items-center justify-end mt-1 hover:underline ml-auto"
                  >
                    <MdReceiptLong className="mr-1"/> Download Receipt
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Status: {payment.status || 'Completed'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerPayments;
