import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleName: 'Customer',
    businessName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const needsBusinessName = ['Retail Shop', 'Delivery Business', 'Service Provider'].includes(formData.roleName);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Create Account</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input name="name" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input name="phone" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
            <input name="email" type="email" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input name="password" type="password" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <select name="roleName" onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:ring-primary focus:border-primary">
              <option value="Customer">Customer</option>
              <option value="Retail Shop">Retail Shop</option>
              <option value="Delivery Business">Delivery Business</option>
              <option value="Service Provider">Service Provider</option>
            </select>
          </div>
          {needsBusinessName && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input name="businessName" required onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 border focus:ring-primary focus:border-primary" />
            </div>
          )}
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-blue-700">
            Register
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">Already have an account? <Link to="/login" className="text-primary">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
