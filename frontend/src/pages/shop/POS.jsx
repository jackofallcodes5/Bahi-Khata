import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdSearch, MdDownload, MdPerson, MdCheckCircle, MdPhone, MdCheck, MdInfoOutline } from 'react-icons/md';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  
  // Phone-based Customer lookup
  const [customerPhone, setCustomerPhone] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  
  const [createdBill, setCreatedBill] = useState(null);

  const fetchPOSData = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        axios.get('/api/shop/products'),
        axios.get('/api/shop/customers')
      ]);
      setProducts(prodRes.data.data || []);
      setCustomers(custRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch POS data", err);
    }
  };

  useEffect(() => {
    fetchPOSData();
  }, []);

  // Live lookup by phone number
  const handlePhoneChange = (val) => {
    setCustomerPhone(val);
    if (!val || val.trim() === '') {
      setMatchedCustomer(null);
      setCustomCustomerName('');
      return;
    }
    
    const clean = val.trim();
    const found = customers.find(c => c.phone === clean || c.phone?.endsWith(clean));
    
    if (found) {
      setMatchedCustomer(found);
      setCustomCustomerName(found.name);
    } else {
      setMatchedCustomer(null);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product_id: product.id, product_name: product.name, price: parseFloat(product.price), quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.product_id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subTotal - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (paymentMethod === 'Udhar' && !customerPhone) {
      return alert('Please enter a Customer Phone Number for Udhar credit billing');
    }

    try {
      const payload = {
        customer_phone: customerPhone || null,
        customer_name: matchedCustomer ? matchedCustomer.name : (customCustomerName || null),
        customer_id: matchedCustomer ? matchedCustomer.id : null,
        items: cart,
        payment_method: paymentMethod,
        discount_amount: discount
      };
      const res = await axios.post('/api/bills', payload);
      
      const billData = res.data.data;
      setCreatedBill({
        id: billData.billId,
        invoice_no: billData.invoice_no,
        customer_name: matchedCustomer ? matchedCustomer.name : (customCustomerName || (customerPhone ? `Customer (${customerPhone})` : 'Walk-in Customer')),
        total: total,
        payment_method: paymentMethod,
        isTemp: billData.temp || false
      });

      // Clear Cart and inputs
      setCart([]);
      setDiscount(0);
      setCustomerPhone('');
      setCustomCustomerName('');
      setMatchedCustomer(null);
      fetchPOSData();
    } catch (err) {
      alert('Error generating bill');
      console.error(err);
    }
  };

  const handleDownloadPDF = (billId) => {
    if (!billId) {
      alert('This bill is saved in temporary staging and will generate a full PDF receipt once the customer registers!');
      return;
    }
    window.open(`/api/bills/${billId}/pdf`, '_blank');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Product Grid Section */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search product or scan barcode..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-primary focus:border-primary text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => addToCart(p)} className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary hover:shadow-md transition flex flex-col justify-between h-32">
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{p.name}</h3>
              <div className="flex justify-between items-end mt-2">
                <span className="text-primary font-bold text-base">₹{p.price}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${p.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  Stock: {p.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
          <span>Current Invoice</span>
          <span className="text-xs bg-blue-100 text-primary px-2.5 py-1 rounded-full">{cart.length} Items</span>
        </div>

        {/* Customer Phone Lookup Section */}
        <div className="p-4 border-b border-gray-100 bg-blue-50/50 space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase">Universal Customer Phone Number</label>
          <div className="relative">
            <MdPhone className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Enter Phone Number (e.g. 5555555555)..."
              value={customerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white font-mono"
            />
          </div>

          {/* Quick Select Buttons from Existing Customers */}
          {customers.length > 0 && !customerPhone && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-gray-500 font-semibold self-center mr-1">Quick Add:</span>
              {customers.slice(0, 3).map(c => (
                <button 
                  key={c.id} 
                  type="button" 
                  onClick={() => handlePhoneChange(c.phone)}
                  className="text-xs bg-white hover:bg-blue-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded transition"
                >
                  {c.name} ({c.phone})
                </button>
              ))}
            </div>
          )}

          {/* Dynamic Customer Status Banner */}
          {matchedCustomer ? (
            <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MdPerson size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">{matchedCustomer.name}</div>
                  <div className="text-[10px] text-emerald-700 font-mono">Phone: {matchedCustomer.phone}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase">Udhar Balance</div>
                <div className="text-xs font-bold text-red-600">₹{matchedCustomer.outstanding_balance || 0}</div>
              </div>
            </div>
          ) : customerPhone ? (
            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <MdInfoOutline size={16} className="text-amber-600" />
                <span>Unregistered Phone Number</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Bill will be saved to temporary staging & auto-linked when customer registers on Bahi Khata!
              </p>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic pt-1">
              Customer: <span className="font-semibold text-gray-700">Walk-in Customer</span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.product_id} className="flex justify-between items-center border-b border-gray-50 pb-2">
              <div className="flex-1 pr-2">
                <div className="font-semibold text-sm text-gray-800">{item.product_name}</div>
                <div className="text-xs text-gray-500">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateQuantity(item.product_id, -1)} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center font-bold hover:bg-gray-200 text-sm">-</button>
                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, 1)} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center font-bold hover:bg-gray-200 text-sm">+</button>
                <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:text-red-700 ml-1">×</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center text-gray-400 mt-8 text-sm">Cart is empty. Add products to bill.</div>}
        </div>

        {/* Checkout Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">₹{subTotal}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Discount (₹)</span>
            <input 
              type="number" 
              min="0"
              value={discount} 
              onChange={e => setDiscount(Number(e.target.value))} 
              className="w-24 px-2 py-1 border rounded text-right text-sm bg-white" 
            />
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Pay</span>
            <span className="text-primary">₹{total}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <select 
              value={paymentMethod} 
              onChange={e => setPaymentMethod(e.target.value)} 
              className="border rounded-lg p-2 text-sm bg-white font-medium"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Udhar">Udhar (Credit)</option>
            </select>
            <button 
              onClick={handleCheckout} 
              className="bg-emerald-600 text-white rounded-lg p-2 font-bold hover:bg-emerald-700 transition flex items-center justify-center space-x-1"
            >
              <span>Pay ₹{total}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bill Download Success Modal */}
      {createdBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <MdCheckCircle size={36} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {createdBill.isTemp ? 'Bill Saved to Temp Staging!' : 'Bill Generated Successfully!'}
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-1">
              <div><span className="text-gray-500">Invoice:</span> <strong className="text-primary">{createdBill.invoice_no}</strong></div>
              <div><span className="text-gray-500">Customer:</span> <strong>{createdBill.customer_name}</strong></div>
              <div><span className="text-gray-500">Amount:</span> <strong>₹{createdBill.total}</strong> ({createdBill.payment_method})</div>
              {createdBill.isTemp && (
                <div className="pt-2 text-xs text-amber-700 font-semibold border-t">
                  * Auto-linking enabled: Data will link to customer account when they register!
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setCreatedBill(null)} 
                className="flex-1 py-2 border rounded-lg text-sm text-gray-600 font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              {!createdBill.isTemp && (
                <button 
                  onClick={() => handleDownloadPDF(createdBill.id)} 
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center justify-center space-x-1"
                >
                  <MdDownload size={18} />
                  <span>Download Bill</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
