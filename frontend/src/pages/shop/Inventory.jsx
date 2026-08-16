import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdAdd, MdSearch, MdEdit, MdWarning } from 'react-icons/md';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', barcode: '', category_name: '' });

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/shop/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/shop/products', formData);
      setShowModal(false);
      setFormData({ name: '', price: '', stock: '', barcode: '', category_name: '' });
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
    }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory & Stock Management</h1>
          <p className="text-gray-500 text-sm">Track items, low stock alerts, and update pricing</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <MdAdd size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center max-w-md">
        <MdSearch className="text-gray-400 mr-2" size={20} />
        <input 
          type="text"
          placeholder="Search by product name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus:outline-none text-sm"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Barcode</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">Loading inventory...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">No products found.</td></tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-semibold text-gray-900">{item.name}</td>
                  <td className="py-4 px-6 text-gray-500">{item.category_name || 'General'}</td>
                  <td className="py-4 px-6 font-mono text-xs">{item.barcode || '—'}</td>
                  <td className="py-4 px-6 font-bold text-gray-900">₹{item.price}</td>
                  <td className="py-4 px-6">
                    {item.stock <= 10 ? (
                      <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <MdWarning size={14} />
                        <span>Low Stock ({item.stock})</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                        In Stock ({item.stock})
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Price (₹)</label>
                  <input 
                    type="number" step="0.01" required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Initial Stock</label>
                  <input 
                    type="number" required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Barcode (Optional)</label>
                <input 
                  type="text"
                  value={formData.barcode}
                  onChange={e => setFormData({ ...formData, barcode: e.target.value })}
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
